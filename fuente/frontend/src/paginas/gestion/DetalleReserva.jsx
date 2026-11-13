import { FileDown } from 'lucide-react'
import { PLANTILLAS_BASE, correoDe } from '../../datos/configuracion.js'
import { fechaCorta, rangoFechas } from '../../lib/fechas.js'
import { pesos } from '../../lib/formato.js'
import { CALIDADES, PARENTESCOS, VIAS } from '../../lib/reglas.js'
import { Boton, Estado } from '../../componentes/ui.jsx'
import { Dialogo, antiguedad } from '../encargada/comun.jsx'

const PAGO = { planilla: 'Planilla', transferencia: 'Transferencia' }
const NOTIF = {
  confirmacion: 'el comprobante de reserva',
  por_confirmar: 'los datos para transferir',
  pago: 'el registro del pago',
  anulacion: 'aviso de anulación por Bienestar',
  devolucion: 'aviso de devolución',
  desistimiento: 'aviso de desistimiento',
}

async function descargar(reserva, numero) {
  const { descargarFicha } = await import('../../lib/ficha.js')
  await descargarFicha(reserva, reserva.fichas.find((a) => a.numero === numero))
}

/**
 * Detalle de una reserva, abierto desde el tablero o el listado de Reservas.
 */
export function DetalleReserva({ reserva: r, onCerrar }) {
  return (
    <Dialogo titulo={`${r.codigo} · ${r.casa.nombre}`} onCerrar={onCerrar}>
      <div className="mt-2">
        <Estado estado={r.visible} />
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-[15px]">
        <D t="Fechas" v={rangoFechas(r.entrada, r.salida)} />
        <D t="Total" v={`${pesos(r.total)} · ${PAGO[r.forma_pago.tipo]}${r.forma_pago.cuotas > 1 ? ` (${r.forma_pago.cuotas} cuotas)` : ''}${r.forma_pago.tipo === 'transferencia' ? (r.pago ? ' · registrada' : ' · por registrar') : ''}`} />
        <D
          t="Usuario/a responsable"
          v={
            <>
              {r.titular.nombre}, <span className="whitespace-nowrap">{r.titular.rut}</span>
            </>
          }
        />
        <D t="Calidad" v={`${CALIDADES[r.titular.calidad]} · ${r.titular.rol}`} />
        <D t="Teléfono" v={r.contacto?.telefono ?? '—'} />
        <D t="Correo" v={r.contacto?.correo ?? '—'} />
        <D t="Vía de la solicitud" v={r.via ? VIAS[r.via] : '—'} />
        <D t="Registrada por" v={r.registrada_por?.nombre ?? '—'} />
      </dl>
      <p className="mt-4 text-[13px] font-medium text-tinta-500">Personas ({r.ocupantes.length})</p>
      <ul className="mt-1 text-[15px]">
        {r.ocupantes.map((o, i) => (
          <li key={i}>
            {o.nombre}
            <span className="text-tinta-500">
              {' '}
              · {o.parentesco === 'titular' ? 'responsable' : (PARENTESCOS.find((p) => p.valor === o.parentesco)?.etiqueta ?? o.parentesco).toLowerCase()}
              {o.edad != null ? `, ${o.edad} años` : ''}
            </span>
          </li>
        ))}
      </ul>
      {r.titular_viaja === false && (
        <p className="mt-2 text-[15px]">
          El usuario/a responsable no viaja. A cargo en la casa: <strong>{r.a_cargo}</strong>.
        </p>
      )}
      {r.perro_asistencia && (
        <p className="mt-2 text-[15px]">
          Lleva perro de asistencia.
          {r.perro_asistencia.credencial && ` Adjuntó credencial (${r.perro_asistencia.credencial}) y certificado sanitario (${r.perro_asistencia.certificado_sanitario}).`}
        </p>
      )}
      {r.motivo_anulacion && <p className="mt-3 rounded-lg bg-error-50 px-3 py-2 text-[15px] text-error-700">{r.motivo_anulacion}</p>}


      <p className="mt-4 text-[13px] font-medium text-tinta-500">Historial</p>
      <ul className="mt-1 space-y-0.5 text-sm text-tinta-700">
        <li>
          Reservada {antiguedad(r.creada_en)} ·{' '}
          {r.registrada_por ? `registrada por ${r.registrada_por.nombre}` : (r.confirmada_por ?? 'confirmada')}
        </li>
        {(r.notificaciones ?? []).map((n, i) =>
          PLANTILLAS_BASE[n.tipo] ? (
            <li key={i}>
              <Correo reserva={r} n={n} />
            </li>
          ) : (
            <li key={i}>
              {fechaCorta(n.en.slice(0, 10), true)}: se envió {NOTIF[n.tipo] ?? n.tipo}
            </li>
          ),
        )}
      </ul>

      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <Boton variante="secundario" onClick={onCerrar}>
          Cerrar
        </Boton>
        <Boton a={`/gestion/reserva/${r.codigo}`}>{r.visible === 'confirmada' ? 'Ver comprobante o registrar desistimiento' : 'Ver comprobante'}</Boton>
      </div>
    </Dialogo>
  )
}

function D({ t, v }) {
  return (
    <div className="min-w-0">
      <dt className="text-[13px] text-tinta-500">{t}</dt>
      <dd className="break-words">{v}</dd>
    </div>
  )
}

/** Un aviso enviado, con el correo tal como lo habría recibido la persona (plantilla vigente). */
function Correo({ reserva: r, n }) {
  const c = correoDe(n.tipo, r)
  return (
    <details>
      <summary className="cursor-pointer">
        {fechaCorta(n.en.slice(0, 10), true)}: se envió «{PLANTILLAS_BASE[n.tipo].nombre.toLowerCase()}» a {c.para}
        {n.ficha && ` (${n.ficha}.pdf)`}
      </summary>
      <div className="mt-1 rounded-lg border border-borde bg-fondo p-3 text-[14px]">
        <p className="font-semibold">{c.asunto}</p>
        <p className="mt-1 whitespace-pre-line">{c.cuerpo}</p>
        {n.ficha && (
          <button type="button" onClick={() => descargar(r, n.ficha)} className="mt-2 inline-flex min-h-8 items-center gap-1 rounded px-1 font-medium text-verde-700 hover:bg-verde-50 hover:underline">
            <FileDown className="size-4" aria-hidden /> {n.ficha}.pdf
          </button>
        )}
      </div>
    </details>
  )
}
