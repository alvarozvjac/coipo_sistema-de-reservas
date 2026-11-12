import { almacen, obtenerCasa, postulacionesDe, todasLasReservas } from './servicio.js'
import { hoyISO, mesDe, sumarDias } from '../lib/fechas.js'
import { estadoReserva } from '../lib/reglas.js'

/*
 * Solicitudes no atendidas y antecedentes de una persona (decisión 12-11-2026).
 *
 * Endpoints de la fase 2 (FastAPI):
 *   registrarNoAtendida(datos)      POST /api/solicitudes-no-atendidas
 *   noAtendidas(region)             GET  /api/solicitudes-no-atendidas?region=
 *   antecedentesPersona(persona)    GET  /api/personas/{rut}/antecedentes
 */

/** Por qué un pedido no terminó en reserva. */
export const MOTIVOS_NO_ATENDIDA = {
  sin_cupo: 'Sin cupo en las fechas o la casa pedida',
  otra_region: 'Casa de otra región: se derivó',
  fuera_plazo: 'Fuera de plazo o de las reglas',
  temporada_alta: 'Temporada alta: va por sorteo',
  otro: 'Otro motivo',
}

const normalizarRut = (rut) => String(rut ?? '').replace(/[^0-9kK]/g, '').toUpperCase()

/**
 * Registra un pedido que llegó al encargado (por cualquier vía) y no se pudo
 * dar. Sirve para medir la demanda no atendida; no aparta fechas.
 */
export function registrarNoAtendida({ persona, via, region, casa_id, entrada, salida, personas, motivo, detalle }, actor) {
  const estado = almacen.leer()
  estado.solicitudes ??= []
  const id = `S-${String(estado.solicitudes.length + 1).padStart(4, '0')}`
  const casa = casa_id ? obtenerCasa(casa_id) : null
  estado.solicitudes.push({
    id,
    creada_en: new Date().toISOString().slice(0, 19),
    registrada_por: actor.nombre,
    persona: { nombre: persona.nombre.trim(), rut: persona.rut?.trim() || null },
    via,
    region: casa?.region ?? region ?? null,
    casa_id: casa_id || null,
    entrada: entrada || null,
    salida: salida || null,
    personas: personas ? Number(personas) : null,
    motivo,
    detalle: detalle?.trim() || null,
  })
  almacen.guardar()
  return id
}

/** Solicitudes no atendidas, las más recientes primero; sin región, las de todo el país. */
export const noAtendidas = (region = '') =>
  (almacen.leer().solicitudes ?? [])
    .filter((s) => !region || s.region === region)
    .map((s) => ({ ...s, casa: s.casa_id ? obtenerCasa(s.casa_id) : null }))
    .sort((a, b) => (a.creada_en < b.creada_en ? 1 : -1))

/**
 * Antecedentes de una persona para quien registra (decisión 12-11-2026): sus
 * reservas de los últimos 12 meses y las próximas, sus postulaciones, sus
 * pedidos no atendidos y los avisos que cambian lo que se le puede ofrecer.
 */
export function antecedentesPersona(persona) {
  const rut = normalizarRut(persona.rut)
  const hoy = hoyISO()
  const desde = sumarDias(hoy, -365)
  const reservas = todasLasReservas()
    .filter((r) => (persona.id != null && r.titular_id === persona.id) || normalizarRut(r.titular.rut) === rut)
    .filter((r) => r.salida >= desde)
    .map((r) => ({ ...r, visible: estadoReserva(r) }))
    .sort((a, b) => (a.entrada < b.entrada ? 1 : -1))
  const vigentes = reservas.filter((r) => ['por_aprobar', 'por_confirmar', 'confirmada', 'en_curso'].includes(r.visible))
  return {
    reservas,
    postulaciones: persona.id != null ? postulacionesDe(persona.id) : [],
    noAtendidas: noAtendidas().filter((s) => s.persona.rut && normalizarRut(s.persona.rut) === rut),
    mesesConReserva: [...new Set(vigentes.filter((r) => r.salida > hoy).map((r) => mesDe(r.entrada)))],
    porPagar: reservas.filter((r) => r.visible === 'por_confirmar'),
    cargos: reservas.filter((r) => r.estado === 'desistida' && r.cargo_desistimiento > 0),
  }
}
