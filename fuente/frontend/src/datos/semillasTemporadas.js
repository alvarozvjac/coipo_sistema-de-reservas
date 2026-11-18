/**
 * Semillas de temporadas altas y del sorteo de verano (etapa 2, decisión
 * 18-11-2026). Restaurado de e81ce1d (semillas.js). TODOS LOS DATOS SON FICTICIOS.
 */
import { CASAS } from './casas.js'
import { diasEntre, sumarDias } from '../lib/fechas.js'
import { formasDePago } from '../lib/reglas.js'
import { calendarioTemporada, inicioTemporada, pagoTemporada, puedePostular, turnosDe } from '../lib/sorteo.js'

/** Cabañas 02 y 10 de P.N. Puyehue: calendario propio de sábado a viernes (Memo 6188/2026). */
const CABANAS_PUYEHUE = [22, 23]

/**
 * Verano 2027 como el Memorándum N° 6188/2026: turnos de 6 noches; las casas en
 * general del martes 5 de enero al 1 de abril, con 2 noches libres entre turnos
 * (11 turnos), y las cabañas de Puyehue del sábado 2 de enero al 2 de abril, con
 * 1 noche libre (13 turnos); 6 cuotas desde marzo; postulación abierta.
 * Invierno 2027: programada, con fechas y cuotas referenciales.
 */
export function temporadasIniciales(hoy) {
  const comun = { noches: 6, cuotas: 6, creada_por: 'Patricia Herrera Muñoz' }
  return [
    { ...comun, id: 'V2027', tipo: 'verano', nombre: 'Temporada de verano 2027', desde: '2027-01-05', hasta: '2027-04-02', libres: 2, especial: { casas: CABANAS_PUYEHUE, desde: '2027-01-02', libres: 1 }, primera_cuota: '2027-03', postulacion: { desde: sumarDias(hoy, -12), hasta: sumarDias(hoy, 18) }, creada_en: sumarDias(hoy, -20) + 'T10:00:00' },
    { ...comun, id: 'I2027', tipo: 'invierno', nombre: 'Vacaciones de invierno 2027', desde: '2027-07-10', hasta: '2027-07-24', libres: 2, especial: { casas: CABANAS_PUYEHUE, desde: '2027-07-10', libres: 1 }, primera_cuota: '2027-09', postulacion: { desde: '2027-05-03', hasta: '2027-05-21' }, creada_en: sumarDias(hoy, -20) + 'T10:05:00' },
  ]
}

/** ¿Cae la estadía en una temporada alta futura? Esas fechas no se siembran como reservas. */
export const enTemporada = (temporadas, entrada, salida) => temporadas.some((t) => entrada < t.hasta && inicioTemporada(t) < salida)

/**
 * Sorteo de verano con la postulación abierta y postulaciones de personas
 * ficticias. La prioridad sale de quién tuvo casa en las vacaciones de invierno
 * 2026 (Art. 6 a) y quién desistió tarde en ellas (Art. 10 d). Solo turnos libres.
 */
export function semillaSorteo(hoy, personas, reservas, hernan, temporada, aleatorio, DEMANDA) {
  const invierno = (r) => r.entrada >= '2026-07-06' && r.entrada <= '2026-07-26'
  const tuvieron = new Set(reservas.filter((r) => invierno(r) && r.estado !== 'desistida').map((r) => r.titular_id))
  const perdieron = new Set(reservas.filter((r) => invierno(r) && r.estado === 'desistida' && r.cargo_desistimiento > 0).map((r) => r.titular_id))
  const azar = aleatorio(2027)
  const libre = (casaId, t) => !reservas.some((r) => r.casa_id === casaId && !['desistida', 'anulada'].includes(r.estado) && t.entrada < r.salida && r.entrada < t.salida)
  const pesoTurno = (t) => ({ '01': 1.4, '02': 1.5 })[t.entrada.slice(5, 7)] ?? 0.6
  const casas = CASAS.map((c) => ({ id: c.id, peso: (DEMANDA[c.id] ?? 0.85) ** 2 }))
  const elegir = (items, peso) => {
    const total = items.reduce((t, x) => t + peso(x), 0)
    let x = azar() * total
    for (const it of items) if ((x -= peso(it)) <= 0) return it
    return items[items.length - 1]
  }
  const desde = temporada.postulacion.desde
  const s = {
    id: temporada.id,
    nombre: temporada.nombre,
    temporada: calendarioTemporada(temporada),
    anterior: { nombre: 'Vacaciones de invierno 2026', adjudicados: [...tuvieron].filter(Boolean), perdieron: [...perdieron].filter(Boolean) },
    postulacion: { ...temporada.postulacion },
    estado: 'postulacion',
    correlativo: 0,
    postulaciones: [],
    abierta_por: 'Patricia Herrera Muñoz',
    abierta_en: desde + 'T09:00:00',
  }
  const agregar = (titular, casaId, turno, dia) => {
    const casa = CASAS.find((c) => c.id === casaId)
    const t = turnosDe(s.temporada, casaId).find((x) => x.entrada === turno)
    s.correlativo += 1
    s.postulaciones.push({
      codigo: `P-V27-${String(s.correlativo).padStart(4, '0')}`,
      usuario_id: titular.id,
      titular: { nombre: titular.nombre, rut: titular.rut, rol: titular.rol, region: titular.region, calidad: titular.calidad, grado: titular.grado, plazo_fijo: Boolean(titular.plazo_fijo), correo: titular.correo, telefono: titular.telefono },
      casa_id: casaId,
      turno,
      salida: t.salida,
      personas: Math.min(casa.capacidad, 2 + Math.floor(azar() * 4)),
      forma_pago: formasDePago(titular)[0] === 'planilla' ? pagoTemporada(s.temporada) : { tipo: 'transferencia', anticipado: true },
      contacto: { correo: titular.correo, telefono: titular.telefono },
      // Las de trabajadores se hicieron desde el aplicativo; las de jubilados las registró una encargada.
      ...(titular.calidad === 'jubilado' ? { registrada_por: { nombre: 'Carolina Núñez Vidal', perfil: 'encargada', region: '05' } } : { via: 'aplicativo' }),
      prioridad: !tuvieron.has(titular.id),
      pierde_posibilidad: perdieron.has(titular.id),
      estado: 'postulada',
      demo: true,
      creada_en: sumarDias(desde, dia) + `T${String(8 + Math.floor(azar() * 12)).padStart(2, '0')}:${String(Math.floor(azar() * 60)).padStart(2, '0')}:00`,
      notificaciones: [{ tipo: 'postulacion', en: sumarDias(desde, dia) + 'T12:00:00', detalle: 'Comprobante de postulación' }],
    })
  }
  const usados = new Set()
  const dias = Math.max(1, diasEntre(desde, hoy))
  const candidatos = personas.filter((p) => puedePostular(p))
  for (let i = 0; i < 900; i++) {
    const p = candidatos[Math.floor(azar() * candidatos.length)]
    if (usados.has(p.id) || perdieron.has(p.id)) continue
    usados.add(p.id)
    const casaId = elegir(casas, (c) => c.peso).id
    const turnos = turnosDe(s.temporada, casaId).filter((t) => libre(casaId, t))
    if (turnos.length) agregar(p, casaId, elegir(turnos, pesoTurno).entrada, Math.floor(azar() * dias))
  }
  // Hernán (jubilado de demostración) ya postuló, por medio de su encargada.
  const t15 = turnosDe(s.temporada, 15).filter((t) => libre(15, t))[4]
  if (t15) agregar(hernan, 15, t15.entrada, dias - 1)
  s.postulaciones.sort((a, b) => (a.creada_en < b.creada_en ? -1 : 1))
  return s
}
