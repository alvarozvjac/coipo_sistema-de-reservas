import { useState } from 'react'
import { CalendarClock, CheckCircle2, Rocket } from 'lucide-react'
import { ETAPAS, anularCambioEtapa, cambiarEtapa, etapaProgramada, etapaVigente, historialEtapa, validarEtapa } from '../../../datos/etapa.js'
import { useDatos } from '../../../datos/servicio.js'
import { useSesion } from '../../../componentes/Perfil.jsx'
import { fechaCorta, hoyISO } from '../../../lib/fechas.js'
import { Aviso, Boton, Campo, Tarjeta, claseEntrada } from '../../../componentes/ui.jsx'
import { Dialogo } from '../../encargada/comun.jsx'

/**
 * Etapa del sistema (decisión 18-11-2026): marcha blanca con encargados o
 * abierto a trabajadores. El encargado nacional la cambia con fecha de
 * vigencia y respaldo; un cambio programado se puede anular antes de que rija.
 */
export function Etapa() {
  useDatos()
  const { usuario } = useSesion()
  const [cambiar, setCambiar] = useState(false)
  const [hecho, setHecho] = useState(null)
  const actual = etapaVigente()
  const programado = etapaProgramada()
  const historial = historialEtapa()

  return (
    <div className="space-y-8">
      <section aria-labelledby="t-etapa">
        <h2 id="t-etapa" className="text-lg font-semibold">
          Etapa del sistema
        </h2>
        <p className="mt-1 max-w-3xl text-[15px] text-tinta-500">
          Bienestar parte con una marcha blanca en que solo los encargados registran reservas. Cuando se acostumbren al aplicativo, se abre la etapa 2 para los trabajadores de CONAF.
        </p>
        {hecho && (
          <div className="mt-3">
            <Aviso tipo="info">{hecho}</Aviso>
          </div>
        )}
        <ol className="mt-4 grid gap-3 md:grid-cols-2">
          {Object.entries(ETAPAS).map(([k, e]) => {
            const rige = k === actual
            return (
              <li key={k}>
                <Tarjeta className={`h-full p-5 ${rige ? 'ring-2 ring-verde-700' : ''}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[13px] font-semibold uppercase tracking-wide text-tinta-500">{e.corto}</p>
                      <p className="mt-0.5 text-[17px] font-semibold">{e.nombre}</p>
                    </div>
                    {rige ? (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-verde-50 px-2.5 py-1 text-[13px] font-semibold text-verde-800">
                        <CheckCircle2 className="size-4" aria-hidden /> Rige hoy
                      </span>
                    ) : (
                      programado?.etapa === k && (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-alerta-50 px-2.5 py-1 text-[13px] font-semibold text-alerta-700">
                          <CalendarClock className="size-4" aria-hidden /> Desde el {fechaCorta(programado.vigente_desde, true)}
                        </span>
                      )
                    )}
                  </div>
                  <p className="mt-2 text-[15px] text-tinta-700">{e.detalle}</p>
                </Tarjeta>
              </li>
            )
          })}
        </ol>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Boton onClick={() => setCambiar(true)} disabled={Boolean(programado)}>
            <Rocket className="size-4" aria-hidden /> Cambiar de etapa
          </Boton>
          {programado && (
            <>
              <span className="text-sm text-tinta-500">
                Hay un cambio programado a «{ETAPAS[programado.etapa].nombre}» desde el {fechaCorta(programado.vigente_desde, true)}.
              </span>
              <Boton
                variante="secundario"
                onClick={() => {
                  anularCambioEtapa(programado.id, usuario)
                  setHecho('Se anuló el cambio de etapa programado.')
                }}
              >
                Anular el cambio programado
              </Boton>
            </>
          )}
        </div>
      </section>

      <section aria-labelledby="t-etapa-hist">
        <h2 id="t-etapa-hist" className="text-lg font-semibold">
          Historial
        </h2>
        {historial.length === 0 ? (
          <p className="mt-2 text-[15px] text-tinta-500">Rige la marcha blanca desde el inicio; no hay cambios de etapa.</p>
        ) : (
          <ul className="mt-2 divide-y divide-borde rounded-xl border border-borde bg-white">
            {historial.map((c) => (
              <li key={c.id} className="px-4 py-3 text-[15px]">
                <p>
                  <strong className="font-semibold">{ETAPAS[c.etapa].nombre}</strong> desde el {fechaCorta(c.vigente_desde, true)}
                  {c.anulado && <span className="ml-2 rounded-full bg-stone-100 px-2 py-0.5 text-[12px] text-tinta-500">Anulado</span>}
                </p>
                <p className="text-[13px] text-tinta-500">
                  {c.por}, {fechaCorta(c.en.slice(0, 10), true)} · {c.respaldo}
                  {c.anulado ? ` · anulado por ${c.anulado_por}` : ''}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {cambiar && (
        <DialogoEtapa
          actual={actual}
          onCerrar={() => setCambiar(false)}
          onListo={(d) => {
            cambiarEtapa(d, usuario)
            setCambiar(false)
            setHecho(d.vigente_desde === hoyISO() ? `Desde hoy rige «${ETAPAS[d.etapa].nombre}».` : `«${ETAPAS[d.etapa].nombre}» regirá desde el ${fechaCorta(d.vigente_desde, true)}.`)
          }}
        />
      )}
    </div>
  )
}

function DialogoEtapa({ actual, onCerrar, onListo }) {
  const otra = actual === 'abierta' ? 'marcha_blanca' : 'abierta'
  const [d, setD] = useState({ etapa: otra, vigente_desde: hoyISO(), respaldo: '' })
  const [intento, setIntento] = useState(false)
  const e = validarEtapa(d)
  const ok = Object.keys(e).length === 0
  return (
    <Dialogo titulo="Cambiar de etapa" onCerrar={onCerrar}>
      <div className="mt-3 space-y-3">
        <Campo etiqueta="Nueva etapa" error={intento ? e.etapa : null}>
          <select className={claseEntrada} value={d.etapa} onChange={(x) => setD({ ...d, etapa: x.target.value })}>
            {Object.entries(ETAPAS)
              .filter(([k]) => k !== actual)
              .map(([k, v]) => (
                <option key={k} value={k}>
                  {v.corto} · {v.nombre}
                </option>
              ))}
          </select>
        </Campo>
        <Campo etiqueta="Rige desde" error={intento ? e.vigente_desde : null}>
          <input type="date" className={claseEntrada} min={hoyISO()} value={d.vigente_desde} onChange={(x) => setD({ ...d, vigente_desde: x.target.value })} />
        </Campo>
        <Campo etiqueta="Respaldo" error={intento ? e.respaldo : null}>
          <input className={claseEntrada} value={d.respaldo} onChange={(x) => setD({ ...d, respaldo: x.target.value })} placeholder="Resolución, memo o acuerdo" />
        </Campo>
        <Aviso tipo="info">
          {d.etapa === 'abierta'
            ? 'Desde esa fecha los trabajadores de CONAF podrán ingresar y reservar, y las temporadas altas que estén definidas se asignarán por postulación y sorteo. Las reservas ya registradas no cambian.'
            : 'Desde esa fecha los trabajadores ya no podrán ingresar; sus reservas vigentes se mantienen y las gestionan los encargados.'}
        </Aviso>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <Boton variante="secundario" onClick={onCerrar}>
          Volver
        </Boton>
        <Boton
          onClick={() => {
            setIntento(true)
            if (ok) onListo(d)
          }}
        >
          Guardar cambio
        </Boton>
      </div>
    </Dialogo>
  )
}
