// Junta dist-pagina/ en un único HTML autocontenido (dist-pagina/maqueta.html),
// en el formato de contenido que publica claude.ai: título y estilos primero,
// sin etiquetas <html>, <head> ni <body> propias.
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const dir = 'dist-pagina'
const html = readFileSync(join(dir, 'index.html'), 'utf8')
const leer = (ruta) => readFileSync(join(dir, ruta.replace(/^\//, '')), 'utf8')

const css = [...html.matchAll(/<link rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g)].map((m) => leer(m[1])).join('\n')
const js = [...html.matchAll(/<script type="module"[^>]*src="([^"]+)"[^>]*><\/script>/g)].map((m) => leer(m[1])).join('\n')
const titulo = html.match(/<title>.*?<\/title>/)[0]
const cabeza = html.match(/<head>([\s\S]*?)<\/head>/)[1]
const cuerpoConScripts = html.match(/<body>([\s\S]*?)<\/body>/)[1]
const cuerpo = cuerpoConScripts.replace(/<script[\s\S]*?<\/script>/g, '').trim()
// Los scripts clásicos en línea (sin atributos) de index.html: el tema antes de pintar, en
// <head>, y la «Vista celular», en <body>. Hasta el 25-11-2026 se descartaban y la página
// publicada salía sin los dos.
const enLinea = (bloque) => [...bloque.matchAll(/<script>[\s\S]*?<\/script>/g)].map((m) => m[0]).join('\n')
const scriptsCabeza = enLinea(cabeza)
const scriptsCuerpo = enLinea(cuerpoConScripts)
const esquemaDeColor = cabeza.match(/<meta name="color-scheme"[^>]*>/)?.[0] ?? ''
if (!scriptsCabeza || !scriptsCuerpo || !esquemaDeColor) {
  throw new Error('index.html ya no trae el tema antes de pintar, la Vista celular o el meta color-scheme: revise scripts/pagina.mjs')
}

const salida = `${titulo}
<style>
${css}
</style>
${cuerpo}
<script type="module">
${js.replace(/<\/script/gi, '<\\/script')}
</script>
`
writeFileSync(join(dir, 'maqueta.html'), salida)
console.log('maqueta.html', (salida.length / 1024 / 1024).toFixed(1), 'MB')

// Versión para GitHub Pages: documento HTML completo (dist-pagina/github-pages/index.html).
import { mkdirSync } from 'node:fs'
mkdirSync(join(dir, 'github-pages'), { recursive: true })
const completo = `<!doctype html>
<html lang="es-CL">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="robots" content="noindex, nofollow" />
<meta name="description" content="Maqueta de validación del sistema de reservas de casas de veraneo del Servicio de Bienestar de CONAF. Datos ficticios." />
${esquemaDeColor}
${titulo}
${scriptsCabeza}
<style>
${css}
</style>
</head>
<body>
${cuerpo}
<script type="module">
${js.replace(/<\/script/gi, '<\\/script')}
</script>
${scriptsCuerpo}
</body>
</html>
`
writeFileSync(join(dir, 'github-pages', 'index.html'), completo)
console.log('github-pages/index.html', (completo.length / 1024 / 1024).toFixed(1), 'MB')
