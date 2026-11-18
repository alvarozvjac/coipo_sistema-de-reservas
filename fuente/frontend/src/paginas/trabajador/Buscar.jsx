import { Link, useSearchParams } from 'react-router-dom'
import { CalendarCheck, Users } from 'lucide-react'
import { REGIONES } from '../../datos/casas.js'
import { listarCasas, misReservas, useDatos } from '../../datos/servicio.js'
import { fechaCorta } from '../../lib/fechas.js'
import { pesos, plural } from '../../lib/formato.js'
import { PARAMETROS, estadoReserva, tarifaPara } from '../../lib/reglas.js'
import { rutaFoto } from '../../componentes/fotos.js'
import { Campo, claseEntrada } from '../../componentes/ui.jsx'
import { useSesion } from '../../componentes/Perfil.jsx'
import { AvisoTemporada } from './AvisoTemporada.jsx'

const nombreRegion = (c) => REGIONES.find((r) => r.codigo === c)?.nombre ?? ''

/**
 * Inicio del trabajador en la etapa 2 (decisión 18-11-2026): elige región y
 * casa; las fechas se eligen en el calendario de cada casa. Arriba, su próxima
 * reserva, si tiene.
 */
export function Buscar() {
  useDatos()
  const { usuario } = useSesion()
  const [p, setP] = useSearchParams()
  const region = p.get('region') ?? ''
  const casas = listarCasas()
  const resultados = casas.filter((c) => !region || c.region === region)
  const proxima = misReservas(usuario.id)
    .filter((r) => ['confirmada', 'en_curso'].includes(estadoReserva(r)))
    .sort((a, b) => (a.entrada < b.entrada ? -1 : 1))[0]

  const fijar = (v) => {
    const n = new URLSearchParams(p)
    if (v) n.set('region', v)
    else n.delete('region')
    setP(n, { replace: true })
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-tinta-900 sm:text-[28px]">Hola, {usuario.nombre.split(' ')[0]}. ¿Dónde quiere descansar?</h1>
      <p className="mt-1 max-w-3xl text-[15px] text-tinta-500">
        Reserve una casa de veraneo de Bienestar con hasta {PARAMETROS.anticipacion_maxima_dias} días de anticipación. Si las fechas están libres, la reserva queda confirmada al instante y le llega la ficha por correo.
      </p>

      {proxima && (
        <Link to={`/trabajador/reserva/${proxima.codigo}`} className="mt-4 flex items-center gap-3 rounded-xl border border-verde-200 bg-verde-50 px-4 py-3 text-verde-800 hover:bg-verde-100">
          <CalendarCheck className="size-5 shrink-0" aria-hidden />
          <span className="text-[15px]">
            Su próxima reserva: <strong className="font-semibold">{proxima.casa.nombre}</strong>, {fechaCorta(proxima.entrada)} al {fechaCorta(proxima.salida, true)}.
          </span>
        </Link>
      )}
      <AvisoTemporada usuario={usuario} />

      <div className="mt-5 rounded-xl border border-borde bg-white p-4" role="search">
        <Campo etiqueta="Región" className="max-w-sm">
          <select className={claseEntrada} value={region} onChange={(e) => fijar(e.target.value)}>
            <option value="">Todas las regiones</option>
            {REGIONES.filter((r) => casas.some((c) => c.region === r.codigo)).map((r) => (
              <option key={r.codigo} value={r.codigo}>
                {r.nombre}
              </option>
            ))}
          </select>
        </Campo>
        <p className="mt-2 text-[13px] text-tinta-500">Elija una casa para ver su calendario de disponibilidad y reservar.</p>
      </div>

      <div className="mt-6 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold text-tinta-900">{plural(resultados.length, 'casa', 'casas')}</h2>
        {region && (
          <button type="button" className="min-h-11 text-sm font-medium text-verde-700 hover:underline" onClick={() => fijar('')}>
            Ver todas
          </button>
        )}
      </div>

      {resultados.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-borde bg-white p-8 text-center text-tinta-500">No hay casas en esa región.</p>
      ) : (
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {resultados.map((c) => (
            <li key={c.id}>
              <Link to={`/trabajador/casa/${c.id}`} className="group block overflow-hidden rounded-xl border border-borde bg-white transition-shadow hover:shadow-md">
                <div className="aspect-[16/10] overflow-hidden bg-stone-200">
                  <img src={rutaFoto(c.fotos[0])} alt="" loading="lazy" className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
                </div>
                <div className="p-4">
                  <p className="text-[13px] font-medium uppercase tracking-wide text-tinta-500">{nombreRegion(c.region)}</p>
                  <h3 className="mt-0.5 text-[17px] font-semibold text-tinta-900">{c.nombre}</h3>
                  <div className="mt-3 flex items-end justify-between">
                    <span className="flex items-center gap-1.5 text-sm text-tinta-500">
                      <Users className="size-4" aria-hidden /> Hasta {c.capacidad}
                    </span>
                    <span className="text-right">
                      <span className="text-[17px] font-bold text-tinta-900">{pesos(tarifaPara(c, usuario))}</span>
                      <span className="text-[13px] text-tinta-500"> / noche</span>
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
