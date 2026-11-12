# Cumplimiento del estándar de coipo_master_produccion

Revisión del 12-11-2026, pedida por Álvaro Zegers (UIA). Alcance acordado: **se corrige la
interfaz** según `identidad/ESTANDAR_UI.md` y **se informa** la brecha con
`docs/ESTANDAR_CODIGO.md`, sin reescribir el código. Es insumo para la fase en que Luis
Monsalve lleve la iniciativa a la fábrica.

Fuentes leídas (VERIFICADO): `coipo_master_produccion` @ `7f67bcd` (2026-11-11):
`AGENTS.md`, `identidad/ESTANDAR_UI.md` (§6 tabla de reglas, §8 móvil),
`semilla/ESQUELETO/frontend/src/estilos/interfaz.css` y `tokens.css`,
`componentes/BannerInstitucional.*`, `componentes/BotonTema.tsx`, `dominio/tema.ts`,
`adaptadores/salida/iam/identidad_local.py`, `registro-iam/README.md`,
`prompts/15-registrar-en-el-iam.md`, `docs/ESTANDAR_CODIGO.md`. Jueces:
`coipo_jueces` @ `1bd9ad5` (2026-10-27).

## 1. Lo que dicen los jueces

**Sobre el repositorio tal cual** (`correr.py --modo advisory --perfil aplicacion`):

| Juez | Veredicto | Detalle |
|---|---|---|
| `j08` | HALLAZGOS | **G8-8** (BLOQUEA): `.gitignore` no ignora `/.env`. **Corregido.** |
| `j09` | HALLAZGOS | **G8-4** (AVISA): el mismo `.env`. **Corregido.** |
| `j02` | OK | — |
| `j01`, `j06`, `j11` | SIN_EVALUAR | no hay `docker-compose.yml` ni `/health`: es una maqueta sin backend. **No es un aprobado.** |
| `j12`, `j13`, `j14`, `j16` | NO_APLICA | no hay `.semilla`: el repositorio no declara seguir la fábrica |

**Sobre una copia que declara `adopta: interfaz`** (para ver qué dirían `j13` y `j16`;
la copia no se publica):

| Juez | Antes de corregir | Después |
|---|---|---|
| `j13` interfaz | OK en 2 comprobaciones; **SIN_EVALUAR el tema oscuro** («ninguna hoja declara `[data-theme=oscuro]` ni `prefers-color-scheme: dark`») | OK en 3 comprobaciones |
| `j16` código | AVISA `COD-1` × 3 | AVISA `COD-1` × 3 (sin cambio: no se reescribe) |

`j16` no evaluó `COD-2` ni `COD-3`: busca `frontend/package.json` en la raíz y aquí el
frontend vive en `fuente/frontend/` (VERIFICADO en `jueces/j16_codigo.py`, líneas 220-231).
Que no los marcara **no** significa que se cumplan (sección 3).

## 2. Interfaz: regla por regla

Estados: **Cumple** (VERIFICADO con la medición que se indica), **Corregido** (no cumplía y
se arregló en esta revisión), **Brecha** (no cumple y queda para la fábrica), **No
aplica**.

| Regla | Severidad | Estado | Cómo se comprobó |
|---|---|---|---|
| UI-1 texto sobre el banner, sin caja, en la zona del título | BLOQUEA | **Corregido** | Antes se ubicaba en el 29 % del *contenedor*; ahora en el 28,86 % (píxel 875 de 3032) del ancho *pintado* de la imagen, como la semilla. Medido a 1024, 1366 y 1920 px: el texto empieza en el borde de la zona (336, 394 y 554 px) y termina muy antes de su fin. Bajo 1024 px no se muestra |
| UI-2 verde institucional `#064928` | BLOQUEA | Cumple | `--color-banner` |
| UI-3 todo color de texto, borde o foco se redefine en los dos temas | BLOQUEA | **Corregido** | No había tema oscuro. Se agregó, con los valores de superficie, fondo y verde derivado del estándar, y el botón «Tema: Sistema / Claro / Oscuro» (misma clave `coipo_tema` que la semilla) |
| UI-4 el paso derivado para oscuro es un token | AVISA | **Corregido** | el oscuro redefine las mismas variables; no hay parches por selector |
| UI-5 sin texto sobre el remate `#5e8f19` | BLOQUEA | Cumple | el texto termina antes de la zona del remate |
| UI-6 operativo sin escalas display | AVISA | Cumple | no se usan |
| UI-7 sin literales de tamaño, espaciado ni radio | AVISA | **Brecha** | 259 tamaños de letra literales (`text-[15px]` 130, `text-[13px]` 115…). Es Tailwind arbitrario: se resuelve al migrar a los tokens `--f-*`, `--e-*`, `--r-*` |
| UI-8 una sola curva de movimiento | AVISA | **Corregido** | la curva del estándar se aplica a todas las transiciones |
| UI-9 ocho estados; nunca `outline:0` sin reemplazo | AVISA / BLOQUEA | **Corregido** lo que bloquea | se quitaron cuatro `outline-none` (campos, filtros y gráficos) que dejaban el foco con un anillo de 1,6:1 o sin anillo. Los ocho estados por componente no se inventariaron (brecha menor) |
| UI-10 el foco es un token y cumple 3:1 en los dos temas | BLOQUEA | **Corregido** | `--foco-color`: `#2f7d4a` en claro (5,06:1 sobre blanco) y `#4fb37a` en oscuro (5,57:1 sobre la superficie) |
| UI-11 estado de carga | AVISA | No aplica en la maqueta | no hay red; aparecerá con el backend |
| UI-12 estado vacío editorial | AVISA | Cumple, INFERIDO | listas vacías con frase explicativa; no se revisaron todas |
| UI-13 ningún estado sólo por color | BLOQUEA | Cumple | estados con etiqueta de texto; el calendario tacha las noches no disponibles |
| UI-14 chip de estado 4,5:1 en texto | BLOQUEA | Cumple | axe-core 4.10, contraste en 14 pantallas por tema: 0 fallas en claro; en oscuro 1 (un contador con `opacity-70`), **corregido**, y luego 0 |
| UI-15 movimiento reducido apaga todo | BLOQUEA | **Corregido** | la regla anterior apagaba transiciones y animaciones, no el desplazamiento; ahora es la de la semilla |
| UI-16 viewport sin `maximum-scale` | BLOQUEA | Cumple | `index.html` |
| UI-17 solo los cuatro cortes de §8.2, con `.98` | AVISA | **Brecha** | usa los cortes de Tailwind (`sm` 640, `md` 768, `lg` 1024, `xl` 1280; 128 usos). El banner sí usa 559,98 px |
| UI-18 área de toque ≥ 44 × 44 bajo puntero grueso | AVISA | **Corregido en parte** | navegación, cierre de sesión, salto al contenido y chips de filtro llegan a 44 px en pantallas táctiles. Quedan bajo 44 filas y enlaces dentro de tablas y barras de gráficos (medido a 320 px) |
| UI-19 nada sólo por *hover* | AVISA | Cumple, INFERIDO | los tooltips de gráficos también se abren con el foco |
| UI-20 sin scroll horizontal a 320 px | AVISA | **Corregido** | 13 pantallas a 320 px: solo Cobros desbordaba (337 px, sus pestañas); ahora desplazan en su contenedor. Las tablas anchas ya desplazaban en el suyo |
| Banner en teléfono | — (§8.2, `BannerInstitucional`) | **Corregido** | bajo 560 px se usa el asset corto `9_banner_CONAF_UIA_corto.jpg`; alto mínimo 68 px y proporción natural en el resto |

Otras piezas de la semilla adoptadas: el **salto al contenido** («Saltar al contenido») y
`color-scheme` para que barras y desplegables nativos sigan el tema.

**Lo que no se verificó** (DESCONOCIDO): qué banner de gerencia corresponde. La maqueta usa
el de la UIA (`9_banner_CONAF_UIA`, idéntico byte a byte al de la fábrica); si Bienestar
debe llevar el de su gerencia, lo decide Luis Monsalve. Tampoco se verificó la tipografía
autoalojada de la semilla (`tipografia.css`): la maqueta usa la del sistema.

## 3. Código: brecha con `docs/ESTANDAR_CODIGO.md` (informe, sin cambios)

| Regla | Estado | Medición (VERIFICADO) |
|---|---|---|
| COD-1 ningún archivo sobre 1000 líneas; sobre 800, aviso | **Brecha menor** | Ninguno pasa de 1000 desde el 12-11-2026 (se separaron las semillas de `datos/servicio.js` a `datos/semillas.js`). Sobre 800, aviso: `datos/servicio.js` 976, `datos/casas.js` 979 (dato), `paginas/central/Casas.jsx` 847 |
| COD-2 TypeScript estricto | **Brecha** | 44 archivos `.js`/`.jsx` y 0 `.ts`/`.tsx` en `src/`; no hay `tsconfig.json`; el CI no corre `tsc` |
| COD-3 hexagonal (dominio puro, puertos, adaptadores) | **Brecha parcial** | no hay `dominio/`, `aplicacion/` ni `adaptadores/`. Hay separación útil para migrar: `lib/reglas.js` y `lib/sorteo.js` son reglas puras; `datos/servicio.js` imita la API (es el futuro adaptador http); `datos/iam.js` imita el puerto de identidad |

**Por qué no se reescribe ahora.** La maqueta es la herramienta para conversar con
Bienestar; el producto lo construye la fábrica sembrando una aplicación nueva, que ya nace
en TypeScript y hexagonal. Reescribir la maqueta duplicaría ese trabajo.

**Lo que conviene a la fábrica** (propuesta para Luis Monsalve):

1. Sembrar `coipo_<nombre>` con `semilla/sembrar.py` y llevar desde la maqueta solo lo que
   ya está separado: `lib/reglas.js` → `dominio/reglas.ts`, `lib/indicadores.js` →
   `dominio/indicadores.ts`.
2. Partir `datos/servicio.js` por recurso (reservas, casas, cobros, inventario, configuración)
   como puertos de `aplicacion/puertos/` con su adaptador http.
3. `datos/casas.js` es dato (22 casas del llamado): va a `datos_prueba/` o a una migración
   SQL, no al código.
4. El ingreso: `iam.uso: activo`, con los roles `encargado_regional` y
   `encargado_nacional` y el atributo `region_id` ([PENDIENTE] confirmar nombres al
   preparar el alta con `registro-iam/preparar_alta.py`). En desarrollo, `IDENTIDAD=local`.
5. Observación para `coipo_jueces`: `j16` no mira un frontend que no está en
   `frontend/` de la raíz. En esta maqueta eso dejó `COD-2` y `COD-3` sin evaluar, y el
   resumen no lo dice (no aparece como SIN_EVALUAR).

## 4. Ingreso con el COIPO IAM (simulado)

Desde esta revisión la maqueta entra como entrará el producto (prompt 15 de la fábrica y
`IdentidadLocal` de la semilla):

1. «Ingresar con COIPO IAM» guarda un `state` de un solo uso y va a `/iam/autorizar` con
   `client_id=reservas-casas-veraneo` y `redirect_uri=/auth/callback`.
2. La pantalla del IAM, rotulada «Simulado en la maqueta», pide usuario y contraseña
   (cuentas ficticias `cnunez`, `pherrera` y `mfuentes`; contraseña «maqueta»).
3. `/auth/callback` valida el `state`, canjea el `code` una sola vez y recibe `sub`,
   `username`, `email`, `role`, `app_id` y `region_id`.
4. El perfil sale solo de `role`; la región de la encargada, de `region_id`. Una cuenta sin
   rol en esta aplicación ve «Su cuenta no tiene acceso a esta aplicación» y no queda
   sesión. Cancelar en el IAM y un `state` ajeno también terminan sin sesión.

Se quitaron el RUT, el nombre y el código por correo del ingreso. En la maqueta todo
ocurre en el navegador; en el producto el canje lo hace el backend (patrón BFF) y el token
no llega al navegador.

## 5. Cómo se verificó

- Batería Playwright `e2e14` (48 comprobaciones, incluye 9 nuevas del IAM y 5 del tema) en
  1366 × 900 y 390 × 844: 0 fallas. `e2e4` y `e2e9`: 0 fallas.
- axe-core 4.10.2, reglas WCAG 2.0/2.1/2.2 A y AA, 14 pantallas (ingreso, IAM y las de
  ambos perfiles), en tema claro y oscuro: 0 violaciones.
- Medición a 320 px de scroll horizontal y de áreas de toque en 13 pantallas.
- Capturas del ingreso, del IAM, del caso sin rol y del tema oscuro en escritorio y
  teléfono, miradas una por una.
