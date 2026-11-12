import { todasLasReservas } from './servicio.js'
import { hoyISO, mesDe, sumarDias } from '../lib/fechas.js'
import { estadoReserva } from '../lib/reglas.js'

/*
 * Antecedentes de una persona (decisión 12-11-2026).
 *
 * Endpoint de la fase 2 (FastAPI):
 *   antecedentesPersona(persona)    GET  /api/personas/{rut}/antecedentes
 */

const normalizarRut = (rut) => String(rut ?? '').replace(/[^0-9kK]/g, '').toUpperCase()

/**
 * Antecedentes de una persona para quien registra (decisión 12-11-2026): sus
 * reservas de los últimos 12 meses y las próximas, y los avisos que cambian
 * lo que se le puede ofrecer.
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
    mesesConReserva: [...new Set(vigentes.filter((r) => r.salida > hoy).map((r) => mesDe(r.entrada)))],
    porPagar: reservas.filter((r) => r.visible === 'por_confirmar'),
    cargos: reservas.filter((r) => r.estado === 'desistida' && r.cargo_desistimiento > 0),
  }
}
