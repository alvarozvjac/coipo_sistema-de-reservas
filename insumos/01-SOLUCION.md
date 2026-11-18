# CON001 · Red de Casas Bienestar (casas de veraneo) · Solución propuesta

Fecha: 2026-11-02, actualizada el 2026-11-12 · Versión de maqueta: https://alvarozvjac.github.io/coipo_sistema-de-reservas/
@ `38662a8` · Fuente: `fuente/` de este repositorio (React 19 + Vite + Tailwind, sin
backend), decisiones en `fuente/docs/DECISIONES.md` · Manual de usuario:
`manual-usuario.pdf` en este repositorio.

> **Cambio de alcance (2026-11-12, decisión de Bienestar comunicada por Álvaro Zegers).**
> La primera etapa se implementa solo con la encargada regional y el encargado nacional
> (nuevo nombre de Oficina Central). Los afiliados/as no ingresan al sistema: los
> encargados registran sus reservas, con una declaración que reemplaza la
> aceptación de la persona. Las funciones del perfil Mantenimiento UIA pasan al encargado
> nacional (pestaña «Administración»). Los criterios que antes ejecutaba el solicitante
> los ejecuta ahora el encargado que registra (`fuente/docs/DECISIONES.md`).

## Qué hace (una frase)

Permite que las encargadas regionales y el encargado nacional de Bienestar registren, por
orden de llegada y solo si hay disponibilidad, las reservas que les piden para las 22 casas
de veraneo a nombre de funcionarios/as de CONAF, jubilados/as y funcionarios/as de otros
servicios públicos, según el reglamento, y que gestionen ocupación, inventario, cobros,
tarifas y casas.

## Qué NO hace (una frase + lista)

No administra las casas de huéspedes ni procesa pagos, correos o datos reales: es una
maqueta sin backend.

- Casas solo de huéspedes (fuera de alcance desde la decisión de octubre de 2026).
- En la marcha blanca (etapa 1), el ingreso de los afiliados/as (2026-11-12) y las temporadas
  altas con sorteo: todas las fechas se registran por orden de llegada. Desde el 2026-11-18
  ambas cosas vuelven en la etapa 2, que el encargado nacional abre en Configuración.
- Ingreso de jubilados/as y de funcionarios/as de otros servicios públicos: también en la
  etapa 2 piden la reserva a la encargada.
- Pago en línea: el pago es por planilla o por transferencia que el encargado nacional registra.
- Envío real de correos (simulado) y el COIPO IAM real: en la maqueta el inicio de sesión del IAM está simulado.
- Integración con las nóminas de afiliados y de personal, IAM o ClaveÚnica (simulado).
- Persistencia: todo queda en el navegador de quien usa la maqueta (localStorage).
- Check-in y check-out registrados por la encargada (solicitud, req. 16): hoy el acta se
  devuelve por correo. [PENDIENTE: confirmar con la Jefatura del Servicio de Bienestar].
- Bloqueo de usuarios y sanciones (solicitud, req. 25 a 27). [PENDIENTE: decidir si entra
  en la primera iteración, con la Jefatura del Servicio de Bienestar].
- Administración (usuarios, nóminas, parámetros): solo se muestra lo que tendrá, en la
  pestaña del encargado nacional.
- Mapa interactivo en la ficha (solicitud, req. 3): hoy es un enlace a un mapa externo.
- Encuestas de satisfacción y reportes exportables en PDF (el dashboard exporta CSV).

## Iteración mínima

Reserva de casas de veraneo, con confirmación según disponibilidad,
registrada por un encargado, descuento por planilla o transferencia registrada por el
encargado nacional, comprobante y acta
de entrega por correo, panel de la encargada regional (llegadas, salidas, reservas,
inventario) y nómina mensual de descuentos en CSV. INFERIDO: es lo que reemplaza el flujo
actual por correo y planillas. El sorteo de temporada alta quedó fuera (decisión
2026-11-12).

## Perfiles

| Perfil | Dispositivo | Momento de uso | Qué necesita decidir |
|---|---|---|---|
| Beneficiario/a (afiliado/a, plazo fijo, no afiliado/a, jubilado/a, otro servicio público) | No ingresa en la marcha blanca (desde 2026-11-12) | Pide la reserva a su encargada, por cualquier vía (teléfono, correo, en persona, WhatsApp) | Qué casa y qué fechas, quiénes van, cómo paga; recibe la ficha de la reserva por correo |
| Trabajador/a de CONAF (afiliado/a, no afiliado/a, plazo fijo), etapa 2 | Celular o computador (INFERIDO) | Cuando planifica sus vacaciones | Qué casa y qué fechas están libres, quiénes van, cómo paga; ver y desistir de sus reservas |
| Encargada regional | Computador de oficina (INFERIDO) | Jornada laboral, varias veces por semana | Quién llega y sale, qué casa necesita mantención; registrar las reservas y desistimientos que le piden |
| Encargado nacional (antes Oficina Central) | Computador de oficina (INFERIDO) | Cierre mensual de descuentos, cambios de tarifa | Qué se descuenta, qué pagos registrar, tarifas, casas; reservas de todo el país; configuración del sistema |

## Pantallas

| Pantalla | Perfil | Decisión que permite | Criterios |
|---|---|---|---|
| Ingreso con el COIPO IAM (simulado) | Encargados | Entrar; a cualquier otra persona se le indica que pida su reserva a la encargada | C1 |
| Comprobante de la reserva | Encargados | Ver estado, direcciones, datos de transferencia y si se registró, y la ficha; registrar el desistimiento | C2, C6, C7, C8, C19, C21, C30 |
| Panel (antes Inicio) | Encargado nacional (país); la encargada regional ya no tiene Panel desde el 13-11-2026 y entra a Reservas | Ver de un vistazo lo que pide acción hoy: transferencias por registrar, reservas recientes, llegadas y salidas, inventario | C22, C30 |
| Reservas: tablero de ocupación + listado (fusiona Reservas y Disponibilidad) | Encargada, encargado nacional | Ver la ocupación por casa y noche en una o todas las regiones, elegir un tramo libre y registrarlo, o abrir una reserva para gestionarla | C10, C19, C20, C23 |
| Registrar reserva (panel lateral en Reservas) | Encargada, encargado nacional | Registrar lo que la persona pidió, solo si hay disponibilidad, sin perder de vista la ocupación y viendo antes sus antecedentes | C2 a C7, C23, C25 |
| Configuración › Casas › otras direcciones | Encargado nacional | Mantener las direcciones que salen en la ficha | C21 |
| Inventario | Encargada regional | Actualizar el inventario que va en la ficha | C10 |
| Cobros | Encargado nacional (la encargada regional ya no tiene Cobros desde el 13-11-2026) | Ver el panel de descuentos por mes (planilla, transferencias recibidas y pendientes), registrar las transferencias que llegan, informar la nómina y registrar devoluciones | C6, C11, C30, C31 |
| Configuración › Casas, Tarifas, Bloqueos de fechas | Encargado nacional | Retirar casas, actualizar tarifas, bloquear fechas | C12, C13, C14 |
| Configuración › Usuarios y encargadas | Encargado nacional | Saber quién entra y con qué rol (se cambia en el IAM) | C26 |
| Configuración › Parámetros | Encargado nacional | Cambiar un parámetro del reglamento desde una fecha y con respaldo (incluye las veces por mes en la misma casa) | C27, C32 |
| Configuración › Plantillas de correo | Encargado nacional | Ajustar lo que recibe la persona | C28 |
| Configuración › Actividad | Encargado nacional | Saber quién hizo qué y cuándo | C29 |
| Dashboard | Encargado nacional | Decidir sobre tarifas, mantenciones y oferta | C17 |
| Etapa (Configuración) | Encargado nacional | Elegir marcha blanca o abierto a trabajadores, desde una fecha y con respaldo | C33 |
| Reservar (inicio del trabajador) | Trabajador/a, etapa 2 | Elegir región y casa; ver su próxima reserva | C34 |
| Ficha de la casa con calendario | Trabajador/a, etapa 2 | Elegir fechas libres; ver total, equipamiento y condiciones | C34 |
| Mis reservas y comprobante | Trabajador/a, etapa 2 | Ver sus reservas, la ficha y desistir | C35 |
| Postular al sorteo | Trabajador/a, etapa 2 | Elegir casa y turno libre de una temporada alta; ver prioridad y forma de pago | C36 |
| Registrar postulación | Encargada regional, encargado nacional, etapa 2 | Registrar la postulación que pide una persona (por ejemplo, jubilada) | C37 |
| Temporadas y sorteo | Encargado nacional, etapa 2 | Definir temporadas, habilitar la postulación, ver la demanda, realizar el sorteo, gestionar lista de espera y vacantes | C37 |

## Criterios de aceptación

Todos con datos ficticios de la maqueta. Cada uno tiene una prueba automática
(Playwright) que se corre en computador (1366 px) y en teléfono (390 × 844); la tabla de
correspondencia está en `02-RASTRO.md`.

- **C1 · Ingreso con el COIPO IAM (decisiones 12-11-2026).** Dada la cuenta `cnunez` del
  IAM con el rol `encargado_regional` y `region_id` 05, cuando ingresa con su contraseña,
  entonces entra al inicio de la Región de Valparaíso; con una contraseña equivocada el IAM
  muestra «Usuario o contraseña incorrectos»; y dada la cuenta `mfuentes`, sin rol en esta
  aplicación, el sistema muestra «Su cuenta no tiene acceso a esta aplicación» y no abre
  sesión.
- **C2 · Reserva con planilla.** Dada la encargada que registra una reserva para la
  afiliada con fechas libres en diciembre, cuando elige 2 noches, descuento por planilla en
  2 cuotas, marca que la persona autorizó el descuento y hace la declaración, entonces ve
  «¡Reserva confirmada!» con un código R-2026-NNNN y el estado «Confirmada».
- **C3 · Una reserva por mes (Art. 7) — sin vigencia desde el 13-11-2026; la reemplaza
  C32.**
- **C4 · Otro servicio público (Art. 9).** Dado un funcionario de otro servicio público,
  cuando el encargado abre el calendario para registrarle una reserva, entonces solo puede elegir llegadas dentro de 15 días y paga
  solo por transferencia.
- **C5 · Sin temporadas (decisión 12-11-2026).** Dada una persona sin reserva en enero y
  una casa libre en enero de 2027, cuando el encargado la registra, entonces se confirma
  como cualquier otra fecha: no hay sorteo, postulación ni noches cerradas.
- **C6 · Transferencia (decisión 13-11-2026, 15:00; reemplaza el «por confirmar» del
  02-11-2026).** Dada una reserva de 2 noches por transferencia para un funcionario de otro
  servicio público, cuando el encargado la registra, entonces queda «Confirmada», se envían
  la ficha y los datos de la cuenta (RUT 61.313.000-4, cuenta 500-04) con la glosa del
  código, y la transferencia queda por registrar; cuando un encargado registra el N° de
  operación, queda a su nombre y la ficha no se reenvía.
- **C7 · Reserva asistida.** Dada la encargada regional, cuando busca a María por RUT y
  reserva a su nombre declarando que se lo pidió, entonces el comprobante dice «a nombre de
  María», «Registrada por» y la declaración del encargado (desde el 12-11-2026 ya no queda
  pendiente de aceptación de la persona).
- **C8 · Desistimiento (Art. 10, práctica del 06-11-2026).** Dada una reserva que empieza
  en 26 días, cuando el encargado registra el desistimiento que la persona le pidió,
  entonces el sistema indica «sin costo»; con menos de 10 días hábiles, cobra la estadía
  completa.
- **C10 · Encargada regional.** Dada la encargada de Valparaíso, cuando abre su inicio,
  entonces ve llegadas y salidas de hoy y mañana, la ocupación de 4 semanas y las reservas
  nuevas de 7 días, sin botones para confirmar.
- **C11 · Nómina de descuentos.** Dado el mes con descuentos, cuando el encargado nacional
  descarga la nómina, entonces obtiene un CSV y puede marcarla «Informada a
  Remuneraciones».
- **C12 · Carga de tarifas por planilla.** Dado el formato tipo descargado, cuando se
  sube con un ID 999 y un monto «mucho», entonces el sistema muestra «No existe una casa con
  ID 999» y «no es un monto», y no aplica nada; con 3 tarifas válidas (una con +100%),
  avisa la variación y aplica las 3 al confirmar, dejando registro en el historial.
- **C13 · Retirar una casa.** Dada una casa con 2 reservas futuras y una estadía en curso,
  cuando el encargado nacional la retira con un motivo, entonces se anulan las 2 reservas
  futuras con aviso, la estadía en curso sigue y la casa figura «Retirada».
- **C14 · Bloqueo de fechas.** Dada una casa con reservas en las fechas elegidas, cuando
  se bloquea por mantención, entonces se advierte qué reservas se anularán y se anulan al
  confirmar.
- **C17 · Dashboard.** Dado el período «año a la fecha», cuando el encargado nacional abre el
  dashboard, entonces ve usuarios, reservas, noches, ocupación, ingresos y anticipación,
  sin indicadores de confirmación manual.
- **C19 · Sin aprobación (decisión 13-11-2026; reemplaza la aprobación del 12-11-2026).**
  Dada una reserva con planilla que el encargado nacional registra en el Departamento Viña
  del Mar, cuando la guarda, entonces queda «Confirmada», se envía la ficha y ni el
  detalle, ni el comprobante, ni la ficha muestran «Aprobada por» ni un botón «Aprobar».
- **C20 · Consulta y región (decisión 12-11-2026, ajustado por el rediseño).** Dada la
  encargada de Valparaíso, cuando en Reservas elige «Todo el país» y toca una noche libre
  de Toconao, entonces la selección dice «Solo consulta» y no ofrece registrar; y cuando
  vuelve a Valparaíso y toca el 14 y luego el 16-12-2026 de una casa libre, ve «3 noches»
  y «Registrar reserva» la lleva al registro con esa casa y esas fechas.
- **C21 · Ficha y direcciones (decisión 12-11-2026).** Dado el Departamento Viña del Mar con
  su estacionamiento en «6 Norte 1045, Viña del Mar», cuando se registra una reserva con
  planilla, entonces la ficha PDF trae el solicitante, quienes viajan, la dirección
  principal, el estacionamiento, el inventario y el acta de ingreso y salida.
- **C22 · Menú de la encargada (decisión 13-11-2026, 15:27; reemplaza su Panel de control
  del 12-11-2026).** Dada la encargada de Valparaíso, cuando entra, entonces llega a Reservas
  y su menú tiene solo «Reservas» e «Inventario»; las direcciones antiguas de su Panel y de
  Cobros la llevan a Reservas. El Panel nacional sigue mostrando transferencias por
  registrar, llegadas de hoy y mañana y ocupación de 30 días.
- **C23 · Vía de la solicitud (decisión 12-11-2026, tarde).** Dado un registro de reserva
  sin vía elegida, cuando el encargado pulsa «Confirmar reserva», entonces ve «Indique por
  qué vía le pidió la reserva» y no se registra; con «Teléfono» elegido, la vía queda en la
  reserva, en el detalle, en el listado y en la ficha («a pedido de la persona (teléfono)»).
- **C25 · Antecedentes de la persona (decisión 12-11-2026, tarde).** Dada una persona con una
  reserva en diciembre con la transferencia sin registrar, cuando la encargada escribe su RUT
  en el registro, entonces antes del formulario ve «Ya tiene una reserva en diciembre 2026» y
  «transferencia sin registrar», y la lista de sus reservas de los últimos 12 meses.

- **C26 · Usuarios y encargadas (decisión 12-11-2026).** Dado el IAM con `cnunez`
  (encargada de Valparaíso), `pherrera` (nacional) y `mfuentes` (sin rol), cuando el
  nacional abre la pestaña, entonces ve a los tres con su rol y que `mfuentes` no entra, y no
  hay botones para editar roles (desde el 13-11-2026 no hay tabla de quién aprueba).
- **C27 · Parámetros con vigencia (decisión 12-11-2026).** Dado «Aviso para desistir sin
  costo» en 10 días hábiles, cuando el nacional lo cambia a 7 desde el 01-12-2026 sin
  respaldo, entonces no se guarda; con respaldo, queda programado y hasta esa fecha rige 10;
  al anularlo queda tachado en el historial. Un cambio de la hora de ingreso a 16:00 desde
  hoy rige de inmediato y sale en la plantilla de la ficha.
- **C28 · Plantillas de correo (decisión 12-11-2026).** Dado el asunto de la ficha con
  `{nombr}`, cuando el nacional intenta guardar, entonces ve «No existe la variable {nombr}»
  y el botón queda deshabilitado; con un asunto válido se guarda y el historial de una
  reserva muestra el correo con el asunto nuevo.
- **C29 · Actividad (decisión 12-11-2026).** Dado que el nacional cambió un parámetro y una
  plantilla, cuando abre Actividad, entonces ve ambas acciones a su nombre; al filtrar por
  «Reservas» desaparecen, y «Descargar CSV» entrega el archivo.

- **C30 · Sin efectivo (decisión 13-11-2026, 15:00).** Dado un afiliado jubilado, cuando el
  encargado nacional abre el registro, entonces la única forma de pago es «Transferencia
  electrónica» (no aparece «Efectivo»); en Cobros › Transferencias por registrar, con el
  N° de operación «TRF-123456», la transferencia queda a nombre de quien la registró.
- **C31 · Panel de descuentos (decisión 13-11-2026).** Dado el encargado nacional, cuando
  abre Cobros, entonces ve por mes el descuento por planilla, las transferencias recibidas,
  las pendientes y el total de todo el país; al registrar una transferencia con N° de
  operación, queda a su nombre y entra al reporte de cobranza (CSV) con quién la registró y
  el N°. La encargada regional no tiene Cobros (13-11-2026, 15:27).

- **C32 · Misma casa por mes (decisión 13-11-2026, 15:59; reemplaza C3).** Dado el parámetro
  «Veces que una persona puede reservar la misma casa en el mes» en 1 y una persona con
  R-2026-0195 en Rocas de Santo Domingo con llegada el 2 de diciembre de 2026, cuando el
  encargado nacional intenta registrarla en esa casa del 20 al 22-12-2026, entonces ve «Ya
  reservó esta casa una vez en diciembre 2026 (R-2026-0195)» y no se registra; en noviembre
  en esa casa, o en diciembre en otra casa, sí se puede (ya no rige una reserva por mes); y
  con el parámetro cambiado a 2 desde hoy, la misma casa en diciembre sí se puede.

- **C33 · Selector de etapa (decisión 18-11-2026).** Dado el encargado nacional en marcha
  blanca, cuando en Configuración › Etapa elige «Abierto a trabajadores» desde hoy con un
  respaldo, entonces el Panel muestra «Etapa 2», Usuarios muestra a `mfuentes` como
  Trabajador/a y la Actividad registra el cambio; sin respaldo no se guarda; un cambio a
  futuro se puede anular; y al volver a «Marcha blanca», `mfuentes` ya no entra.
- **C34 · El trabajador reserva (decisión 18-11-2026).** Dada la etapa 2, cuando `mfuentes`
  ingresa con el IAM, entonces llega a «Reservar» con su menú (Reservar, Mis reservas), elige
  Rocas de Santo Domingo y dos noches libres en el calendario (que no muestra quién ocupa),
  y al confirmar sin aceptar el reglamento ve «Debe aceptar el reglamento»; con la
  autorización del descuento y la aceptación, la reserva queda «Confirmada» a su nombre, con
  vía «Aplicativo», sin «Registrada por» y con la ficha enviada.
- **C35 · Mis reservas (decisión 18-11-2026).** Dada esa reserva, cuando la abre desde Mis
  reservas y desiste, entonces queda «Desistida» por la titular (Actividad: «Desistió desde
  el aplicativo»); y si escribe la dirección de una reserva ajena o de una pantalla de
  encargados, no la ve.

- **C36 · Temporadas con sorteo en la etapa 2 (decisión 18-11-2026).** Dada la marcha
  blanca, cuando la encargada registra a Nora en Rocas de Santo Domingo del 12 al 14-01-2027,
  entonces no aparece ningún aviso de sorteo y el menú del nacional no tiene «Temporadas»;
  abierta la etapa 2, el nacional ve «Temporadas» con el verano 2027 en postulación, y
  `mfuentes` ya no puede reservar esas fechas («se asigna por sorteo»), ve la temporada
  marcada en el calendario y postula a un turno libre de esa casa con descuento por planilla
  (6 cuotas desde marzo 2027); la ve en Mis reservas, la retira y vuelve a postular.
- **C37 · Postulación registrada y sorteo (decisión 18-11-2026).** Dada la etapa 2, cuando
  la encargada usa «Registrar postulación» para la RUT de Nora (jubilada), entonces queda a
  nombre de Nora, por transferencia y registrada por la encargada; y cuando el nacional
  realiza el sorteo, queda la semilla y quién lo hizo, cada turno adjudicado tiene su reserva
  confirmada con ficha, las de planilla van en 6 cuotas desde marzo y marzo 2027 aparece en
  el panel de descuentos; `mfuentes` ve su resultado en Mis reservas.

## Instrumentos de datos candidatos para la fábrica

| Instrumento | Muestra en | Dueño | Observación |
|---|---|---|---|
| Planilla oficial de inmuebles | [PENDIENTE] | Servicio de Bienestar | Hoy la maqueta tiene `frontend/src/datos/casas.js`, derivado del anexo de la solicitud |
| Resolución anual de tarifas | [PENDIENTE] | Servicio de Bienestar | La maqueta ya trae el formato tipo de carga (`lib/planillaTarifas.js`): columnas ID casa, Casa, Región, Tarifa vigente, Nueva tarifa |
| Reglamento de casas de veraneo (parámetros) | Proyecto fuente, `lib/reglas.js` (`PARAMETROS`) | Servicio de Bienestar | Plazos, anticipación, horarios, cuotas; [VERIFICAR] versión aprobada |
| Nómina de afiliados/as | [PENDIENTE] | Servicio de Bienestar | Define calidad, región y correo de cada persona |
| Nómina de personal de CONAF | [PENDIENTE] | Gerencia de Personas | Plazo fijo y no afiliados |
| Formato de la nómina de descuentos | [PENDIENTE] | Remuneraciones | Hoy CSV con separador «;» |

## Datos personales y Ley 21.719

| Dato | Finalidad | ¿Evitable/agregable? | Estado |
|---|---|---|---|
| RUT, nombre, correo, teléfono del solicitante | Identificar, comunicar, cobrar | No evitable | [VERIFICAR: base de licitud] |
| Nombre, edad y relación de quienes viajan | Capacidad (Art. 14) y responsabilidad | Edad podría ser tramo; nombre por exigencia del Anexo A | [VERIFICAR] |
| Credencial de perro de asistencia | Acreditar el ingreso del perro (Art. 15) | Podría verificarse sin guardar el archivo | [VERIFICAR: dato sensible] |
| Datos de otros servicios públicos | Reserva y cobro | No evitable | [VERIFICAR] |
| Descuentos por persona | Nómina para Remuneraciones | No evitable | [VERIFICAR] |
| Dashboard | Toma de decisiones | Agregado (sin personas) | Construido agregado |

## Fuera de alcance / iteraciones posteriores

Casas de huéspedes; sanciones y bloqueo de usuarios; check-in y check-out en el sistema;
pago en línea; mapa interactivo; encuestas; perfil de Mantenimiento UIA. Motivo: no los pide el reglamento de octubre o
quedan sujetos a decisión de Bienestar (ver pendientes de `00-PROBLEMA.md`).
