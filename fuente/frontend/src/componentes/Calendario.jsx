import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { diaSemana, diasDelMes, fechaLarga, hoyISO, mesDe, nombreMes, primerDiaMes, sumarDias, sumarMeses } from '../lib/fechas.js'
import { estadoNoche, limiteReserva } from '../lib/reglas.js'

const DIAS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

/**
 * Calendario de disponibilidad que sirve, a la vez, para elegir las fechas.
 * Primer clic: llegada. Segundo clic: salida. Muestra dos meses en
 * pantallas anchas y uno en el celular. Lo usa el trabajador en la etapa 2
 * (decisión 18-11-2026): no muestra quién ocupa cada noche. `enSorteo(d)`
 * marca las noches de temporada alta que se asignan por sorteo.
 */
export function Calendario({ noDisponibles, entrada, salida, onCambio, calidad, enSorteo = () => false }) {
  const hoy = hoyISO()
  const primerMes = primerDiaMes(sumarDias(hoy, 1))
  const ultimoMes = primerDiaMes(limiteReserva(hoy, calidad))
  const [mes, setMes] = useState(() => (entrada ? primerDiaMes(entrada) : primerMes))

  const estado = (d) => (enSorteo(d) && estadoNoche(d, noDisponibles, hoy, calidad) === 'disponible' ? 'temporada_alta' : estadoNoche(d, noDisponibles, hoy, calidad))

  // Con la llegada elegida, la salida puede ir hasta la primera noche no disponible.
  let salidaMaxima = null
  if (entrada && !salida) {
    let d = entrada
    while (estado(d) === 'disponible') d = sumarDias(d, 1)
    salidaMaxima = d
  }

  function elegir(d) {
    if (entrada && !salida && d > entrada && d <= salidaMaxima) return onCambio({ entrada, salida: d })
    if (estado(d) === 'disponible') onCambio({ entrada: d, salida: null })
  }

  const meses = [mes, sumarMeses(mes, 1)]
  const mesesConSorteo = meses.some((m) => Array.from({ length: diasDelMes(m) }, (_, i) => sumarDias(m, i)).some(enSorteo))

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setMes(sumarMeses(mes, -1))}
          disabled={mes <= primerMes}
          className="grid size-10 place-items-center rounded-full text-tinta-700 hover:bg-stone-100 disabled:opacity-30"
          aria-label="Mes anterior"
        >
          <ChevronLeft className="size-5" aria-hidden />
        </button>
        <p className="text-sm text-tinta-500" aria-live="polite">
          {!entrada ? 'Elija el día de llegada' : !salida ? 'Ahora elija el día de salida' : 'Fechas elegidas'}
        </p>
        <button
          type="button"
          onClick={() => setMes(sumarMeses(mes, 1))}
          disabled={mes >= ultimoMes}
          className="grid size-10 place-items-center rounded-full text-tinta-700 hover:bg-stone-100 disabled:opacity-30"
          aria-label="Mes siguiente"
        >
          <ChevronRight className="size-5" aria-hidden />
        </button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 sm:gap-4">
        {meses.map((m, i) => (
          <Mes key={m} mes={m} oculto={i === 1} estado={estado} entrada={entrada} salida={salida} salidaMaxima={salidaMaxima} elegir={elegir} />
        ))}
      </div>

      <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-tinta-500">
        <li className="flex items-center gap-2">
          <span className="size-4 rounded border border-borde bg-white" aria-hidden /> Disponible
        </li>
        <li className="flex items-center gap-2">
          <span className="size-4 rounded bg-stone-200" aria-hidden /> No disponible
        </li>
        {mesesConSorteo && (
          <li className="flex items-center gap-2">
            <span className="size-4 rounded bg-alerta-50 ring-1 ring-alerta-700/30" aria-hidden /> Temporada alta (por sorteo)
          </li>
        )}
      </ul>
    </div>
  )
}

function Mes({ mes, oculto, estado, entrada, salida, salidaMaxima, elegir }) {
  const total = diasDelMes(mes)
  const vacios = diaSemana(mes)
  const dias = Array.from({ length: total }, (_, i) => sumarDias(mes, i))

  return (
    <div className={oculto ? 'hidden sm:block' : ''}>
      <p className="mb-2 text-center text-[15px] font-semibold capitalize text-tinta-900">{nombreMes(mes)}</p>
      <div className="grid grid-cols-7 text-center text-xs font-medium text-tinta-400">
        {DIAS.map((d, i) => (
          <span key={i} className="pb-1">
            {d}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {Array.from({ length: vacios }, (_, i) => (
          <span key={'v' + i} />
        ))}
        {dias.map((d) => {
          const e = estado(d)
          const esExtremo = d === entrada || d === salida
          const enRango = entrada && salida && d > entrada && d < salida
          const salidaPosible = entrada && !salida && d > entrada && d <= salidaMaxima
          const clicable = e === 'disponible' || salidaPosible
          let clase = 'text-tinta-900 hover:bg-verde-50'
          if (esExtremo) clase = 'bg-verde-700 text-white font-semibold'
          else if (enRango) clase = 'bg-verde-100 text-verde-800'
          else if (salidaPosible) clase = 'text-tinta-900 ring-1 ring-inset ring-verde-200 hover:bg-verde-50'
          else if (e === 'ocupado') clase = 'bg-stone-200 text-tinta-400 line-through'
          else if (e === 'temporada_alta') clase = 'bg-alerta-50 text-alerta-700'
          else if (e !== 'disponible') clase = 'text-stone-300'
          return (
            <button
              key={d}
              type="button"
              disabled={!clicable}
              onClick={() => elegir(d)}
              aria-pressed={esExtremo}
              aria-label={`${fechaLarga(d)}${e === 'ocupado' ? ', no disponible' : e === 'temporada_alta' ? ', temporada alta' : ''}`}
              className={`mx-auto grid h-10 w-full max-w-11 place-items-center rounded-lg text-sm tabular-nums transition-colors disabled:cursor-default ${clase} ${mesDe(d) !== mesDe(mes) ? 'invisible' : ''}`}
            >
              {Number(d.slice(8, 10))}
            </button>
          )
        })}
      </div>
    </div>
  )
}
