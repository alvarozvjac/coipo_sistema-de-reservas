import { useState } from 'react'
import { CalendarClock } from 'lucide-react'
import { EDITABLES, anularCambioParametro, cambiarParametro, historialParametros, validarParametro, valorVigente } from '../../../datos/configuracion.js'
import { useDatos } from '../../../datos/servicio.js'
import { useSesion } from '../../../componentes/Perfil.jsx'
import { fechaCorta, hoyISO, sumarDias } from '../../../lib/fechas.js'
import { Aviso, Boton, Campo, Tarjeta, claseEntrada } from '../../../componentes/ui.jsx'
import { Dialogo } from '../../encargada/comun.jsx'

const SINGULAR = { días: 'día', 'días hábiles': 'día hábil', cuotas: 'cuota', horas: 'hora', noches: 'noche' }

/**
 * Parámetros del reglamento (decisión 12-11-2026): el encargado nacional los
 * cambia indicando desde cuándo rigen y qué los respalda. Las reservas ya
 * hechas no cambian; un cambio programado se puede anular antes de que rija.
 */
export function Parametros() {
  useDatos()
  const { usuario } = useSesion()
  const hoy = hoyISO()
  const [editar, setEditar] = useState(null)
  const [hecho, setHecho] = useState(null)
  const historial = historialParametros()
  const programado = (clave) => historial.find((p) => p.clave === clave && !p.anulado && p.vigente_desde > hoy)
  const def = (clave) => EDITABLES.find((d) => d.clave === clave)
  const mostrar = (d, v) => (d.tipo === 'hora' ? v : `${v} ${Number(v) === 1 ? (SINGULAR[d.unidad] ?? d.unidad) : d.unidad}`)

  return (
    <div className="space-y-8">
      <section aria-labelledby="t-param">
        <h2 id="t-param" className="text-lg font-semibold">
          Parámetros vigentes
        </h2>
        <p className="mt-1 max-w-3xl text-[15px] text-tinta-500">
          Cada cambio pide desde cuándo rige y la resolución, memo o acuerdo que lo respalda. Las reservas ya registradas conservan lo que se les aplicó. Desde la fecha de vigencia, las reglas usan el valor nuevo para todo registro.
        </p>
        {hecho && (
          <div className="mt-3">
            <Aviso tipo="info">{hecho}</Aviso>
          </div>
        )}
        <Tarjeta className="relative mt-3 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-[15px]">
            <thead className="border-b border-borde text-[13px] text-tinta-500">
              <tr>
                <th className="px-4 py-3 font-medium">Parámetro</th>
                <th className="px-4 py-3 font-medium">Vigente hoy</th>
                <th className="px-4 py-3 font-medium">Programado</th>
                <th className="px-4 py-3 font-medium">
                  <span className="sr-only">Acción</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borde">
              {EDITABLES.map((d) => {
                const prog = programado(d.clave)
                return (
                  <tr key={d.clave}>
                    <td className="px-4 py-3">
                      {d.etiqueta}
                      <span className="block text-[13px] text-tinta-500">{d.fuente}</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-semibold tabular-nums">{mostrar(d, valorVigente(d.clave))}</td>
                    <td className="px-4 py-3 text-[14px]">
                      {prog ? (
                        <span className="inline-flex items-center gap-1.5 text-alerta-700">
                          <CalendarClock className="size-4" aria-hidden /> {mostrar(d, prog.valor)} desde el {fechaCorta(prog.vigente_desde, true)}
                        </span>
                      ) : (
                        <span className="text-tinta-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Boton variante="secundario" onClick={() => setEditar(d)} aria-label={`Cambiar ${d.etiqueta}`}>
                        Cambiar
                      </Boton>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Tarjeta>
      </section>

      <section aria-labelledby="t-hist-param">
        <h2 id="t-hist-param" className="text-lg font-semibold">
          Historial de cambios
        </h2>
        {historial.length === 0 ? (
          <p className="mt-2 text-[15px] text-tinta-500">Aún no hay cambios: rigen los valores del reglamento y las decisiones de Bienestar.</p>
        ) : (
          <Tarjeta className="mt-3">
            <ul className="divide-y divide-borde">
              {historial.map((p) => {
                const d = def(p.clave)
                return (
                  <li key={p.id} className="flex flex-wrap items-start justify-between gap-3 px-4 py-3 text-[15px]">
                    <div className="min-w-0">
                      <p className={p.anulado ? 'text-tinta-500 line-through' : 'font-medium'}>
                        {d.etiqueta}: {mostrar(d, p.anterior)} → {mostrar(d, p.valor)}
                      </p>
                      <p className="text-[13px] text-tinta-500">
                        Rige desde el {fechaCorta(p.vigente_desde, true)} · {p.respaldo} · {p.por}, {fechaCorta(p.en.slice(0, 10), true)}
                        {p.anulado && ` · anulado por ${p.anulado_por}`}
                      </p>
                    </div>
                    {!p.anulado && p.vigente_desde > hoy && (
                      <Boton
                        variante="secundario"
                        onClick={() => {
                          anularCambioParametro(p.id, usuario)
                          setHecho(`Se anuló el cambio programado de «${d.etiqueta}».`)
                        }}
                      >
                        Anular
                      </Boton>
                    )}
                  </li>
                )
              })}
            </ul>
          </Tarjeta>
        )}
      </section>

      {editar && (
        <DialogoParametro
          def={editar}
          onCerrar={() => setEditar(null)}
          onListo={(m) => {
            setEditar(null)
            setHecho(m)
          }}
          actor={usuario}
        />
      )}
    </div>
  )
}

function DialogoParametro({ def, actor, onCerrar, onListo }) {
  const hoy = hoyISO()
  const [valor, setValor] = useState(String(valorVigente(def.clave)))
  const [desde, setDesde] = useState(sumarDias(hoy, 1))
  const [respaldo, setRespaldo] = useState('')
  const [intento, setIntento] = useState(false)
  const err = validarParametro(def, valor, desde, respaldo)
  const igual = String(valorVigente(def.clave, desde)) === String(valor)
  return (
    <Dialogo titulo={def.etiqueta} onCerrar={onCerrar}>
      <p className="mt-1 text-[15px] text-tinta-700">
        Hoy rige: <strong>{def.tipo === 'hora' ? valorVigente(def.clave) : `${valorVigente(def.clave)} ${def.unidad}`}</strong>. Fuente: {def.fuente}.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Campo etiqueta={def.tipo === 'hora' ? 'Nuevo valor (HH:MM)' : `Nuevo valor (${def.unidad})`} error={intento && err.valor}>
          <input className={claseEntrada} type={def.tipo === 'hora' ? 'time' : 'number'} min={def.min} max={def.max} value={valor} onChange={(e) => setValor(e.target.value)} />
        </Campo>
        <Campo etiqueta="Rige desde" error={intento && err.vigente_desde}>
          <input className={claseEntrada} type="date" min={hoy} value={desde} onChange={(e) => setDesde(e.target.value)} />
        </Campo>
      </div>
      <Campo etiqueta="Respaldo" ayuda="Por ejemplo: Resolución Exenta N° 123/2026 o Memorándum N° 6188/2026." error={intento && err.respaldo} className="mt-3">
        <input className={claseEntrada} value={respaldo} onChange={(e) => setRespaldo(e.target.value)} />
      </Campo>
      {intento && igual && !Object.keys(err).length && (
        <div className="mt-3">
          <Aviso tipo="error">Ese es el valor que ya rige en esa fecha.</Aviso>
        </div>
      )}
      <div className="mt-6 flex justify-end gap-3">
        <Boton variante="secundario" onClick={onCerrar}>
          Cancelar
        </Boton>
        <Boton
          onClick={() => {
            setIntento(true)
            if (Object.keys(err).length || igual) return
            cambiarParametro({ clave: def.clave, valor, vigente_desde: desde, respaldo }, actor)
            onListo(desde === hoy ? `«${def.etiqueta}» cambió desde hoy.` : `Se programó el cambio de «${def.etiqueta}» desde el ${fechaCorta(desde, true)}.`)
          }}
        >
          Guardar cambio
        </Boton>
      </div>
    </Dialogo>
  )
}
