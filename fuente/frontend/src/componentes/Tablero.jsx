import { useRef, useState } from 'react'
import { diaSemana, fechaLarga, nombreMes, sumarDias } from '../lib/fechas.js'
import { ESTADOS, temporadaAltaDe } from '../lib/reglas.js'
import { bloqueosDe, nochesLiberadas } from '../datos/servicio.js'

/** Estados que ocupan noches en el tablero (las demás reservas no se dibujan). */
export const EN_TABLERO = ['por_aprobar', 'por_confirmar', 'confirmada', 'en_curso', 'finalizada']

export const BARRA = {
  confirmada: 'bg-verde-700 text-white',
  en_curso: 'bg-verde-700 text-white',
  por_confirmar: 'bg-verde-100 text-verde-800 ring-1 ring-inset ring-verde-700',
  por_aprobar: 'border-2 border-dashed border-alerta-700 bg-alerta-50 text-alerta-700',
  finalizada: 'bg-stone-200 text-tinta-700',
}
export const RAYADO = 'bg-[repeating-linear-gradient(45deg,var(--color-stone-400)_0_3px,var(--color-stone-100)_3px_7px)]'

const INICIAL = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

/**
 * Tablero de ocupación (decisión 12-11-2026): una fila por casa y una columna
 * por noche. Las reservas son barras; se toca una para gestionarla. En una casa
 * libre se toca la primera noche y luego la última para elegir un tramo, que la
 * página ofrece registrar. Con el teclado, el tablero es una sola parada: las
 * flechas recorren las noches y Enter elige o abre.
 */
export function Tablero({ casas, reservas, desde, dias, minimo, hoy, personas, seleccion, onSeleccion, onAbrir, resaltar, grupos }) {
  const noches = Array.from({ length: dias }, (_, i) => sumarDias(desde, i))
  const [foco, setFoco] = useState({ f: 0, i: 0 })
  const raiz = useRef(null)

  // Lo que hay en cada noche de cada casa.
  const filas = casas.map((casa) => {
    const propias = reservas.filter((r) => r.casa_id === casa.id && EN_TABLERO.includes(r.visible) && r.entrada < sumarDias(desde, dias) && r.salida > desde)
    const bloqueos = bloqueosDe(casa.id)
    const liberadas = nochesLiberadas(casa.id)
    const cabe = !personas || casa.capacidad >= personas
    const celdas = noches.map((d) => {
      const r = propias.find((x) => d >= x.entrada && d < x.salida)
      if (r) return { tipo: 'reserva', r }
      if (bloqueos.some((b) => d >= b.entrada && d < b.salida)) return { tipo: 'bloqueo' }
      if (temporadaAltaDe(d) && !liberadas.has(d)) return { tipo: 'temporada' }
      if (d < minimo) return { tipo: 'pasado' }
      if (!cabe) return { tipo: 'capacidad' }
      return { tipo: 'libre' }
    })
    return { casa, propias, bloqueos, celdas, cabe }
  })

  function elegir(fila, i) {
    const { casa, celdas } = filas[fila]
    const c = celdas[i]
    if (c.tipo === 'reserva') return onAbrir(c.r.codigo)
    if (c.tipo !== 'libre') return
    const d = noches[i]
    const s = seleccion
    // Segundo toque en la misma casa, después de la primera noche: se extiende si todo el tramo está libre.
    if (s && s.casaId === casa.id && s.abierta && d >= s.entrada) {
      const desdeI = noches.indexOf(s.entrada)
      const libre = desdeI >= 0 && celdas.slice(desdeI, i + 1).every((x) => x.tipo === 'libre')
      if (libre) return onSeleccion({ casaId: casa.id, entrada: s.entrada, salida: sumarDias(d, 1), abierta: false })
    }
    onSeleccion({ casaId: casa.id, entrada: d, salida: sumarDias(d, 1), abierta: true })
  }

  function tecla(e) {
    const mover = { ArrowLeft: [0, -1], ArrowRight: [0, 1], ArrowUp: [-1, 0], ArrowDown: [1, 0], Home: [0, -dias], End: [0, dias] }[e.key]
    if (mover) {
      e.preventDefault()
      const f = Math.min(filas.length - 1, Math.max(0, foco.f + mover[0]))
      const i = Math.min(dias - 1, Math.max(0, foco.i + mover[1]))
      setFoco({ f, i })
      raiz.current?.querySelector(`[data-f="${f}"][data-i="${i}"]`)?.focus()
    } else if (e.key === 'Escape' && seleccion) {
      onSeleccion(null)
    }
  }

  const etiqueta = (casa, d, c) => {
    const base = `${casa.nombre}, ${fechaLarga(d)}: `
    if (c.tipo === 'reserva') return `${base}${c.r.codigo}, ${c.r.titular.nombre}, ${ESTADOS[c.r.visible].etiqueta.toLowerCase()}`
    if (c.tipo === 'bloqueo') return `${base}bloqueada`
    if (c.tipo === 'temporada') return `${base}temporada alta, por sorteo`
    if (c.tipo === 'pasado') return `${base}no se puede reservar`
    if (c.tipo === 'capacidad') return `${base}libre, pero no alcanza la capacidad`
    return `${base}libre`
  }

  const enSeleccion = (casa, d) => seleccion && seleccion.casaId === casa.id && d >= seleccion.entrada && d < seleccion.salida
  const meses = noches.reduce((acc, d, i) => {
    if (i === 0 || d.slice(8) === '01') acc.push({ i, texto: nombreMes(d) })
    return acc
  }, [])
  const columnas = { gridTemplateColumns: `repeat(${dias}, minmax(1.75rem, 1fr))` }

  return (
    <div ref={raiz} className="max-h-[75vh] overflow-auto overscroll-contain rounded-xl border border-borde bg-white" onKeyDown={tecla}>
      <div role="grid" aria-label="Tablero de ocupación: casas por noche" className="text-[13px]" style={{ minWidth: `calc(8rem + ${dias} * 1.75rem)` }}>
        {/* Encabezado: meses y noches */}
        <div role="row" className="sticky top-0 z-20 flex border-b border-borde bg-white">
          <div role="columnheader" className="sticky left-0 z-20 w-32 shrink-0 bg-white px-3 py-2 font-medium text-tinta-500 sm:w-48">
            Casa
          </div>
          <div className="relative grid flex-1 pt-5" style={columnas}>
            {meses.map((m) => (
              <span key={m.i} aria-hidden className="absolute top-1 whitespace-nowrap pl-1 font-semibold capitalize text-tinta-700" style={{ left: `calc(${m.i} * 100% / ${dias})` }}>
                {m.texto}
              </span>
            ))}
            {noches.map((d) => (
              <div key={d} role="columnheader" aria-label={`${fechaLarga(d)}${d === hoy ? ', hoy' : ''}`} className={`border-l border-borde py-1 text-center leading-tight tabular-nums ${d === hoy ? 'bg-verde-700 font-semibold text-white' : diaSemana(d) >= 5 ? 'bg-stone-50 font-semibold text-tinta-900' : 'text-tinta-500'}`}>
                <span className="block text-[11px]">{INICIAL[diaSemana(d)]}</span>
                {Number(d.slice(8))}
              </div>
            ))}
          </div>
        </div>

        {filas.map(({ casa, propias, celdas, cabe }, f) => (
          <div key={casa.id}>
            {grupos?.[f] && (
              <div className="sticky left-0 border-b border-borde bg-fondo px-3 py-1.5 text-[13px] font-semibold text-tinta-700" role="row">
                <span role="rowheader">{grupos[f]}</span>
              </div>
            )}
            <div role="row" className="flex border-b border-borde last:border-b-0">
              <div role="rowheader" className="sticky left-0 z-10 flex w-32 shrink-0 flex-col justify-center bg-white px-3 py-1.5 sm:w-48">
                <span className="line-clamp-2 text-[13px] leading-tight font-medium text-tinta-900 sm:truncate sm:text-[14px]" title={casa.nombre}>
                  {casa.nombre}
                </span>
                <span className={`text-[12px] ${cabe ? 'text-tinta-500' : 'font-medium text-alerta-700'}`}>hasta {casa.capacidad} personas</span>
              </div>
              <div className="relative grid flex-1" style={columnas}>
                {celdas.map((c, i) => {
                  const d = noches[i]
                  const sel = enSeleccion(casa, d)
                  const fondo = sel
                    ? 'bg-verde-100'
                    : c.tipo === 'bloqueo'
                      ? RAYADO
                      : c.tipo === 'temporada'
                        ? 'bg-alerta-50'
                        : c.tipo === 'libre'
                          ? `${diaSemana(d) >= 5 ? 'bg-stone-50' : ''} hover:bg-verde-50`
                          : diaSemana(d) >= 5
                            ? 'bg-stone-50'
                            : ''
                  return (
                    <button
                      key={d}
                      type="button"
                      role="gridcell"
                      data-f={f}
                      data-i={i}
                      tabIndex={foco.f === f && foco.i === i ? 0 : -1}
                      aria-selected={sel || undefined}
                      aria-disabled={!['libre', 'reserva'].includes(c.tipo) || undefined}
                      aria-label={etiqueta(casa, d, c)}
                      title={etiqueta(casa, d, c)}
                      onFocus={() => setFoco({ f, i })}
                      onClick={() => elegir(f, i)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          elegir(f, i)
                        }
                      }}
                      className={`h-11 border-l border-borde ${fondo} ${c.tipo === 'libre' ? 'cursor-pointer' : c.tipo === 'reserva' ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                      style={{ gridColumn: i + 1, gridRow: 1 }}
                    />
                  )
                })}
                {propias.map((r) => {
                  const a = Math.max(0, noches.indexOf(r.entrada) === -1 ? 0 : noches.indexOf(r.entrada))
                  const finI = noches.indexOf(r.salida)
                  const b = finI === -1 ? dias : finI
                  const tenue = resaltar && !resaltar.has(r.codigo)
                  return (
                    <div
                      key={r.codigo}
                      aria-hidden
                      onClick={() => onAbrir(r.codigo)}
                      className={`z-[1] cursor-pointer mx-0.5 my-1.5 flex min-w-0 items-center overflow-hidden rounded-md px-1.5 text-left text-[12px] font-semibold leading-tight ${BARRA[r.visible]} ${tenue ? 'opacity-25' : ''}`}
                      style={{ gridColumn: `${a + 1} / ${b + 1}`, gridRow: 1 }}
                      title={`${r.codigo} · ${r.titular.nombre} · ${ESTADOS[r.visible].etiqueta}`}
                    >
                      <span className="truncate">{r.titular.nombre.split(' ').slice(0, 2).join(' ')}</span>
                    </div>
                  )
                })}
                {seleccion && seleccion.casaId === casa.id && noches.includes(seleccion.entrada) && (
                  <span
                    aria-hidden
                    className="pointer-events-none z-[1] mx-0.5 my-1.5 flex items-center overflow-hidden rounded-md px-1.5 text-[12px] font-semibold text-verde-800 ring-2 ring-inset ring-verde-700"
                    style={{ gridColumn: `${noches.indexOf(seleccion.entrada) + 1} / ${(noches.indexOf(seleccion.salida) === -1 ? dias : noches.indexOf(seleccion.salida)) + 1}`, gridRow: 1 }}
                  >
                    <span className="truncate">{seleccion.abierta ? 'Elija la última noche' : 'Selección'}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/** Leyenda del tablero. */
export function LeyendaTablero() {
  const item = (clase, texto) => (
    <li className="flex items-center gap-2">
      <span className={`inline-block h-3.5 w-5 rounded-sm ${clase}`} aria-hidden /> {texto}
    </li>
  )
  return (
    <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[13px] text-tinta-500">
      {item(BARRA.confirmada, 'Confirmada o en curso')}
      {item(BARRA.por_confirmar, 'Por confirmar (pago)')}
      {item(BARRA.por_aprobar, 'Por aprobar')}
      {item(BARRA.finalizada, 'Finalizada')}
      {item(RAYADO, 'Bloqueada')}
      {item('bg-alerta-50 ring-1 ring-inset ring-borde', 'Temporada alta (sorteo)')}
      {item('bg-white ring-1 ring-inset ring-borde', 'Libre')}
    </ul>
  )
}
