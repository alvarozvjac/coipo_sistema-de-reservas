import { almacen, interno, listarCasas, obtenerCasa, ocupacionesDe, registrarAlDesistir } from './servicio.js'
import { etapaAbierta } from './etapa.js'
import { hoyISO, sumarDias } from '../lib/fechas.js'
import { PARAMETROS, fraseTemporada, glosaTransferencia, noches, tarifaPara } from '../lib/reglas.js'
import { HORAS_OFERTA, calendarioDe, calendarioTemporada, inicioTemporada, nochesTurno, pagoTemporada, puedePostular, sortear, turnosDe } from '../lib/sorteo.js'

/*
 * Temporadas altas con postulación y sorteo (Art. 6), solo en la etapa 2
 * (decisión 18-11-2026). Restaurado de e81ce1d, donde vivía en servicio.js
 * (quitado el 13-11-2026), y adaptado a las reglas vigentes: sin aprobación,
 * la reserva adjudicada queda confirmada con su ficha; un turno ya ocupado
 * por una reserva de la marcha blanca no se postula ni se adjudica.
 *
 * Endpoints de la fase 2 (FastAPI):
 *   listarTemporadas() / guardarTemporada(d)  GET | POST /api/temporadas
 *   abrirPostulacion(id, actor)               POST  /api/temporadas/{id}/postulacion
 *   sorteoVigente()                           GET   /api/sorteos/vigente
 *   postular(datos) / retirarPostulacion(c)   POST | DELETE /api/sorteos/{id}/postulaciones
 *   realizarSorteo(actor)                     POST  /api/sorteos/{id}/sorteo
 *   responderOferta(codigo, acepta)           POST  /api/sorteos/{id}/postulaciones/{codigo}/oferta
 *   nochesEnSorteo(casaId)                    GET   /api/casas/{id}/noches-por-sorteo
 */

const estado = () => almacen.leer()
const guardar = () => almacen.guardar()
const ahora = () => new Date().toISOString().slice(0, 19)

/* ---------- Sorteo en foco ---------- */

let foco = null
const sorteosOrdenados = () => [...(estado().sorteos ?? [])].sort((a, b) => (a.temporada.desde < b.temporada.desde ? -1 : 1))

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
  guardar()
}

export const sorteoDe = (temporadaId) => (estado().sorteos ?? []).find((x) => x.id === temporadaId) ?? null

function buscarPostulacion(codigo) {
  for (const s of estado().sorteos ?? []) {
    const p = s.postulaciones.find((x) => x.codigo === codigo)
    if (p) return { s, p }
  }
  return {}
}

/** ¿El turno está libre de reservas y bloqueos en esa casa? (las de la marcha blanca siguen valiendo) */
export const turnoLibre = (casaId, t) => !ocupacionesDe(casaId).some((o) => t.entrada < o.salida && o.entrada < t.salida)

/**
 * El encargado nacional habilita la postulación de una temporada: crea su sorteo.
 * La prioridad (Art. 6 a) y la pérdida de posibilidad (Art. 10 d) salen del
 * último sorteo realizado.
 */
export function abrirPostulacion(temporadaId, actor, hoy = hoyISO()) {
  const e = estado()
  const t = e.temporadas.find((x) => x.id === temporadaId)
  if (!t) return { error: 'No existe esa temporada.' }
  if (sorteoDe(temporadaId)) return { error: 'La postulación de esta temporada ya se habilitó.' }
  if (t.postulacion.hasta < hoy) return { error: 'El cierre de la postulación ya pasó: cámbielo en «Editar» antes de habilitarla.' }
  if (t.desde <= hoy) return { error: 'La temporada ya comenzó.' }
  const previo = sorteosOrdenados().filter((x) => x.estado === 'sorteado' && x.temporada.desde < t.desde).at(-1)
  const anterior = previo
    ? {
        nombre: previo.nombre,
        adjudicados: previo.postulaciones.filter((p) => p.estado === 'adjudicada').map((p) => p.usuario_id),
        perdieron: e.reservas.filter((r) => r.origen === 'sorteo' && r.pierde_sorteo_siguiente && previo.postulaciones.some((p) => p.codigo === r.postulacion)).map((r) => r.titular_id),
      }
    : null
  e.sorteos.push({ id: t.id, nombre: t.nombre, temporada: calendarioTemporada(t), anterior, postulacion: { desde: hoy, hasta: t.postulacion.hasta }, estado: 'postulacion', correlativo: 0, postulaciones: [], abierta_por: actor.nombre, abierta_en: ahora() })
  foco = t.id
  guardar()
  return { id: t.id }
}

/** Datos del sorteo en foco, con sus turnos. */
export function sorteoVigente() {
  const s = sorteoActual()
  if (!s) return null
  const t = estado().temporadas.find((x) => x.id === s.id)
  const temporada = { ...s.temporada, tipo: t?.tipo ?? 'verano' }
  return { ...s, temporada, turnos: turnosDe(temporada), turnosCasa: (casaId) => turnosDe(temporada, casaId) }
}

/** La postulación está abierta solo en la etapa 2 y dentro de su plazo. */
export const postulacionAbierta = (hoy = hoyISO()) => {
  const s = sorteoActual()
  return Boolean(etapaAbierta(hoy) && s && s.estado === 'postulacion' && hoy <= s.postulacion.hasta)
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

/**
 * Registra una postulación: la hace el trabajador desde el aplicativo o un
 * encargado a pedido de la persona (`registrada_por`). Devuelve { codigo } o { error }.
 */
export function postular({ usuario, casa_id, turno, personas, forma_pago, contacto, registrada_por }) {
  const s = sorteoActual()
  if (!postulacionAbierta()) return { error: 'La postulación no está abierta.' }
  if (!puedePostular(usuario)) return { error: 'Los funcionarios de otros servicios públicos no postulan al sorteo (Art. 9).' }
  if (postulacionDe(usuario.id)) return { error: 'Ya hay una postulación en este sorteo: se postula a un solo turno (Art. 6 b). Para cambiarla, retire la anterior.' }
  const casa = obtenerCasa(casa_id)
  if (!casa || personas > casa.capacidad) return { error: 'La casa no admite esa cantidad de personas.' }
  const t = turnosDe(s.temporada, casa.id).find((x) => x.entrada === turno)
  if (!t) return { error: 'Ese turno no existe para la casa elegida.' }
  if (!turnoLibre(casa.id, t)) return { error: 'Ese turno ya está ocupado en esta casa.' }
  s.correlativo += 1
  const codigo = `P-${s.id.slice(0, 1)}${s.id.slice(3, 5)}-${String(s.correlativo).padStart(4, '0')}`
  const c = condicionSorteo(usuario.id)
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
    ...(registrada_por ? { registrada_por } : { via: 'aplicativo' }),
    prioridad: c.prioridad,
    pierde_posibilidad: c.pierde_posibilidad,
    estado: 'postulada',
    creada_en: ahora(),
    notificaciones: [{ tipo: 'postulacion', en: ahora(), detalle: 'Comprobante de postulación' }],
  })
  guardar()
  return { codigo }
}

export function retirarPostulacion(codigo, actor) {
  const { p } = buscarPostulacion(codigo)
  if (!p || p.estado !== 'postulada') return
  p.estado = 'retirada'
  p.retirada_en = ahora()
  if (actor) p.retirada_por = actor.nombre
  guardar()
}

/** Crea la reserva confirmada de una postulación adjudicada, con su ficha (sin aprobación desde el 13-11-2026). */
function reservaDesdePostulacion(p, via) {
  const e = estado()
  const casa = obtenerCasa(p.casa_id)
  const s = (e.sorteos ?? []).find((x) => x.postulaciones.includes(p))
  const salida = p.salida ?? sumarDias(p.turno, nochesTurno(s?.temporada))
  const tarifa = tarifaPara(casa, p.titular)
  const codigo = interno.nuevoCodigo()
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
  if (r.forma_pago.tipo === 'transferencia') r.notificaciones.push({ tipo: 'por_confirmar', en: ahora(), detalle: 'Turno adjudicado: datos para la transferencia' })
  interno.enviarFicha(r)
  e.reservas.push(r)
  p.reserva = codigo
  return r
}

/**
 * Cierra la postulación y realiza el sorteo (Art. 6). La semilla queda
 * registrada para reproducir y auditar el resultado. Si una reserva de la
 * marcha blanca ya ocupa el turno, la postulación queda «sin cupo».
 */
export function realizarSorteo(actor) {
  const s = sorteoActual()
  if (!s || s.estado !== 'postulacion') return
  const semilla = Math.floor(Math.random() * 900000) + 100000
  const lista = s.postulaciones.filter((p) => p.estado === 'postulada')
  const porCodigo = new Map(lista.map((p) => [p.codigo, p]))
  for (const res of sortear(lista, semilla)) {
    const p = porCodigo.get(res.codigo)
    if (res.resultado === 'adjudicada' && !turnoLibre(p.casa_id, { entrada: p.turno, salida: p.salida })) {
      p.estado = 'sin_cupo'
      p.motivo = 'El turno ya estaba ocupado por una reserva registrada antes del sorteo.'
    } else {
      p.estado = res.resultado
      if (res.posicion) p.posicion = res.posicion
      if (res.motivo) p.motivo = res.motivo
      if (res.resultado === 'adjudicada') reservaDesdePostulacion(p, 'Sorteo de temporada alta')
    }
    p.notificaciones.push({
      tipo: 'resultado',
      en: ahora(),
      detalle: p.estado === 'adjudicada' ? `Resultado del sorteo: adjudicada (reserva ${p.reserva})` : p.estado === 'espera' ? `Resultado del sorteo: lista de espera, lugar ${p.posicion}` : `Resultado del sorteo: ${p.motivo}`,
    })
  }
  Object.assign(s, { estado: 'sorteado', semilla, sorteado_en: ahora(), sorteado_por: actor.nombre, postulacion: { ...s.postulacion, cerrada_en: ahora() } })
  guardar()
}

/** Ofrece el cupo liberado a la siguiente persona de la lista de espera (Art. 6 d). */
function ofrecerSiguiente(casaId, turno) {
  const s = (estado().sorteos ?? []).find((x) => x.estado === 'sorteado' && turno >= inicioTemporada(x.temporada) && turno < x.temporada.hasta)
  if (!s) return
  const siguiente = s.postulaciones.filter((p) => p.casa_id === casaId && p.turno === turno && p.estado === 'espera').sort((a, b) => a.posicion - b.posicion)[0]
  if (!siguiente) return
  siguiente.estado = 'ofertada'
  siguiente.oferta = { enviada_en: ahora(), vence_en: new Date(Date.now() + HORAS_OFERTA * 3600000).toISOString().slice(0, 19) }
  siguiente.notificaciones.push({ tipo: 'oferta', en: ahora(), detalle: `Se liberó el turno: tiene ${HORAS_OFERTA} horas para aceptarlo` })
}

// Art. 10 d): desistir tarde de un turno adjudicado hace perder el sorteo siguiente; el cupo pasa a la lista de espera.
registrarAlDesistir((r) => {
  if (r.origen !== 'sorteo') return
  if (r.cargo_desistimiento > 0) r.pierde_sorteo_siguiente = true
  ofrecerSiguiente(r.casa_id, r.entrada)
})

/** La persona acepta o rechaza el cupo ofrecido (desde el aplicativo o por medio de un encargado). */
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
 * Turnos sin adjudicar después del sorteo: libres y sin nadie esperando. Se
 * publican como vacantes y se reservan directo, también por funcionarios de
 * otros servicios (Art. 6 c y Art. 9).
 */
export function turnosVacantes(todas = false) {
  const sorteos = todas ? (estado().sorteos ?? []).filter((x) => x.estado === 'sorteado') : [sorteoActual()].filter((x) => x?.estado === 'sorteado')
  return sorteos.flatMap((s) => {
    const lista = []
    for (const casa of listarCasas())
      for (const t of turnosDe(s.temporada, casa.id)) {
        const esperando = s.postulaciones.some((p) => p.casa_id === casa.id && p.turno === t.entrada && ['espera', 'ofertada'].includes(p.estado))
        if (turnoLibre(casa.id, t) && !esperando) lista.push({ casa, ...t })
      }
    return lista
  })
}

/** Noches de temporada alta liberadas para reserva directa (vacantes de sorteos ya realizados). */
function nochesLiberadas(casaId) {
  const set = new Set()
  for (const s of (estado().sorteos ?? []).filter((x) => x.estado === 'sorteado'))
    for (const t of turnosDe(s.temporada, casaId)) {
      const esperando = s.postulaciones.some((p) => p.casa_id === casaId && p.turno === t.entrada && ['espera', 'ofertada'].includes(p.estado))
      if (!esperando) for (let d = t.entrada; d < t.salida; d = sumarDias(d, 1)) set.add(d)
    }
  return set
}

/**
 * Noches de una casa que en la etapa 2 se asignan por sorteo y no se reservan
 * directo: desde la llegada del primer turno de su calendario hasta el fin de
 * la temporada, salvo los turnos que quedaron vacantes. En la marcha blanca, ninguna.
 */
export function nochesEnSorteo(casaId, hoy = hoyISO()) {
  const set = new Set()
  if (!etapaAbierta(hoy)) return set
  const liberadas = nochesLiberadas(casaId)
  for (const t of estado().temporadas ?? []) {
    if (t.hasta <= hoy) continue
    for (let d = calendarioDe(t, casaId).desde; d && d < t.hasta; d = sumarDias(d, 1)) if (d > hoy && !liberadas.has(d)) set.add(d)
  }
  return set
}

/** Mensaje si las fechas pisan noches que se asignan por sorteo (Art. 6). */
export function erroresTemporada(casaId, entrada, salida) {
  if (!entrada || !salida) return []
  const set = nochesEnSorteo(casaId)
  for (let d = entrada; d < salida; d = sumarDias(d, 1))
    if (set.has(d)) {
      const t = (estado().temporadas ?? []).find((x) => d >= inicioTemporada(x) && d < x.hasta)
      return [`Las fechas caen en ${t ? fraseTemporada(t) : 'una temporada alta'}, que en la etapa 2 se asigna por sorteo entre quienes postulan (Art. 6).`]
    }
  return []
}

/* ---------- Temporadas altas (encargado nacional, Art. 6) ---------- */

export const listarTemporadas = () => [...(estado().temporadas ?? [])].sort((a, b) => (a.desde < b.desde ? -1 : 1))

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
  if (s?.estado === 'sorteado') return 'cerrada'
  return s?.postulaciones.some((p) => p.estado !== 'retirada') ? 'solo_cierre' : 'completa'
}

/** Crea o modifica una temporada. Devuelve { id } o { error, errores }. */
export function guardarTemporada(datos, actor, hoy = hoyISO()) {
  const e = estado()
  const previa = datos.id ? e.temporadas.find((t) => t.id === datos.id) : null
  const t = normalizarTemporada({ ...previa, ...datos })
  const errores = validarTemporada(t, previa, hoy)
  if (errores.length) return { error: errores[0], errores }
  if (previa) Object.assign(previa, t, { modificada_por: actor.nombre, modificada_en: ahora() })
  else {
    t.id = `${t.tipo === 'invierno' ? 'I' : 'V'}${t.desde.slice(0, 4)}-${Date.now().toString(36).slice(-4)}`
    e.temporadas.push({ ...t, creada_por: actor.nombre, creada_en: ahora() })
  }
  const final = e.temporadas.find((x) => x.id === (previa?.id ?? t.id))
  const so = sorteoDe(final.id)
  if (so) Object.assign(so, { nombre: final.nombre, temporada: calendarioTemporada(final), postulacion: { ...so.postulacion, hasta: final.postulacion.hasta } })
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
    const cruce = estado().temporadas.find((o) => o.id !== t.id && inicioTemporada(t) < o.hasta && inicioTemporada(o) < t.hasta)
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
