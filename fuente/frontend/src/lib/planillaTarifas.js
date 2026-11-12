/**
 * Carga masiva de las tarifas por noche (encargado nacional), en los dos tramos
 * por grado del trabajador/a: 04 a 14 y 15 a 19 (Memo 6188/2026).
 *
 * Formato tipo: una hoja «Tarifas» con una fila por casa y estas columnas, en
 * este orden. El sistema identifica cada casa por «ID casa»; las columnas
 * «Casa», «Región» y las tarifas vigentes son solo de referencia. Se acepta el
 * mismo formato en Excel (.xlsx) o CSV (separador «;» o «,», UTF-8).
 */

import { guardarArchivo } from './guardar.js'
import { hoyISO } from './fechas.js'
import { TRAMOS, tarifaTramo } from './reglas.js'

export const COLUMNAS = ['ID casa', 'Casa', 'Región', 'Vigente grados 04-14 ($/noche)', 'Vigente grados 15-19 ($/noche)', 'Nueva grados 04-14 ($/noche)', 'Nueva grados 15-19 ($/noche)']
/** Columna de la tarifa nueva de cada tramo. */
const COLUMNA_NUEVA = { a: 5, b: 6 }
export const TARIFA_MIN = 5000
export const TARIFA_MAX = 500000
export const VARIACION_AVISO = 0.3
export const TAMANO_MAX = 2 * 1024 * 1024

const INSTRUCCIONES = [
  'Formato tipo para actualizar la tarifa por noche y por familia de cada casa de veraneo, en sus dos tramos según el grado del trabajador/a.',
  '',
  '1. Trabaje en la hoja «Tarifas». No cambie el nombre de la hoja ni el de las columnas, ni su orden.',
  '2. No modifique la columna «ID casa»: es la que usa el sistema para reconocer cada casa.',
  '3. Escriba las nuevas tarifas en las columnas «Nueva grados 04-14» y «Nueva grados 15-19», en pesos, sin decimales (por ejemplo: 45000).',
  `4. Cada tarifa debe estar entre $${TARIFA_MIN.toLocaleString('es-CL')} y $${TARIFA_MAX.toLocaleString('es-CL')} por noche.`,
  '5. Si deja una tarifa nueva en blanco, ese tramo mantiene su tarifa vigente.',
  '6. Las columnas «Casa», «Región» y las tarifas vigentes son de referencia; el sistema no las usa.',
  '7. Guarde como Excel (.xlsx) o CSV y súbalo en Casas y tarifas › Tarifas › Cargar planilla.',
  '8. Antes de aplicar, el sistema muestra los cambios y los errores por fila. Los cambios rigen para reservas nuevas.',
]

/** Descarga el formato tipo en Excel, con las casas y su tarifa vigente. */
export async function descargarFormatoExcel(casas, nombreRegion) {
  const { default: writeExcelFile } = await import('write-excel-file/browser')
  const cab = (v) => ({ value: v, fontWeight: 'bold', backgroundColor: '#D6EADC', wrap: true })
  const tarifas = [
    COLUMNAS.map(cab),
    ...casas.map((c) => [
      { value: c.id, type: Number },
      { value: c.nombre, type: String },
      { value: nombreRegion(c.region), type: String },
      { value: tarifaTramo(c, 'a'), type: Number, format: '#,##0' },
      { value: tarifaTramo(c, 'b'), type: Number, format: '#,##0' },
      { value: null, type: Number, format: '#,##0', backgroundColor: '#FFF8E1' },
      { value: null, type: Number, format: '#,##0', backgroundColor: '#FFF8E1' },
    ]),
  ]
  const blob = await writeExcelFile([
    { sheet: 'Tarifas', data: tarifas, columns: [{ width: 9 }, { width: 34 }, { width: 16 }, { width: 18 }, { width: 18 }, { width: 18 }, { width: 18 }], stickyRowsCount: 1 },
    { sheet: 'Instrucciones', data: INSTRUCCIONES.map((t) => [{ value: t, type: String }]), columns: [{ width: 110 }] },
  ]).toBlob()
  return guardarArchivo(`formato-tarifas-casas-veraneo-${hoyISO()}.xlsx`, blob)
}

/** Descarga el mismo formato en CSV (separador «;», abre en Excel). */
export function descargarFormatoCSV(casas, nombreRegion) {
  const celda = (v) => {
    const t = v == null ? '' : String(v)
    return /[;"\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t
  }
  const filas = [COLUMNAS, ...casas.map((c) => [c.id, c.nombre, nombreRegion(c.region), tarifaTramo(c, 'a'), tarifaTramo(c, 'b'), '', ''])]
  const texto = filas.map((f) => f.map(celda).join(';')).join('\r\n')
  return guardarArchivo(`formato-tarifas-casas-veraneo-${hoyISO()}.csv`, new Blob(['﻿' + texto], { type: 'text/csv;charset=utf-8' }))
}

/** Lee el archivo subido y devuelve sus filas (arreglos de celdas), o lanza un error con un mensaje para la persona. */
export async function leerArchivo(archivo) {
  const nombre = archivo.name.toLowerCase()
  if (archivo.size > TAMANO_MAX) throw new Error('El archivo pesa más de 2 MB. Use el formato tipo, que tiene una fila por casa.')
  if (nombre.endsWith('.csv')) return leerCSV(await archivo.text())
  if (nombre.endsWith('.xlsx')) {
    const { default: readExcelFile } = await import('read-excel-file/browser')
    let hojas
    try {
      hojas = await readExcelFile(archivo)
    } catch {
      throw new Error('No se pudo leer el archivo Excel. Verifique que sea un .xlsx y que no esté protegido con contraseña.')
    }
    const hoja = hojas.find((h) => normalizar(h.sheet) === 'tarifas') ?? hojas[0]
    return hoja.data
  }
  throw new Error('Formato no admitido. Suba un archivo .xlsx o .csv con el formato tipo.')
}

function leerCSV(texto) {
  const limpio = texto.replace(/^﻿/, '')
  const primera = limpio.split(/\r?\n/)[0] ?? ''
  const sep = primera.split(';').length >= primera.split(',').length ? ';' : ','
  const filas = []
  let fila = [], campo = '', comillas = false
  const cerrarCampo = () => {
    fila.push(campo)
    campo = ''
  }
  for (let i = 0; i < limpio.length; i++) {
    const ch = limpio[i]
    if (comillas) {
      if (ch === '"' && limpio[i + 1] === '"') {
        campo += '"'
        i++
      } else if (ch === '"') comillas = false
      else campo += ch
    } else if (ch === '"') comillas = true
    else if (ch === sep) cerrarCampo()
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && limpio[i + 1] === '\n') i++
      cerrarCampo()
      filas.push(fila)
      fila = []
    } else campo += ch
  }
  if (campo !== '' || fila.length) {
    cerrarCampo()
    filas.push(fila)
  }
  return filas
}

const normalizar = (t) =>
  String(t ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()

/** «45.000», «$45000», 45000 → 45000; texto que no es un monto entero → NaN. */
function aMonto(v) {
  if (typeof v === 'number') return v
  const t = String(v).replace(/\$/g, '').replace(/\s/g, '').trim()
  if (/^\d{1,3}(\.\d{3})+$/.test(t)) return Number(t.replace(/\./g, ''))
  if (/^\d+$/.test(t)) return Number(t)
  return NaN
}

const vacia = (fila) => fila.every((c) => c == null || String(c).trim() === '')

/**
 * Valida las filas contra las casas del sistema. Devuelve:
 *   { valido, errores: [{ fila, mensaje }], advertencias: [{ fila, mensaje }],
 *     cambios: [{ casa_id, casa, tramo, antes, nueva, variacion }], sinCambio }
 * `sinCambio` cuenta los tramos que quedan con su tarifa vigente.
 * `fila` es el número de fila tal como se ve en Excel (la cabecera es la 1).
 */
export function validarPlanilla(filas, casas) {
  const errores = []
  const advertencias = []
  const cambios = []
  let sinCambio = 0
  if (!filas.length || vacia(filas[0])) return { valido: false, errores: [{ fila: 1, mensaje: 'El archivo está vacío.' }], advertencias, cambios, sinCambio }

  const cabecera = filas[0].map(normalizar)
  const faltan = COLUMNAS.filter((c, i) => cabecera[i] !== normalizar(c))
  if (faltan.length)
    return {
      valido: false,
      errores: [{ fila: 1, mensaje: `Las columnas no coinciden con el formato tipo. Se esperaba, en este orden: ${COLUMNAS.join(' · ')}. Descargue el formato tipo y vuelva a cargarlo.` }],
      advertencias,
      cambios,
      sinCambio,
    }

  const porId = new Map(casas.map((c) => [c.id, c]))
  const vistos = new Map()
  filas.slice(1).forEach((f, i) => {
    const n = i + 2
    if (vacia(f)) return
    const idTexto = String(f[0] ?? '').trim()
    const id = Number(idTexto)
    if (!idTexto || !Number.isInteger(id)) return errores.push({ fila: n, mensaje: `«ID casa» vacío o no numérico («${idTexto}»).` })
    const casa = porId.get(id)
    if (!casa) return errores.push({ fila: n, mensaje: `No existe una casa con ID ${id}.` })
    if (vistos.has(id)) return errores.push({ fila: n, mensaje: `La casa ${casa.nombre} (ID ${id}) ya aparece en la fila ${vistos.get(id)}.` })
    vistos.set(id, n)
    if (f[1] && normalizar(f[1]) !== normalizar(casa.nombre)) advertencias.push({ fila: n, mensaje: `El nombre «${f[1]}» no coincide con el del sistema («${casa.nombre}»); se usa el ID ${id}.` })
    const resultado = {}
    for (const tramo of ['a', 'b']) {
      const etiqueta = TRAMOS[tramo].toLowerCase()
      const bruto = f[COLUMNA_NUEVA[tramo]]
      const vigente = tarifaTramo(casa, tramo)
      if (bruto == null || String(bruto).trim() === '') {
        sinCambio += 1
        resultado[tramo] = vigente
        continue
      }
      const nueva = aMonto(bruto)
      if (!Number.isFinite(nueva) || !Number.isInteger(nueva)) {
        errores.push({ fila: n, mensaje: `${casa.nombre}, ${etiqueta}: la nueva tarifa «${bruto}» no es un monto en pesos sin decimales.` })
        continue
      }
      if (nueva < TARIFA_MIN || nueva > TARIFA_MAX) {
        errores.push({ fila: n, mensaje: `${casa.nombre}, ${etiqueta}: la nueva tarifa ($${nueva.toLocaleString('es-CL')}) está fuera del rango permitido ($${TARIFA_MIN.toLocaleString('es-CL')} a $${TARIFA_MAX.toLocaleString('es-CL')}).` })
        continue
      }
      resultado[tramo] = nueva
      if (nueva === vigente) {
        sinCambio += 1
        continue
      }
      const variacion = (nueva - vigente) / vigente
      if (Math.abs(variacion) > VARIACION_AVISO) advertencias.push({ fila: n, mensaje: `${casa.nombre}, ${etiqueta}: la tarifa cambia ${Math.round(variacion * 100)}%. Revise que el monto sea correcto.` })
      cambios.push({ casa_id: id, casa: casa.nombre, region: casa.region, tramo, antes: vigente, nueva, variacion })
    }
    if (resultado.a !== undefined && resultado.b !== undefined && resultado.b > resultado.a)
      advertencias.push({ fila: n, mensaje: `${casa.nombre}: la tarifa de grados 15 a 19 queda mayor que la de grados 04 a 14. Revise que no estén invertidas.` })
  })
  if (!errores.length && !cambios.length) errores.push({ fila: null, mensaje: 'La planilla no trae tarifas nuevas: las columnas «Nueva grados 04-14» y «Nueva grados 15-19» están vacías o repiten las tarifas vigentes.' })
  return { valido: errores.length === 0, errores, advertencias, cambios, sinCambio }
}
