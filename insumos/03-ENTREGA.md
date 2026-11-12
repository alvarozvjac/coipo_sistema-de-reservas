# CON001 · Entrega a la fábrica

Fecha: 2026-11-02 · De: Álvaro Zegers · Para: Luis Monsalve
Maqueta aprobada: **ninguna todavía**. Versión en revisión:
https://alvarozvjac.github.io/coipo_sistema-de-reservas/ · Aprobó: [PENDIENTE, P1]

> Este archivo se deja preparado. **No se envía** mientras el test de abajo tenga
> `[FALTA]`.

## En una frase, qué hace

Permite que las encargadas regionales y el encargado nacional de Bienestar registren las
reservas y las postulaciones al sorteo de las 22 casas de veraneo a nombre de
funcionarios/as de CONAF, jubilados/as y funcionarios/as de otros servicios públicos,
según la disponibilidad y el reglamento, y que gestionen ocupación, inventario, cobros,
tarifas, casas y los sorteos de temporada alta (primera etapa, decisión del 12-11-2026:
los afiliados/as no ingresan).

## En una frase, qué NO hace

No administra las casas de huéspedes, ni cobra en línea, ni registra check-in/check-out,
ni sanciona usuarios; en la maqueta, correos, nóminas e IAM son simulados.

## Gerencia / banner

Servicio de Bienestar, que depende de la Gerencia de Desarrollo de las Personas
[VERIFICAR: dependencia, con la Jefatura del Servicio de Bienestar] → banner
`5_banner_DESARROLLO_PERSONAS` de `identidad/` (INFERIDO). La maqueta usa hoy una franja
CONAF · UIA propia, no el banner de la gerencia.

## Instrumentos de datos candidatos

Planilla oficial de inmuebles · resolución anual de tarifas (con el formato tipo de carga
que ya trae la maqueta) · parámetros del reglamento aprobado · nómina de afiliados/as ·
nómina de personal · formato de la nómina de descuentos de Remuneraciones. Ninguno tiene
muestra todavía (`01-SOLUCION.md`).

## Datos personales involucrados

RUT, nombre, correo y teléfono de solicitantes; nombre, edad y relación de quienes
viajan; credencial de perro de asistencia (sensible); descuentos por persona. Todos
`[VERIFICAR]` con Fiscalía o el encargado/a de protección de datos (P8).

## Pendientes abiertos (con persona)

Ver la tabla de `00-PROBLEMA.md` (P1 a P10) y «Por confirmar con Bienestar» en
`fuente/docs/DECISIONES.md`. Todos tienen persona a quien preguntar.

## Lo que el estándar de interfaz no trajo, o en que la maqueta se aparta

Leído `identidad/ESTANDAR_UI.md` @ `0853a0e` (2026-10-30). La maqueta no está sembrada,
así que nada de esto la bloquea; sí lo tendrá que resolver la aplicación sembrada:

- Verde de interfaz `#185530` (botones, enlaces) en vez del institucional `#064928`
  (UI-2).
- Letra del sistema en vez de Instrument Sans / Fraunces / JetBrains Mono (enmienda del
  2026-10-24).
- Tamaños, espacios y radios escritos con clases de Tailwind, no con la capa de tokens
  (UI-7).
- Sin tema oscuro (UI-3 y UI-10 no se pueden evaluar en oscuro).
- El título sobre la franja se ubica con un porcentaje del contenedor (UI-1 lo prohíbe);
  desde 1024 px la imagen ocupa todo el ancho y el texto cae en el campo plano, pero no se
  comprobó con `verificar-titulo.ts`.
- Estados de error, aviso e información con colores propios: el estándar declara que no
  tiene color de estado (§7, hueco 2).
- Cumple: viewport sin bloqueo de zoom (UI-16), `prefers-reduced-motion` global (UI-15),
  anillo de foco único (UI-10 en claro), sin scroll horizontal a 390 px (UI-20).

## Lo que este tramo NO decidió (para Luis)

Dominio (existe `reserva-bienestar.conaf.cl`, hoy servido sin código correspondiente, según
`AGENTS.md` §1) · puerto · arquitectura · registro en IAM · nombre del repositorio de
producción (`coipo_cabania` u otro) · qué hacer con lo que corre hoy en producción.

## Test de entrega (objetivo 0 de la fábrica)

Leído como Luis, solo con estos cuatro archivos, el 2026-11-02:

- [OK] Qué hace en una frase.
- [OK] Qué NO hace en una frase.
- [OK] Instrumentos de datos identificados (sin muestras; cada uno con dueño y
  `[PENDIENTE]`).
- [OK] Cada pendiente con persona.
- [FALTA] Aprobación trazable de quien decide: no se sabe quién aprueba (P1) y no hay
  aprobación de la maqueta nueva → objetivo 6.
- [FALTA] Verificación de la maqueta en local y en Pages: la versión vigente no se miró en
  la URL pública → objetivo 5, repetir contra la URL.
- [OK] Código fuente versionado en `fuente/` de este repositorio (decisión de Álvaro
  Zegers, 02-11-2026); compila desde cero y la batería de pruebas pasa sobre esa
  compilación.
- [FALTA] Problema confirmado por la contraparte y escala con número (reservas por año) →
  objetivo 1 (P2, P3).
- No comprobado: teléfono real, lectores de pantalla, Firefox y Safari.
