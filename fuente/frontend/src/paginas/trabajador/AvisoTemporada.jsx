import { Link } from 'react-router-dom'
import { Ticket } from 'lucide-react'
import { postulacionAbierta, postulacionDe, sorteoVigente } from '../../datos/temporadas.js'
import { etapaAbierta } from '../../datos/etapa.js'
import { fechaLarga, rangoFechas } from '../../lib/fechas.js'
import { fraseTemporada } from '../../lib/reglas.js'
import { ESTADOS_POSTULACION, inicioTemporada, puedePostular } from '../../lib/sorteo.js'

/** Invitación a postular al sorteo de temporada alta, o acceso a la postulación hecha (etapa 2, 18-11-2026). */
export function AvisoTemporada({ usuario }) {
  const s = sorteoVigente()
  if (!etapaAbierta() || !s || !puedePostular(usuario)) return null
  const mia = postulacionDe(usuario.id)
  if (!postulacionAbierta() && !mia && s.estado !== 'sorteado') return null
  return (
    <div className="mt-4 flex flex-col gap-3 rounded-xl border border-verde-200 bg-verde-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-[15px] text-verde-800">
        {mia && mia.estado !== 'postulada'
          ? `Resultado del sorteo de ${fraseTemporada(s.temporada)}: ${ESTADOS_POSTULACION[mia.estado]?.etiqueta.toLowerCase() ?? mia.estado}.`
          : mia
          ? `Usted postuló al sorteo de ${fraseTemporada(s.temporada)}.`
          : s.estado === 'sorteado'
            ? `El sorteo de ${fraseTemporada(s.temporada)} ya se realizó: revise los turnos que quedaron vacantes.`
            : `${s.nombre} (${rangoFechas(inicioTemporada(s.temporada), s.temporada.hasta)}) se asigna por sorteo. Postule hasta el ${fechaLarga(s.postulacion.hasta)}.`}
      </p>
      <Link to={mia ? '/trabajador/mis-reservas' : '/trabajador/sorteo'} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-verde-700 px-4 text-[15px] font-semibold text-white hover:bg-verde-800">
        <Ticket className="size-4" aria-hidden /> {mia && mia.estado !== 'postulada' ? 'Ver el resultado' : mia ? 'Ver mi postulación' : s.estado === 'sorteado' ? 'Ver vacantes' : 'Postular al sorteo'}
      </Link>
    </div>
  )
}
