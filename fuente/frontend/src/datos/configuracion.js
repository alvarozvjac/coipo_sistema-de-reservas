import { almacen, obtenerCasa, todasLasReservas } from './servicio.js'
import { CUENTAS, PERFIL_POR_ROL } from './iam.js'
import { fechaLarga, hoyISO, rangoFechas } from '../lib/fechas.js'
import { pesos } from '../lib/formato.js'
import { PARAMETROS, glosaTransferencia } from '../lib/reglas.js'

/*
 * Configuración del encargado nacional (decisión 12-11-2026): usuarios y
 * encargadas (leídos del IAM), parámetros del reglamento con vigencia,
 * plantillas de correo y registro de actividad.
 *
 * Endpoints de la fase 2 (FastAPI):
 *   usuariosConAcceso()                 GET  /api/iam/usuarios?client_id=   (lo responde el IAM)
 *   cambiarParametro(datos, actor)      POST /api/parametros
 *   historialParametros()               GET  /api/parametros/historial
 *   guardarPlantilla(clave, datos)      PUT  /api/plantillas/{clave}
 *   actividad(filtros)                  GET  /api/actividad
 */

const ahora = () => new Date().toISOString().slice(0, 19)

/* ---------- Usuarios y encargadas (solo lectura: se editan en el IAM) ---------- */

export function usuariosConAcceso() {
  return CUENTAS.map((c) => ({ ...c, perfil: PERFIL_POR_ROL[c.role] ?? null }))
}

/* ---------- Parámetros del reglamento, con vigencia ---------- */

/** Valores de origen (reglas.js), antes de cualquier cambio del encargado nacional. */
const BASE = { ...PARAMETROS }

/** Los parámetros que el encargado nacional puede cambiar, con su fuente y sus límites. */
export const EDITABLES = [
  { clave: 'anticipacion_maxima_dias', etiqueta: 'Anticipación máxima para reservar', unidad: 'días', min: 15, max: 365, fuente: 'Decisión de Bienestar y UIA (20-10-2026)' },
  { clave: 'anticipacion_maxima_otro_servicio_dias', etiqueta: 'Anticipación máxima, otros servicios públicos', unidad: 'días', min: 1, max: 90, fuente: 'Art. 9' },
  { clave: 'aviso_desistimiento_dias_habiles', etiqueta: 'Aviso para desistir sin costo', unidad: 'días hábiles', min: 1, max: 30, fuente: 'Memo 6188/2026 (Art. 10 a dice 7 días corridos)' },
  { clave: 'aviso_retiro_anticipado_dias', etiqueta: 'Aviso de retiro anticipado', unidad: 'días', min: 0, max: 10, fuente: 'Art. 10 e)' },
  { clave: 'dias_aseo_entre_reservas', etiqueta: 'Días de aseo entre reservas', unidad: 'días', min: 0, max: 3, fuente: 'Decisión de Bienestar' },
  { clave: 'cuotas_maximas_planilla', etiqueta: 'Cuotas máximas por planilla (reserva directa)', unidad: 'cuotas', min: 1, max: 12, fuente: 'Decisión de Bienestar' },
  { clave: 'plazo_observaciones_horas', etiqueta: 'Plazo para informar diferencias de inventario', unidad: 'horas', min: 1, max: 72, fuente: 'Art. 13' },
  { clave: 'hora_ingreso', etiqueta: 'Hora de ingreso (check-in)', unidad: 'hora', tipo: 'hora', fuente: 'Art. 12' },
  { clave: 'hora_salida', etiqueta: 'Hora de salida (check-out)', unidad: 'hora', tipo: 'hora', fuente: 'Art. 12' },
]

export const historialParametros = () => [...(almacen.leer().parametros ?? [])].sort((a, b) => (a.en < b.en ? 1 : -1))

/** El valor que rige un día: el último cambio con vigencia hasta ese día, o el de origen. */
export function valorVigente(clave, dia = hoyISO()) {
  const cambio = (almacen.leer().parametros ?? []).filter((p) => p.clave === clave && !p.anulado && p.vigente_desde <= dia).sort((a, b) => (a.vigente_desde < b.vigente_desde ? 1 : a.vigente_desde > b.vigente_desde ? -1 : a.en < b.en ? 1 : -1))[0]
  return cambio ? cambio.valor : BASE[clave]
}

/** Copia a las reglas los valores vigentes hoy. Se llama al iniciar y tras cada cambio o reinicio. */
export function aplicarParametros() {
  for (const { clave } of EDITABLES) PARAMETROS[clave] = valorVigente(clave)
}

export function validarParametro(def, valor, vigente_desde, respaldo) {
  const e = {}
  if (def.tipo === 'hora') {
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(valor)) e.valor = 'Use el formato HH:MM.'
  } else if (!Number.isInteger(Number(valor)) || valor === '' || Number(valor) < def.min || Number(valor) > def.max) e.valor = `Entre ${def.min} y ${def.max}.`
  if (!vigente_desde || vigente_desde < hoyISO()) e.vigente_desde = 'Desde hoy o una fecha futura.'
  if (!respaldo?.trim()) e.respaldo = 'Indique la resolución, memo o acuerdo que lo respalda.'
  return e
}

/** Registra un cambio de parámetro. Rige desde `vigente_desde`; las reservas ya hechas no cambian. */
export function cambiarParametro({ clave, valor, vigente_desde, respaldo }, actor) {
  const def = EDITABLES.find((d) => d.clave === clave)
  const estado = almacen.leer()
  estado.parametros ??= []
  estado.parametros.push({ id: `P-${estado.parametros.length + 1}`, clave, anterior: valorVigente(clave, vigente_desde), valor: def.tipo === 'hora' ? valor : Number(valor), vigente_desde, respaldo: respaldo.trim(), por: actor.nombre, en: ahora() })
  almacen.guardar()
  aplicarParametros()
}

/** Anula un cambio programado que aún no rige. */
export function anularCambioParametro(id, actor) {
  const p = (almacen.leer().parametros ?? []).find((x) => x.id === id)
  if (!p || p.vigente_desde <= hoyISO()) return
  Object.assign(p, { anulado: true, anulado_por: actor.nombre, anulado_en: ahora() })
  almacen.guardar()
  aplicarParametros()
}

/* ---------- Plantillas de correo ---------- */

/** Variables que se pueden usar en las plantillas. */
export const VARIABLES = {
  nombre: 'Nombre de la persona',
  codigo: 'Código de la reserva',
  casa: 'Nombre de la casa',
  fechas: 'Llegada y salida',
  monto: 'Total de la estadía',
  glosa: 'Glosa de la transferencia',
  motivo: 'Motivo de la anulación',
  registrada_por: 'Quién registró la reserva',
  hora_ingreso: 'Hora de ingreso',
  plazo_observaciones: 'Horas para informar diferencias del inventario',
}

export const PLANTILLAS_BASE = {
  ficha: {
    nombre: 'Ficha de la reserva',
    cuando: 'Al registrar la reserva (con transferencia, al registrar el pago)',
    asunto: 'Ficha de su reserva {codigo} · {casa}',
    cuerpo: 'Estimado/a {nombre}:\n\nSu reserva en {casa} quedó confirmada para el {fechas}. Adjuntamos la ficha de la reserva, con quienes viajan, las direcciones de la casa y su inventario.\n\nEl ingreso es desde las {hora_ingreso}. Al llegar revise el inventario e informe cualquier diferencia dentro de {plazo_observaciones} horas.\n\nDepartamento de Bienestar · CONAF',
  },
  por_confirmar: {
    nombre: 'Datos para transferir',
    cuando: 'Al registrar una reserva que se paga por transferencia',
    asunto: 'Datos para transferir · reserva {codigo}',
    cuerpo: 'Estimado/a {nombre}:\n\nSu reserva en {casa} ({fechas}) quedó por confirmar. Transfiera {monto} a la cuenta corriente de CONAF con la glosa {glosa}. Cuando registremos el pago le enviaremos la ficha de la reserva.\n\nDepartamento de Bienestar · CONAF',
  },
  desistimiento: {
    nombre: 'Desistimiento registrado',
    cuando: 'Al registrar que la persona desiste',
    asunto: 'Registro de su desistimiento · {codigo}',
    cuerpo: 'Estimado/a {nombre}:\n\nRegistramos su desistimiento de la reserva {codigo} en {casa} ({fechas}).\n\nDepartamento de Bienestar · CONAF',
  },
  anulacion: {
    nombre: 'Anulación por Bienestar',
    cuando: 'Al bloquear fechas o retirar una casa con reservas',
    asunto: 'Anulación de su reserva {codigo}',
    cuerpo: 'Estimado/a {nombre}:\n\nLamentamos informarle que su reserva {codigo} en {casa} ({fechas}) fue anulada. {motivo}\n\nDepartamento de Bienestar · CONAF',
  },
}

export function plantillas() {
  const guardadas = almacen.leer().plantillas ?? {}
  return Object.fromEntries(Object.entries(PLANTILLAS_BASE).map(([k, b]) => [k, { ...b, ...guardadas[k], base: b }]))
}

/** Variables desconocidas en un texto (por ejemplo, {nombr}). */
export const variablesDesconocidas = (texto) => [...texto.matchAll(/\{([^}]*)\}/g)].map((m) => m[1]).filter((v) => !(v in VARIABLES))

export function guardarPlantilla(clave, { asunto, cuerpo }, actor) {
  const estado = almacen.leer()
  estado.plantillas ??= {}
  estado.plantillas[clave] = { asunto, cuerpo, por: actor.nombre, en: ahora() }
  estado.historial_plantillas ??= []
  estado.historial_plantillas.unshift({ clave, por: actor.nombre, en: ahora() })
  almacen.guardar()
}

export function restaurarPlantilla(clave, actor) {
  const estado = almacen.leer()
  delete estado.plantillas?.[clave]
  estado.historial_plantillas ??= []
  estado.historial_plantillas.unshift({ clave, por: actor.nombre, en: ahora(), restaurada: true })
  almacen.guardar()
}

const valores = (r) => ({
  nombre: r.titular.nombre,
  codigo: r.codigo,
  casa: r.casa?.nombre ?? obtenerCasa(r.casa_id)?.nombre,
  fechas: `${fechaLarga(r.entrada)} al ${fechaLarga(r.salida)}`,
  monto: pesos(r.total),
  glosa: r.forma_pago?.glosa ?? glosaTransferencia(r.casa ?? obtenerCasa(r.casa_id), r.codigo),
  motivo: r.motivo_anulacion ?? '—',
  registrada_por: r.registrada_por?.nombre ?? '—',
  hora_ingreso: PARAMETROS.hora_ingreso,
  plazo_observaciones: PARAMETROS.plazo_observaciones_horas,
})

/** El correo tal como lo recibiría la persona, con la plantilla vigente. */
export function correoDe(clave, reserva, texto = plantillas()[clave]) {
  const v = valores(reserva)
  const poner = (s) => s.replace(/\{(\w+)\}/g, (m, k) => v[k] ?? m)
  return { asunto: poner(texto.asunto), cuerpo: poner(texto.cuerpo), para: reserva.contacto?.correo ?? reserva.titular.correo }
}

/** Una reserva de ejemplo para la vista previa. */
export const reservaEjemplo = () => todasLasReservas().find((r) => r.registrada_por && r.forma_pago?.tipo === 'planilla') ?? todasLasReservas()[0]

/* ---------- Registro de actividad (se arma con lo que ya queda registrado) ---------- */

export const AREAS = { reservas: 'Reservas', cobros: 'Cobros', casas: 'Casas y tarifas', configuracion: 'Configuración', inventario: 'Inventario' }

/**
 * Quién hizo qué y cuándo. No hay una bitácora aparte: se arma con los
 * registros que cada acción ya deja (quién y cuándo), así no puede desviarse
 * de los datos. Las acciones automáticas de la demostración no aparecen.
 */
export function actividad() {
  const e = almacen.leer()
  const casa = (id) => obtenerCasa(id)?.nombre ?? `casa ${id}`
  const l = []
  const add = (en, por, area, accion, detalle) => en && por && l.push({ en, por, area, accion, detalle })
  for (const r of e.reservas) {
    const ref = `${r.codigo} · ${casa(r.casa_id)} · ${rangoFechas(r.entrada, r.salida)}`
    if (r.registrada_por) add(r.declaracion_encargado ?? r.creada_en, r.registrada_por.nombre, 'reservas', 'Registró una reserva', `${ref} · a nombre de ${r.titular.nombre}`)
    if (r.desistimiento_registrado_por) add(r.desistida_en, r.desistimiento_registrado_por, 'reservas', 'Registró un desistimiento', ref)
    if (r.pago?.por && r.pago.por !== 'Encargada regional') add(r.pago.registrado_en, r.pago.por, 'cobros', 'Registró un pago', `${ref} · ${r.pago.comprobante}`)
    if (r.devolucion) add(r.devolucion.registrada_en, r.devolucion.por, 'cobros', 'Registró una devolución', ref)
  }
  for (const b of e.bloqueos ?? []) add(b.creado_en, b.creado_por, 'casas', 'Bloqueó fechas', `${casa(b.casa_id)} · ${rangoFechas(b.entrada, b.salida)} · ${b.motivo}`)
  for (const t of e.historial_tarifas ?? []) add(t.en, t.por, 'casas', 'Actualizó tarifas', `${t.cambios.length} cambio(s) · ${t.metodo}${t.archivo ? ` (${t.archivo})` : ''}`)
  for (const x of e.retiros ?? []) add(x.en, x.por, 'casas', x.accion === 'retiro' ? 'Retiró una casa' : 'Reincorporó una casa', `${casa(x.casa_id)}${x.motivo ? ` · ${x.motivo}` : ''}`)
  for (const d of e.historial_direcciones ?? []) add(d.en, d.por, 'casas', 'Editó otras direcciones', `${casa(d.casa_id)} · ${d.cantidad} dirección(es)`)
  for (const [id, inv] of Object.entries(e.inventarios ?? {})) add(inv.actualizado_en, inv.actualizado_por, 'inventario', 'Actualizó el inventario', casa(Number(id)))
  for (const [periodo, n] of Object.entries(e.nominas ?? {})) add(n.en, n.por, 'cobros', 'Cambió el estado de la nómina', `${periodo} · ${n.estado}`)
  for (const p of e.parametros ?? []) {
    const def = EDITABLES.find((d) => d.clave === p.clave)
    add(p.en, p.por, 'configuracion', 'Cambió un parámetro', `${def?.etiqueta ?? p.clave}: ${p.anterior} → ${p.valor}, desde ${p.vigente_desde} · ${p.respaldo}`)
    if (p.anulado) add(p.anulado_en, p.anulado_por, 'configuracion', 'Anuló un cambio programado', def?.etiqueta ?? p.clave)
  }
  for (const h of e.historial_plantillas ?? []) add(h.en, h.por, 'configuracion', h.restaurada ? 'Restauró una plantilla' : 'Editó una plantilla', PLANTILLAS_BASE[h.clave]?.nombre ?? h.clave)
  return l.sort((a, b) => (a.en < b.en ? 1 : -1))
}
