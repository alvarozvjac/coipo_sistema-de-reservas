import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, MemoryRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import './index.css'
import { INICIO, ProveedorSesion, useSesion } from './componentes/Perfil.jsx'
import { Plantilla } from './componentes/Plantilla.jsx'
import { aplicarTema, temaGuardado } from './componentes/BotonTema.jsx'
import { Ingreso } from './paginas/Ingreso.jsx'
import { IamSimulado } from './paginas/iam/IamSimulado.jsx'
import { Callback } from './paginas/iam/Callback.jsx'
import { Comprobante } from './paginas/gestion/Comprobante.jsx'
import { PostulacionAsistida } from './paginas/gestion/PostulacionAsistida.jsx'
import { SorteoCentral } from './paginas/central/Sorteo.jsx'
import { InicioEncargada } from './paginas/encargada/Inicio.jsx'
import { Reservas } from './paginas/gestion/Reservas.jsx'
import { InventarioEncargada } from './paginas/encargada/Inventario.jsx'
import { InicioCentral } from './paginas/central/Inicio.jsx'
import { Cobros } from './paginas/central/Cobros.jsx'
import { CasasTarifas } from './paginas/central/Casas.jsx'
import { Dashboard } from './paginas/central/Dashboard.jsx'
import { ReservaAsistida } from './paginas/gestion/ReservaAsistida.jsx'

/** Exige sesión y, si se indica, un perfil. Sin sesión lleva al ingreso. */
function Requiere({ perfil, children }) {
  const { usuario } = useSesion()
  const ubicacion = useLocation()
  if (!usuario) return <Navigate to="/ingreso" replace state={{ desde: ubicacion.pathname }} />
  const permitidos = Array.isArray(perfil) ? perfil : perfil ? [perfil] : null
  if (permitidos && !permitidos.includes(usuario.perfil)) return <Navigate to={INICIO[usuario.perfil]} replace />
  return children
}

/** Inicio según el perfil (solo ingresan los encargados, decisión 12-11-2026). */
function AlInicio() {
  const { usuario } = useSesion()
  return <Navigate to={INICIO[usuario.perfil]} replace />
}

const gestion = (el) => <Requiere perfil={['encargada', 'central']}>{el}</Requiere>

/** La versión publicada como página de claude.ai navega en memoria: su dirección no se puede cambiar. */
/** Disponibilidad se fusionó con Reservas (decisión 12-11-2026). */
function IrAReservas() {
  const { usuario } = useSesion()
  return <Navigate to={usuario?.perfil === 'central' ? '/central/reservas' : '/encargada/reservas'} replace />
}

const Enrutador = import.meta.env.MODE === 'pagina' ? MemoryRouter : BrowserRouter

aplicarTema(temaGuardado())

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Enrutador>
      <ProveedorSesion>
        <Routes>
          <Route path="ingreso" element={<Ingreso />} />
          <Route path="iam/autorizar" element={<IamSimulado />} />
          <Route path="auth/callback" element={<Callback />} />
          <Route
            element={
              <Requiere>
                <Plantilla />
              </Requiere>
            }
          >
            <Route index element={<AlInicio />} />
            <Route path="encargada" element={<Requiere perfil="encargada"><InicioEncargada /></Requiere>} />
            <Route path="encargada/reservas" element={<Requiere perfil="encargada"><Reservas /></Requiere>} />
            <Route path="encargada/inventario" element={<Requiere perfil="encargada"><InventarioEncargada /></Requiere>} />
            <Route path="central" element={<Requiere perfil="central"><InicioCentral /></Requiere>} />
            <Route path="central/cobros" element={<Requiere perfil="central"><Cobros /></Requiere>} />
            <Route path="central/configuracion" element={<Requiere perfil="central"><CasasTarifas /></Requiere>} />
            <Route path="central/casas" element={<Navigate to="/central/configuracion" replace />} />
            <Route path="central/reservas" element={<Requiere perfil="central"><Reservas /></Requiere>} />
            <Route path="central/dashboard" element={<Requiere perfil="central"><Dashboard /></Requiere>} />
            <Route path="central/sorteo" element={<Requiere perfil="central"><SorteoCentral /></Requiere>} />
            <Route path="central/administracion" element={<Navigate to="/central/configuracion?pestana=administracion" replace />} />
            <Route path="gestion/reservar" element={gestion(<ReservaAsistida />)} />
            <Route path="gestion/disponibilidad" element={<IrAReservas />} />
            <Route path="gestion/reserva/:codigo" element={gestion(<Comprobante />)} />
            <Route path="gestion/postular" element={gestion(<PostulacionAsistida />)} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ProveedorSesion>
    </Enrutador>
  </StrictMode>,
)
