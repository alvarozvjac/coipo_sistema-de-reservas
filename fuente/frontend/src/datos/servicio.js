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
 *   crearReserva(datos)                       POST  /api/reservas   (aprobada, o por aprobar si la registra el nacional)
 *   aprobarReserva / rechazarReserva          POST  /api/reservas/{codigo}/aprobacion | /rechazo
 *   reservasPorAprobar(region)                GET   /api/reservas?estado=por_aprobar&region={region}
 *   actualizarDirecciones(id, lista)          PUT   /api/casas/{id}/direcciones
 *   disponibilidad(consulta)                  GET   /api/disponibilidad?entrada&salida&personas&region
 *   desistirReserva(codigo)                   POST  /api/reservas/{codigo}/desistimiento
 *   registrarPago(codigo, datos, actor)       POST  /api/reservas/{codigo}/pago
 *   nominaPlanilla(periodo)                   GET   /api/nomina-descuentos/{AAAA-MM}
 *   cambiarEstadoNomina(periodo, estado)      PATCH /api/nomina-descuentos/{AAAA-MM}
 *   inventarioDe(casaId) / guardarInventario  GET | PUT /api/casas/{id}/inventario
 *   sorteoVigente()                           GET   /api/sorteos/vigente
 *   postular(datos) / retirarPostulacion(c)   POST | DELETE /api/sorteos/{id}/postulaciones
 *   realizarSorteo(actor)                     POST  /api/sorteos/{id}/sorteo
 *   responderOferta(codigo, acepta)           POST  /api/sorteos/{id}/postulaciones/{codigo}/oferta
 *   nochesLiberadas(casaId)                   GET   /api/casas/{id}/vacantes-temporada-alta
 */

import { useSyncExternalStore } from 'react'
import { CASAS } from './casas.js'
import { NOMINA } from './usuarios.js'
import { regionConEncargada } from './iam.js'
import { ADICIONAL_BASE, AUTOMATICA, aleatorio, crearPersonas, pagoTemporada, semillas as semillasBase, sincronizarTemporadas } from './semillas.js'

export { pagoTemporada }
import { hoyISO, mesDe, primerDiaMes, sumarDias, sumarMeses } from '../lib/fechas.js'
import { ADICIONAL_TARIFA, PARAMETROS, cargoDesistimiento, glosaTransferencia, noches, porConfirmar, tarifaPara, tarifaTramo, temporadaAltaDe } from '../lib/reglas.js'
import { HORAS_OFERTA, calendarioTemporada, inicioTemporada, nochesTurno, puedePostular, sortear, turnosDe } from '../lib/sorteo.js'

const CLAVE = 'reserva_veraneo_v15'

const ahora = () => new Date().toISOString().slice(0, 19)

const casaBase = (id) => CASAS.find((c) => c.id === id)

/* ---------- Estado y suscripción ---------- */

/** Estado inicial de la demostración, con las fichas ya enviadas a las reservas confirmadas recientes. */
function semillas(hoy) {
  estado = semillasBase(hoy)
  for (const r of estado.reservas) {
    if (r.estado === 'confirmada' && !porConfirmar(r) && r.salida > sumarDias(hoy, -15)) {
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
sincronizarTemporadas(estado.temporadas)

function cargar() {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE))
    if (guardado?.reservas && guardado?.inventarios && guardado?.bloqueos && guardado?.sorteos && guardado?.temporadas) return guardado
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

/** Las tarifas diferenciadas vigentes se aplican a las reglas de cálculo. */
function aplicarAdicionales() {
  Object.assign(ADICIONAL_TARIFA, estado.adicionales ?? ADICIONAL_BASE)
}

export function reiniciarDemo() {
  foco = null
  estado = semillas(hoyISO())
  aplicarAdicionales()
  sincronizarTemporadas(estado.temporadas)
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

/** Ocupan fechas: las vigentes y las por aprobar (apartadas hasta que se aprueban o rechazan). */
const ocupa = (r) => !['desistida', 'anulada', 'rechazada'].includes(r.estado)

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
  if (requiereAprobacion(registrada_por)) {
    // Decisión 12-11-2026: lo que registra el encargado nacional queda por aprobar, con las
    // fechas apartadas; a la persona no se le envía nada hasta que se aprueba.
    r.estado = 'pendiente_aprobacion'
    r.notificaciones.push({ tipo: 'solicitud', en: ahora(), detalle: 'Reserva registrada por el encargado nacional: por aprobar' })
  } else {
    // La registra la encargada de la región de la casa: queda aprobada al registrarla.
    aprobar(r, registrada_por?.nombre ?? AUTOMATICA)
  }
  estado.reservas.push(r)
  guardar()
  return codigo
}

/** Solo la registrada por el encargado nacional espera aprobación (decisión 12-11-2026). */
const requiereAprobacion = (registrada_por) => registrada_por?.perfil === 'central'

/**
 * Aprueba: con planilla queda confirmada y se envía la ficha de la reserva; con
 * transferencia, se envían los datos para transferir y la ficha recién cuando
 * se registra el pago (decisión 12-11-2026).
 */
function aprobar(r, por) {
  r.estado = 'confirmada'
  r.aprobada_por = por
  r.aprobada_en = ahora()
  r.confirmada_por = por
  r.confirmada_en = ahora()
  if (porConfirmar(r)) r.notificaciones.push({ tipo: 'por_confirmar', en: ahora(), detalle: 'Reserva aprobada: datos para la transferencia' })
  else enviarFicha(r)
}

/** Reservas por aprobar; sin región, las de todo el país. */
export const reservasPorAprobar = (region) =>
  estado.reservas
    .filter((r) => r.estado === 'pendiente_aprobacion' && (!region || casaBase(r.casa_id)?.region === region))
    .map(conCasa)
    .sort((a, b) => (a.entrada < b.entrada ? -1 : 1))

/**
 * Quién aprueba: la encargada regional de la región de la casa. Si esa región
 * aún no tiene encargada con rol en el COIPO IAM, la aprueba el encargado
 * nacional ([PENDIENTE] confirmar con Bienestar).
 */
export function puedeAprobar(gestor, r) {
  const region = casaBase(r.casa_id)?.region
  if (gestor?.perfil === 'encargada') return gestor.region === region
  return gestor?.perfil === 'central' && !regionConEncargada(region)
}

export function aprobarReserva(codigo, actor) {
  const r = estado.reservas.find((x) => x.codigo === codigo)
  if (!r || r.estado !== 'pendiente_aprobacion') return false
  aprobar(r, actor.nombre)
  guardar()
  return true
}

/** No aprobada: se liberan las fechas y se avisa a la persona con el motivo. */
export function rechazarReserva(codigo, motivo, actor) {
  const r = estado.reservas.find((x) => x.codigo === codigo)
  if (!r || r.estado !== 'pendiente_aprobacion') return false
  r.estado = 'rechazada'
  r.rechazo = { motivo, por: actor.nombre, en: ahora() }
  r.notificaciones.push({ tipo: 'rechazo', en: ahora(), detalle: `Reserva no aprobada: ${motivo}` })
  guardar()
  return true
}

/**
 * Consulta de disponibilidad nacional (encargada regional y nacional): para
 * cada casa activa, si está libre entre `entrada` y `salida` para `personas`.
 * No mira la anticipación ni la regla de una reserva por mes: esas dependen de
 * la persona y se revisan al registrar.
 */
export function disponibilidad({ entrada, salida, personas = 1, region = '' }) {
  return listarCasas()
    .filter((c) => !region || c.region === region)
    .map((c) => {
      let motivo = null
      if (c.capacidad < personas) motivo = 'capacidad'
      else if (ocupacionesDe(c.id).some((o) => entrada < o.salida && o.entrada < salida)) motivo = 'ocupada'
      else {
        const liberadas = nochesLiberadas(c.id)
        for (let d = entrada; d < salida; d = sumarDias(d, 1)) if (temporadaAltaDe(d) && !liberadas.has(d)) motivo = 'temporada_alta'
      }
      return { casa: c, disponible: !motivo, motivo }
    })
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
  if (r.origen === 'sorteo') {
    // Art. 10 d): desistir tarde en temporada alta hace perder el sorteo siguiente.
    if (r.cargo_desistimiento > 0) r.pierde_sorteo_siguiente = true
    ofrecerSiguiente(r.casa_id, r.entrada)
  }
  guardar()
}

/* ---------- Cobros (Art. 21, Anexo A) ---------- */

/** Pagos por transferencia o en Bienestar aún no registrados, de reservas confirmadas. */
export const pagosPorRegistrar = () =>
  estado.reservas
    .filter((r) => r.estado === 'confirmada' && r.forma_pago.tipo !== 'planilla' && !r.pago)
    .map(conCasa)
    .sort((a, b) => (a.entrada < b.entrada ? -1 : 1))

export function registrarPago(codigo, { comprobante }, actor) {
  const r = estado.reservas.find((x) => x.codigo === codigo)
  if (!r) return
  const confirma = porConfirmar(r) && r.entrada > hoyISO()
  r.pago = { registrado_en: ahora(), comprobante, por: actor.nombre }
  r.notificaciones ??= []
  r.notificaciones.push({ tipo: 'pago', en: ahora(), detalle: `Pago registrado (${comprobante})` })
  if (confirma) {
    // Decisión 02-11-2026: comprobado el pago, la reserva queda confirmada y recién ahí se envía la ficha (12-11-2026).
    r.confirmada_por = actor.nombre
    r.confirmada_en = ahora()
    enviarFicha(r)
  }
  guardar()
  return confirma
}

/**
 * Líneas de la nómina de descuentos de un período (AAAA-MM). Cada estadía
 * finalizada con planilla se descuenta en cuotas a partir del mes siguiente
 * a la salida; un turno de temporada alta, desde el mes que fija la temporada
 * (Memo 6188/2026: 6 cuotas desde marzo); los cargos por desistimiento, en el
 * mes siguiente al aviso.
 */
export function nominaPlanilla(periodo) {
  const lineas = []
  for (const r of estado.reservas) {
    if (r.forma_pago.tipo !== 'planilla') continue
    const desdeMes = r.forma_pago.desde_mes
    if (r.estado === 'confirmada' && (desdeMes || r.salida <= hoyISO())) {
      const cuotas = r.forma_pago.cuotas ?? 1
      for (let k = 1; k <= cuotas; k++) {
        const mes = desdeMes ? mesDe(sumarMeses(desdeMes + '-01', k - 1)) : mesDe(sumarMeses(r.salida, k))
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
  estado.reservas.filter((r) => r.casa_id === casaId && r.estado === 'confirmada' && !porConfirmar(r) && r.entrada >= hoyISO())

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

/* ---------- Sorteo de temporada alta (Art. 6) ---------- */

/*
 * Cada temporada alta tiene su propio sorteo, que existe desde que Oficina
 * Central habilita la postulación (decisión 02-11-2026). La interfaz trabaja
 * sobre un sorteo «en foco»: el que se eligió, o si no, el que tiene la
 * postulación abierta, o el más próximo que no haya terminado.
 */
let foco = null

const sorteosOrdenados = () => [...(estado.sorteos ?? [])].sort((a, b) => (a.temporada.desde < b.temporada.desde ? -1 : 1))

function sorteoActual() {
  const lista = sorteosOrdenados()
  const elegido = lista.find((x) => x.id === foco)
  if (elegido) return elegido
  const hoy = hoyISO()
  return lista.find((x) => x.estado === 'postulacion' && hoy <= x.postulacion.hasta) ?? lista.find((x) => x.temporada.hasta > hoy) ?? lista.at(-1) ?? null
}

/** Pone en foco el sorteo de una temporada (la interfaz lo elige con las tarjetas de temporadas). */
export function elegirSorteo(id) {
  foco = id
  version++
  oyentes.forEach((f) => f())
}

export const sorteoDe = (temporadaId) => (estado.sorteos ?? []).find((x) => x.id === temporadaId) ?? null

/** Busca una postulación por código en todos los sorteos. */
function buscarPostulacion(codigo) {
  for (const s of estado.sorteos ?? []) {
    const p = s.postulaciones.find((x) => x.codigo === codigo)
    if (p) return { s, p }
  }
  return {}
}

/**
 * El encargado nacional habilita la postulación de una temporada: crea su sorteo.
 * La postulación queda abierta desde hoy hasta el cierre definido en la
 * temporada. La prioridad (Art. 6 a) y la pérdida de posibilidad (Art. 10 d)
 * salen del último sorteo realizado.
 */
export function abrirPostulacion(temporadaId, actor, hoy = hoyISO()) {
  const t = estado.temporadas.find((x) => x.id === temporadaId)
  if (!t) return { error: 'No existe esa temporada.' }
  if (sorteoDe(temporadaId)) return { error: 'La postulación de esta temporada ya se habilitó.' }
  if (t.postulacion.hasta < hoy) return { error: 'El cierre de la postulación ya pasó: cámbielo en «Editar» antes de habilitarla.' }
  if (t.desde <= hoy) return { error: 'La temporada ya comenzó.' }
  const previo = sorteosOrdenados().filter((x) => x.estado === 'sorteado' && x.temporada.desde < t.desde).at(-1)
  const anterior = previo
    ? {
        nombre: previo.nombre,
        adjudicados: previo.postulaciones.filter((p) => p.estado === 'adjudicada').map((p) => p.usuario_id),
        perdieron: estado.reservas.filter((r) => r.origen === 'sorteo' && r.pierde_sorteo_siguiente && previo.postulaciones.some((p) => p.codigo === r.postulacion)).map((r) => r.titular_id),
      }
    : null
  estado.sorteos.push({
    id: t.id,
    nombre: t.nombre,
    temporada: calendarioTemporada(t),
    anterior,
    postulacion: { desde: hoy, hasta: t.postulacion.hasta },
    estado: 'postulacion',
    correlativo: 0,
    postulaciones: [],
    abierta_por: actor.nombre,
    abierta_en: ahora(),
  })
  foco = t.id
  guardar()
  return { id: t.id }
}

/** Datos del sorteo en foco, con sus turnos. */
export function sorteoVigente() {
  const s = sorteoActual()
  if (!s) return null
  const t = estado.temporadas.find((x) => x.id === s.id)
  const temporada = { ...s.temporada, tipo: t?.tipo ?? 'verano' }
  return { ...s, temporada, turnos: turnosDe(temporada), turnosCasa: (casaId) => turnosDe(temporada, casaId) }
}

export const postulacionAbierta = (hoy = hoyISO()) => {
  const s = sorteoActual()
  return Boolean(s && s.estado === 'postulacion' && hoy <= s.postulacion.hasta)
}

const vigentes = (p) => p.estado !== 'retirada'

export const postulacionDe = (usuarioId) => {
  const p = sorteoActual()?.postulaciones.find((x) => x.usuario_id === usuarioId && vigentes(x))
  return p ? { ...p, casa: obtenerCasa(p.casa_id) } : null
}

/** Postulaciones vigentes de una persona en todos los sorteos, con el nombre de cada sorteo. */
export const postulacionesDe = (usuarioId) =>
  sorteosOrdenados().flatMap((s) => s.postulaciones.filter((p) => p.usuario_id === usuarioId && vigentes(p)).map((p) => ({ ...p, casa: obtenerCasa(p.casa_id), sorteo: { id: s.id, nombre: s.nombre } })))

export const postulaciones = () => (sorteoActual()?.postulaciones ?? []).map((p) => ({ ...p, casa: obtenerCasa(p.casa_id) }))

/** Postulaciones vigentes por casa y turno: { 'casa|turno': n }. */
export function demanda() {
  const m = {}
  for (const p of sorteoActual()?.postulaciones ?? []) if (vigentes(p)) m[`${p.casa_id}|${p.turno}`] = (m[`${p.casa_id}|${p.turno}`] ?? 0) + 1
  return m
}

/** Prioridad (Art. 6 a) y posibilidad (Art. 10 d) de una persona en este sorteo. */
export function condicionSorteo(usuarioId) {
  const a = sorteoActual()?.anterior
  return { prioridad: !a?.adjudicados.includes(usuarioId), pierde_posibilidad: Boolean(a?.perdieron.includes(usuarioId)), anterior: a?.nombre }
}

/** Registra una postulación. Devuelve el código o un mensaje de error. */
/** La postulación la registra un encargado a pedido de la persona (`registrada_por`, desde el 12-11-2026). */
export function postular({ usuario, casa_id, turno, personas, forma_pago, contacto, registrada_por }) {
  const s = sorteoActual()
  if (!postulacionAbierta()) return { error: 'La postulación no está abierta.' }
  if (!puedePostular(usuario)) return { error: 'Los funcionarios de otros servicios públicos no postulan al sorteo (Art. 9).' }
  if (postulacionDe(usuario.id)) return { error: 'Esta persona ya tiene una postulación en este sorteo: se postula a un solo turno (Art. 6 b). Si quiere cambiarla, retire la anterior.' }
  const casa = obtenerCasa(casa_id)
  if (!casa || personas > casa.capacidad) return { error: 'La casa no admite esa cantidad de personas.' }
  const t = turnosDe(s.temporada, casa.id).find((x) => x.entrada === turno)
  if (!t) return { error: 'Ese turno no existe para la casa elegida.' }
  s.correlativo += 1
  const codigo = `P-${s.id.slice(0, 1)}${s.id.slice(3, 5)}-${String(s.correlativo).padStart(4, '0')}`
  s.postulaciones.push({
    codigo,
    usuario_id: usuario.id,
    titular: { nombre: usuario.nombre, rut: usuario.rut, rol: usuario.rol, region: usuario.region, calidad: usuario.calidad, grado: usuario.grado, plazo_fijo: Boolean(usuario.plazo_fijo), correo: contacto.correo, telefono: contacto.telefono },
    casa_id,
    turno,
    salida: t.salida,
    personas,
    forma_pago: forma_pago.tipo === 'planilla' ? pagoTemporada(s.temporada) : forma_pago,
    contacto,
    ...(registrada_por && { registrada_por }),
    prioridad: condicionSorteo(usuario.id).prioridad,
    pierde_posibilidad: condicionSorteo(usuario.id).pierde_posibilidad,
    estado: 'postulada',
    creada_en: ahora(),
    notificaciones: [{ tipo: 'postulacion', en: ahora(), detalle: 'Comprobante de postulación' }],
  })
  guardar()
  return { codigo }
}

export function retirarPostulacion(codigo) {
  const { p } = buscarPostulacion(codigo)
  if (!p || p.estado !== 'postulada') return
  p.estado = 'retirada'
  p.retirada_en = ahora()
  guardar()
}

/** Crea la reserva confirmada de una postulación adjudicada. */
function reservaDesdePostulacion(p, via) {
  const casa = obtenerCasa(p.casa_id)
  const s = (estado.sorteos ?? []).find((x) => x.postulaciones.includes(p))
  const salida = p.salida ?? sumarDias(p.turno, nochesTurno(s?.temporada))
  const tarifa = tarifaPara(casa, p.titular)
  const codigo = nuevoCodigo()
  const r = {
    codigo,
    titular_id: p.usuario_id,
    titular: p.titular,
    casa_id: p.casa_id,
    entrada: p.turno,
    salida,
    tarifa_noche: tarifa,
    total: tarifa * noches(p.turno, salida),
    ocupantes: [{ nombre: p.titular.nombre, parentesco: 'titular' }, ...Array.from({ length: p.personas - 1 }, (_, i) => ({ nombre: `Acompañante ${i + 1}`, parentesco: 'acompanante' }))],
    contacto: p.contacto,
    perro_asistencia: false,
    forma_pago: p.forma_pago.tipo === 'transferencia' ? { ...p.forma_pago, glosa: glosaTransferencia(casa, codigo) } : p.forma_pago,
    acepta_reglamento: true,
    estado: 'confirmada',
    origen: 'sorteo',
    postulacion: p.codigo,
    creada_en: ahora(),
    confirmada_por: via,
    confirmada_en: ahora(),
    notificaciones: [],
  }
  if (porConfirmar(r)) r.notificaciones.push({ tipo: 'por_confirmar', en: ahora(), detalle: 'Reserva adjudicada: datos para la transferencia' })
  else enviarFicha(r)
  estado.reservas.push(r)
  p.reserva = codigo
  return r
}

/**
 * Cierra la postulación y realiza el sorteo (Art. 6). La semilla queda
 * registrada para que el resultado se pueda reproducir y auditar. Crea las
 * reservas adjudicadas y comunica el resultado a cada postulante (Art. 6 c).
 */
export function realizarSorteo(actor) {
  const s = sorteoActual()
  if (!s || s.estado !== 'postulacion') return
  const semilla = Math.floor(Math.random() * 900000) + 100000
  const lista = s.postulaciones.filter((p) => p.estado === 'postulada')
  const resultados = sortear(lista, semilla)
  const porCodigo = new Map(lista.map((p) => [p.codigo, p]))
  for (const res of resultados) {
    const p = porCodigo.get(res.codigo)
    p.estado = res.resultado
    if (res.posicion) p.posicion = res.posicion
    if (res.motivo) p.motivo = res.motivo
    if (res.resultado === 'adjudicada') reservaDesdePostulacion(p, 'Sorteo de temporada alta')
    p.notificaciones.push({
      tipo: 'resultado',
      en: ahora(),
      detalle:
        res.resultado === 'adjudicada'
          ? `Resultado del sorteo: adjudicada (reserva ${p.reserva})`
          : res.resultado === 'espera'
            ? `Resultado del sorteo: lista de espera, lugar ${res.posicion}`
            : 'Resultado del sorteo: sin posibilidad (Art. 10 d)',
    })
  }
  s.estado = 'sorteado'
  s.semilla = semilla
  s.sorteado_en = ahora()
  s.sorteado_por = actor.nombre
  s.postulacion = { ...s.postulacion, cerrada_en: ahora() }
  guardar()
}

/** Ofrece el cupo liberado a la siguiente persona de la lista de espera (Art. 6 d). */
function ofrecerSiguiente(casaId, turno) {
  const s = (estado.sorteos ?? []).find((x) => x.estado === 'sorteado' && turno >= inicioTemporada(x.temporada) && turno < x.temporada.hasta)
  if (!s) return
  const siguiente = s.postulaciones
    .filter((p) => p.casa_id === casaId && p.turno === turno && p.estado === 'espera')
    .sort((a, b) => a.posicion - b.posicion)[0]
  if (!siguiente) return
  const vence = new Date(Date.now() + HORAS_OFERTA * 3600000).toISOString().slice(0, 19)
  siguiente.estado = 'ofertada'
  siguiente.oferta = { enviada_en: ahora(), vence_en: vence }
  siguiente.notificaciones.push({ tipo: 'oferta', en: ahora(), detalle: `Se liberó el turno: tiene ${HORAS_OFERTA} horas para aceptarlo` })
}

/** La persona acepta o rechaza el cupo ofrecido. */
export function responderOferta(codigo, acepta) {
  const { p } = buscarPostulacion(codigo)
  if (!p || p.estado !== 'ofertada') return null
  p.oferta.respondida_en = ahora()
  let reserva = null
  if (acepta) {
    p.estado = 'adjudicada'
    p.oferta.resultado = 'aceptada'
    reserva = reservaDesdePostulacion(p, 'Lista de espera del sorteo').codigo
  } else {
    p.estado = 'sin_cupo'
    p.oferta.resultado = 'rechazada'
    p.motivo = 'Rechazó el cupo ofrecido.'
    ofrecerSiguiente(p.casa_id, p.turno)
  }
  guardar()
  return reserva
}

/** Vence una oferta sin respuesta y pasa a la siguiente persona. En la maqueta, el encargado nacional lo simula. */
export function vencerOferta(codigo) {
  const { p } = buscarPostulacion(codigo)
  if (!p || p.estado !== 'ofertada') return
  p.estado = 'sin_cupo'
  p.oferta.resultado = 'vencida'
  p.motivo = `No respondió dentro de ${HORAS_OFERTA} horas.`
  ofrecerSiguiente(p.casa_id, p.turno)
  guardar()
}

/**
 * Turnos sin adjudicar después del sorteo: sin reserva vigente y sin nadie
 * esperando. Se publican como vacantes y se reservan directo, también por
 * funcionarios de otros servicios (Art. 6 c y Art. 9).
 */
export function turnosVacantes(todas = false) {
  const sorteos = todas ? (estado.sorteos ?? []).filter((x) => x.estado === 'sorteado') : [sorteoActual()].filter((x) => x?.estado === 'sorteado')
  return sorteos.flatMap(vacantesDe)
}

function vacantesDe(s) {
  const lista = []
  for (const casa of listarCasas()) {
    for (const t of turnosDe(s.temporada, casa.id)) {
      const tomado = estado.reservas.some((r) => r.casa_id === casa.id && r.origen === 'sorteo' && r.entrada === t.entrada && ocupa(r))
      const esperando = s.postulaciones.some((p) => p.casa_id === casa.id && p.turno === t.entrada && ['espera', 'ofertada'].includes(p.estado))
      if (!tomado && !esperando) lista.push({ casa, ...t })
    }
  }
  return lista
}

/** Noches de temporada alta liberadas para reserva directa (de una casa o de todas). */
export function nochesLiberadas(casaId) {
  const set = new Set()
  for (const v of turnosVacantes(true)) {
    if (casaId !== undefined && v.casa.id !== casaId) continue
    for (let d = v.entrada; d < v.salida; d = sumarDias(d, 1)) set.add(d)
  }
  return set
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

/* ---------- Temporadas altas (encargado nacional, Art. 6) ---------- */

export const listarTemporadas = () => [...estado.temporadas].sort((a, b) => (a.desde < b.desde ? -1 : 1))

/** Estado de una temporada según su sorteo y su plazo de postulación. */
export function estadoTemporada(t, hoy = hoyISO()) {
  const s = sorteoDe(t.id)
  if (t.hasta <= hoy) return 'terminada'
  if (!s) return 'programada'
  if (s.estado === 'sorteado') return 'sorteada'
  if (hoy <= s.postulacion.hasta) return 'postulacion'
  return 'por_sortear'
}

/** Qué se puede cambiar de una temporada: con postulaciones, solo el cierre de la postulación. */
export function edicionTemporada(t) {
  const s = sorteoDe(t.id)
  const conPostulaciones = Boolean(s?.postulaciones.some((p) => p.estado !== 'retirada'))
  if (s?.estado === 'sorteado') return 'cerrada'
  return conPostulaciones ? 'solo_cierre' : 'completa'
}

/**
 * Crea o modifica una temporada. Valida fechas, día de cambio, plazo de
 * postulación y que no se cruce con otra temporada. Devuelve { id } o { error }.
 */
export function guardarTemporada(datos, actor, hoy = hoyISO()) {
  const previa = datos.id ? estado.temporadas.find((t) => t.id === datos.id) : null
  const t = normalizarTemporada({ ...previa, ...datos })
  const errores = validarTemporada(t, previa, hoy)
  if (errores.length) return { error: errores[0], errores }
  if (previa) {
    Object.assign(previa, t, { modificada_por: actor.nombre, modificada_en: ahora() })
  } else {
    t.id = `${t.tipo === 'invierno' ? 'I' : 'V'}${t.desde.slice(0, 4)}-${Date.now().toString(36).slice(-4)}`
    estado.temporadas.push({ ...t, creada_por: actor.nombre, creada_en: ahora() })
  }
  const final = estado.temporadas.find((x) => x.id === (previa?.id ?? t.id))
  const so = sorteoDe(final.id)
  if (so) {
    so.nombre = final.nombre
    so.temporada = calendarioTemporada(final)
    so.postulacion = { ...so.postulacion, hasta: final.postulacion.hasta }
  }
  sincronizarTemporadas(estado.temporadas)
  guardar()
  return { id: final.id }
}

export function validarTemporada(t, previa, hoy = hoyISO()) {
  const e = []
  if (!t.nombre?.trim()) e.push('Escriba el nombre de la temporada.')
  if (!t.desde || !t.hasta) e.push('Indique la llegada del primer turno y la salida del último.')
  else {
    if (t.hasta <= t.desde) e.push('El fin de la temporada debe ser posterior a la llegada del primer turno.')
    if (!(t.noches >= 1 && t.noches <= 14)) e.push('Los turnos deben tener entre 1 y 14 noches.')
    if (!(t.libres >= 0 && t.libres <= 7)) e.push('Las noches libres entre turnos deben estar entre 0 y 7.')
    if (!turnosDe(t).length) e.push(`Entre la llegada del primer turno y el fin de la temporada no cabe un turno de ${t.noches} noches.`)
    if (t.especial) {
      if (!t.especial.desde) e.push('Indique la llegada del primer turno del calendario especial.')
      else if (!turnosDe(t, t.especial.casas[0]).length) e.push(`En el calendario especial no cabe un turno de ${t.noches} noches antes del fin de la temporada.`)
      if (!(t.especial.libres >= 0 && t.especial.libres <= 7)) e.push('Las noches libres del calendario especial deben estar entre 0 y 7.')
    }
    if (!(t.cuotas >= 1 && t.cuotas <= 12)) e.push('Indique entre 1 y 12 cuotas de descuento por planilla.')
    if (!t.primera_cuota) e.push('Indique el mes de la primera cuota.')
    if (!previa && inicioTemporada(t) <= hoy) e.push('La temporada debe comenzar después de hoy.')
    const cruce = estado.temporadas.find((o) => o.id !== t.id && inicioTemporada(t) < o.hasta && inicioTemporada(o) < t.hasta)
    if (cruce) e.push(`Se cruza con ${cruce.nombre}.`)
  }
  if (!t.postulacion?.desde || !t.postulacion?.hasta) e.push('Indique el plazo de postulación.')
  else {
    if (t.postulacion.hasta < t.postulacion.desde) e.push('El cierre de la postulación debe ser posterior a su apertura.')
    if (t.desde && t.postulacion.hasta >= inicioTemporada(t)) e.push('La postulación debe cerrar antes de que comience la temporada.')
  }
  if (previa) {
    const modo = edicionTemporada(previa)
    if (modo === 'cerrada') e.push('El sorteo de esta temporada ya se realizó: no se puede modificar.')
    if (modo === 'solo_cierre' && (JSON.stringify(calendarioTemporada(t)) !== JSON.stringify(calendarioTemporada(previa)) || t.postulacion.desde !== previa.postulacion.desde))
      e.push('Ya hay postulaciones: solo se puede cambiar el cierre de la postulación.')
  }
  return e
}

/** Números como números y calendario especial vacío como null. */
function normalizarTemporada(t) {
  const n = (v, def) => (v === '' || v === undefined || v === null ? def : Number(v))
  const especial = t.especial?.casas?.length ? { casas: t.especial.casas.map(Number), desde: t.especial.desde ?? '', libres: n(t.especial.libres, 1) } : null
  return { ...t, noches: n(t.noches, PARAMETROS.noches_turno_temporada_alta), libres: n(t.libres, 0), especial, cuotas: n(t.cuotas, PARAMETROS.cuotas_temporada_alta), primera_cuota: t.primera_cuota || '' }
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
 * convenio, daño mayor). Deja de aparecer al buscar y en el sorteo; sus
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
