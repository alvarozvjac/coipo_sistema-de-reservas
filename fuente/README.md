# Fuente de coipo_sistema-de-reservas — Reservas de Casas de Veraneo · Bienestar CONAF

Maqueta funcional del sistema de reservas de las casas de veraneo del Servicio de
Bienestar de CONAF, desarrollada por la Unidad de Información y Análisis (UIA). React 19,
Vite y Tailwind 4, sin backend: todo ocurre en el navegador.

Reemplaza a la maqueta anterior (`coipo_cabania`), que se usó solo como referencia
de datos, fotos y reglas. Rige el **Reglamento General de Uso de Casas de Veraneo o
Descanso (propuesta de actualización, octubre 2026)**. Cómo probarla, perfil por perfil,
está en el `README.md` de la raíz.

## Estado

| Paso | Perfil | Estado |
|---|---|---|
| 0 | Ingreso con el COIPO IAM simulado (`client_id`, `state`, canje del `code`; el perfil sale del rol) | Construido |
| 1 | Encargada regional: Reservas (tablero de ocupación del país, registro en panel lateral en su región, desistimientos) e Inventario | Construido |
| 2 | Encargado nacional: Panel, Reservas, Cobros (descuentos por planilla y transferencias) y Configuración (etapa, casas y direcciones, tarifas, bloqueos, usuarios, parámetros, plantillas y actividad) | Construido |
| 3 | Etapa 2: trabajadores que reservan a su nombre, y temporadas altas con postulación y sorteo | Construido |
| 4 | Backend, base de datos y despliegue | Lo hace la fábrica (ver `docs/CUMPLIMIENTO-FABRICA.md`) |

## Cómo ejecutarla

Requiere Node.js 20.19 o superior (lo pide Vite 8).

```powershell
cd frontend
npm install
npm run dev            # http://localhost:5173
npm run lint           # oxlint con las reglas del Zen de la semilla (COD-5)
npm run build:pagina   # página única para GitHub Pages
npm run manual         # capturas (Chrome instalado, fecha fija 25-11-2026) y PDF del manual
```

El manual de usuario se escribe en `docs/manual/manual.html`; sus capturas, en
`docs/manual/capturas/`, las toma `scripts/manual/capturar.mjs`, e `imprimir.mjs` deja el PDF
en `frontend/public/` y en la raíz del repositorio. Usa `playwright-core` con el canal
`chrome`: no descarga navegadores.

En la pantalla de ingreso, «Ingresar con COIPO IAM» abre el IAM simulado: se elige una
cuenta de prueba (contraseña «maqueta»). **«Reiniciar datos de prueba»**, en el pie,
vuelve los datos al estado inicial.

`npm run build:pagina` deja `frontend/dist-pagina/github-pages/index.html`, que se copia al
`index.html` de la raíz. `scripts/pagina.mjs` lleva a esa página los scripts en línea de
`index.html` (el tema antes de pintar y la «Vista celular») y se detiene si faltan.

## Estructura

```
frontend/src/
  datos/        servicio.js (imita la futura API; guarda en localStorage), iam.js (IAM simulado),
                usuarios.js (nómina de demostración), semillas.js y semillasTemporadas.js (estado
                inicial), casas.js, inventarios.js, temporadas.js, etapa.js, configuracion.js,
                antecedentes.js
  lib/          reglas.js (reglamento y parámetros), sorteo.js, ficha.js (PDF de la ficha),
                planillaTarifas.js, csv.js, fechas.js, formato.js, guardar.js, tema.js
  componentes/  plantilla, banner, tema, calendario, tablero, panel, gráficos y elementos comunes
  paginas/      Ingreso.jsx, iam/ (IAM simulado y callback), gestion/ (reservas, registro, cobros),
                encargada/ (inventario), central/ (panel, casas, tarifas, temporadas, sorteo,
                configuración), trabajador/ (etapa 2)
docs/DECISIONES.md           alcance, decisiones tomadas y puntos por confirmar
docs/CUMPLIMIENTO-FABRICA.md revisión contra coipo_master_produccion
```

## Datos de prueba

Todos los datos son de demostración y siguen `docs/DATOS_DE_PRUEBA.md` de la fábrica
desde el 25-11-2026: las personas con nombre usan los RUT de prueba de Clave Única
(11.111.111-1 a 88.888.888-8), las generadas llevan el dígito verificador incorrecto a
propósito, los correos terminan en `.invalid` y los teléfonos en `+56 9 0000 NNNN`. Fotos
de stock (`src/assets/fotos/CREDITS.md`) y tarifas del llamado de verano 2027. Nada sale
del navegador.
