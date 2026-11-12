import { createContext, useContext, useMemo, useState } from 'react'
import { PERFILES_CON_INGRESO, porId } from '../datos/usuarios.js'

const CLAVE = 'reserva_veraneo_sesion_v3'
const Contexto = createContext(null)

/**
 * Sesión de la maqueta: guarda el id de la persona de la nómina que ingresó.
 * Solo ingresan los encargados (regional y nacional); cualquier otra sesión
 * guardada se descarta. En producción la sesión la emite el backend tras
 * validar el código.
 */
function leer() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE))
  } catch {
    return null
  }
}

function resolver(s) {
  const p = s?.id ? porId(s.id) : null
  return p && PERFILES_CON_INGRESO.includes(p.perfil) ? p : null
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
export const INICIO = { encargada: '/encargada', central: '/central' }

/** Nombre de cada perfil con ingreso. Oficina Central se llama Encargado nacional desde el 12-11-2026. */
// eslint-disable-next-line react-refresh/only-export-components
export const PERFIL_ETIQUETA = { encargada: 'Encargada regional', central: 'Encargado nacional' }
