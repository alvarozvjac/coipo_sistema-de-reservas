/**
 * Capa de datos de la maqueta.
 *
 * Cada función corresponde a un endpoint de la futura API (FastAPI) y
 * devuelve los mismos campos. Hoy guarda en el navegador (localStorage);
 * en la versión real este archivo se reemplaza por llamadas HTTP.
 *
 *   listarCasas() / obtenerCasa(id)           GET   /api/casas[/{id}]
 *   actualizarCasa(id, cambios)               PATCH /api/casas/{id}
 *   ocupacionesDe(id) / bloqueosDe(id)        GET   /api/casas/{id}/ocupacion | /bloqueos
 *   crearBloqueo(...) / eliminarBloqueo(id)   POST | DELETE /api/bloqueos
 *   todasLasReservas()                        GET   /api/reservas
 *   misReservas(usuarioId)                    GET   /api/reservas?titular=me
 *   reservasRegion(region)                    GET   /api/reservas?region={region}
 *   obtenerReserva(codigo)                    GET   /api/reservas/{codigo}
 *   crearReserva(datos)                       POST  /api/reservas   (queda confirmada al registrar)
 *   transferenciasDelPeriodo(periodo, region) GET   /api/cobranza/transferencias?periodo&region
 *   resumenCobranza(region)                   GET   /api/cobranza/resumen?region
 *   actualizarDirecciones(id, lista)          PUT   /api/casas/{id}/direcciones
 *   desistirReserva(codigo)                   POST  /api/reservas/{codigo}/desistimiento
 *   registrarPago(codigo, datos, actor)       POST  /api/reservas/{codigo}/pago
 *   nominaPlanilla(periodo)                   GET   /api/nomina-descuentos/{AAAA-MM}
 *   cambiarEstadoNomina(periodo, estado)      PATCH /api/nomina-descuentos/{AAAA-MM}
 *   inventarioDe(casaId) / guardarInventario  GET | PUT /api/casas/{id}/inventario
 */

import { useSyncExternalStore } from 'react'
import { CASAS } from './casas.js'
import { NOMINA } from './usuarios.js'
import { ADICIONAL_BASE, aleatorio, crearPersonas, semillas as semillasBase } from './semillas.js'

import { hoyISO, mesDe, primerDiaMes, sumarDias, sumarMeses } from '../lib/fechas.js'
import { ADICIONAL_TARIFA, cargoDesistimiento, noches, tarifaTramo } from '../lib/reglas.js'

const CLAVE = 'reserva_veraneo_v22'

const ahora = () => new Date().toISOString().slice(0, 19)

const casaBase = (id) => CASAS.find((c) => c.id === id)

/* ---------- Estado y suscripción ---------- */

/** Estado inicial de la demostración, con las fichas ya enviadas a las reservas confirmadas recientes. */
function semillas(hoy) {
  estado = semillasBase(hoy)
  for (const r of estado.reservas) {
    if (r.estado === 'confirmada' && r.salida > sumarDias(hoy, -15)) {
      const inv = estado.inventarios[r.casa_id]
      const cuando = inv && (r.confirmada_en ?? '') < inv.actualizado_en ? inv.actualizado_en : (r.confirmada_en ?? r.creada_en)
      enviarFicha(r, cuando)
    }
  }
  return estado
}

let estado = null
let version = 0
const oyentes = new Set()
estado = cargar()
aplicarAdicionales()

function cargar() {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE))
    if (guardado?.reservas && guardado?.inventarios && guardado?.bloqueos) return guardado
  } catch {
    // sin persistencia disponible
  }
  return semillas(hoyISO())
}

function guardar() {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(estado))
  } catch {
    // sin persistencia disponible
  }
  version++
  oyentes.forEach((f) => f())
}

/** Para los módulos de datos que viven aparte (configuracion.js): el mismo estado y el mismo guardado. */
export const almacen = { leer: () => estado, guardar: () => guardar() }

/** Las tarifas diferenciadas vigentes se aplican a las reglas de cálculo. */
function aplicarAdicionales() {
  Object.assign(ADICIONAL_TARIFA, estado.adicionales ?? ADICIONAL_BASE)
}

export function reiniciarDemo() {
  estado = semillas(hoyISO())
  aplicarAdicionales()
    guardar()
}

/** Hook: vuelve a renderizar cuando cambian los datos. */
export function useDatos() {
  return useSyncExternalStore(
    (f) => {
      oyentes.add(f)
      return () => oyentes.delete(f)
    },
    () => version,
  )
}

/* ---------- Casas, tarifas y bloqueos ---------- */

/** Tarifas vigentes de una casa: las de la resolución o las cargadas por el encargado nacional ({ a: grados 04–14, b: grados 15–19 }). */
const conAjustes = (c) => {
  const t = estado.tarifas[c.id] ?? {}
  const otras = estado.direcciones?.[c.id] ?? c.otras_direcciones ?? []
  return { ...c, otras_direcciones: otras, tarifa_noche: t.a ?? c.tarifa_noche, tarifa_noche_15_19: t.b ?? c.tarifa_noche_15_19, activa: !estado.inactivas.includes(c.id) }
}

/** Casas activas (para registrar reservas) o todas (para el encargado nacional). */
export const listarCasas = ({ incluirInactivas = false } = {}) => CASAS.map(conAjustes).filter((c) => incluirInactivas || c.activa)

export function obtenerCasa(id) {
  const c = casaBase(Number(id))
  return c ? conAjustes(c) : null
}

export function actualizarCasa(id, { tarifa_noche, tarifa_noche_15_19, activa }) {
  if (tarifa_noche !== undefined) estado.tarifas[id] = { ...estado.tarifas[id], a: Number(tarifa_noche) }
  if (tarifa_noche_15_19 !== undefined) estado.tarifas[id] = { ...estado.tarifas[id], b: Number(tarifa_noche_15_19) }
  if (activa !== undefined) estado.inactivas = activa ? estado.inactivas.filter((x) => x !== id) : [...new Set([...estado.inactivas, id])]
  guardar()
}

/**
 * Otras direcciones de una casa además de la principal (estacionamiento en otro
 * edificio, retiro de llaves, acceso vehicular…). Las edita el encargado
 * nacional y salen en la ficha de la reserva (decisión 12-11-2026).
 */
export function actualizarDirecciones(id, lista, actor) {
  estado.direcciones ??= {}
  estado.direcciones[id] = lista.filter((d) => d.tipo?.trim() && d.direccion?.trim()).map((d) => ({ tipo: d.tipo.trim(), direccion: d.direccion.trim(), indicacion: d.indicacion?.trim() || '' }))
  estado.historial_direcciones ??= []
  estado.historial_direcciones.unshift({ casa_id: id, en: ahora(), por: actor?.nombre ?? '—', cantidad: estado.direcciones[id].length })
  guardar()
}

export const tarifasDiferenciadas = () => ({ ...estado.adicionales })

export function actualizarTarifasDiferenciadas(valores) {
  estado.adicionales = { ...estado.adicionales, ...Object.fromEntries(Object.entries(valores).map(([k, v]) => [k, Number(v)])) }
  aplicarAdicionales()
  guardar()
}

export const listarBloqueos = () => [...estado.bloqueos].sort((a, b) => (a.entrada < b.entrada ? -1 : 1))

export const bloqueosDe = (casaId) => estado.bloqueos.filter((b) => b.casa_id === casaId)

/** Ocupan fechas todas las reservas, salvo las desistidas y las anuladas. */
const ocupa = (r) => !['desistida', 'anulada'].includes(r.estado)

export const ocupacionesDe = (casaId) => [
  ...estado.reservas.filter((r) => r.casa_id === casaId && ocupa(r)).map(({ entrada, salida }) => ({ entrada, salida })),
  ...bloqueosDe(casaId),
]

/** Reservas vigentes que chocan con un bloqueo propuesto. */
export const reservasAfectadas = (casaId, entrada, salida) =>
  estado.reservas.filter((r) => r.casa_id === casaId && r.estado === 'confirmada' && r.entrada < salida && entrada < r.salida && r.salida > hoyISO()).map(conCasa)

/**
 * Bloquea fechas por mantención o fuerza mayor (Art. 11). Las reservas
 * afectadas se anulan, se avisa al usuario y se marca la devolución de lo pagado.
 */
export function crearBloqueo({ casa_id, entrada, salida, motivo }, actor) {
  const afectadas = reservasAfectadas(casa_id, entrada, salida)
  for (const a of afectadas) {
    const r = estado.reservas.find((x) => x.codigo === a.codigo)
    r.estado = 'anulada'
    r.motivo_anulacion = `Bienestar no puede ofrecer la casa en esas fechas: ${motivo}. Se devolverá lo pagado y le ofreceremos otra casa o fecha (Art. 11).`
    r.anulada_en = ahora()
    if (r.pago) r.devolucion_pendiente = true
    r.notificaciones ??= []
    r.notificaciones.push({ tipo: 'anulacion', en: ahora(), detalle: r.motivo_anulacion })
  }
  estado.bloqueos.push({ id: 'B-' + Date.now().toString(36), casa_id, entrada, salida, motivo, creado_por: actor.nombre, creado_en: ahora() })
  guardar()
  return afectadas.length
}

export function eliminarBloqueo(id) {
  estado.bloqueos = estado.bloqueos.filter((b) => b.id !== id)
  guardar()
}

/* ---------- Reservas ---------- */

const conCasa = (r) => (r ? { ...r, casa: obtenerCasa(r.casa_id) } : null)

export const todasLasReservas = () => estado.reservas.map(conCasa)

export const misReservas = (usuarioId) =>
  estado.reservas.filter((r) => r.titular_id === usuarioId).map(conCasa).sort((a, b) => (a.entrada < b.entrada ? 1 : -1))

/** Reservas de una región; sin región, las de todo el país (encargado nacional). */
export const reservasRegion = (region) => estado.reservas.filter((r) => !region || casaBase(r.casa_id)?.region === region).map(conCasa)

export const obtenerReserva = (codigo) => conCasa(estado.reservas.find((r) => r.codigo === codigo))

/**
 * Reserva con confirmación automática (decisión 20-10-2026): si las fechas
 * están disponibles y se cumple la anticipación, queda confirmada al instante
 * y se envían el comprobante y el acta de entrega. La validación final de
 * disponibilidad la hace el backend dentro de una transacción, para que dos
 * personas no tomen las mismas fechas a la vez.
 */
/**
 * Desde el 12-11-2026 las reservas las registran los encargados (regional o
 * nacional) a pedido de la persona: `registrada_por` es quien la registró, y
 * su declaración (la persona la pidió, conoce el reglamento y, si paga por
 * planilla, autorizó el descuento) reemplaza la aceptación de la persona.
 */
export function crearReserva({ usuario, casa, entrada, salida, tarifa_noche, ocupantes, contacto, perro_asistencia, forma_pago, titular_viaja = true, a_cargo, registrada_por, via }) {
  const choca = ocupacionesDe(casa.id).some((o) => entrada < o.salida && o.entrada < salida)
  if (choca) return null
  const codigo = nuevoCodigo()
  const r = {
    codigo,
    titular_id: usuario.id,
    titular: { nombre: usuario.nombre, rut: usuario.rut, rol: usuario.rol, region: usuario.region, calidad: usuario.calidad, grado: usuario.grado, correo: contacto.correo, telefono: contacto.telefono },
    casa_id: casa.id,
    entrada,
    salida,
    tarifa_noche,
    total: tarifa_noche * noches(entrada, salida),
    ocupantes,
    contacto,
    titular_viaja,
    a_cargo: a_cargo ?? usuario.nombre,
    perro_asistencia,
    forma_pago,
    acepta_reglamento: true,
    ...(registrada_por && { registrada_por, declaracion_encargado: ahora() }),
    ...(via && { via }),
    estado: 'confirmada',
    creada_en: ahora(),
    notificaciones: [],
  }
  // Decisión 13-11-2026: no hay aprobación; lo que registra un encargado queda confirmado.
  confirmar(r, registrada_por?.nombre ?? 'Encargada regional')
  estado.reservas.push(r)
  guardar()
  return codigo
}

/**
 * Confirma al registrar (decisión 13-11-2026: sin aprobación) y envía la ficha
 * de la reserva. Con transferencia se envían además los datos para transferir,
 * y el pago queda pendiente hasta que el encargado nacional registra que llegó.
 */
function confirmar(r, por) {
  r.estado = 'confirmada'
  r.confirmada_por = por
  r.confirmada_en = ahora()
  if (r.forma_pago.tipo === 'transferencia') r.notificaciones.push({ tipo: 'por_confirmar', en: ahora(), detalle: 'Datos para la transferencia' })
  enviarFicha(r)
}

function nuevoCodigo() {
  estado.correlativo += 1
  return `R-${hoyISO().slice(0, 4)}-${String(estado.correlativo).padStart(4, '0')}`
}

/** Código que recibirá la próxima reserva (para la glosa de la transferencia). */
export const proximoCodigo = () => `R-${hoyISO().slice(0, 4)}-${String(estado.correlativo + 1).padStart(4, '0')}`

/** Desistimiento que la persona comunicó y un encargado registra (`gestor`, desde el 12-11-2026). */
export function desistirReserva(codigo, gestor) {
  const r = estado.reservas.find((x) => x.codigo === codigo)
  if (!r) return
  r.cargo_desistimiento = cargoDesistimiento(r)
  r.estado = 'desistida'
  r.desistida_en = hoyISO()
  if (gestor) r.desistimiento_registrado_por = gestor.nombre
  r.notificaciones.push({ tipo: 'desistimiento', en: ahora(), detalle: r.cargo_desistimiento ? 'Desistimiento fuera de plazo: se cobra la estadía completa' : 'Desistimiento sin costo' })
  guardar()
}

/* ---------- Cobros (Art. 21, Anexo A) ---------- */

/** Transferencias por registrar, de reservas confirmadas; con región, solo las casas de esa región. */
export const pagosPorRegistrar = (region = '') =>
  estado.reservas
    .filter((r) => r.estado === 'confirmada' && r.forma_pago.tipo !== 'planilla' && !r.pago && (!region || casaBase(r.casa_id)?.region === region))
    .map(conCasa)
    .sort((a, b) => (a.entrada < b.entrada ? -1 : 1))

export function registrarPago(codigo, { comprobante }, actor) {
  const r = estado.reservas.find((x) => x.codigo === codigo)
  if (!r) return
  r.pago = { registrado_en: ahora(), comprobante, por: actor.nombre }
  r.notificaciones ??= []
  r.notificaciones.push({ tipo: 'pago', en: ahora(), detalle: `Transferencia registrada por ${actor.nombre} (comprobante ${comprobante})` })
  guardar()
}

/**
 * Líneas de la nómina de descuentos de un período (AAAA-MM). Cada estadía
 * finalizada con planilla se descuenta en cuotas a partir del mes siguiente
 * a la salida; los cargos por desistimiento, en el mes siguiente al aviso.
 */
export function nominaPlanilla(periodo, region = '') {
  const lineas = []
  for (const r of estado.reservas) {
    if (r.forma_pago.tipo !== 'planilla') continue
    if (region && casaBase(r.casa_id)?.region !== region) continue
    if (r.estado === 'confirmada' && r.salida <= hoyISO()) {
      const cuotas = r.forma_pago.cuotas ?? 1
      for (let k = 1; k <= cuotas; k++) {
        const mes = mesDe(sumarMeses(r.salida, k))
        if (mes === periodo) {
          lineas.push({ reserva: r.codigo, titular: r.titular, casa: casaBase(r.casa_id).nombre, concepto: `Estadía ${r.entrada} a ${r.salida}`, cuota: `${k} de ${cuotas}`, monto: Math.round(r.total / cuotas) })
        }
      }
    }
    if (r.estado === 'desistida' && r.cargo_desistimiento > 0 && mesDe(sumarMeses(r.desistida_en, 1)) === periodo) {
      lineas.push({ reserva: r.codigo, titular: r.titular, casa: casaBase(r.casa_id).nombre, concepto: 'Desistimiento fuera de plazo: estadía completa', cuota: '1 de 1', monto: r.cargo_desistimiento })
    }
  }
  return lineas.sort((a, b) => a.titular.nombre.localeCompare(b.titular.nombre))
}

/** pendiente → informada (enviada a Remuneraciones) → descontada. Los meses pasados se dan por descontados. */
export function estadoNomina(periodo) {
  if (estado.nominas[periodo]) return estado.nominas[periodo]
  const actual = mesDe(hoyISO())
  if (periodo < actual) return { estado: 'descontada' }
  return { estado: periodo === actual ? 'pendiente' : 'programada' }
}

export function cambiarEstadoNomina(periodo, nuevo, actor) {
  estado.nominas[periodo] = { estado: nuevo, en: ahora(), por: actor.nombre }
  guardar()
}

/**
 * Transferencias de un período (decisión 13-11-2026). Lo recibido cuenta en el
 * mes en que un encargado registró que llegó; lo pendiente, en el mes de la
 * llegada (debe pagarse antes de llegar) o, si desistió fuera de plazo, en el
 * mes del aviso. Con región, solo las casas de esa región.
 */
export function transferenciasDelPeriodo(periodo, region = '') {
  const lineas = []
  for (const r of estado.reservas) {
    if (r.forma_pago.tipo !== 'transferencia') continue
    if (region && casaBase(r.casa_id)?.region !== region) continue
    const base = { reserva: r.codigo, titular: r.titular, casa: casaBase(r.casa_id).nombre, region: casaBase(r.casa_id).region }
    if (r.estado === 'confirmada') {
      if (r.pago) {
        if (mesDe(r.pago.registrado_en) === periodo) lineas.push({ ...base, concepto: `Estadía ${r.entrada} a ${r.salida}`, monto: r.total, recibido: true, comprobante: r.pago.comprobante, por: r.pago.por, fecha: r.pago.registrado_en.slice(0, 10) })
      } else if (mesDe(r.entrada) === periodo) lineas.push({ ...base, concepto: `Estadía ${r.entrada} a ${r.salida}`, monto: r.total, recibido: false, vence: r.entrada })
    }
    if (r.estado === 'desistida' && r.cargo_desistimiento > 0 && !r.pago && mesDe(r.desistida_en) === periodo) {
      lineas.push({ ...base, concepto: 'Desistimiento fuera de plazo: estadía completa', monto: r.cargo_desistimiento, recibido: false, vence: r.desistida_en })
    }
  }
  return lineas.sort((a, b) => a.titular.nombre.localeCompare(b.titular.nombre))
}

/** Resumen mensual de la cobranza (decisión 13-11-2026): planilla y transferencias recibidas y pendientes. */
export const resumenCobranza = (region = '') =>
  periodosNomina().map((periodo) => {
    const planilla = nominaPlanilla(periodo, region).reduce((s, l) => s + l.monto, 0)
    const tr = transferenciasDelPeriodo(periodo, region)
    const recibidas = tr.filter((l) => l.recibido).reduce((s, l) => s + l.monto, 0)
    const pendientes = tr.filter((l) => !l.recibido).reduce((s, l) => s + l.monto, 0)
    return { periodo, planilla, recibidas, pendientes, total: planilla + recibidas + pendientes }
  })

export const periodosNomina = () => {
  const actual = primerDiaMes(hoyISO())
  return Array.from({ length: 8 }, (_, i) => mesDe(sumarMeses(actual, 2 - i)))
}

/* ---------- Inventario y acta de entrega (Art. 2 e-f, Art. 13, Anexo B) ---------- */

export const inventarioDe = (casaId) => estado.inventarios[casaId] ?? null

/**
 * Ficha de la reserva (decisión 12-11-2026): un solo documento que reemplaza al
 * comprobante y al acta de entrega. Lleva los datos de la persona, quienes
 * viajan, todas las direcciones de la casa y el inventario vigente con el acta
 * (Anexo B). Se "envía" al correo de la persona y queda en el historial como
 * archivo descargable. Si la casa aún no tiene inventario, la ficha lo dice.
 */
function enviarFicha(r, cuando = ahora()) {
  const inv = estado.inventarios[r.casa_id] ?? null
  // Sin obtenerCasa(): esto corre también al sembrar, antes de que se definan los ajustes de las casas.
  const casa = casaBase(r.casa_id)
  const otras = estado.direcciones?.[r.casa_id] ?? casa.otras_direcciones ?? []
  r.fichas ??= []
  const numero = `FICHA-${r.codigo.slice(2)}-${r.fichas.length + 1}`
  r.fichas.push({ numero, generada_en: cuando, enviada_a: r.contacto?.correo ?? r.titular.correo, direccion: casa.direccion, otras_direcciones: structuredClone(otras), inventario: inv ? structuredClone(inv) : null })
  r.notificaciones ??= []
  r.notificaciones.push({ tipo: 'ficha', en: cuando, detalle: `Ficha de la reserva ${numero}` + (inv ? ` (inventario versión ${inv.version})` : ' (sin inventario registrado)'), ficha: numero })
  return true
}

/** Reservas confirmadas que aún no comienzan: reciben cada nueva versión del acta. */
export const reservasPorRecibirInventario = (casaId) =>
  estado.reservas.filter((r) => r.casa_id === casaId && r.estado === 'confirmada' && r.entrada >= hoyISO())

/** Guarda una nueva versión y la envía automáticamente. Devuelve cuántas reservas la recibieron. */
export function guardarInventario(casaId, { items, seguridad }, actor) {
  const previo = inventarioDe(casaId)
  estado.inventarios[casaId] = {
    version: (previo?.version ?? 0) + 1,
    actualizado_en: ahora(),
    actualizado_por: actor.nombre,
    items,
    seguridad,
  }
  const destino = reservasPorRecibirInventario(casaId)
  destino.forEach((r) => enviarFicha(r))
  guardar()
  return destino.length
}

export function registrarDevolucion(codigo, actor) {
  const r = estado.reservas.find((x) => x.codigo === codigo)
  if (!r) return
  r.devolucion_pendiente = false
  r.devolucion = { registrada_en: ahora(), por: actor.nombre }
  r.notificaciones ??= []
  r.notificaciones.push({ tipo: 'devolucion', en: ahora(), detalle: 'Devolución registrada' })
  guardar()
}

/* ---------- Reserva asistida (encargada regional o encargado nacional) ---------- */

const normalizar = (rut) => String(rut).replace(/[^0-9kK]/g, '').toUpperCase()
let personasBase = null

/**
 * Busca a una persona por RUT en la nómina de CONAF y Bienestar (en la
 * maqueta: la nómina de demostración y las personas ficticias de las semillas).
 * No devuelve funcionarios de otros servicios: esos datos se ingresan a mano.
 */
export function buscarPersona(rut) {
  const n = normalizar(rut)
  const demo = NOMINA.find((p) => p.perfil === 'solicitante' && normalizar(p.rut) === n)
  if (demo) return { ...demo, grupo_familiar: [] }
  personasBase ??= crearPersonas(210, aleatorio(20261020))
  const p = personasBase.find((x) => x.calidad !== 'otro_servicio' && normalizar(x.rut) === n)
  return p ? { ...p, perfil: 'solicitante', grupo_familiar: [] } : null
}

/* ---------- Tarifas: edición y carga masiva ---------- */

/**
 * Aplica varias tarifas de afiliado a la vez (digitadas o desde planilla) y
 * deja registro. Rigen para las reservas que se hagan desde ahora.
 */
export function actualizarTarifasMasivo(cambios, { metodo, archivo }, actor) {
  const detalle = []
  for (const c of cambios) {
    const tramo = c.tramo ?? 'a'
    const casa = obtenerCasa(c.casa_id)
    const antes = tarifaTramo(casa, tramo)
    if (antes === c.nueva) continue
    estado.tarifas[c.casa_id] = { ...estado.tarifas[c.casa_id], [tramo]: c.nueva }
    detalle.push({ casa_id: c.casa_id, tramo, antes, despues: c.nueva })
  }
  if (!detalle.length) return 0
  estado.historial_tarifas.unshift({ en: ahora(), por: actor.nombre, metodo, archivo: archivo ?? null, cambios: detalle })
  guardar()
  return detalle.length
}

export const historialTarifas = () => estado.historial_tarifas ?? []

/* ---------- Retiro de una casa del sistema ---------- */

/** Reservas confirmadas de una casa que aún no terminan. */
/** Reservas que aún no comienzan: son las que se anulan al retirar la casa. */
export const reservasFuturasDe = (casaId) =>
  estado.reservas.filter((r) => r.casa_id === casaId && r.estado === 'confirmada' && r.entrada > hoyISO()).map(conCasa)

/** Estadía en curso: no se anula; termina en su fecha. */
export const estadiaEnCursoDe = (casaId) => {
  const r = estado.reservas.find((x) => x.casa_id === casaId && x.estado === 'confirmada' && x.entrada <= hoyISO() && x.salida > hoyISO())
  return r ? conCasa(r) : null
}

/**
 * Retira una casa del sistema sin fecha de término (venta, término de
 * convenio, daño mayor). Deja de aparecer al buscar; sus
 * reservas futuras se anulan con aviso y devolución, como en un bloqueo.
 */
export function retirarCasa(casaId, motivo, actor) {
  const afectadas = reservasFuturasDe(casaId)
  for (const a of afectadas) {
    const r = estado.reservas.find((x) => x.codigo === a.codigo)
    r.estado = 'anulada'
    r.motivo_anulacion = `La casa dejó de estar disponible: ${motivo}. Se devolverá lo pagado y le ofreceremos otra casa o fecha (Art. 11).`
    r.anulada_en = ahora()
    if (r.pago) r.devolucion_pendiente = true
    r.notificaciones ??= []
    r.notificaciones.push({ tipo: 'anulacion', en: ahora(), detalle: r.motivo_anulacion })
  }
  estado.inactivas = [...new Set([...estado.inactivas, casaId])]
  estado.retiros.unshift({ casa_id: casaId, accion: 'retiro', motivo, por: actor.nombre, en: ahora(), anuladas: afectadas.length })
  guardar()
  return afectadas.length
}

export function reincorporarCasa(casaId, actor) {
  estado.inactivas = estado.inactivas.filter((x) => x !== casaId)
  estado.retiros.unshift({ casa_id: casaId, accion: 'reincorporacion', por: actor.nombre, en: ahora() })
  guardar()
}

export const ultimoRetiro = (casaId) => (estado.retiros ?? []).find((r) => r.casa_id === casaId)
