import { useState } from 'react'
import { Download, Search } from 'lucide-react'
import { AREAS, actividad } from '../../../datos/configuracion.js'
import { useDatos } from '../../../datos/servicio.js'
import { fechaCorta } from '../../../lib/fechas.js'
import { plural } from '../../../lib/formato.js'
import { Boton, Tarjeta, claseEntrada } from '../../../componentes/ui.jsx'

const POR_PAGINA = 50

function descargarCSV(filas) {
  const celda = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const texto = ['Fecha;Hora;Quién;Área;Acción;Detalle', ...filas.map((f) => [f.en.slice(0, 10), f.en.slice(11, 16), f.por, AREAS[f.area], f.accion, f.detalle].map(celda).join(';'))].join('\n')
  const url = URL.createObjectURL(new Blob(['﻿' + texto], { type: 'text/csv;charset=utf-8' }))
  const a = Object.assign(document.createElement('a'), { href: url, download: 'actividad-casas-de-veraneo.csv' })
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * Registro de actividad (decisión 12-11-2026): quién hizo qué y cuándo, con
 * filtros y descarga. Se arma con lo que cada acción ya registra.
 */
export function Actividad() {
  useDatos()
  const todas = actividad()
  const [area, setArea] = useState('')
  const [quien, setQuien] = useState('')
  const [texto, setTexto] = useState('')
  const [n, setN] = useState(POR_PAGINA)
  const personas = [...new Set(todas.map((x) => x.por))].sort()
  const q = texto.trim().toLowerCase()
  const filas = todas.filter((x) => (!area || x.area === area) && (!quien || x.por === quien) && (!q || `${x.accion} ${x.detalle}`.toLowerCase().includes(q)))

  return (
    <section aria-labelledby="t-act">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="t-act" className="text-lg font-semibold">
            Registro de actividad
          </h2>
          <p className="mt-1 max-w-3xl text-[15px] text-tinta-500">Lo que hicieron los encargados en el sistema: reservas, aprobaciones, pagos, casas, tarifas, temporadas y configuración. Las acciones automáticas no aparecen.</p>
        </div>
        <Boton variante="secundario" onClick={() => descargarCSV(filas)} disabled={!filas.length}>
          <Download className="size-4" aria-hidden /> Descargar CSV
        </Boton>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_12rem_14rem]">
        <label className="relative block">
          <span className="sr-only">Buscar en la actividad</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-tinta-400" aria-hidden />
          <input className={`${claseEntrada} pl-9`} placeholder="Buscar: código, casa, motivo…" value={texto} onChange={(e) => setTexto(e.target.value)} />
        </label>
        <select className={claseEntrada} value={area} onChange={(e) => setArea(e.target.value)} aria-label="Área">
          <option value="">Todas las áreas</option>
          {Object.entries(AREAS).map(([k, t]) => (
            <option key={k} value={k}>
              {t}
            </option>
          ))}
        </select>
        <select className={claseEntrada} value={quien} onChange={(e) => setQuien(e.target.value)} aria-label="Quién">
          <option value="">Todas las personas</option>
          {personas.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
      </div>
      <Tarjeta className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-[15px]">
          <thead className="border-b border-borde text-[13px] text-tinta-500">
            <tr>
              <th className="px-4 py-3 font-medium">Cuándo</th>
              <th className="px-4 py-3 font-medium">Quién</th>
              <th className="px-4 py-3 font-medium">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-borde">
            {filas.slice(0, n).map((x, i) => (
              <tr key={i} className="align-top">
                <td className="whitespace-nowrap px-4 py-2.5 tabular-nums">
                  {fechaCorta(x.en.slice(0, 10), true)}
                  <span className="block text-[13px] text-tinta-500">{x.en.slice(11, 16)}</span>
                </td>
                <td className="px-4 py-2.5">
                  {x.por}
                  <span className="block text-[13px] text-tinta-500">{AREAS[x.area]}</span>
                </td>
                <td className="px-4 py-2.5">
                  {x.accion}
                  <span className="block text-[13px] text-tinta-500">{x.detalle}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filas.length === 0 && <p className="p-6 text-center text-tinta-500">No hay actividad con esos filtros.</p>}
      </Tarjeta>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[13px] text-tinta-500">
        <span>
          {plural(filas.length, 'acción', 'acciones')}
          {filas.length > n ? `, se muestran ${n}` : ''}
        </span>
        {filas.length > n && (
          <Boton variante="secundario" onClick={() => setN((x) => x + POR_PAGINA)}>
            Ver más
          </Boton>
        )}
      </div>
    </section>
  )
}
