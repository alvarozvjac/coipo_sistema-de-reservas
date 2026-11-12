import { MOTIVOS_NO_ATENDIDA } from '../../datos/solicitudes.js'
import { REGIONES } from '../../datos/casas.js'
import { fechaCorta, rangoFechas } from '../../lib/fechas.js'
import { plural } from '../../lib/formato.js'
import { VIAS } from '../../lib/reglas.js'
import { Tarjeta } from '../../componentes/ui.jsx'

const nombreRegion = (c) => REGIONES.find((r) => r.codigo === c)?.nombre ?? '—'

/** Solicitudes no atendidas (decisión 12-11-2026): lo que se pidió y no terminó en reserva. */
export function ListaNoAtendidas({ solicitudes }) {
  return (
    <>
      <Tarjeta className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-[15px]">
          <thead className="border-b border-borde text-[13px] text-tinta-500">
            <tr>
              <th className="px-4 py-3 font-medium">Registrada</th>
              <th className="px-4 py-3 font-medium">Persona</th>
              <th className="px-4 py-3 font-medium">Qué pidió</th>
              <th className="px-4 py-3 font-medium">Vía</th>
              <th className="px-4 py-3 font-medium">Motivo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-borde">
            {solicitudes.map((s) => (
              <tr key={s.id} className="align-top">
                <td className="whitespace-nowrap px-4 py-3">
                  {fechaCorta(s.creada_en.slice(0, 10), true)}
                  <span className="block text-[13px] text-tinta-500">
                    {s.id} · {s.registrada_por}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {s.persona.nombre}
                  {s.persona.rut && <span className="block whitespace-nowrap text-[13px] text-tinta-500">{s.persona.rut}</span>}
                </td>
                <td className="px-4 py-3">
                  {s.casa ? s.casa.nombre : s.region ? `Región de ${nombreRegion(s.region)}` : 'Sin preferencia'}
                  <span className="block text-[13px] text-tinta-500">
                    {[s.entrada && s.salida ? rangoFechas(s.entrada, s.salida) : null, s.personas ? plural(s.personas, 'persona', 'personas') : null].filter(Boolean).join(' · ') || '—'}
                  </span>
                </td>
                <td className="px-4 py-3 text-tinta-700">{VIAS[s.via] ?? '—'}</td>
                <td className="px-4 py-3">
                  {MOTIVOS_NO_ATENDIDA[s.motivo]}
                  {s.detalle && <span className="block text-[13px] text-tinta-500">{s.detalle}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {solicitudes.length === 0 && <p className="p-6 text-center text-tinta-500">No hay solicitudes no atendidas con esos filtros.</p>}
      </Tarjeta>
      <p className="mt-2 text-[13px] text-tinta-500">{plural(solicitudes.length, 'solicitud no atendida', 'solicitudes no atendidas')}</p>
    </>
  )
}
