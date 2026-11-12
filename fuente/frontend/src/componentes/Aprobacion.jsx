import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, Inbox } from 'lucide-react'
import { REGIONES } from '../datos/casas.js'
import { aprobarReserva, puedeAprobar, rechazarReserva, reservasPorAprobar, useDatos } from '../datos/servicio.js'
import { porConfirmar } from '../lib/reglas.js'
import { fechaCorta } from '../lib/fechas.js'
import { pesos, plural } from '../lib/formato.js'
import { Dialogo } from '../paginas/encargada/comun.jsx'
import { Aviso, Boton, Campo, Tarjeta, claseEntrada } from './ui.jsx'

const nombreRegion = (c) => REGIONES.find((r) => r.codigo === c)?.nombre ?? ''

/**
 * Aprobar o no aprobar una reserva que registró el encargado nacional
 * (decisión 12-11-2026). Al aprobar con planilla se envía la ficha de la
 * reserva; con transferencia, los datos para transferir (la ficha sale con el
 * pago). Al no aprobar se liberan las fechas y se avisa a la persona.
 */
export function BotonesAprobacion({ reserva: r, gestor, onListo }) {
  const [rechazar, setRechazar] = useState(false)
  const [motivo, setMotivo] = useState('')
  const [intento, setIntento] = useState(false)
  const conTransferencia = r.forma_pago?.tipo === 'transferencia'
  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Boton
          onClick={() => {
            aprobarReserva(r.codigo, gestor)
            onListo?.('aprobada')
          }}
        >
          <CheckCircle2 className="size-4" aria-hidden /> Aprobar
        </Boton>
        <Boton variante="secundario" onClick={() => setRechazar(true)}>
          No aprobar
        </Boton>
      </div>
      <p className="mt-2 text-[13px] text-tinta-500">
        Al aprobar {conTransferencia ? `se envían a ${r.contacto?.correo} los datos para transferir; la ficha de la reserva sale cuando se registre el pago.` : `se envía a ${r.contacto?.correo} la ficha de la reserva.`}
      </p>
      {rechazar && (
        <Dialogo titulo="¿No aprobar la reserva?" onCerrar={() => setRechazar(false)}>
          <p className="mt-2 text-[15px] text-tinta-700">
            {r.titular.nombre} · {r.casa.nombre}, {fechaCorta(r.entrada)} al {fechaCorta(r.salida, true)}. Las fechas se liberan y se avisa a la persona por correo con el motivo.
          </p>
          <Campo etiqueta="Motivo" error={intento && !motivo.trim() ? 'Escriba el motivo: se le envía a la persona.' : null} className="mt-3">
            <textarea className={`${claseEntrada} min-h-20 py-2`} value={motivo} onChange={(e) => setMotivo(e.target.value)} />
          </Campo>
          <div className="mt-6 flex justify-end gap-3">
            <Boton variante="secundario" onClick={() => setRechazar(false)}>
              Volver
            </Boton>
            <Boton
              variante="peligro"
              onClick={() => {
                setIntento(true)
                if (!motivo.trim()) return
                rechazarReserva(r.codigo, motivo.trim(), gestor)
                setRechazar(false)
                onListo?.('rechazada')
              }}
            >
              No aprobar
            </Boton>
          </div>
        </Dialogo>
      )}
    </>
  )
}

/**
 * Reservas por aprobar que le tocan a este encargado: a la encargada, las de
 * su región; al nacional, las de regiones sin encargada en el IAM. El nacional
 * ve además, solo para seguimiento, las que registró y esperan a una encargada.
 */
export function PanelPorAprobar({ gestor }) {
  useDatos()
  const [hecho, setHecho] = useState(null)
  const todas = reservasPorAprobar(gestor.perfil === 'encargada' ? gestor.region : '')
  const mias = todas.filter((r) => puedeAprobar(gestor, r))
  const esperan = gestor.perfil === 'central' ? todas.filter((r) => !puedeAprobar(gestor, r)) : []
  if (!mias.length && !esperan.length && !hecho) return null
  return (
    <section className="mt-6" aria-labelledby="por-aprobar">
      <h2 id="por-aprobar" className="text-lg font-semibold">
        Reservas por aprobar
      </h2>
      {hecho && (
        <div className="mt-2">
          <Aviso tipo="info">{hecho}</Aviso>
        </div>
      )}
      {mias.length > 0 && (
        <ul className="mt-3 space-y-3">
          {mias.map((r) => (
            <li key={r.codigo}>
              <Tarjeta className="p-4">
                <FilaReserva r={r} />
                <div className="mt-3">
                  <BotonesAprobacion
                    reserva={r}
                    gestor={gestor}
                    onListo={(res) => setHecho(`${r.codigo} ${res === 'aprobada' ? (porConfirmar({ ...r, estado: 'confirmada' }) ? 'aprobada: se enviaron los datos para transferir.' : 'aprobada: se envió la ficha de la reserva.') : 'no aprobada: se liberaron las fechas y se avisó a la persona.'}`)}
                  />
                </div>
              </Tarjeta>
            </li>
          ))}
        </ul>
      )}
      {esperan.length > 0 && (
        <div className="mt-4">
          <p className="flex items-center gap-2 text-[15px] text-tinta-700">
            <Inbox className="size-4 text-tinta-500" aria-hidden /> {plural(esperan.length, 'registrada por usted espera', 'registradas por usted esperan')} la aprobación de la encargada de la región:
          </p>
          <ul className="mt-2 divide-y divide-borde rounded-xl border border-borde bg-white">
            {esperan.map((r) => (
              <li key={r.codigo} className="px-4 py-3">
                <FilaReserva r={r} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}

function FilaReserva({ r }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
      <p className="text-[15px]">
        <Link to={`/gestion/reserva/${r.codigo}`} className="font-semibold text-verde-700 hover:underline">
          {r.codigo}
        </Link>{' '}
        · {r.titular.nombre} · {r.casa.nombre} ({nombreRegion(r.casa.region)})
      </p>
      <p className="text-sm text-tinta-500">
        {fechaCorta(r.entrada)} al {fechaCorta(r.salida, true)} · {plural(r.ocupantes.length, 'persona', 'personas')} · {pesos(r.total)} · registrada por {r.registrada_por?.nombre}
      </p>
    </div>
  )
}
