import { almacen } from './servicio.js'
import { hoyISO, ahora } from '../lib/fechas.js'

/*
 * Etapa del sistema (decisión 18-11-2026). Bienestar parte con una marcha
 * blanca en que solo los encargados registran reservas; cuando se acostumbren,
 * abre la etapa 2 y los trabajadores de CONAF reservan desde el aplicativo, y
 * las temporadas altas se asignan por postulación y sorteo. El encargado
 * nacional elige la etapa en Configuración › Etapa, con fecha desde la que rige
 * y el documento que la respalda, igual que un parámetro.
 *
 * Endpoints de la fase 2 (FastAPI):
 *   etapaVigente(dia)              GET  /api/etapa?dia=
 *   cambiarEtapa(datos, actor)     POST /api/etapa
 *   historialEtapa()               GET  /api/etapa/historial
 */

export const ETAPAS = {
  marcha_blanca: {
    nombre: 'Marcha blanca',
    corto: 'Etapa 1',
    detalle: 'Solo las encargadas regionales y el encargado nacional registran reservas, a pedido de la persona. Verano e invierno se registran como cualquier fecha.',
  },
  abierta: {
    nombre: 'Abierto a trabajadores',
    corto: 'Etapa 2',
    detalle: 'Además, los trabajadores de CONAF (afiliados/as, no afiliados/as y plazo fijo) ingresan con su cuenta institucional y reservan a su nombre. Las temporadas altas se asignan por postulación y sorteo. Jubilados/as y otros servicios públicos siguen pidiéndolo a la encargada.',
  },
}

export const ETAPA_INICIAL = 'marcha_blanca'


/** Cambios de etapa, del más reciente al más antiguo. */
export const historialEtapa = () => [...(almacen.leer().etapas ?? [])].sort((a, b) => (a.en < b.en ? 1 : -1))

/** Etapa que rige un día: el último cambio no anulado con vigencia hasta ese día. */
export function etapaVigente(dia = hoyISO()) {
  const vigentes = (almacen.leer().etapas ?? []).filter((c) => !c.anulado && c.vigente_desde <= dia)
  vigentes.sort((a, b) => (a.vigente_desde === b.vigente_desde ? (a.en < b.en ? -1 : 1) : a.vigente_desde < b.vigente_desde ? -1 : 1))
  return vigentes.at(-1)?.etapa ?? ETAPA_INICIAL
}

/** ¿Los trabajadores reservan desde el aplicativo y rigen las temporadas con sorteo? */
export const etapaAbierta = (dia = hoyISO()) => etapaVigente(dia) === 'abierta'

/** Cambio programado que aún no rige, si lo hay. */
export const etapaProgramada = (hoy = hoyISO()) => historialEtapa().find((c) => !c.anulado && c.vigente_desde > hoy) ?? null

export function validarEtapa({ etapa, vigente_desde, respaldo }) {
  const e = {}
  if (!ETAPAS[etapa]) e.etapa = 'Elija una etapa.'
  if (!vigente_desde || vigente_desde < hoyISO()) e.vigente_desde = 'Desde hoy o una fecha futura.'
  if (!respaldo?.trim()) e.respaldo = 'Indique la resolución, memo o acuerdo que lo respalda.'
  return e
}

/** Registra un cambio de etapa. Rige desde `vigente_desde`; lo ya registrado no cambia. */
export function cambiarEtapa({ etapa, vigente_desde, respaldo }, actor) {
  const estado = almacen.leer()
  estado.etapas ??= []
  estado.etapas.push({ id: `E-${estado.etapas.length + 1}`, etapa, anterior: etapaVigente(vigente_desde), vigente_desde, respaldo: respaldo.trim(), por: actor.nombre, en: ahora() })
  almacen.guardar()
}

/** Anula un cambio programado que aún no rige. */
export function anularCambioEtapa(id, actor) {
  const c = (almacen.leer().etapas ?? []).find((x) => x.id === id)
  if (!c || c.vigente_desde <= hoyISO()) return
  Object.assign(c, { anulado: true, anulado_por: actor.nombre, anulado_en: ahora() })
  almacen.guardar()
}
