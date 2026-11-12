/**
 * El tema de la interfaz, como dato (sin navegador). Sigue a
 * semilla/ESQUELETO/frontend/src/dominio/tema.ts de coipo_master_produccion,
 * sin el tema «inmersivo», cuya regla de color (UI-2) sigue sin firmar.
 * «sistema» no fija nada: manda prefers-color-scheme.
 */
export const TEMAS = ['sistema', 'claro', 'oscuro']

export const NOMBRES_DE_TEMA = { sistema: 'Sistema', claro: 'Claro', oscuro: 'Oscuro' }

export const esTema = (v) => TEMAS.includes(v)

export const temaSiguiente = (t) => TEMAS[(TEMAS.indexOf(t) + 1) % TEMAS.length] ?? 'sistema'

/** Valor de data-theme en <html>; null para «sistema». */
export const atributoDeTema = (t) => (t === 'sistema' ? null : t)
