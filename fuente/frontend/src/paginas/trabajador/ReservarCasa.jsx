import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { obtenerCasa, useDatos } from '../../datos/servicio.js'
import { rangoFechas } from '../../lib/fechas.js'
import { pesos, plural } from '../../lib/formato.js'
import { noches, tarifaPara } from '../../lib/reglas.js'
import { useSesion } from '../../componentes/Perfil.jsx'
import { Reservar } from '../gestion/Reservar.jsx'

/**
 * El trabajador completa su reserva (etapa 2, decisión 18-11-2026): quiénes
 * van, contacto, pago y aceptación del reglamento. Es el mismo formulario que
 * usan los encargados, sin la vía ni la declaración del encargado.
 */
export function ReservarCasa() {
  useDatos()
  const { id } = useParams()
  const [p] = useSearchParams()
  const navegar = useNavigate()
  const { usuario } = useSesion()
  const casa = obtenerCasa(id)
  const entrada = p.get('entrada')
  const salida = p.get('salida')
  if (!casa || !entrada || !salida) return <Navigate to="/trabajador" replace />
  const n = noches(entrada, salida)
  const volver = `/trabajador/casa/${casa.id}?entrada=${entrada}&salida=${salida}`

  return (
    <div className="mx-auto max-w-2xl">
      <Link to={volver} className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-verde-700 hover:underline">
        <ArrowLeft className="size-4" aria-hidden /> Cambiar fechas
      </Link>
      <h1 className="mt-2 text-2xl font-bold">Reservar {casa.nombre}</h1>
      <p className="mt-1 text-[15px] text-tinta-500">
        {rangoFechas(entrada, salida)} · {plural(n, 'noche', 'noches')} · {pesos(tarifaPara(casa, usuario) * n)}
      </p>
      <div className="mt-5">
        <Reservar
          titular={usuario}
          gestor={null}
          casaId={casa.id}
          panel={{
            entrada,
            salida,
            onListo: (codigo) => navegar(`/trabajador/reserva/${codigo}?nueva=1`),
            onCancelar: () => navegar(volver),
          }}
        />
      </div>
    </div>
  )
}
