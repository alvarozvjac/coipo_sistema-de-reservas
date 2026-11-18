import { Link } from 'react-router-dom'
import { misReservas, useDatos } from '../../datos/servicio.js'
import { diasEntre, hoyISO, rangoFechas } from '../../lib/fechas.js'
import { pesos, plural } from '../../lib/formato.js'
import { estadoReserva, noches } from '../../lib/reglas.js'
import { rutaFoto } from '../../componentes/fotos.js'
import { Boton, Estado } from '../../componentes/ui.jsx'
import { useSesion } from '../../componentes/Perfil.jsx'
import { MisPostulaciones } from './MisPostulaciones.jsx'

const GRUPOS = [
  { titulo: 'En curso', estados: ['en_curso'] },
  { titulo: 'Próximas', estados: ['confirmada'] },
  { titulo: 'Anteriores', estados: ['finalizada', 'desistida', 'anulada'] },
]

/**
 * Reservas del trabajador en la etapa 2 (decisión 18-11-2026): las que hizo
 * desde el aplicativo y las que le registró una encargada. Desde el detalle
 * puede desistir.
 */
export function MisReservas() {
  useDatos()
  const { usuario } = useSesion()
  const reservas = misReservas(usuario.id).map((r) => ({ ...r, visible: estadoReserva(r) }))

  return (
    <>
      <h1 className="text-2xl font-bold">Mis reservas</h1>
      <MisPostulaciones usuario={usuario} />

      {reservas.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-borde bg-white p-10 text-center">
          <p className="text-tinta-500">Todavía no tiene reservas.</p>
          <Boton a="/trabajador" className="mt-4">
            Buscar una casa
          </Boton>
        </div>
      ) : (
        GRUPOS.map((g) => {
          const lista = reservas.filter((r) => g.estados.includes(r.visible))
          if (!lista.length) return null
          const proximas = g.titulo === 'Próximas'
          if (proximas) lista.sort((a, b) => (a.entrada > b.entrada ? 1 : -1))
          return (
            <section key={g.titulo} className="mt-6" aria-labelledby={`g-${g.titulo}`}>
              <h2 id={`g-${g.titulo}`} className="mb-3 text-[15px] font-semibold uppercase tracking-wide text-tinta-500">
                {g.titulo}
              </h2>
              <ul className="space-y-3">
                {lista.map((r) => (
                  <li key={r.codigo}>
                    <Link to={`/trabajador/reserva/${r.codigo}`} className="flex flex-col gap-4 rounded-xl border border-borde bg-white p-3 hover:bg-stone-50 sm:flex-row sm:items-center">
                      <img src={rutaFoto(r.casa.fotos[0])} alt="" className="h-36 w-full rounded-lg object-cover sm:h-20 sm:w-28" loading="lazy" />
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold">{r.casa.nombre}</span>
                          <Estado estado={r.visible} />
                        </span>
                        <span className="mt-0.5 block text-[15px] text-tinta-700">
                          {rangoFechas(r.entrada, r.salida)} · {plural(noches(r.entrada, r.salida), 'noche', 'noches')}
                        </span>
                        <span className="block text-sm text-tinta-500">
                          {r.codigo} · {pesos(r.total)}
                          {proximas && ` · faltan ${plural(diasEntre(hoyISO(), r.entrada), 'día', 'días')}`}
                          {r.registrada_por && ` · registrada por ${r.registrada_por.nombre}`}
                        </span>
                      </span>
                      <span className="text-sm font-medium text-verde-700">Ver detalle</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )
        })
      )}
    </>
  )
}
