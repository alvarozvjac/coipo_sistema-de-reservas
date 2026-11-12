import { useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { Banner } from '../componentes/Banner.jsx'
import { ACCESOS_DEMO, PERFILES_CON_INGRESO, buscarEnNomina, nombreCoincide, porId } from '../datos/usuarios.js'
import { formatearRut, rutValido } from '../lib/formato.js'
import { INICIO, useSesion } from '../componentes/Perfil.jsx'
import { MANUAL } from '../componentes/Plantilla.jsx'
import { Aviso, Boton, Campo, claseEntrada } from '../componentes/ui.jsx'

/** a••••••@conaf.cl */
const ocultarCorreo = (c) => {
  const [u, d] = c.split('@')
  return `${u[0]}${'•'.repeat(5)}@${d}`
}

const nuevoCodigo = () => String(Math.floor(100000 + Math.random() * 900000))

const VACIO = { rut: '', nombre: '' }

/**
 * Ingreso de los encargados de Bienestar (regional y nacional), con RUT,
 * nombre y un código al correo de la nómina. En la primera etapa los
 * afiliados/as no ingresan: los encargados registran sus reservas y
 * postulaciones (decisión de Bienestar, 12-11-2026).
 */
export function Ingreso() {
  const { usuario, ingresar } = useSesion()
  const navegar = useNavigate()
  const [datos, setDatos] = useState(VACIO)
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState(null)
  const [pendiente, setPendiente] = useState(null) // { sesion, correo, codigo, destino }
  const [codigo, setCodigo] = useState('')
  const [errorCodigo, setErrorCodigo] = useState(null)
  const campoCodigo = useRef(null)

  useEffect(() => {
    if (pendiente) campoCodigo.current?.focus()
  }, [pendiente])

  if (usuario) return <Navigate to={INICIO[usuario.perfil]} replace />

  const fijar = (k, v) => {
    setDatos((d) => ({ ...d, [k]: v }))
    setErrores((e) => ({ ...e, [k]: null }))
    setErrorGeneral(null)
  }

  function enviar(e) {
    e.preventDefault()
    const err = {}
    if (!rutValido(datos.rut)) err.rut = 'Revise el RUT: el dígito verificador no corresponde.'
    if (datos.nombre.trim().split(/\s+/).length < 2) err.nombre = 'Escriba su nombre y al menos un apellido.'
    setErrores(err)
    if (Object.keys(err).length) return
    const persona = buscarEnNomina(datos.rut)
    // Mensaje único: no revela si el RUT está en la nómina ni qué perfil tiene.
    if (!persona || !PERFILES_CON_INGRESO.includes(persona.perfil) || !nombreCoincide(datos.nombre, persona.nombre)) {
      setErrorGeneral('Este acceso es solo para los encargados de Bienestar, regionales y nacional. Si necesita una reserva o postular al sorteo, pídasela a la encargada de Bienestar de su región.')
      return
    }
    setPendiente({ sesion: { id: persona.id }, correo: persona.correo, codigo: nuevoCodigo(), destino: INICIO[persona.perfil] })
    setCodigo('')
    setErrorCodigo(null)
  }

  function verificar(e) {
    e.preventDefault()
    if (codigo.trim() !== pendiente.codigo) {
      setErrorCodigo('El código no coincide. Revise el correo o pida uno nuevo.')
      return
    }
    ingresar(pendiente.sesion)
    navegar(pendiente.destino, { replace: true })
  }

  function accesoDemo(a) {
    const p = porId(a.id)
    setPendiente(null)
    setErrores({})
    setErrorGeneral(null)
    setDatos({ rut: p.rut, nombre: p.nombre })
  }

  return (
    <div className="flex min-h-dvh flex-col bg-fondo">
      <Banner />

      <main className="mx-auto w-full max-w-md flex-1 px-4 py-8 sm:py-12">
        <p className="text-[13px] font-semibold uppercase tracking-wide text-verde-700">Servicio de Bienestar · CONAF</p>
        <h1 className="mt-1 text-[26px] font-bold leading-tight text-tinta-900">Casas de Veraneo</h1>
        <p className="mt-1 text-[15px] text-tinta-700">Gestión de reservas y sorteos para los encargados de Bienestar.</p>

        <div className="mt-6 rounded-2xl border border-borde bg-white p-5 sm:p-6">
          {!pendiente ? (
            <form onSubmit={enviar} noValidate className="space-y-3">
              <h2 className="text-[17px] font-semibold text-tinta-900">Ingreso de encargados</h2>
              <Campo etiqueta="RUT" error={errores.rut}>
                <input
                  className={claseEntrada}
                  value={datos.rut}
                  onChange={(e) => fijar('rut', formatearRut(e.target.value))}
                  placeholder="12.345.678-9"
                  autoComplete="off"
                  inputMode="text"
                  maxLength={12}
                />
              </Campo>
              <Campo etiqueta="Nombre y apellidos" error={errores.nombre}>
                <input className={claseEntrada} value={datos.nombre} onChange={(e) => fijar('nombre', e.target.value)} autoComplete="name" />
              </Campo>
              {errorGeneral && <Aviso tipo="error">{errorGeneral}</Aviso>}
              <Boton type="submit" className="w-full">
                Continuar
              </Boton>
              <p className="text-center text-[13px] text-tinta-500">Le enviaremos un código al correo registrado en la nómina.</p>
            </form>
          ) : (
            <form onSubmit={verificar} noValidate>
              <button type="button" onClick={() => setPendiente(null)} className="-ml-1 inline-flex items-center gap-1 rounded px-1 text-sm font-medium text-verde-700 hover:underline">
                <ArrowLeft className="size-4" aria-hidden /> Cambiar datos
              </button>
              <ShieldCheck className="mt-4 size-9 text-verde-600" aria-hidden />
              <h2 className="mt-2 text-[19px] font-semibold">Revise su correo</h2>
              <p className="mt-1 text-[15px] text-tinta-700">
                Enviamos un código de 6 dígitos a <strong className="font-semibold">{ocultarCorreo(pendiente.correo)}</strong>. Vence en 10 minutos.
              </p>
              <Campo etiqueta="Código" error={errorCodigo} className="mt-4">
                <input
                  ref={campoCodigo}
                  className={`${claseEntrada} text-center text-xl tracking-[0.5em] tabular-nums`}
                  value={codigo}
                  onChange={(e) => {
                    setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))
                    setErrorCodigo(null)
                  }}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  aria-describedby="codigo-demo"
                />
              </Campo>
              <Boton type="submit" className="mt-4 w-full" disabled={codigo.length !== 6}>
                Ingresar
              </Boton>
              <button
                type="button"
                onClick={() => {
                  setPendiente({ ...pendiente, codigo: nuevoCodigo() })
                  setCodigo('')
                  setErrorCodigo(null)
                }}
                className="mt-3 w-full rounded py-2 text-sm font-medium text-verde-700 hover:underline"
              >
                No me llegó: enviar otro código
              </button>
              <p id="codigo-demo" className="mt-3 rounded-lg border border-dashed border-alerta-700/40 bg-alerta-50 px-3 py-2 text-center text-sm text-alerta-700">
                Maqueta: el correo no se envía. Su código es <strong className="tabular-nums tracking-widest">{pendiente.codigo}</strong>
              </p>
            </form>
          )}
        </div>

        <p className="mt-4 text-[13px] leading-snug text-tinta-500">
          Los datos de las personas se usan solo para gestionar el beneficio de alojamiento, conforme a las Leyes 19.628 y 21.719 (Art. 25 del reglamento).
        </p>

        <p className="mt-6 text-center text-sm">
          <a href={MANUAL} target="_blank" rel="noreferrer" className="font-medium text-verde-700 underline underline-offset-2 hover:text-verde-800">
            Manual de usuario (PDF)
          </a>
        </p>

        <section className="mt-4 rounded-xl border border-dashed border-borde p-4" aria-labelledby="demo-titulo">
          <h2 id="demo-titulo" className="text-[13px] font-semibold uppercase tracking-wide text-tinta-500">
            Maqueta · probar como
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {ACCESOS_DEMO.map((a) => (
              <button
                key={a.etiqueta}
                type="button"
                onClick={() => accesoDemo(a)}
                className="rounded-full bg-white px-3 py-1.5 text-sm text-tinta-700 ring-1 ring-borde hover:bg-verde-50 hover:text-verde-800"
              >
                {a.etiqueta}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[13px] text-tinta-500">Completa el formulario con un encargado ficticio; luego presione «Continuar».</p>
        </section>
      </main>
    </div>
  )
}
