import { useState } from 'react'
import { NOMBRES_DE_TEMA, atributoDeTema, esTema, temaSiguiente } from '../lib/tema.js'

/** La misma clave que usa la semilla de la fábrica (aplicacion/preferenciaDeTema.ts). */
export const CLAVE_DE_TEMA = 'coipo_tema'

export function temaGuardado() {
  try {
    const t = localStorage.getItem(CLAVE_DE_TEMA)
    return esTema(t) ? t : 'sistema'
  } catch {
    return 'sistema'
  }
}

/** Pone o quita data-theme en <html>. Se llama antes de pintar (main.jsx). */
export function aplicarTema(t) {
  const a = atributoDeTema(t)
  if (a) document.documentElement.setAttribute('data-theme', a)
  else document.documentElement.removeAttribute('data-theme')
}

/**
 * Un botón que rota entre sistema, claro y oscuro y DICE en cuál está, con
 * texto (como BotonTema.tsx de la semilla): un ícono solo no le dice nada a un
 * lector de pantalla.
 */
export function BotonTema({ className = '' }) {
  const [tema, setTema] = useState(temaGuardado)
  function siguiente() {
    const nuevo = temaSiguiente(tema)
    try {
      if (nuevo === 'sistema') localStorage.removeItem(CLAVE_DE_TEMA)
      else localStorage.setItem(CLAVE_DE_TEMA, nuevo)
    } catch {
      // sin persistencia: el tema vale hasta recargar
    }
    aplicarTema(nuevo)
    setTema(nuevo)
  }
  return (
    <button type="button" onClick={siguiente} aria-label={`Tema: ${NOMBRES_DE_TEMA[tema]}. Cambiar tema`} className={`min-h-11 rounded px-2 py-1 font-medium text-verde-700 hover:bg-verde-50 ${className}`}>
      Tema: {NOMBRES_DE_TEMA[tema]}
    </button>
  )
}
