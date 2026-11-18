import { Navigate, useNavigate } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import { Banner } from '../componentes/Banner.jsx'
import { urlDeAutorizacion } from '../datos/iam.js'
import { INICIO, useSesion } from '../componentes/Perfil.jsx'
import { MANUAL } from '../componentes/Plantilla.jsx'
import { Boton } from '../componentes/ui.jsx'
import { BotonTema } from '../componentes/BotonTema.jsx'
import { etapaAbierta } from '../datos/etapa.js'
import { useDatos } from '../datos/servicio.js'

/**
 * Ingreso con la cuenta institucional del COIPO IAM (simulado en la maqueta,
 * datos/iam.js). En la marcha blanca solo ingresan los encargados de Bienestar
 * (decisión 12-11-2026); en la etapa 2 también los trabajadores de CONAF, que
 * reservan a su nombre (decisión 18-11-2026).
 */
export function Ingreso() {
  useDatos()
  const { usuario } = useSesion()
  const abierta = etapaAbierta()
  const navegar = useNavigate()

  if (usuario) return <Navigate to={INICIO[usuario.perfil]} replace />

  return (
    <div className="flex min-h-dvh flex-col bg-fondo">
      <Banner />

      <main className="mx-auto w-full max-w-md flex-1 px-4 py-8 sm:py-12">
        <p className="text-[13px] font-semibold uppercase tracking-wide text-verde-700">Departamento de Bienestar · CONAF</p>
        <h1 className="mt-1 text-[26px] font-bold leading-tight text-tinta-900">Sistema de Gestión de Reservas</h1>
        <p className="mt-1 text-[15px] text-tinta-700">{abierta ? 'Reserve las casas de veraneo de Bienestar con su cuenta institucional.' : 'Registro y gestión de reservas para los encargados de Bienestar.'}</p>

        <div className="mt-6 rounded-2xl border border-borde bg-white p-5 sm:p-6">
          <h2 className="text-[17px] font-semibold text-tinta-900">{abierta ? 'Ingreso de trabajadores y encargados' : 'Ingreso de encargados'}</h2>
          <p className="mt-1 text-[15px] text-tinta-700">Ingrese con su cuenta institucional. El acceso lo administra el COIPO IAM{abierta ? '.' : ', según el rol que tenga asignado en esta aplicación.'}</p>
          <Boton className="mt-4 w-full" onClick={() => navegar(urlDeAutorizacion())}>
            <LogIn className="size-4" aria-hidden /> Ingresar con COIPO IAM
          </Boton>
          <p className="mt-3 text-[13px] text-tinta-500">
            {abierta
              ? 'Jubilados/as y funcionarios/as de otros servicios públicos: pidan su reserva a la encargada de Bienestar de su región.'
              : 'Si necesita una reserva, pídasela a la encargada de Bienestar de su región: en esta etapa solo ingresan los encargados.'}
          </p>
        </div>

        <p className="mt-4 text-[13px] leading-snug text-tinta-500">
          Los datos de las personas se usan solo para gestionar el beneficio de alojamiento, conforme a las Leyes 19.628 y 21.719 (Art. 25 del reglamento).
        </p>

        <p className="mt-6 text-center text-sm">
          <a href={MANUAL} target="_blank" rel="noreferrer" className="font-medium text-verde-700 underline underline-offset-2 hover:text-verde-800">
            Manual de usuario (PDF)
          </a>
        </p>
        <p className="mt-2 text-center text-sm">
          <BotonTema />
        </p>
      </main>
    </div>
  )
}
