/**
 * Semillas de la maqueta: personas ficticias y reservas
 * con que parte la demostración (y con que vuelve «Reiniciar datos de prueba»).
 * Separado de servicio.js el 12-11-2026 para que ningún archivo pase de 1000
 * líneas (COD-1 de docs/ESTANDAR_CODIGO.md de coipo_master_produccion).
 * TODOS LOS DATOS SON FICTICIOS.
 */

import { CASAS } from './casas.js'
import { inventarioInicial } from './inventarios.js'
import { sumarDias } from '../lib/fechas.js'
import { ADICIONAL_TARIFA, cargoDesistimiento, tarifaTramo, tramoDe } from '../lib/reglas.js'

export const ADICIONAL_BASE = { ...ADICIONAL_TARIFA }

/** Desde el 20-10-2026 toda reserva se confirma sola si hay disponibilidad. */
export const AUTOMATICA = 'Confirmación automática'
const casaBase = (id) => CASAS.find((c) => c.id === id)

/* ---------- Personas ficticias ---------- */

export function rutFicticio(cuerpo) {
  let s = 0
  let f = 2
  for (const d of String(cuerpo).split('').reverse()) {
    s += Number(d) * f
    f = f === 7 ? 2 : f + 1
  }
  const r = 11 - (s % 11)
  const dv = r === 11 ? '0' : r === 10 ? 'K' : String(r)
  return `${String(cuerpo).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}-${dv}`
}

const NOMBRES = ['Luis', 'Ana', 'Pedro', 'Claudia', 'Óscar', 'Ximena', 'Javiera', 'Rodrigo', 'Soledad', 'Manuel', 'Camila', 'Felipe', 'Daniela', 'Cristián', 'Valentina', 'Jorge', 'Paola', 'Andrés', 'Carolina', 'Mauricio', 'Francisca', 'Gonzalo', 'Marcela', 'Patricio', 'Lorena', 'Sebastián', 'Verónica', 'Héctor', 'Fernanda', 'Ricardo']
const APELLIDOS = ['Cárdenas', 'Villalobos', 'Millán', 'Sandoval', 'Maldonado', 'Bravo', 'Toro', 'Escobar', 'Ríos', 'Aguirre', 'Henríquez', 'Navarro', 'Fuentealba', 'Poblete', 'Jara', 'Soto', 'Quezada', 'Rivas', 'Vera', 'Alarcón', 'Sepúlveda', 'Paredes', 'Peña', 'Lizana', 'Rojas', 'Godoy', 'Mora', 'Arce', 'Cortés', 'Muñoz']
const ROLES = ['Guardaparque', 'Brigadista', 'Técnico forestal', 'Administrativa', 'Profesional de fiscalización', 'Conductor', 'Viverista', 'Profesional de fomento']
const INSTITUCIONES = ['Servicio Agrícola y Ganadero', 'INDAP', 'Servicio de Salud Valparaíso', 'Ministerio de Agricultura', 'SERNAPESCA']
const REGIONES_PERSONAL = ['02', '03', '04', '05', '05', '06', '07', '08', '08', '09', '09', '10', '10', '11', '12', '13', '13', '13', '14']

export function crearPersonas(cantidad, azar) {
  const lista = []
  for (let i = 0; i < cantidad; i++) {
    const g = Math.floor(i / 30)
    const nombre = `${NOMBRES[i % 30]} ${APELLIDOS[(i * 7 + g * 11) % 30]} ${APELLIDOS[(i * 13 + g * 17 + 5) % 30]}`
    const x = azar()
    const calidad = x < 0.72 ? 'afiliado' : x < 0.84 ? 'no_afiliado' : x < 0.94 ? 'jubilado' : 'otro_servicio'
    const correoBase = nombre.split(' ').slice(0, 2).join('.').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    lista.push({
      id: `p${i}`,
      nombre,
      rut: rutFicticio(10234567 + ((i * 97919) % 9000000)),
      rol: calidad === 'otro_servicio' ? `Funcionario/a de ${INSTITUCIONES[i % 5]}` : calidad === 'jubilado' ? 'Afiliado jubilado' : ROLES[i % ROLES.length],
      region: REGIONES_PERSONAL[i % REGIONES_PERSONAL.length],
      calidad,
      plazo_fijo: calidad === 'afiliado' && azar() < 0.1,
      ...(['afiliado', 'no_afiliado'].includes(calidad) && { grado: 4 + ((i * 7) % 16) }),
      correo: calidad === 'jubilado' ? `${correoBase}@gmail.com` : calidad === 'otro_servicio' ? `${correoBase}@servicio.gob.cl` : `${correoBase}@conaf.cl`,
      telefono: `+56 9 ${5000 + ((i * 37) % 4999)} ${1000 + ((i * 53) % 8999)}`,
    })
  }
  return lista
}

/* ---------- Semillas ---------- */

/** Demanda relativa de cada casa (1 = normal): define cuánto se usa en la demostración. */
const DEMANDA = { 2: 1.6, 6: 1.7, 10: 1.5, 5: 1.4, 22: 1.4, 23: 1.3, 3: 1.2, 8: 1.2, 11: 1.1, 20: 1.0, 25: 1.0, 7: 1.0, 15: 1.0, 21: 1.0, 1: 0.5, 24: 0.7, 13: 0.7, 34: 0.7 }
const tarifaSegun = (casa, titular) => tarifaTramo(casa, tramoDe(titular)) + (ADICIONAL_BASE[titular.calidad] ?? 0)

function nuevaReserva(codigo, casaId, entrada, nochesN, titular, extra = {}) {
  const casa = casaBase(casaId)
  const salida = sumarDias(entrada, nochesN)
  const personas = Math.min(casa.capacidad, 2 + (codigo.charCodeAt(codigo.length - 1) % 4))
  const tarifa = tarifaSegun(casa, titular)
  const anticipado = ['jubilado', 'otro_servicio'].includes(titular.calidad)
  return {
    codigo,
    titular_id: titular.id ?? null,
    titular,
    casa_id: casaId,
    entrada,
    salida,
    tarifa_noche: tarifa,
    total: tarifa * nochesN,
    ocupantes: [
      { nombre: titular.nombre, parentesco: 'titular' },
      ...Array.from({ length: personas - 1 }, (_, i) => ({ nombre: `Acompañante ${i + 1}`, edad: i === 0 ? 41 : 6 + i * 4, parentesco: i === 0 ? 'conyuge' : 'hijo' })),
    ],
    contacto: { correo: titular.correo, telefono: titular.telefono },
    // Jubilados/as y otros servicios: transferencia o efectivo (efectivo desde el 13-11-2026), repartido.
    forma_pago: anticipado ? { tipo: codigo.charCodeAt(codigo.length - 1) % 2 ? 'transferencia' : 'efectivo', anticipado: true } : { tipo: 'planilla', cuotas: 1, autorizacion: true },
    estado: 'confirmada',
    creada_en: sumarDias(entrada, -21) + 'T10:15:00',
    notificaciones: [],
    // Vía ficticia y repartida, para que el dashboard tenga qué contar.
    via: VIAS_SEMILLA[codigo.charCodeAt(codigo.length - 1) % VIAS_SEMILLA.length],
    ...extra,
  }
}

const VIAS_SEMILLA = ['telefono', 'correo', 'telefono', 'presencial', 'whatsapp', 'correo', 'telefono']

export function semillas(hoy) {
  const azar = aleatorio(20261020)
  const personas = crearPersonas(210, azar)
  const maria = { id: 1, nombre: 'María Fuentes Rojas', rut: '13.457.902-1', rol: 'Técnica administrativa', region: '05', calidad: 'afiliado', grado: 16, correo: 'maria.fuentes@conaf.cl', telefono: '+56 9 6123 4587' }
  const hernan = { id: 3, nombre: 'Hernán Soto Valenzuela', rut: '6.884.215-8', rol: 'Afiliado jubilado', region: '08', calidad: 'jubilado', correo: 'hsoto.valenzuela@gmail.com', telefono: '+56 9 8455 1290' }
  const externo = { nombre: 'Rodrigo Pérez Leiva', rut: rutFicticio(14552310), rol: 'Funcionario de Servicio Agrícola y Ganadero', region: '05', calidad: 'otro_servicio', correo: 'rodrigo.perez@sag.gob.cl', telefono: '+56 9 7712 4410' }
  // Nora está en la nómina de demostración (datos/usuarios.js) con su propio RUT ficticio.
  const jubilada = { id: 7, nombre: 'Nora Castillo Vergara', rut: '7.215.346-4', rol: 'Afiliada jubilada', region: '05', calidad: 'jubilado', correo: 'nora.castillo@gmail.com', telefono: '+56 9 6630 2194' }
  const conf = (dias) => ({ confirmada_por: AUTOMATICA, creada_en: sumarDias(hoy, -dias) + 'T09:30:00', confirmada_en: sumarDias(hoy, -dias) + 'T09:30:00' })
  const auto = (creada) => ({ confirmada_por: AUTOMATICA, creada_en: creada, confirmada_en: creada })
  const porNacional = (creada) => ({
    creada_en: creada,
    registrada_por: { nombre: 'Patricia Herrera Muñoz', perfil: 'central', region: null },
    via: 'telefono',
    declaracion_encargado: creada,
    confirmada_por: 'Patricia Herrera Muñoz',
    confirmada_en: creada,
  })
  const pagado = (r, dias) => ({ ...r, pago: { registrado_en: sumarDias(hoy, -dias) + 'T12:00:00', comprobante: (r.forma_pago.tipo === 'efectivo' ? 'REC-' : 'TRF-') + (480000 + dias * 37), por: 'Patricia Herrera Muñoz' } })

  const bloqueos = [
    { id: 'B-1', casa_id: 7, entrada: sumarDias(hoy, 12), salida: sumarDias(hoy, 20), motivo: 'Mantención de techumbre', creado_por: 'Patricia Herrera Muñoz', creado_en: sumarDias(hoy, -6) + 'T10:00:00' },
  ]

  // Reservas de los usuarios de demostración.
  const lista = [
    nuevaReserva('R-2026-0118', 6, sumarDias(hoy, -70), 4, maria, conf(95)),
    nuevaReserva('R-2026-0187', 20, sumarDias(hoy, 26), 3, maria, { ...conf(10), forma_pago: { tipo: 'planilla', cuotas: 2, autorizacion: true } }),
    pagado(nuevaReserva('R-2026-0142', 15, sumarDias(hoy, -40), 3, hernan, conf(60)), 45),
  ]

  // Escenario de la Región de Valparaíso y pendientes en otras regiones.
  lista.push(
    nuevaReserva('R-2026-0171', 8, hoy, 3, { ...personas[0], calidad: 'afiliado', plazo_fijo: false }, conf(10)),
    nuevaReserva('R-2026-0166', 9, sumarDias(hoy, -2), 3, { ...personas[1], calidad: 'afiliado', plazo_fijo: false }, conf(12)),
    nuevaReserva('R-2026-0174', 6, sumarDias(hoy, 1), 2, { ...personas[2], calidad: 'afiliado', plazo_fijo: false }, conf(8)),
    nuevaReserva('R-2026-0179', 7, sumarDias(hoy, 25), 4, { ...personas[4], calidad: 'afiliado', plazo_fijo: false }, conf(4)),
    nuevaReserva('R-2026-0190', 6, sumarDias(hoy, 12), 3, { ...personas[5], calidad: 'afiliado', plazo_fijo: false }, { ...auto(sumarDias(hoy, -2) + 'T16:42:00') }),
    nuevaReserva('R-2026-0193', 9, sumarDias(hoy, 12), 2, externo, { ...auto(sumarDias(hoy, -1) + 'T11:05:00') }),
    // Jubilada de Valparaíso que paga en efectivo: confirmada, con el pago pendiente (13-11-2026).
    nuevaReserva('R-2026-0195', 8, sumarDias(hoy, 30), 4, jubilada, { ...auto(hoy + 'T08:12:00'), forma_pago: { tipo: 'efectivo', anticipado: true } }),
    // Confirmadas con pago anticipado pendiente de registrar.
    nuevaReserva('R-2026-0181', 2, sumarDias(hoy, 4), 3, { ...personas[6], calidad: 'jubilado', rol: 'Afiliado jubilado' }, conf(9)),
    nuevaReserva('R-2026-0183', 25, sumarDias(hoy, 8), 4, { ...personas[7], calidad: 'otro_servicio', rol: 'Funcionario/a de INDAP' }, conf(5)),
    // Otras reservas recientes de otras regiones.
    nuevaReserva('R-2026-0158', 22, sumarDias(hoy, 9), 3, { ...personas[8], calidad: 'afiliado', plazo_fijo: false }, { ...auto(sumarDias(hoy, -6) + 'T09:20:00') }),
    nuevaReserva('R-2026-0162', 21, sumarDias(hoy, 18), 4, { ...personas[9], calidad: 'no_afiliado' }, { ...auto(sumarDias(hoy, -4) + 'T15:10:00') }),
    nuevaReserva('R-2026-0185', 10, sumarDias(hoy, 7), 2, { ...personas[10], calidad: 'afiliado', plazo_fijo: false }, { ...auto(sumarDias(hoy, -1) + 'T18:45:00') }),
    // Registradas por el encargado nacional: quedan confirmadas al registrarlas (sin aprobación, 13-11-2026).
    nuevaReserva('R-2026-0197', 9, sumarDias(hoy, 40), 3, { ...personas[11], calidad: 'afiliado', plazo_fijo: false }, porNacional(sumarDias(hoy, -1) + 'T10:20:00')),
    nuevaReserva('R-2026-0198', 3, sumarDias(hoy, 33), 3, { ...personas[12], calidad: 'afiliado', plazo_fijo: false }, porNacional(hoy + 'T09:05:00')),
  )

  // Historial de todo 2026 y reservas futuras de terceros, sin chocar con lo anterior.
  let n = 300
  const inicio = '2026-01-03'
  const finFuturo = sumarDias(hoy, 110)
  for (const casa of CASAS) {
    const rnd = aleatorio(casa.id * 7919)
    const demanda = DEMANDA[casa.id] ?? 0.85
    let d = sumarDias(inicio, Math.floor(rnd() * 5))
    while (d < finFuturo) {
      const mes = Number(d.slice(5, 7))
      const verano = mes <= 2 || (mes === 7 && Number(d.slice(8, 10)) >= 6 && Number(d.slice(8, 10)) <= 26)
      const largo = verano ? 5 + Math.floor(rnd() * 3) : 2 + Math.floor(rnd() * 4)
      const salida = sumarDias(d, largo)
      const brecha = Math.max(1, Math.round((verano ? 1 + rnd() * 3 : 3 + rnd() * 11) / demanda))
      const choca = lista.some((p) => p.casa_id === casa.id && d <= sumarDias(p.salida, 1) && sumarDias(p.entrada, -1) <= salida)
      const enBloqueo = bloqueos.some((b) => b.casa_id === casa.id && d <= b.salida && b.entrada <= salida)
      if (!choca && !enBloqueo) {
        n += 1
        const titular = personas[Math.floor(rnd() * personas.length)]
        const codigo = `R-2026-${String(n).padStart(4, '0')}`
        const anticipacion = 5 + Math.floor(rnd() * 55)
        const creada = sumarDias(d, -anticipacion) + `T${String(8 + Math.floor(rnd() * 11)).padStart(2, '0')}:${String(Math.floor(rnd() * 60)).padStart(2, '0')}:00`
        const creadaEn = creada < hoy ? creada : hoy + 'T08:00:00'
        const r = nuevaReserva(codigo, casa.id, d, largo, titular, { ...auto(creadaEn) })
        const sinAnticipo = r.forma_pago.anticipado !== true
        if (sinAnticipo) {
          const p = rnd()
          r.forma_pago = titular.plazo_fijo && p < 0.4 ? { tipo: 'transferencia', anticipado: true } : { tipo: 'planilla', cuotas: 1 + Math.floor(rnd() * 3), autorizacion: true }
        }
        const x = rnd()
        if (d < hoy && x < 0.06) {
          r.estado = 'desistida'
          r.desistida_en = sumarDias(d, -Math.floor(rnd() * 14))
          r.cargo_desistimiento = cargoDesistimiento({ ...r, estado: 'confirmada' }, r.desistida_en)
        } else if (r.forma_pago.tipo !== 'planilla' && (salida <= hoy || r.forma_pago.anticipado)) {
          if (salida <= hoy || rnd() < 0.85) r.pago = { registrado_en: (salida <= hoy ? sumarDias(salida, -1) : sumarDias(hoy, -2)) + 'T12:00:00', comprobante: (r.forma_pago.tipo === 'efectivo' ? 'REC-' : 'TRF-') + (500000 + n), por: 'Encargada regional' }
        }
        lista.push(r)
      }
      d = sumarDias(salida, brecha)
    }
  }

  const inventarios = inventarioInicial(hoy)
  const estado = { reservas: lista, correlativo: n, inventarios, bloqueos, tarifas: {}, inactivas: [], retiros: [], historial_tarifas: [], adicionales: { ...ADICIONAL_BASE }, nominas: {} }
  return estado
}

/** Generador determinista: mismos datos en cada carga. */
export function aleatorio(semilla) {
  let s = semilla % 233280
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}
