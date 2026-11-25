// Imprime fuente/docs/manual/manual.html a PDF con Chrome (playwright-core, canal «chrome»).
//
// Uso: npm run manual:pdf  (o `npm run manual` para capturar e imprimir de una vez)
// Deja el PDF en fuente/frontend/public/manual-usuario.pdf, que es el que enlaza la maqueta,
// y una copia idéntica en la raíz del repositorio, la que sirve GitHub Pages.
import { chromium } from 'playwright-core'
import { copyFileSync, existsSync, statSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join } from 'node:path'

const AQUI = dirname(fileURLToPath(import.meta.url))
const FUENTE = join(AQUI, '..', '..', '..', 'docs', 'manual', 'manual.html')
const PDF = join(AQUI, '..', '..', 'public', 'manual-usuario.pdf')
const RAIZ = join(AQUI, '..', '..', '..', '..', 'manual-usuario.pdf')

if (!existsSync(join(dirname(FUENTE), 'capturas', '01-ingreso.jpg'))) {
  console.error('Faltan las capturas: corra antes `npm run build && npm run manual:capturas`.')
  process.exit(1)
}

const navegador = await chromium.launch({ channel: 'chrome' })
const pagina = await navegador.newPage()
await pagina.goto(pathToFileURL(FUENTE).href, { waitUntil: 'load' })
const rotas = await pagina.evaluate(() => [...document.images].filter((i) => !i.complete || i.naturalWidth === 0).map((i) => i.getAttribute('src')))
if (rotas.length) {
  console.error('Imágenes que no cargaron:\n' + rotas.join('\n'))
  process.exit(1)
}
await pagina.pdf({
  path: PDF,
  format: 'A4',
  printBackground: true,
  preferCSSPageSize: true,
  displayHeaderFooter: true,
  headerTemplate: '<span></span>',
  footerTemplate:
    '<div style="font:8px Segoe UI,system-ui,sans-serif;color:#5d5a55;width:100%;padding:0 16mm;display:flex;justify-content:space-between">' +
    '<span>Casas de Veraneo · Manual de usuario · Servicio de Bienestar · CONAF</span>' +
    '<span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>',
})
await navegador.close()
copyFileSync(PDF, RAIZ)
console.log('manual-usuario.pdf', (statSync(PDF).size / 1024 / 1024).toFixed(1), 'MB')
