import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, PencilLine } from 'lucide-react'
import { pesos } from '../../lib/formato.js'
import { TRAMOS, tarifaTramo } from '../../lib/reglas.js'
import { claseEntrada } from '../../componentes/ui.jsx'
import { nombreRegion } from '../encargada/comun.jsx'

/** Monto en pesos con el signo dentro del campo. */
export function EntradaPesos({ value, onChange, etiqueta, placeholder }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-tinta-400">$</span>
      <input className={`${claseEntrada} pl-7 tabular-nums`} type="number" min="0" step="1000" value={value} onChange={(e) => onChange(e.target.value)} aria-label={etiqueta} placeholder={placeholder} />
    </div>
  )
}

/**
 * Tarifas por noche según grado, en un carril horizontal (decisión 13-11-2026):
 * se ven 4 casas en escritorio, 2 en tableta y 1 en el teléfono; las flechas o
 * el gesto pasan a las siguientes, y la página sigue debajo sin un listado largo.
 * La nueva tarifa se escribe en la misma tarjeta y los cambios se guardan juntos.
 */
export function CarrilTarifas({ casas, valores, onValor, cambian }) {
  const carril = useRef(null)
  const [vista, setVista] = useState({ desde: 0, porPagina: 4 })

  // Qué tarjetas están a la vista: se recalcula al desplazar y al cambiar el ancho.
  useEffect(() => {
    const el = carril.current
    if (!el) return
    const medir = () => {
      const tarjeta = el.querySelector('li')
      if (!tarjeta) return
      const paso = tarjeta.getBoundingClientRect().width + parseFloat(getComputedStyle(el).columnGap || '0')
      const porPagina = Math.max(1, Math.round((el.clientWidth + parseFloat(getComputedStyle(el).columnGap || '0')) / paso))
      setVista({ desde: Math.min(casas.length - 1, Math.max(0, Math.round(el.scrollLeft / paso))), porPagina })
    }
    medir()
    el.addEventListener('scroll', medir, { passive: true })
    const obs = new ResizeObserver(medir)
    obs.observe(el)
    return () => {
      el.removeEventListener('scroll', medir)
      obs.disconnect()
    }
  }, [casas.length])

  // Al filtrar, el carril vuelve al principio.
  const ids = casas.map((c) => c.id).join(',')
  useEffect(() => {
    carril.current?.scrollTo({ left: 0 })
  }, [ids])

  const mover = (dir) => {
    const el = carril.current
    if (!el) return
    const tarjeta = el.querySelector('li')
    const paso = tarjeta ? tarjeta.getBoundingClientRect().width + parseFloat(getComputedStyle(el).columnGap || '0') : el.clientWidth
    el.scrollBy({ left: dir * paso * vista.porPagina, behavior: 'smooth' })
  }
  const irAPagina = (p) => {
    const el = carril.current
    const tarjeta = el?.querySelector('li')
    if (!el || !tarjeta) return
    const paso = tarjeta.getBoundingClientRect().width + parseFloat(getComputedStyle(el).columnGap || '0')
    el.scrollTo({ left: p * vista.porPagina * paso, behavior: 'smooth' })
  }

  const total = casas.length
  const hasta = Math.min(total, vista.desde + vista.porPagina)
  const paginas = Math.ceil(total / vista.porPagina)
  const pagina = Math.min(paginas - 1, Math.ceil(vista.desde / vista.porPagina))
  const alInicio = vista.desde <= 0
  const alFinal = hasta >= total

  if (!total) return <p className="mt-3 rounded-lg border border-borde p-6 text-center text-tinta-500">No hay casas con ese filtro.</p>

  return (
    <section className="mt-3" aria-roledescription="carrusel" aria-label="Tarifas por casa">
      <div className="relative">
        <ul ref={carril} className="-mx-1 flex snap-x snap-mandatory scroll-px-1 gap-3 overflow-x-auto overscroll-x-contain scroll-smooth px-1 pb-3 pt-1 [scrollbar-width:thin]">
          {casas.map((c, i) => {
            const cambia = cambian.has(c.id)
            return (
              <li
                key={c.id}
                aria-roledescription="tarjeta"
                aria-label={`${c.nombre}, ${i + 1} de ${total}`}
                className={`flex w-[85%] shrink-0 snap-start flex-col rounded-xl bg-white p-4 sm:w-[calc((100%-0.75rem)/2)] lg:w-[calc((100%-2.25rem)/4)] ${cambia ? 'ring-2 ring-alerta-700' : 'ring-1 ring-borde'}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-semibold" title={c.nombre}>
                      {c.nombre}
                    </p>
                    <p className="text-[13px] text-tinta-500">
                      {nombreRegion(c.region)} · hasta {c.capacidad}
                    </p>
                  </div>
                  {cambia ? (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-alerta-50 px-2 py-0.5 text-[12px] font-semibold text-alerta-700">
                      <PencilLine className="size-3" aria-hidden /> Cambia
                    </span>
                  ) : (
                    !c.activa && <span className="shrink-0 rounded-full bg-stone-100 px-2 py-0.5 text-[12px] font-medium text-tinta-500">Retirada</span>
                  )}
                </div>
                <dl className="mt-3 space-y-3">
                  {['a', 'b'].map((tr) => (
                    <div key={tr} className="rounded-lg bg-fondo p-2.5">
                      <dt className="flex items-baseline justify-between gap-2 text-[13px] text-tinta-500">
                        <span>{TRAMOS[tr]}</span>
                        <span className="font-semibold tabular-nums text-tinta-900">{pesos(tarifaTramo(c, tr))}</span>
                      </dt>
                      <dd className="mt-1.5">
                        <EntradaPesos value={valores[`${c.id}|${tr}`] ?? ''} onChange={(x) => onValor(`${c.id}|${tr}`, x)} etiqueta={`Nueva tarifa de ${c.nombre}, ${TRAMOS[tr].toLowerCase()}`} placeholder="Nueva tarifa" />
                      </dd>
                    </div>
                  ))}
                </dl>
              </li>
            )
          })}
        </ul>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-tinta-500" aria-live="polite">
          {hasta - vista.desde > 1 ? `Casas ${vista.desde + 1}–${hasta} de ${total}` : `Casa ${vista.desde + 1} de ${total}`}
        </p>
        {paginas > 1 && paginas <= 12 && (
          <div className="hidden items-center gap-1 sm:flex" role="group" aria-label="Páginas del carril">
            {Array.from({ length: paginas }, (_, p) => (
              <button
                key={p}
                type="button"
                onClick={() => irAPagina(p)}
                aria-label={`Ir a las casas ${p * vista.porPagina + 1} a ${Math.min(total, (p + 1) * vista.porPagina)}`}
                aria-current={p === pagina || undefined}
                className="grid size-6 place-items-center rounded-full pointer-coarse:size-9"
              >
                <span className={`block rounded-full transition-all ${p === pagina ? 'h-2 w-5 bg-verde-700' : 'size-2 bg-stone-300 hover:bg-stone-400'}`} />
              </button>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <button type="button" onClick={() => mover(-1)} disabled={alInicio} aria-label="Casas anteriores" className="grid size-10 place-items-center rounded-lg bg-white ring-1 ring-borde hover:bg-stone-50 disabled:opacity-40">
            <ChevronLeft className="size-5" aria-hidden />
          </button>
          <button type="button" onClick={() => mover(1)} disabled={alFinal} aria-label="Casas siguientes" className="grid size-10 place-items-center rounded-lg bg-white ring-1 ring-borde hover:bg-stone-50 disabled:opacity-40">
            <ChevronRight className="size-5" aria-hidden />
          </button>
        </div>
      </div>
    </section>
  )
}
