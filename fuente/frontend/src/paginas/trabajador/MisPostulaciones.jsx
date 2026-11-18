import { useNavigate } from 'react-router-dom'
import { postulacionesDe } from '../../datos/temporadas.js'
import { TarjetaPostulacion } from '../../componentes/Postulacion.jsx'

/** Postulaciones del trabajador a los sorteos de temporada alta (etapa 2, 18-11-2026). */
export function MisPostulaciones({ usuario }) {
  const navegar = useNavigate()
  const mias = postulacionesDe(usuario.id)
  if (!mias.length) return null
  return (
    <section className="mt-6 space-y-3" aria-labelledby="t-postulaciones">
      <h2 id="t-postulaciones" className="mb-3 text-[15px] font-semibold uppercase tracking-wide text-tinta-500">
        Sorteos de temporada alta
      </h2>
      {mias.map((p) => (
        <TarjetaPostulacion key={p.codigo} postulacion={p} sorteo={p.sorteo} propio actor={usuario} onReserva={(c) => navegar(`/trabajador/reserva/${c}?nueva=1`)} />
      ))}
    </section>
  )
}
