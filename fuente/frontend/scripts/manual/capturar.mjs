// Capturas del manual de usuario (fuente/docs/manual/capturas/).
//
// Uso: npm run build && npm run manual:capturas
// Levanta `vite preview` sobre dist/, recorre la maqueta con Chrome (playwright-core,
// canal «chrome»: usa el Chrome instalado, no descarga navegadores) con la fecha fija
// del 25-11-2026 y los datos de prueba recién sembrados, y guarda una captura JPEG por
// pantalla. Mismo código, misma fecha, mismas capturas.
import { chromium } from 'playwright-core'
import { preview } from 'vite'
import { mkdirSync, rmSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const AQUI = dirname(fileURLToPath(import.meta.url))
const SALIDA = join(AQUI, '..', '..', '..', 'docs', 'manual', 'capturas')
const FECHA = new Date('2026-11-25T10:00:00-03:00')
const PUERTO = 4179

const servidor = await preview({ preview: { port: PUERTO, strictPort: true, open: false }, logLevel: 'warn' })
const BASE = `http://localhost:${PUERTO}`
const navegador = await chromium.launch({ channel: 'chrome' })
const contexto = await navegador.newContext({ viewport: { width: 1366, height: 860 }, locale: 'es-CL', colorScheme: 'light' })
const pagina = await contexto.newPage()
await pagina.clock.setFixedTime(FECHA)
const errores = []
pagina.on('pageerror', (e) => errores.push(String(e)))

rmSync(SALIDA, { recursive: true, force: true })
mkdirSync(SALIDA, { recursive: true })

const ir = async (ruta) => {
  await pagina.goto(BASE + ruta)
  await pagina.waitForLoadState('networkidle')
}
const boton = (nombre) => pagina.getByRole('button', { name: nombre })

async function capturar(nombre) {
  await pagina.waitForTimeout(400)
  await pagina.screenshot({ path: join(SALIDA, `${nombre}.jpg`), type: 'jpeg', quality: 82 })
  console.log('  ', nombre)
}

async function salir() {
  await ir('/ingreso')
  await pagina.evaluate(() => {
    for (const k of Object.keys(localStorage)) if (k.includes('sesion')) localStorage.removeItem(k)
  })
}

async function entrar(usuario) {
  await salir()
  await ir('/ingreso')
  await boton(/Ingresar con COIPO IAM/).click()
  await pagina.locator('input[autocomplete="username"]').fill(usuario)
  await pagina.locator('input[type="password"]').fill('maqueta')
  await pagina.locator('form button[type="submit"]').click()
  // Una cuenta sin rol se queda en /auth/callback con el aviso: no se espera otra dirección.
  await pagina.waitForTimeout(1000)
}

// Datos de prueba desde cero y tema claro.
await ir('/ingreso')
await pagina.evaluate(() => localStorage.clear())

// 1. Ingreso
await ir('/ingreso')
await capturar('01-ingreso')
await boton(/Ingresar con COIPO IAM/).click()
await pagina.locator('input[autocomplete="username"]').fill('cnunez')
await capturar('02-iam')
await entrar('jpavez')
await capturar('03-sin-acceso')

// 2. Encargada regional
await entrar('cnunez')
await ir('/encargada/reservas')
await capturar('10-reservas-encargada')
await pagina.getByRole('heading', { name: /^Listado/ }).scrollIntoViewIfNeeded()
await pagina.mouse.wheel(0, -120)
await capturar('11-listado')
await ir('/encargada/reservas')
await boton(/Nueva solicitud/).click()
await capturar('12-registro-casa-fechas')
const panel = pagina.getByRole('dialog')
await panel.locator('select').first().selectOption({ index: 1 })
await panel.locator('input[type=date]').nth(0).fill('2027-02-08')
await panel.locator('input[type=date]').nth(1).fill('2027-02-11')
await panel.getByRole('radio', { name: /Funcionario\/a de CONAF/ }).click()
await panel.getByLabel('RUT de la persona').fill('11.111.111-1')
await panel.getByRole('button', { name: 'Buscar en la nómina' }).click()
await pagina.waitForTimeout(300)
await panel.getByRole('button', { name: 'Cambiar' }).first().scrollIntoViewIfNeeded()
await capturar('13-registro-persona')
await pagina.getByRole('heading', { name: '¿Quiénes van?' }).scrollIntoViewIfNeeded()
await capturar('14-registro-quienes')
await pagina.getByRole('heading', { name: '¿Cómo pagará?' }).scrollIntoViewIfNeeded()
await capturar('15-registro-pago')
await pagina.getByRole('heading', { name: 'Antes de enviar' }).scrollIntoViewIfNeeded()
await capturar('16-registro-enviar')
await ir('/gestion/reserva/R-2026-0195')
await capturar('17-ficha')
await ir('/encargada/inventario')
await capturar('18-inventario')

// 3. Encargado nacional
await entrar('pherrera')
await ir('/central')
await capturar('20-panel')
await ir('/central/reservas')
await capturar('21-reservas-nacional')
await ir('/central/cobros')
await capturar('22-cobros-descuentos')
await ir('/central/cobros?pestana=pagos')
await capturar('23-cobros-transferencias')
for (const [k, n] of [
  ['casas', '24-config-casas'],
  ['tarifas', '25-config-tarifas'],
  ['bloqueos', '26-config-bloqueos'],
  ['usuarios', '27-config-usuarios'],
  ['parametros', '28-config-parametros'],
  ['plantillas', '29-config-plantillas'],
  ['actividad', '30-config-actividad'],
  ['etapa', '31-config-etapa'],
]) {
  await ir(`/central/configuracion?pestana=${k}`)
  await capturar(n)
}
await boton('Cambiar de etapa').click()
await pagina.getByRole('dialog').locator('select').selectOption('abierta')
await pagina.getByLabel('Respaldo').fill('Memorándum de ejemplo')
await capturar('32-cambiar-etapa')
await boton('Guardar cambio').click()
await ir('/central/temporadas')
await capturar('33-temporadas')

// 4. Trabajador (etapa 2)
await entrar('mfuentes')
await ir('/trabajador')
await capturar('40-trabajador-inicio')
await ir('/trabajador/casa/1')
await capturar('41-trabajador-casa')
await ir('/trabajador/sorteo')
await capturar('42-trabajador-sorteo')
await ir('/trabajador/mis-reservas')
await capturar('43-trabajador-mis-reservas')

await navegador.close()
await servidor.close()
if (errores.length) {
  console.error('Errores de la página:\n' + errores.join('\n'))
  process.exit(1)
}
console.log('Capturas en', SALIDA)
