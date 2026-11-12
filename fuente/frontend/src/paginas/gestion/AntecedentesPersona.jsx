import { AlertTriangle, History } from 'lucide-react'
import { antecedentesPersona, MOTIVOS_NO_ATENDIDA } from '../../datos/solicitudes.js'
import { useDatos } from '../../datos/servicio.js'
import { fechaCorta, nombreMes, rangoFechas } from '../../lib/fechas.js'
import { pesos, plural } from '../../lib/formato.js'
import { Estado, Tarjeta } from '../../componentes/ui.jsx'

const MAX = 5

/**
 * Antecedentes de la persona, apenas se la encuentra por RUT (decisión
 * 12-11-2026): lo que conviene saber antes de ofrecerle fechas. Los avisos van
 * primero; las listas, abreviadas.
 */
export function AntecedentesPersona({ persona }) {
  useDatos()
  const a = antecedentesPersona(persona)
  const avisos = [
    ...a.mesesConReserva.map((m) => `Ya tiene una reserva en ${nombreMes(m + '-01')}: rige una por mes calendario (Art. 7).`),
    ...a.porPagar.map((r) => `${r.codigo}: transferencia sin registrar (${pesos(r.total)}), llegada el ${fechaCorta(r.entrada)}.`),
    ...a.cargos.map((r) => `${r.codigo}: desistió fuera de plazo; cargo de ${pesos(r.cargo_desistimiento)}.`),
    ...a.reservas.filter((r) => r.pierde_sorteo_siguiente).map((r) => `${r.codigo}: no podrá postular al próximo sorteo.`),
  ]
  const vacio = !a.reservas.length && !a.postulaciones.length && !a.noAtendidas.length

  return (
    <Tarjeta className="p-5">
      <h3 className="flex items-center gap-2 font-semibold">
        <History className="size-5 text-tinta-500" aria-hidden /> Antecedentes de {persona.nombre.split(' ')[0]}
      </h3>
      {vacio && <p className="mt-2 text-[15px] text-tinta-500">Sin reservas, postulaciones ni pedidos en los últimos 12 meses.</p>}
      {avisos.length > 0 && (
        <ul className="mt-3 space-y-2">
          {avisos.map((t) => (
            <li key={t} className="flex gap-2 rounded-lg bg-alerta-50 px-3 py-2 text-[15px] text-alerta-700">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden /> {t}
            </li>
          ))}
        </ul>
      )}
      {a.reservas.length > 0 && (
        <>
          <p className="mt-4 text-[13px] font-medium text-tinta-500">Reservas · últimos 12 meses y próximas ({a.reservas.length})</p>
          <ul className="mt-1 divide-y divide-borde text-[15px]">
            {a.reservas.slice(0, MAX).map((r) => (
              <li key={r.codigo} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 py-2">
                <span className="min-w-0">
                  {rangoFechas(r.entrada, r.salida)} · {r.casa.nombre}
                  <span className="block text-[13px] text-tinta-500">{r.codigo}</span>
                </span>
                <Estado estado={r.visible} />
              </li>
            ))}
          </ul>
          {a.reservas.length > MAX && <p className="text-[13px] text-tinta-500">y {plural(a.reservas.length - MAX, 'más', 'más')}; búsquelas por RUT en el listado.</p>}
        </>
      )}
      {a.postulaciones.length > 0 && (
        <>
          <p className="mt-4 text-[13px] font-medium text-tinta-500">Postulaciones ({a.postulaciones.length})</p>
          <ul className="mt-1 text-[15px]">
            {a.postulaciones.slice(0, MAX).map((p) => (
              <li key={p.codigo}>
                {p.sorteo.nombre} · {p.casa?.nombre} <span className="text-tinta-500">· {p.estado}</span>
              </li>
            ))}
          </ul>
        </>
      )}
      {a.noAtendidas.length > 0 && (
        <>
          <p className="mt-4 text-[13px] font-medium text-tinta-500">Pedidos no atendidos ({a.noAtendidas.length})</p>
          <ul className="mt-1 text-[15px]">
            {a.noAtendidas.slice(0, MAX).map((s) => (
              <li key={s.id}>
                {fechaCorta(s.creada_en.slice(0, 10), true)} · {MOTIVOS_NO_ATENDIDA[s.motivo]}
              </li>
            ))}
          </ul>
        </>
      )}
    </Tarjeta>
  )
}
