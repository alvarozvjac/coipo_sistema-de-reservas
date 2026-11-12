import { useEffect } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { Banner } from './Banner.jsx'
import { BotonTema } from './BotonTema.jsx'
import { aplicarParametros } from '../datos/configuracion.js'
import { reiniciarDemo } from '../datos/servicio.js'
import { INICIO, PERFIL_ETIQUETA, useSesion } from './Perfil.jsx'

/** Menú de cada perfil. Desde el 12-11-2026 solo ingresan los encargados. */
const NAV = {
  encargada: [
    { a: '/encargada', texto: 'Panel', fin: true },
    { a: '/encargada/reservas', texto: 'Reservas' },
    { a: '/encargada/inventario', texto: 'Inventario' },
  ],
  central: [
    { a: '/central', texto: 'Panel', fin: true },
    { a: '/central/reservas', texto: 'Reservas' },
    { a: '/central/cobros', texto: 'Cobros' },
    { a: '/central/sorteo', texto: 'Temporadas' },
    { a: '/central/dashboard', texto: 'Dashboard' },
    { a: '/central/configuracion', texto: 'Configuración' },
  ],
}

/** Manual de usuario (public/manual-usuario.pdf). En la página única va junto al index.html publicado. */
export const MANUAL = import.meta.env.MODE === 'pagina' ? 'manual-usuario.pdf' : '/manual-usuario.pdf'

export function Plantilla() {
  const { usuario, salir } = useSesion()
  const navegar = useNavigate()
  const { pathname } = useLocation()
  // Al cambiar de página se parte desde arriba: en el teléfono el resultado de una acción quedaba fuera de la vista.
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])
  const subtitulo = PERFIL_ETIQUETA[usuario.perfil]

  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#contenido" className="salto-al-contenido no-imprimir">
        Saltar al contenido
      </a>
      <header className="no-imprimir border-b border-borde bg-white">
        <Banner />
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <NavLink to={INICIO[usuario.perfil]} className="mr-auto flex min-h-11 flex-col justify-center leading-tight">
            <span className="block text-[17px] font-bold text-verde-800">Gestión de Reservas</span>
            <span className="block text-[13px] text-tinta-500">CONAF</span>
          </NavLink>

          <nav aria-label="Principal" className="order-3 -mx-1 flex w-full gap-1 overflow-x-auto px-1 sm:order-none sm:mx-0 sm:w-auto sm:px-0 lg:ml-auto">
            {NAV[usuario.perfil].map((n) => (
              <NavLink
                key={n.a}
                to={n.a}
                end={n.fin}
                className={({ isActive }) =>
                  `inline-flex shrink-0 items-center whitespace-nowrap rounded-lg px-3 py-2 text-[15px] font-medium pointer-coarse:min-h-11 ${isActive ? 'bg-verde-50 text-verde-800' : 'text-tinta-700 hover:bg-stone-100'}`
                }
              >
                {n.texto}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="text-right leading-tight">
              <span className="block text-sm font-medium text-tinta-900">{usuario.nombre}</span>
              <span className="block text-[13px] text-tinta-500">{subtitulo}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                salir()
                navegar('/ingreso', { replace: true })
              }}
              className="grid size-11 place-items-center rounded-lg text-tinta-500 ring-1 ring-borde hover:bg-stone-50 hover:text-tinta-900"
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
            >
              <LogOut className="size-4" aria-hidden />
            </button>
          </div>
        </div>
      </header>

      <main id="contenido" tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:py-8">
        <Outlet />
      </main>

      <footer className="no-imprimir border-t border-borde bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-3 text-[13px] text-tinta-500">
          <span>
            <strong className="font-semibold text-tinta-700">Maqueta de validación.</strong> Personas, reservas y fotos son ficticias; casas y tarifas, del llamado de verano 2027. Nada se guarda fuera de este navegador.
          </span>
          <span className="flex flex-wrap gap-1">
            <a href={MANUAL} target="_blank" rel="noreferrer" className="rounded px-2 py-1 font-medium text-verde-700 hover:bg-verde-50">
              Manual de usuario (PDF)
            </a>
            <button
              type="button"
              onClick={() => {
                reiniciarDemo()
                aplicarParametros()
              }} className="rounded px-2 py-1 font-medium text-verde-700 hover:bg-verde-50">
              Reiniciar datos de prueba
            </button>
            <BotonTema />
          </span>
        </div>
      </footer>
    </div>
  )
}
