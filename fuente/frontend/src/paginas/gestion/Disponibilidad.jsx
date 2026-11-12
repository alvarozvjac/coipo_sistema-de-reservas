import { useState } from 'react'
import { CalendarSearch, CheckCircle2, XCircle } from 'lucide-react'
import { REGIONES } from '../../datos/casas.js'
import { disponibilidad, listarCasas, nochesLiberadas, ocupacionesDe, useDatos } from '../../datos/servicio.js'
import { useSesion } from '../../componentes/Perfil.jsx'
import { Calendario } from '../../componentes/Calendario.jsx'
import { fechaCorta, hoyISO, sumarDias } from '../../lib/fechas.js'
import { plural } from '../../lib/formato.js'
import { nochesNoDisponibles } from '../../lib/reglas.js'
import { Aviso, Boton, Campo, Tarjeta, claseEntrada } from '../../componentes/ui.jsx'

const nombreRegion = (c) => REGIONES.find((r) => r.codigo === c)?.nombre ?? ''

const MOTIVO = {
  ocupada: 'Ocupada o bloqueada en esas fechas',
  temporada_alta: 'Temporada alta: se asigna por sorteo',
  capacidad: 'No alcanza la capacidad',
}

/**
 * Consulta de disponibilidad de todas las casas del país (decisión
 * 12-11-2026), para la encargada regional y el encargado nacional. La
 * encargada puede consultar cualquier región, pero solo registra reservas en
 * las casas de la suya. No aplica las reglas de la persona (anticipación, una
 * reserva por mes): esas se revisan al registrar.
 */
export function Disponibilidad() {
  useDatos()
  const { usuario } = useSesion()
  const regional = usuario.perfil === 'encargada'
  const manana = sumarDias(hoyISO(), 1)
  const [q, setQ] = useState({ entrada: sumarDias(manana, 7), salida: sumarDias(manana, 10), personas: 2, region: '' })
  const [abierta, setAbierta] = useState(null)
  const valida = q.entrada && q.salida && q.salida > q.entrada && q.entrada >= manana
  // Primero las libres; dentro de cada grupo, en el orden de las regiones (norte a sur).
  const filas = valida ? [...disponibilidad(q)].sort((x, y) => Number(y.disponible) - Number(x.disponible)) : []
  const libres = filas.filter((f) => f.disponible)
  const regiones = REGIONES.filter((r) => listarCasas().some((c) => c.region === r.codigo))
  const fijar = (k, v) => setQ((x) => ({ ...x, [k]: v }))

  return (
    <div>
      <h1 className="text-2xl font-bold">Disponibilidad de las casas</h1>
      <p className="mt-1 max-w-3xl text-[15px] text-tinta-500">
        Consulte qué casas del país están libres en unas fechas.{' '}
        {regional ? 'Puede registrar reservas en las casas de su región; para otra región, derive la solicitud a su encargada o al encargado nacional.' : 'Puede registrar en cualquier casa; quedará por aprobar por la encargada de la región de la casa.'}
      </p>

      <Tarjeta className="mt-5 p-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Campo etiqueta="Llegada">
            <input type="date" className={claseEntrada} min={manana} value={q.entrada} onChange={(e) => fijar('entrada', e.target.value)} />
          </Campo>
          <Campo etiqueta="Salida">
            <input type="date" className={claseEntrada} min={q.entrada || manana} value={q.salida} onChange={(e) => fijar('salida', e.target.value)} />
          </Campo>
          <Campo etiqueta="Personas">
            <input type="number" className={claseEntrada} min={1} max={12} value={q.personas} onChange={(e) => fijar('personas', Math.max(1, Number(e.target.value) || 1))} />
          </Campo>
          <Campo etiqueta="Región">
            <select className={claseEntrada} value={q.region} onChange={(e) => fijar('region', e.target.value)}>
              <option value="">Todo el país</option>
              {regiones.map((r) => (
                <option key={r.codigo} value={r.codigo}>
                  {r.nombre}
                </option>
              ))}
            </select>
          </Campo>
        </div>
      </Tarjeta>

      {!valida ? (
        <div className="mt-5">
          <Aviso>Elija una llegada desde mañana y una salida posterior a la llegada.</Aviso>
        </div>
      ) : (
        <>
          <p className="mt-5 text-[15px] text-tinta-700" role="status">
            <CalendarSearch className="mr-1.5 inline size-4 align-[-2px] text-verde-700" aria-hidden />
            {plural(libres.length, 'casa libre', 'casas libres')} de {filas.length} del {fechaCorta(q.entrada)} al {fechaCorta(q.salida, true)} para {plural(q.personas, 'persona', 'personas')}
            {q.region ? `, en la Región de ${nombreRegion(q.region)}` : ', en todo el país'}.
          </p>
          <ul className="mt-3 space-y-2">
            {filas.map(({ casa, disponible, motivo }) => {
              const propia = !regional || casa.region === usuario.region
              const ver = abierta === casa.id
              return (
                <li key={casa.id}>
                  <Tarjeta className="p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-tinta-900">{casa.nombre}</p>
                        <p className="text-sm text-tinta-500">
                          {nombreRegion(casa.region)} · hasta {casa.capacidad} personas
                        </p>
                        <p className={`mt-1 flex items-center gap-1.5 text-sm font-medium ${disponible ? 'text-verde-700' : 'text-tinta-500'}`}>
                          {disponible ? <CheckCircle2 className="size-4" aria-hidden /> : <XCircle className="size-4" aria-hidden />}
                          {disponible ? 'Disponible' : MOTIVO[motivo]}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Boton variante="secundario" onClick={() => setAbierta(ver ? null : casa.id)} aria-expanded={ver}>
                          {ver ? 'Ocultar calendario' : 'Ver calendario'}
                        </Boton>
                        {disponible && propia && (
                          <Boton a={`/gestion/reservar?casa=${casa.id}&entrada=${q.entrada}&salida=${q.salida}`}>Registrar reserva</Boton>
                        )}
                      </div>
                    </div>
                    {disponible && !propia && <p className="mt-2 text-[13px] text-tinta-500">Solo consulta: esta casa es de otra región. Derive la solicitud a su encargada o al encargado nacional.</p>}
                    {ver && (
                      <div className="mt-4 border-t border-borde pt-4">
                        <Calendario
                          noDisponibles={nochesNoDisponibles(ocupacionesDe(casa.id))}
                          liberadas={nochesLiberadas(casa.id)}
                          calidad="afiliado"
                          entrada={q.entrada}
                          salida={q.salida}
                          onCambio={({ entrada, salida }) => setQ((x) => ({ ...x, entrada, salida: salida ?? '' }))}
                        />
                        <p className="mt-2 text-[13px] text-tinta-500">Elija otras fechas en el calendario para volver a consultar todas las casas.</p>
                      </div>
                    )}
                  </Tarjeta>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </div>
  )
}
