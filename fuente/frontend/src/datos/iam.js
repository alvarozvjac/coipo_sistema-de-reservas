/**
 * COIPO IAM SIMULADO — CUENTAS, CLAVES Y CÓDIGOS FICTICIOS.
 *
 * Imita el flujo de inicio de sesión que tendrá la aplicación con el IAM de la
 * flota (COIPO_USUARIOS), para que la maqueta se use igual que el producto:
 *
 *   1. La aplicación pide `urlDeAutorizacion()`: guarda un `state` de un solo
 *      uso y manda al navegador a la pantalla del IAM.
 *   2. En el IAM la persona ingresa su usuario institucional y su contraseña.
 *      El IAM emite un `code` de un solo uso y vuelve a `/auth/callback`.
 *   3. El callback valida el `state` y canjea el `code` por los datos de la
 *      persona (`userinfo`): sub, username, email, role y region_id.
 *   4. La aplicación decide el perfil SOLO por el `role` que el IAM le asignó
 *      para esta aplicación. Sin rol, no entra.
 *
 * En la fábrica esto lo hace el backend (patrón BFF, `IdentidadLocal` en
 * desarrollo y el IAM real en producción): el token nunca llega al navegador.
 * Aquí todo ocurre en el navegador y se guarda en sessionStorage, solo para
 * mostrar el flujo. Nada de esto es seguro ni pretende serlo.
 *
 * [PENDIENTE] Los nombres de los roles (`encargado_regional`, `encargado_nacional`)
 * y el atributo `region_id` se fijan al registrar la aplicación en el IAM
 * (prompts/15-registrar-en-el-iam.md de coipo_master_produccion).
 */

export const CLIENT_ID = 'reservas-casas-veraneo'
export const RUTA_IAM = '/iam/autorizar'
export const RUTA_CALLBACK = '/auth/callback'

/** Contraseña única de todas las cuentas de la maqueta. */
export const CLAVE_MAQUETA = 'maqueta'

/** Rol del IAM → perfil de la aplicación. */
export const PERFIL_POR_ROL = {
  encargado_regional: 'encargada',
  encargado_nacional: 'central',
}

/**
 * Cuentas del IAM simulado. `nomina` enlaza con la nómina de demostración
 * (datos/usuarios.js). Una cuenta sin `role` existe en el IAM pero no tiene
 * acceso a esta aplicación.
 */
export const CUENTAS = [
  { username: 'cnunez', sub: 'iam-105', nomina: 5, email: 'carolina.nunez@conaf.cl', role: 'encargado_regional', region_id: '05', etiqueta: 'Encargada regional (Valparaíso)' },
  { username: 'pherrera', sub: 'iam-106', nomina: 6, email: 'patricia.herrera@conaf.cl', role: 'encargado_nacional', region_id: null, etiqueta: 'Encargado nacional' },
  { username: 'mfuentes', sub: 'iam-101', nomina: 1, email: 'maria.fuentes@conaf.cl', role: null, region_id: null, etiqueta: 'Afiliada, sin rol en esta aplicación' },
]

const CLAVE_ESTADO = 'iam_maqueta_state'
const CLAVE_CODIGOS = 'iam_maqueta_codigos'

const azar = () => Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10)

function leer(clave, porDefecto) {
  try {
    return JSON.parse(sessionStorage.getItem(clave)) ?? porDefecto
  } catch {
    return porDefecto
  }
}

function escribir(clave, valor) {
  try {
    if (valor == null) sessionStorage.removeItem(clave)
    else sessionStorage.setItem(clave, JSON.stringify(valor))
  } catch {
    // sin almacenamiento: el callback mostrará que no pudo validar el estado
  }
}

/** Paso 1: la aplicación arma la dirección del IAM con un `state` de un solo uso. */
export function urlDeAutorizacion() {
  const state = azar()
  escribir(CLAVE_ESTADO, state)
  const q = new URLSearchParams({ client_id: CLIENT_ID, redirect_uri: RUTA_CALLBACK, response_type: 'code', state })
  return `${RUTA_IAM}?${q}`
}

/**
 * Paso 2, del lado del IAM: valida usuario y contraseña. Devuelve la dirección
 * de vuelta con un `code` de un solo uso, o un error para mostrar en el IAM.
 */
export function autenticarEnIam({ username, password, redirect_uri, state }) {
  const cuenta = CUENTAS.find((c) => c.username === String(username).trim().toLowerCase())
  if (!cuenta || password !== CLAVE_MAQUETA) return { error: 'Usuario o contraseña incorrectos.' }
  const code = azar()
  escribir(CLAVE_CODIGOS, { ...leer(CLAVE_CODIGOS, {}), [code]: cuenta.username })
  return { destino: `${redirect_uri}?${new URLSearchParams({ code, state })}` }
}

/** El IAM devuelve a la aplicación sin sesión porque la persona canceló. */
export const urlDeCancelacion = (redirect_uri, state) => `${redirect_uri}?${new URLSearchParams({ error: 'access_denied', state })}`

/**
 * Paso 3: la aplicación valida el `state` y canjea el `code` (los dos son de
 * un solo uso). Devuelve `{ claims }` o `{ error }` con un motivo.
 */
export function canjearCodigo({ code, state, error }) {
  const esperado = leer(CLAVE_ESTADO, null)
  escribir(CLAVE_ESTADO, null)
  if (!esperado || state !== esperado) return { error: 'estado' }
  if (error) return { error: 'cancelado' }
  const codigos = leer(CLAVE_CODIGOS, {})
  const username = codigos[code]
  delete codigos[code]
  escribir(CLAVE_CODIGOS, codigos)
  const cuenta = CUENTAS.find((c) => c.username === username)
  if (!cuenta) return { error: 'codigo' }
  const { sub, email, role, region_id } = cuenta
  return { claims: { sub, username, email, role, app_id: CLIENT_ID, region_id } }
}

/** Paso 4: el perfil sale solo del rol que el IAM asignó para esta aplicación. */
export const perfilDeClaims = (claims) => PERFIL_POR_ROL[claims?.role] ?? null

/** La persona de la nómina que corresponde a la cuenta del IAM. */
export const nominaDeClaims = (claims) => CUENTAS.find((c) => c.sub === claims?.sub)?.nomina ?? null
