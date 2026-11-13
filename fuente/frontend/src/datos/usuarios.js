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
    rut: '13.457.902-1',
    correo: 'maria.fuentes@conaf.cl',
    telefono: '+56 9 6123 4587',
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
    rut: '16.882.409-2',
    correo: 'paula.ortiz@conaf.cl',
    telefono: '+56 9 5520 7714',
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
    rut: '6.884.215-8',
    correo: 'hsoto.valenzuela@gmail.com',
    telefono: '+56 9 8455 1290',
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
    rut: '15.336.204-1',
    correo: 'jorge.pavez@conaf.cl',
    telefono: '+56 9 7341 0028',
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
    rut: '14.102.558-9',
    correo: 'carolina.nunez@conaf.cl',
    telefono: '+56 9 6610 4432',
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
    rut: '12.554.871-7',
    correo: 'patricia.herrera@conaf.cl',
    telefono: '+56 9 7788 1203',
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
    rut: '7.215.346-4',
    correo: 'nora.castillo@gmail.com',
    telefono: '+56 9 6630 2194',
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
  rut: '15.903.447-K',
  institucion: 'Servicio Agrícola y Ganadero',
  correo: 'andrea.molina@sag.gob.cl',
  telefono: '+56 9 6234 1187',
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
  return enNomina?.correo ?? `bienestar.region${region}@conaf.cl`
}
