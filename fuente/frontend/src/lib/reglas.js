/**
 * Reglas del Reglamento General de Uso de Casas de Veraneo o Descanso
 * (propuesta de actualización, octubre 2026) y decisiones de Bienestar/UIA.
 * Desde el 06-11-2026 las tarifas por grado y el desistimiento siguen la
 * práctica vigente del Memorándum N° 6188/2026, por decisión de Álvaro
 * Zegers: donde el reglamento propuesto dice otra cosa, se anota. Desde el
 * 12-11-2026 no hay temporadas altas ni sorteo: el sistema lo usan solo los
 * encargados y registran por orden de llegada lo que tiene disponibilidad.
 *
 * Todo lo que el reglamento deja como número está en PARAMETROS; el encargado
 * nacional cambia los editables en Configuración › Parámetros, con fecha de
 * vigencia (datos/configuracion.js).
 */

import { diasEntre, fechaCorta, hoyISO, mesDe, nombreMes, restarDiasHabiles, sumarDias } from './fechas.js'

export const PARAMETROS = {
  anticipacion_maxima_dias: 90, // no está en el reglamento de oct-2026; se mantiene como parámetro (decisión 20-10-2026)
  anticipacion_maxima_otro_servicio_dias: 15, // Art. 9: solo cupos que siguen libres cerca de la fecha (decisión 20-10-2026)
  aviso_desistimiento_dias_habiles: 10, // Memo 6188/2026 (el reglamento propuesto dice 7 días corridos, Art. 10 a)
  aviso_retiro_anticipado_dias: 2, // Art. 10 e)
  dias_aseo_entre_reservas: 1, // decisión de Bienestar
  reservas_por_mes: 1, // Art. 7
  cuotas_maximas_planilla: 3, // reserva directa: decisión de Bienestar (Anexo A pide el número de cuotas)
  hora_ingreso: '15:00', // Art. 12
  hora_salida: '12:00', // Art. 12
  plazo_observaciones_horas: 12, // Art. 13
  noches_beneficio_matrimonio: 3, // Art. 20
}

/**
 * Tarifa diferenciada (Art. 19): la resolución anual fija valores propios para
 * trabajadores no afiliados y funcionarios de otros servicios. Mientras no
 * exista la resolución, se usa un adicional REFERENCIAL por noche sobre la
 * tarifa de afiliado.
 */
export const ADICIONAL_TARIFA = { afiliado: 0, jubilado: 0, no_afiliado: 5000, otro_servicio: 15000 }

/** Calidad del usuario/a responsable (Anexo A). */
export const CALIDADES = {
  afiliado: 'Afiliado/a activo/a',
  jubilado: 'Afiliado/a jubilado/a',
  no_afiliado: 'Trabajador/a CONAF no afiliado/a',
  otro_servicio: 'Funcionario/a de otro servicio público',
}

/**
 * Formas de pago según la calidad (decisión 20-10-2026, ajusta el Art. 21):
 * - Funcionarios de CONAF (afiliados activos y no afiliados): descuento por planilla.
 * - Funcionarios de CONAF a plazo fijo: planilla o transferencia.
 * - Afiliados jubilados y funcionarios de otros servicios públicos: transferencia
 *   o efectivo, antes de llegar (pago anticipado de toda la estadía). El efectivo
 *   volvió el 13-11-2026: lo recibe y lo registra la encargada regional o el
 *   encargado nacional; la reserva queda confirmada con el pago pendiente.
 */
export function formasDePago(u) {
  if (u.calidad === 'jubilado' || u.calidad === 'otro_servicio') return ['transferencia', 'efectivo']
  if (u.plazo_fijo) return ['planilla', 'transferencia']
  return ['planilla']
}

/** Cuenta de destino de las transferencias. */
export const DATOS_TRANSFERENCIA = {
  titular: 'Corporación Nacional Forestal',
  rut: '61.313.000-4',
  banco: 'Banco de Chile',
  tipo: 'Cuenta corriente',
  numero: '500-04',
}

/** Glosa que identifica el pago: casa y código de la reserva. */
export const glosaTransferencia = (casa, codigo) => `Pago casa ${casa.nombre} ${codigo}`

/**
 * Tramos de tarifa según el grado del trabajador/a (Memo 6188/2026). Quien no
 * tiene grado en la nómina (jubilados/as, otros servicios) paga el tramo 04–14
 * [PENDIENTE: confirmar con Bienestar].
 */
export const TRAMOS = { a: 'Grados 04 a 14', b: 'Grados 15 a 19' }
export const tramoDe = (u) => (Number(u?.grado) >= 15 ? 'b' : 'a')
export const tarifaTramo = (casa, tramo) => (tramo === 'b' ? (casa.tarifa_noche_15_19 ?? casa.tarifa_noche) : casa.tarifa_noche)
export const tarifaPara = (casa, u) => tarifaTramo(casa, tramoDe(u)) + (ADICIONAL_TARIFA[u.calidad] ?? 0)

export const PARENTESCOS = [
  { valor: 'conyuge', etiqueta: 'Cónyuge o conviviente civil' },
  { valor: 'hijo', etiqueta: 'Hijo/a' },
  { valor: 'familiar', etiqueta: 'Otro familiar' },
  { valor: 'acompanante', etiqueta: 'Otra persona autorizada' },
]

/** Condiciones de uso que el solicitante acepta al reservar (Títulos II a IV). */
export const CONDICIONES_USO = [
  `Ingreso desde las ${PARAMETROS.hora_ingreso} y salida hasta las ${PARAMETROS.hora_salida} (Art. 12).`,
  'La reserva es personal e intransferible: no se puede ceder ni subarrendar (Art. 8).',
  `Al llegar revise el inventario; tiene ${PARAMETROS.plazo_observaciones_horas} horas para informar daños o faltantes (Art. 13).`,
  'No puede pernoctar más gente que la autorizada en la reserva; cada persona adicional paga la tarifa con 50% de recargo (Art. 14).',
  'No se permiten mascotas, salvo perros de asistencia informados en la reserva (Art. 15).',
  'Prohibido fumar en interiores y encender fuego fuera de lugares habilitados; cierre el gas al salir (Art. 16).',
  'Descanso entre las 22:00 y las 08:00 y respeto del reglamento del condominio (Art. 17).',
  `Si se retira antes de tiempo, avise con ${PARAMETROS.aviso_retiro_anticipado_dias} días; sin aviso se cobra el período completo (Art. 10 e).`,
]

/**
 * Última fecha de llegada que puede elegir una persona. Las reservas se
 * confirman solas si hay disponibilidad (decisión 20-10-2026), así que el
 * control del Art. 9 para otros servicios públicos se hace con un plazo menor:
 * solo pueden tomar cupos que siguen libres pocos días antes.
 */
export const limiteReserva = (hoy = hoyISO(), calidad) =>
  sumarDias(hoy, calidad === 'otro_servicio' ? PARAMETROS.anticipacion_maxima_otro_servicio_dias : PARAMETROS.anticipacion_maxima_dias)

/**
 * Noches que una casa no puede ofrecer: las ocupadas por cada reserva más el
 * día de aseo antes y después. Devuelve un Set de fechas ISO.
 */
export function nochesNoDisponibles(ocupaciones) {
  const set = new Set()
  const aseo = PARAMETROS.dias_aseo_entre_reservas
  for (const o of ocupaciones) {
    let d = sumarDias(o.entrada, -aseo)
    const fin = sumarDias(o.salida, aseo - 1)
    while (d <= fin) {
      set.add(d)
      d = sumarDias(d, 1)
    }
  }
  return set
}

/** Estado de una noche para el calendario. */
export function estadoNoche(iso, noDisponibles, hoy = hoyISO(), calidad) {
  if (iso <= hoy) return 'pasado'
  if (iso > limiteReserva(hoy, calidad)) return 'fuera_plazo'
  if (noDisponibles.has(iso)) return 'ocupado'
  return 'disponible'
}

const vigente = (r, hoy) => !['desistida', 'anulada'].includes(r.estado) && r.salida > hoy

/**
 * Valida un rango de fechas para un solicitante.
 * Devuelve una lista de mensajes; vacía = se puede solicitar.
 */
export function validarFechas({ entrada, salida, noDisponibles, reservasUsuario = [], hoy = hoyISO(), calidad }) {
  const errores = []
  if (!entrada || !salida) return ['Elija la fecha de llegada y la de salida.']
  if (salida <= entrada) return ['La salida debe ser posterior a la llegada.']
  if (entrada <= hoy) errores.push('La llegada debe ser a partir de mañana.')
  const limite = limiteReserva(hoy, calidad)
  if (entrada > limite)
    errores.push(
      calidad === 'otro_servicio'
        ? `Los funcionarios de otros servicios públicos reservan con hasta ${PARAMETROS.anticipacion_maxima_otro_servicio_dias} días de anticipación, sobre cupos que no ocupa el personal de CONAF (Art. 9). Llegada hasta el ${fechaCorta(limite, true)}.`
        : `Se reserva con hasta ${PARAMETROS.anticipacion_maxima_dias} días de anticipación (llegada hasta el ${fechaCorta(limite, true)}).`,
    )

  let d = entrada
  let ocupada = false
  while (d < salida) {
    if (noDisponibles.has(d)) ocupada = true
    d = sumarDias(d, 1)
  }
  if (ocupada) errores.push('Hay noches ocupadas en ese rango (se deja un día libre entre reservas para aseo).')

  const otra = reservasUsuario.find((r) => vigente(r, hoy) && mesDe(r.entrada) === mesDe(entrada))
  if (otra) errores.push(`Ya tiene una reserva en ${nombreMes(entrada)}. Se permite una reserva por mes calendario (Art. 7).`)
  return errores
}

export const noches = (entrada, salida) => (entrada && salida ? Math.max(0, diasEntre(entrada, salida)) : 0)

/** Último día para desistir sin costo: 10 días hábiles antes de la llegada (Memo 6188/2026). */
export const limiteDesistimiento = (entrada) => restarDiasHabiles(entrada, PARAMETROS.aviso_desistimiento_dias_habiles)

/**
 * Cargo por desistir hoy: sin costo hasta 10 días hábiles antes de la llegada;
 * después se paga el valor total de la estadía (Memo 6188/2026; el reglamento
 * propuesto cobraba una noche con menos de 7 días corridos, Art. 10 a).
 */
export function cargoDesistimiento(reserva, hoy = hoyISO()) {
  return hoy <= limiteDesistimiento(reserva.entrada) ? 0 : reserva.total
}

/**
 * Pago por transferencia aún no comprobado (decisión 02-11-2026): la reserva
 * queda «por confirmar» con las fechas apartadas, y se confirma cuando Oficina
 * Central registra el pago. Las de planilla se confirman al instante.
 */
export const porConfirmar = (r) => r.estado === 'confirmada' && r.forma_pago?.tipo === 'transferencia' && !r.pago

/** Efectivo aún no recibido (decisión 13-11-2026): la reserva está confirmada, pero el pago queda pendiente en Cobros. */
export const efectivoPendiente = (r) => r.estado === 'confirmada' && r.forma_pago?.tipo === 'efectivo' && !r.pago

export const FORMAS_PAGO = { planilla: 'Descuento por planilla', transferencia: 'Transferencia', efectivo: 'Efectivo' }

/** Estado visible de una reserva según la fecha de hoy. */
export function estadoReserva(r, hoy = hoyISO()) {
  if (['desistida', 'anulada'].includes(r.estado)) return r.estado
  if (r.salida <= hoy) return 'finalizada'
  if (r.entrada <= hoy) return 'en_curso'
  return porConfirmar(r) ? 'por_confirmar' : 'confirmada'
}

export const ESTADOS = {
  por_confirmar: { etiqueta: 'Por confirmar', clase: 'bg-alerta-50 text-alerta-700' },
  confirmada: { etiqueta: 'Confirmada', clase: 'bg-verde-100 text-verde-800' },
  en_curso: { etiqueta: 'En curso', clase: 'bg-sky-100 text-sky-800' },
  finalizada: { etiqueta: 'Finalizada', clase: 'bg-stone-200 text-tinta-700' },
  anulada: { etiqueta: 'Anulada por Bienestar', clase: 'bg-error-50 text-error-700' },
  desistida: { etiqueta: 'Desistida', clase: 'bg-stone-100 text-tinta-500 line-through decoration-1' },
}

/**
 * Vía por la que la persona pidió la reserva al encargado (decisión 12-11-2026):
 * el sistema registra lo que llega por cualquier canal. Obligatoria al registrar.
 */
export const VIAS = {
  telefono: 'Teléfono',
  correo: 'Correo electrónico',
  presencial: 'Presencial',
  whatsapp: 'WhatsApp',
  otra: 'Otra',
}
