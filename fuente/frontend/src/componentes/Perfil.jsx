import { createContext, useContext, useMemo, useState } from 'react'
import { porId } from '../datos/usuarios.js'
import { nominaDeClaims, perfilDeClaims } from '../datos/iam.js'

const CLAVE = 'reserva_veraneo_sesion_v4'
const Contexto = createContext(null)

/**
 * Sesión de la maqueta: guarda los datos que el COIPO IAM (simulado) entregó
 * al ingresar (`claims`: sub, username, email, role, region_id). El perfil sale
 * del rol del IAM y la región, de `region_id`; la nómina solo aporta el nombre
 * y el cargo. Una sesión guardada sin rol válido se descarta. En producción la
 * sesión la emite el backend tras canjear el código del IAM (patrón BFF).
 */
function leer() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE))
  } catch {
    return null
  }
}

function resolver(s) {
  const perfil = perfilDeClaims(s?.claims)
  const persona = porId(nominaDeClaims(s?.claims))
  if (!perfil || !persona) return null
  return { ...persona, perfil, region: s.claims.region_id ?? null, correo: s.claims.email, usuario_iam: s.claims.username }
}

export function ProveedorSesion({ children }) {
  const [sesion, setSesion] = useState(leer)

  const valor = useMemo(() => {
    const guardar = (s) => {
      try {
        if (s) localStorage.setItem(CLAVE, JSON.stringify(s))
        else localStorage.removeItem(CLAVE)
      } catch {
        // sin persistencia
      }
      setSesion(s)
    }
    const usuario = resolver(sesion)
    return {
      usuario,
      perfil: usuario?.perfil ?? null,
      ingresar: guardar,
      salir: () => guardar(null),
    }
  }, [sesion])

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useSesion = () => useContext(Contexto)

/** Inicio de cada perfil. */
// eslint-disable-next-line react-refresh/only-export-components
export const INICIO = { encargada: '/encargada/reservas', central: '/central' }

/** Nombre de cada perfil con ingreso. Oficina Central se llama Encargado nacional desde el 12-11-2026. */
// eslint-disable-next-line react-refresh/only-export-components
export const PERFIL_ETIQUETA = { encargada: 'Encargada regional', central: 'Encargado nacional' }
