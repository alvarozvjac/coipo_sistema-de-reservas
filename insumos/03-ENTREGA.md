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
los afiliados/as no ingresan). La encargada regional registra en su región y aprueba lo
que el encargado nacional registra en ella; al aprobarse, la persona recibe una ficha con
acompañantes, direcciones e inventario; ambos consultan la disponibilidad de todo el país.

## En una frase, qué NO hace

No administra las casas de huéspedes, ni cobra en línea, ni registra check-in/check-out,
ni sanciona usuarios; en la maqueta, correos, nóminas y el inicio de sesión del COIPO IAM
son simulados.

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

## Cumplimiento del estándar de la fábrica

Revisado el 2026-11-12 contra `coipo_master_produccion` @ `7f67bcd` y `coipo_jueces` @
`1bd9ad5`: detalle regla por regla en `fuente/docs/CUMPLIMIENTO-FABRICA.md`.

- **Interfaz:** se corrigió lo que bloquea (tema oscuro con los valores del estándar, foco
  como token, movimiento reducido completo, título del banner en la zona medida, banner
  corto en teléfono, focos suprimidos). `j13` sale OK con 3 comprobaciones (antes no podía
  evaluar el tema oscuro) y axe-core no encuentra violaciones AA en claro ni en oscuro.
  Quedan como aviso: tamaños literales de Tailwind (UI-7), cortes de Tailwind (UI-17) y
  áreas de toque dentro de tablas y gráficos (UI-18).
- **Código:** la maqueta no cumple `ESTANDAR_CODIGO.md` (JavaScript, sin capas, tres
  archivos sobre 800 líneas). No se reescribe: la aplicación sembrada nace en TypeScript y
  hexagonal; el informe dice qué partes pasan tal cual al dominio.
- **Ingreso:** simulado con el COIPO IAM (rol y `region_id`); propuesta `iam.uso: activo`
  con roles `encargado_regional` y `encargado_nacional` [PENDIENTE: nombres, al preparar el
  alta].
- **Banner:** la maqueta usa el de la UIA; el de la gerencia queda como dice «Gerencia /
  banner» arriba.

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
