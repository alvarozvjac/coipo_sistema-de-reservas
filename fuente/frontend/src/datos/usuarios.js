/**
 * Nómina de demostración — PERSONAS Y RUT FICTICIOS.
 *
 * Representa el cruce de la nómina de afiliados de Bienestar con la nómina de
 * Personal. En la versión real se carga desde esas fuentes: el RUT determina
 * la calidad de la persona (Anexo A), su tipo de contrato (Art. 21), su región
 * y su perfil en el sistema. El usuario nunca elige su categoría.
 *
 * calidad: afiliado | jubilado | no_afiliado   (otro_servicio no está en nómina)
 * grado:   grado del trabajador/a activo/a (04 a 19); define el
 *          tramo de tarifa (Memo 6188/2026). Jubilados/as no tienen grado.
 * perfil:  solicitante (beneficiario/a, no ingresa) | encargada | central. Es
 *          referencial: quién ingresa y con qué perfil lo decide el rol del
 *          COIPO IAM (datos/iam.js), no esta nómina.
 */

export const NOMINA = [
  {
    id: 1,
    nombre: 'María Fuentes Rojas',
    rut: '11.111.111-1',
    correo: 'maria.fuentes@conaf.invalid',
    telefono: '+56 9 0000 4587',
    region: '05',
    rol: 'Técnica administrativa',
    unidad: 'Dirección Regional Valparaíso',
    calidad: 'afiliado',
    plazo_fijo: false,
    grado: 16,
    perfil: 'solicitante',
    grupo_familiar: [
      { nombre: 'Rodrigo Salinas Pérez', edad: 44, parentesco: 'conyuge' },
      { nombre: 'Emilia Salinas Fuentes', edad: 12, parentesco: 'hijo' },
      { nombre: 'Tomás Salinas Fuentes', edad: 9, parentesco: 'hijo' },
    ],
  },
  {
    id: 2,
    nombre: 'Paula Ortiz Cárcamo',
    rut: '22.222.222-2',
    correo: 'paula.ortiz@conaf.invalid',
    telefono: '+56 9 0000 7714',
    region: '09',
    rol: 'Guardaparque',
    unidad: 'P.N. Conguillío, Dirección Regional Araucanía',
    calidad: 'afiliado',
    plazo_fijo: true,
    grado: 18,
    perfil: 'solicitante',
    grupo_familiar: [{ nombre: 'Matías Ortiz Ortiz', edad: 6, parentesco: 'hijo' }],
  },
  {
    id: 3,
    nombre: 'Hernán Soto Valenzuela',
    rut: '33.333.333-3',
    correo: 'hsoto.valenzuela@correo.invalid',
    telefono: '+56 9 0000 1290',
    region: '08',
    rol: 'Afiliado jubilado',
    unidad: '—',
    calidad: 'jubilado',
    plazo_fijo: false,
    perfil: 'solicitante',
    grupo_familiar: [{ nombre: 'Gloria Muñoz Araya', edad: 68, parentesco: 'conyuge' }],
  },
  {
    id: 4,
    nombre: 'Jorge Pavez Contreras',
    rut: '44.444.444-4',
    correo: 'jorge.pavez@conaf.invalid',
    telefono: '+56 9 0000 0028',
    region: '13',
    rol: 'Analista de presupuesto',
    unidad: 'Gerencia de Finanzas, Oficina Central',
    calidad: 'no_afiliado',
    plazo_fijo: false,
    grado: 12,
    perfil: 'solicitante',
    grupo_familiar: [],
  },
  {
    id: 5,
    nombre: 'Carolina Núñez Vidal',
    rut: '55.555.555-5',
    correo: 'carolina.nunez@conaf.invalid',
    telefono: '+56 9 0000 4432',
    region: '05',
    rol: 'Encargada regional de Bienestar',
    unidad: 'Bienestar, Región de Valparaíso',
    calidad: 'afiliado',
    plazo_fijo: false,
    grado: 11,
    perfil: 'encargada',
    grupo_familiar: [],
  },
  {
    id: 6,
    nombre: 'Patricia Herrera Muñoz',
    rut: '66.666.666-6',
    correo: 'patricia.herrera@conaf.invalid',
    telefono: '+56 9 0000 1203',
    region: '13',
    rol: 'Encargada nacional de casas de veraneo',
    unidad: 'Servicio de Bienestar, Oficina Central',
    calidad: 'afiliado',
    plazo_fijo: false,
    grado: 7,
    perfil: 'central',
    grupo_familiar: [],
  },
  {
    id: 7,
    nombre: 'Nora Castillo Vergara',
    rut: '77.777.777-7',
    correo: 'nora.castillo@correo.invalid',
    telefono: '+56 9 0000 2194',
    region: '05',
    rol: 'Afiliada jubilada',
    unidad: '—',
    calidad: 'jubilado',
    plazo_fijo: false,
    perfil: 'solicitante',
    grupo_familiar: [{ nombre: 'Ernesto Valdés Rojas', edad: 71, parentesco: 'conyuge' }],
  },
]

/** Persona de otro servicio público para los botones de demostración (no está en nómina). */
export const EXTERNO_DEMO = {
  nombre: 'Andrea Molina Pizarro',
  rut: '88.888.888-8',
  institucion: 'Servicio Agrícola y Ganadero',
  correo: 'andrea.molina@sag.invalid',
  telefono: '+56 9 0000 1187',
}

const normalizarRut = (r) => String(r).replace(/[^0-9kK]/g, '').toUpperCase()

export const buscarEnNomina = (rut) => NOMINA.find((p) => normalizarRut(p.rut) === normalizarRut(rut)) ?? null

export const porId = (id) => NOMINA.find((p) => p.id === id) ?? null

/**
 * Correo de la encargada regional, al que el usuario envía las observaciones
 * de ingreso (12 horas) y el acta de salida firmada (Art. 13, Art. 26).
 * Solo la Región de Valparaíso tiene encargada en la nómina de demostración;
 * el resto usa una casilla genérica ficticia.
 */
export function correoEncargada(region) {
  const enNomina = NOMINA.find((p) => p.perfil === 'encargada' && p.region === region)
  return enNomina?.correo ?? `bienestar.region${region}@conaf.invalid`
}
