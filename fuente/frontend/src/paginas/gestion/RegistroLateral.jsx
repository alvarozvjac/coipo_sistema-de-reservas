import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { REGIONES } from '../../datos/casas.js'
import { listarCasas, obtenerCasa } from '../../datos/servicio.js'
import { hoyISO, rangoFechas, sumarDias } from '../../lib/fechas.js'
import { plural } from '../../lib/formato.js'
import { noches } from '../../lib/reglas.js'
import { Campo, Tarjeta, claseEntrada } from '../../componentes/ui.jsx'
import { Persona } from './Persona.jsx'
import { AntecedentesPersona } from './AntecedentesPersona.jsx'
import { Reservar } from './Reservar.jsx'

const nombreRegion = (c) => REGIONES.find((r) => r.codigo === c)?.nombre ?? ''

/**
 * Registro de una reserva en un panel lateral de Reservas (decisión
 * 12-11-2026): el tablero queda a la vista y todo va en una sola columna:
 * casa y fechas (vienen del tramo elegido), persona por RUT con sus
 * antecedentes, quiénes van, contacto, pago, vía y declaración. En el teléfono
 * ocupa la pantalla completa. La encargada solo elige casas de su región.
 */
export function RegistroLateral({ gestor, inicial, onCerrar, onListo }) {
  const regional = gestor.perfil === 'encargada'
  const casas = listarCasas().filter((c) => !regional || c.region === gestor.region)
  const manana = sumarDias(hoyISO(), 1)
  const [casaId, setCasaId] = useState(() => (casas.some((c) => c.id === inicial.casaId) ? inicial.casaId : ''))
  const [entrada, setEntrada] = useState(inicial.entrada ?? '')
  const [salida, setSalida] = useState(inicial.salida ?? '')
  const [persona, setPersona] = useState(null)
  const titulo = useRef(null)
  const casa = casaId ? obtenerCasa(Number(casaId)) : null
  const fechasValidas = entrada && salida && salida > entrada && entrada >= manana

  useEffect(() => {
    titulo.current?.focus()
    const previo = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previo
    }
  }, [])
  useEffect(() => {
    const tecla = (e) => e.key === 'Escape' && !document.querySelector('[role=dialog] [role=dialog]') && onCerrar()
    window.addEventListener('keydown', tecla)
    return () => window.removeEventListener('keydown', tecla)
  }, [onCerrar])

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={onCerrar}>
      <div role="dialog" aria-modal="true" aria-labelledby="t-registro" className="flex h-full w-full max-w-2xl flex-col bg-fondo shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3 border-b border-borde bg-white px-5 py-4">
          <div className="min-w-0">
            <h2 id="t-registro" ref={titulo} tabIndex={-1} className="text-lg font-bold outline-none">
              Registrar reserva
            </h2>
            <p className="text-[15px] text-tinta-500">
              {casa ? casa.nombre : 'Elija la casa y las fechas'}
              {casa && fechasValidas ? ` · ${rangoFechas(entrada, salida)} · ${plural(noches(entrada, salida), 'noche', 'noches')}` : ''}
              {persona ? ` · a nombre de ${persona.nombre}` : ''}
            </p>
          </div>
          <button type="button" onClick={onCerrar} aria-label="Cerrar el registro" className="grid size-11 shrink-0 place-items-center rounded-lg text-tinta-500 ring-1 ring-borde hover:bg-stone-50">
            <X className="size-5" aria-hidden />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto overscroll-contain px-5 py-5">
          <Tarjeta className="p-5">
            <h3 className="font-semibold">1. Casa y fechas</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Campo etiqueta="Casa" className="sm:col-span-2">
                <select className={claseEntrada} value={casaId} onChange={(e) => setCasaId(Number(e.target.value) || '')}>
                  <option value="">Elija una casa</option>
                  {casas.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                      {regional ? '' : ` · ${nombreRegion(c.region)}`} · hasta {c.capacidad}
                    </option>
                  ))}
                </select>
              </Campo>
              <Campo etiqueta="Llegada">
                <input type="date" className={claseEntrada} min={manana} value={entrada} onChange={(e) => setEntrada(e.target.value)} />
              </Campo>
              <Campo etiqueta="Salida">
                <input type="date" className={claseEntrada} min={entrada || manana} value={salida} onChange={(e) => setSalida(e.target.value)} />
              </Campo>
            </div>
            <p className="mt-2 text-[13px] text-tinta-500">
              {regional ? `Solo casas de la Región de ${nombreRegion(gestor.region)}.` : 'Cualquier casa del país.'} La disponibilidad y las reglas de la persona se revisan abajo.
            </p>
            {entrada && salida && !fechasValidas && <p className="mt-2 text-sm text-error-700">La llegada debe ser desde mañana y la salida, posterior a la llegada.</p>}
          </Tarjeta>

          {casa && fechasValidas && (
            <Persona persona={persona} onPersona={setPersona} titulo="2. ¿A nombre de quién?" />
          )}
          {casa && fechasValidas && persona && <AntecedentesPersona persona={persona} />}
          {casa && fechasValidas && persona && (
            <Reservar
              key={`${persona.rut}|${casa.id}|${entrada}|${salida}`}
              titular={persona}
              gestor={gestor}
              casaId={casa.id}
              panel={{ entrada, salida, onListo, onCancelar: onCerrar }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
