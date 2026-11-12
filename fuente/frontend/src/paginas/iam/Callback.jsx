import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { Banner } from '../../componentes/Banner.jsx'
import { canjearCodigo, perfilDeClaims } from '../../datos/iam.js'
import { INICIO, useSesion } from '../../componentes/Perfil.jsx'
import { Aviso } from '../../componentes/ui.jsx'

const MENSAJES = {
  sin_rol: {
    titulo: 'Su cuenta no tiene acceso a esta aplicación',
    texto: 'Ingresó al COIPO IAM, pero no tiene un rol asignado en el Sistema de Gestión de Reservas. En esta etapa solo ingresan los encargados de Bienestar. Si necesita una reserva o postular al sorteo, pídasela a la encargada de Bienestar de su región; si usted es encargado, solicite el rol al administrador del sistema.',
  },
  cancelado: { titulo: 'Ingreso cancelado', texto: 'Volvió del COIPO IAM sin iniciar sesión.' },
  estado: { titulo: 'No pudimos completar el ingreso', texto: 'La respuesta del COIPO IAM no corresponde a esta solicitud o ya se usó. Vuelva a intentarlo desde el inicio.' },
  codigo: { titulo: 'No pudimos completar el ingreso', texto: 'El código del COIPO IAM no es válido o ya se usó. Vuelva a intentarlo desde el inicio.' },
}

/**
 * Vuelta desde el COIPO IAM (simulado). Canjea el código una sola vez y abre la
 * sesión si el IAM asignó un rol de esta aplicación; si no, explica por qué no
 * entra y ofrece volver, sin reintentar solo (la guarda anti-bucle de la
 * semilla de la fábrica sigue la misma idea).
 */
export function Callback() {
  const { search } = useLocation()
  const { usuario, ingresar } = useSesion()
  const [resultado, setResultado] = useState(null)

  useEffect(() => {
    const q = new URLSearchParams(search)
    const r = canjearCodigo({ code: q.get('code'), state: q.get('state'), error: q.get('error') })
    if (r.claims && !perfilDeClaims(r.claims)) setResultado({ error: 'sin_rol' })
    else if (r.claims) {
      ingresar({ claims: r.claims })
      setResultado({ ok: true })
    } else setResultado(r)
    // Se canjea una sola vez, al llegar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (usuario) return <Navigate to={INICIO[usuario.perfil]} replace />
  if (!resultado || resultado.ok) return <p className="p-6 text-[15px] text-tinta-500">Completando el ingreso…</p>

  const m = MENSAJES[resultado.error] ?? MENSAJES.estado
  return (
    <div className="flex min-h-dvh flex-col bg-fondo">
      <Banner />
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-8 sm:py-12">
        <Aviso tipo={resultado.error === 'cancelado' ? 'info' : 'error'}>
          <strong className="block font-semibold">{m.titulo}</strong>
          {m.texto}
        </Aviso>
        <Link to="/ingreso" replace className="mt-4 inline-flex min-h-11 items-center font-medium text-verde-700 underline underline-offset-2">
          Volver al ingreso
        </Link>
      </main>
    </div>
  )
}
