/**
 * Sorteo de temporada alta (Art. 6 del reglamento).
 *
 * Turnos (decisión 06-11-2026, práctica del Memorándum N° 6188/2026):
 * - Turnos fijos de 6 noches. Cada temporada tiene un calendario general y,
 *   si hace falta, uno especial para algunas casas (verano 2027: cabañas 02 y
 *   10 de Puyehue, de sábado a viernes). Cada calendario se define por la
 *   llegada del primer turno y las noches libres entre turnos (aseo y cambio):
 *   2 en el general, que por eso parte cada turno un día distinto de la semana,
 *   y 1 en el de Puyehue.
 *
 * Decisiones de Bienestar/UIA (20-10-2026):
 * - Cada postulante indica una sola opción (casa y turno) y se adjudica un solo período.
 * - Postulan funcionarios/as de CONAF activos/as y jubilados/as. Otros servicios
 *   públicos no postulan: solo toman vacantes después del sorteo (Art. 9).
 * - Prioridad para quien no fue adjudicado/a en la temporada alta anterior (Art. 6 a).
 * - Quien desistió sin aviso o no se presentó en la temporada alta anterior pierde
 *   la posibilidad en este sorteo (Art. 10 d).
 * - Lista de espera por turno; el cupo liberado se ofrece por correo a la siguiente
 *   persona, que tiene 48 horas para aceptar (Art. 6 d).
 */

import { sumarDias } from './fechas.js'
import { PARAMETROS } from './reglas.js'

export const HORAS_OFERTA = 48
/** Días de la semana (lunes = 0). */
export const DIAS_SEMANA = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo']

export const nochesTurno = (temporada) => Number(temporada?.noches) || PARAMETROS.noches_turno_temporada_alta

/** ¿La casa sigue el calendario especial de la temporada? */
export const enCalendarioEspecial = (temporada, casaId) => Boolean(temporada?.especial?.casas?.includes(casaId))

/** Calendario de una casa en la temporada: { desde, libres }. */
export function calendarioDe(temporada, casaId) {
  if (enCalendarioEspecial(temporada, casaId)) return { desde: temporada.especial.desde, libres: Number(temporada.especial.libres) || 0 }
  return { desde: temporada.desde, libres: Number(temporada.libres) || 0 }
}

/**
 * Turnos de una casa en la temporada: desde la llegada del primer turno de su
 * calendario, turnos de `noches` noches separados por `libres` noches, sin
 * pasar del fin de la temporada (`hasta`). Sin casa, el calendario general.
 */
export function turnosDe(temporada, casaId) {
  const n = nochesTurno(temporada)
  const { desde, libres } = calendarioDe(temporada, casaId)
  const lista = []
  if (!desde || !temporada?.hasta) return lista
  let d = desde
  while (sumarDias(d, n) <= temporada.hasta && lista.length < 60) {
    lista.push({ entrada: d, salida: sumarDias(d, n), numero: lista.length + 1 })
    d = sumarDias(d, n + libres)
  }
  return lista
}

/** Primera noche de la temporada, considerando los dos calendarios. */
export const inicioTemporada = (t) => (t.especial?.casas?.length && t.especial.desde && t.especial.desde < t.desde ? t.especial.desde : t.desde)

/** Campos de calendario que se copian de la temporada al sorteo. */
export const calendarioTemporada = (t) => ({
  desde: t.desde,
  hasta: t.hasta,
  noches: nochesTurno(t),
  libres: Number(t.libres) || 0,
  especial: t.especial?.casas?.length ? { casas: [...t.especial.casas], desde: t.especial.desde, libres: Number(t.especial.libres) || 0 } : null,
  cuotas: Number(t.cuotas) || PARAMETROS.cuotas_temporada_alta,
  primera_cuota: t.primera_cuota ?? null,
})

/** Quién puede postular (decisión 20-10-2026). */
export const puedePostular = (u) => u?.calidad !== 'otro_servicio'

/** Generador determinista a partir de una semilla (el sorteo se puede repetir y auditar). */
export function azarDesde(semilla) {
  let s = semilla >>> 0 || 1
  return () => {
    // xorshift32
    s ^= s << 13
    s >>>= 0
    s ^= s >>> 17
    s ^= s << 5
    s >>>= 0
    return s / 4294967296
  }
}

/**
 * Realiza el sorteo. Recibe las postulaciones vigentes y la semilla; devuelve,
 * por postulación, su resultado:
 *   { codigo, resultado: 'adjudicada' | 'espera' | 'excluida', posicion?, motivo? }
 *
 * Por cada casa y turno: se excluye a quien perdió la posibilidad (Art. 10 d),
 * se ordena al azar y luego se ubica primero a quien tiene prioridad (Art. 6 a).
 * La primera persona se adjudica el turno; el resto queda en lista de espera
 * en ese orden.
 */
export function sortear(postulaciones, semilla) {
  const azar = azarDesde(semilla)
  const resultados = []
  const grupos = new Map()
  // Orden estable antes de barajar, para que la misma semilla dé el mismo resultado.
  const ordenadas = [...postulaciones].sort((a, b) => (a.codigo < b.codigo ? -1 : 1))
  for (const p of ordenadas) {
    if (p.pierde_posibilidad) {
      resultados.push({ codigo: p.codigo, resultado: 'excluida', motivo: 'Desistió sin aviso o no se presentó en la temporada alta anterior (Art. 10 d).' })
      continue
    }
    const clave = `${p.casa_id}|${p.turno}`
    if (!grupos.has(clave)) grupos.set(clave, [])
    grupos.get(clave).push(p)
  }
  for (const lista of grupos.values()) {
    const conNumero = lista.map((p) => ({ p, n: azar() }))
    conNumero.sort((a, b) => (a.p.prioridad === b.p.prioridad ? a.n - b.n : a.p.prioridad ? -1 : 1))
    conNumero.forEach(({ p }, i) =>
      resultados.push(i === 0 ? { codigo: p.codigo, resultado: 'adjudicada' } : { codigo: p.codigo, resultado: 'espera', posicion: i }),
    )
  }
  return resultados
}

export const ESTADOS_POSTULACION = {
  postulada: { etiqueta: 'Postulada', clase: 'bg-sky-100 text-sky-800' },
  adjudicada: { etiqueta: 'Adjudicada', clase: 'bg-verde-100 text-verde-800' },
  espera: { etiqueta: 'En lista de espera', clase: 'bg-alerta-50 text-alerta-700' },
  ofertada: { etiqueta: 'Cupo ofrecido', clase: 'bg-alerta-50 text-alerta-700' },
  excluida: { etiqueta: 'Sin posibilidad', clase: 'bg-stone-200 text-tinta-700' },
  sin_cupo: { etiqueta: 'Sin cupo', clase: 'bg-stone-200 text-tinta-700' },
  retirada: { etiqueta: 'Retirada', clase: 'bg-stone-100 text-tinta-500' },
}

/**
 * Los calendarios de una temporada, con sus casas y turnos, para mostrarlos:
 * [{ clave: 'general' | 'especial', casas, desde, libres, turnos }].
 */
export function calendariosDe(temporada, casas) {
  const lista = []
  const especiales = casas.filter((c) => enCalendarioEspecial(temporada, c.id))
  const generales = casas.filter((c) => !enCalendarioEspecial(temporada, c.id))
  if (generales.length) lista.push({ clave: 'general', casas: generales, ...calendarioDe(temporada), turnos: turnosDe(temporada) })
  if (especiales.length) lista.push({ clave: 'especial', casas: especiales, ...calendarioDe(temporada, especiales[0].id), turnos: turnosDe(temporada, especiales[0].id) })
  return lista
}

/** Código del turno como en el llamado: S01, S02… */
export const codigoTurno = (t) => `S${String(t.numero).padStart(2, '0')}`

/** «martes 5 ene al lunes 11 ene» con días de la semana, para listar turnos escalonados. */
export const nombreDia = (iso) => DIAS_SEMANA[(new Date(iso + 'T00:00:00Z').getUTCDay() + 6) % 7]
