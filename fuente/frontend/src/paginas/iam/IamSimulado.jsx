import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { KeyRound } from 'lucide-react'
import { CLAVE_MAQUETA, CLIENT_ID, CUENTAS, autenticarEnIam, urlDeCancelacion } from '../../datos/iam.js'
import { Aviso, Boton, Campo, claseEntrada } from '../../componentes/ui.jsx'

const NOMBRE_APP = { [CLIENT_ID]: 'Sistema de Gestión de Reservas · Departamento de Bienestar' }

/**
 * Pantalla de inicio de sesión del COIPO IAM, SIMULADA en la maqueta. Es otro
 * sistema: por eso no lleva el banner ni la navegación de la aplicación.
 * Recibe client_id, redirect_uri y state, y devuelve un código de un solo uso.
 */
export function IamSimulado() {
  const q = new URLSearchParams(useLocation().search)
  const navegar = useNavigate()
  const [datos, setDatos] = useState({ username: '', password: '' })
  const [error, setError] = useState(null)
  const client_id = q.get('client_id')
  const redirect_uri = q.get('redirect_uri')
  const state = q.get('state')
  const app = NOMBRE_APP[client_id]

  function enviar(e) {
    e.preventDefault()
    if (!datos.username.trim() || !datos.password) return setError('Escriba su usuario y su contraseña.')
    const r = autenticarEnIam({ ...datos, redirect_uri, state })
    if (r.error) return setError(r.error)
    navegar(r.destino, { replace: true })
  }

  const fijar = (k, v) => {
    setDatos((d) => ({ ...d, [k]: v }))
    setError(null)
  }

  return (
    <div className="flex min-h-dvh flex-col bg-fondo">
      <header className="border-b border-borde bg-white">
        <div className="mx-auto flex max-w-md items-center gap-2 px-4 py-3">
          <KeyRound className="size-5 text-verde-700" aria-hidden />
          <p className="text-[15px] font-semibold text-tinta-900">
            COIPO IAM <span className="font-normal text-tinta-500">· Identidades de CONAF</span>
          </p>
        </div>
      </header>
      <p className="border-b border-dashed border-alerta-700/40 bg-alerta-50 px-4 py-2 text-center text-[13px] text-alerta-700">
        Simulado en la maqueta: no es el IAM real y no valida cuentas reales.
      </p>

      <main className="mx-auto w-full max-w-md flex-1 px-4 py-8">
        {!app || !redirect_uri || !state ? (
          <Aviso tipo="error">
            La solicitud de inicio de sesión no es válida: falta la aplicación de origen.{' '}
            <Link to="/ingreso" className="font-medium underline">
              Volver al Sistema de Gestión de Reservas
            </Link>
          </Aviso>
        ) : (
          <div className="rounded-2xl border border-borde bg-white p-5 sm:p-6">
            <h1 className="text-[19px] font-semibold text-tinta-900">Iniciar sesión</h1>
            <p className="mt-1 text-[15px] text-tinta-700">
              Para continuar a <strong className="font-semibold">{app}</strong>.
            </p>
            <form onSubmit={enviar} noValidate className="mt-4 space-y-3">
              <Campo etiqueta="Usuario institucional">
                <input className={claseEntrada} value={datos.username} onChange={(e) => fijar('username', e.target.value)} autoComplete="username" autoCapitalize="none" spellCheck={false} />
              </Campo>
              <Campo etiqueta="Contraseña">
                <input type="password" className={claseEntrada} value={datos.password} onChange={(e) => fijar('password', e.target.value)} autoComplete="current-password" />
              </Campo>
              {error && <Aviso tipo="error">{error}</Aviso>}
              <Boton type="submit" className="w-full">
                Ingresar
              </Boton>
              <Boton type="button" variante="secundario" className="w-full" onClick={() => navegar(urlDeCancelacion(redirect_uri, state), { replace: true })}>
                Cancelar y volver
              </Boton>
            </form>

            <section className="mt-5 rounded-xl border border-dashed border-borde p-4" aria-labelledby="cuentas-titulo">
              <h2 id="cuentas-titulo" className="text-[13px] font-semibold uppercase tracking-wide text-tinta-500">
                Maqueta · cuentas de prueba
              </h2>
              <p className="mt-1 text-[13px] text-tinta-500">
                La contraseña de todas es «{CLAVE_MAQUETA}». Elija una para completar el formulario.
              </p>
              <ul className="mt-2 space-y-2">
                {CUENTAS.map((c) => (
                  <li key={c.username}>
                    <button
                      type="button"
                      onClick={() => {
                        setDatos({ username: c.username, password: CLAVE_MAQUETA })
                        setError(null)
                      }}
                      className="flex min-h-11 w-full flex-col items-start rounded-lg bg-white px-3 py-2 text-left ring-1 ring-borde hover:bg-verde-50"
                    >
                      <span className="text-sm font-semibold text-tinta-900">{c.username}</span>
                      <span className="text-[13px] text-tinta-500">{c.etiqueta}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}
      </main>
    </div>
  )
}
