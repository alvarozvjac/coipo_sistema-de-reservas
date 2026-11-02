# CON001 · Red de Casas Bienestar (casas de veraneo) · Solución propuesta

Fecha: 2026-11-02 · Versión de maqueta: https://alvarozvjac.github.io/coipo_sistema-de-reservas/
@ `38662a8` · Fuente: proyecto `coipo_reserva_veraneo` (React 19 + Vite + Tailwind, sin
backend), decisiones en su `docs/DECISIONES.md` · Manual de usuario:
`manual-usuario.pdf` en este repositorio.

## Qué hace (una frase)

Permite que funcionarios/as de CONAF, jubilados/as y funcionarios/as de otros servicios
públicos reserven en línea las 30 casas de veraneo de Bienestar según la disponibilidad y
el reglamento, y que las encargadas regionales y Oficina Central gestionen ocupación,
inventario, cobros, tarifas, casas y el sorteo de temporada alta.

## Qué NO hace (una frase + lista)

No administra las casas de huéspedes ni procesa pagos, correos o datos reales: es una
maqueta sin backend.

- Casas solo de huéspedes (fuera de alcance desde la decisión de octubre de 2026).
- Pago en línea: el pago es por planilla o por transferencia que Oficina Central registra.
- Envío real de correos y del código de ingreso (simulado: se muestra en pantalla).
- Integración con las nóminas de afiliados y de personal, IAM o ClaveÚnica (simulado).
- Persistencia: todo queda en el navegador de quien usa la maqueta (localStorage).
- Check-in y check-out registrados por la encargada (solicitud, req. 16): hoy el acta se
  devuelve por correo. [PENDIENTE: confirmar con la Jefatura del Servicio de Bienestar].
- Bloqueo de usuarios y sanciones (solicitud, req. 25 a 27). [PENDIENTE: decidir si entra
  en la primera iteración, con la Jefatura del Servicio de Bienestar].
- Perfil «Mantenimiento UIA»: solo se muestra lo que tendrá.
- Mapa interactivo en la ficha (solicitud, req. 3): hoy es un enlace a un mapa externo.
- Encuestas de satisfacción y reportes exportables en PDF (el dashboard exporta CSV).

## Iteración mínima

Reserva de casas de veraneo fuera de temporada alta, con confirmación según disponibilidad,
descuento por planilla o transferencia registrada por Oficina Central, comprobante y acta
de entrega por correo, panel de la encargada regional (llegadas, salidas, reservas,
inventario) y nómina mensual de descuentos en CSV. INFERIDO: es lo que reemplaza el flujo
actual por correo y planillas; [PENDIENTE: confirmar con la Jefatura del Servicio de
Bienestar si el sorteo de temporada alta debe estar en la primera puesta en marcha].

## Perfiles

| Perfil | Dispositivo | Momento de uso | Qué necesita decidir |
|---|---|---|---|
| Solicitante (afiliado/a, plazo fijo, no afiliado/a, jubilado/a, otro servicio público) | Teléfono o computador personal (INFERIDO) | Al planificar vacaciones, a veces desde fuera de la oficina | Qué casa y qué fechas, quiénes van, cómo paga; si postula al sorteo |
| Encargada regional | Computador de oficina (INFERIDO) | Jornada laboral, varias veces por semana | Quién llega y sale hoy y mañana, qué casa necesita mantención, cómo ayudar a quien no reserva por su cuenta |
| Oficina Central | Computador de oficina (INFERIDO) | Cierre mensual de descuentos, temporadas, cambios de tarifa | Qué se descuenta, qué pagos registrar, tarifas, casas retiradas, temporadas y sorteo |
| Mantenimiento UIA | Computador | Soporte | Usuarios, nóminas y parámetros (no construido) |

## Pantallas

| Pantalla | Perfil | Decisión que permite | Criterios |
|---|---|---|---|
| Ingreso (RUT + código) | Todos | Entrar con el perfil que corresponde al RUT | C1 |
| Buscar casa (solo región) | Solicitante | Elegir casa | C2 |
| Ficha y calendario de la casa | Solicitante | Elegir fechas válidas | C2, C3, C4, C5 |
| Reservar: quiénes van y pago | Solicitante, encargada, Oficina Central | Registrar personas y forma de pago | C2, C6, C7 |
| Comprobante / detalle de la reserva | Todos | Ver estado, transferir, descargar acta, aceptar reglamento | C2, C6, C7 |
| Mis reservas | Solicitante | Desistir, ver postulación | C8 |
| Temporadas (verano e invierno) | Solicitante | Ver qué temporada tiene la postulación abierta y postular a una casa y un turno | C9, C18 |
| Inicio, Reservas, Inventario | Encargada regional | Preparar llegadas y salidas, actualizar inventario | C10 |
| Reservar para otra persona | Encargada, Oficina Central | Reservar a pedido | C7 |
| Inicio nacional, Cobros | Oficina Central | Registrar pagos, informar la nómina | C6, C11 |
| Casas y tarifas (Casas, Tarifas, Bloqueos de fechas) | Oficina Central | Retirar casas, actualizar tarifas, bloquear fechas | C12, C13, C14 |
| Temporadas (temporadas altas y sorteo de cada una) | Oficina Central | Definir temporadas, habilitar la postulación, realizar el sorteo | C15, C16, C18 |
| Dashboard | Oficina Central | Decidir sobre tarifas, mantenciones y oferta | C17 |

## Criterios de aceptación

Todos con datos ficticios de la maqueta. Cada uno tiene una prueba automática
(Playwright) que se corre en computador (1366 px) y en teléfono (390 × 844); la tabla de
correspondencia está en `02-RASTRO.md`.

- **C1 · Ingreso.** Dado el RUT ficticio de la afiliada María (13.457.902-1), cuando
  ingresa el código de 6 dígitos, entonces entra al buscador con el saludo «Hola, María»; y
  si escribe «000000», ve «El código no coincide».
- **C2 · Reserva con planilla.** Dada la afiliada con fechas libres en diciembre, cuando
  elige 2 noches, descuento por planilla en 2 cuotas y acepta el reglamento, entonces ve
  «¡Reserva confirmada!» con un código R-2026-NNNN y el estado «Confirmada».
- **C3 · Una reserva por mes (Art. 7).** Dada una afiliada con una reserva que empieza en
  noviembre, cuando intenta otra con llegada en noviembre, entonces el sistema no la deja y
  cita el Art. 7.
- **C4 · Otro servicio público (Art. 9).** Dado un funcionario de otro servicio público,
  cuando abre el calendario, entonces solo puede elegir llegadas dentro de 15 días y paga
  solo por transferencia.
- **C5 · Temporada alta.** Dada una temporada alta guardada (verano 2027: 2 de enero a 27
  de febrero), cuando un solicitante abre enero en el calendario, entonces esas noches no
  se pueden reservar directo, salvo los turnos vacantes después del sorteo.
- **C6 · Transferencia por confirmar (decisión 02-11-2026).** Dado un funcionario de otro
  servicio público que reserva 2 noches por transferencia, cuando confirma, entonces ve
  «Reserva por confirmar» con los datos de la cuenta (RUT 61.313.000-4, cuenta 500-04) y la
  glosa con el código; y cuando Oficina Central registra el pago con el N° de operación,
  entonces la reserva pasa a «Confirmada» y se registran el comprobante y el acta.
- **C7 · Reserva asistida.** Dada la encargada regional, cuando busca a María por RUT y
  reserva a su nombre declarando que se lo pidió, entonces el comprobante dice «a nombre de
  María», «Registrada por» y queda pendiente de aceptación del reglamento.
- **C8 · Desistimiento (Art. 10).** Dada una reserva que empieza en 26 días, cuando la
  persona desiste, entonces el sistema indica «sin costo»; con menos de 7 días, cobra una
  noche.
- **C9 · Postulación al sorteo.** Dada la postulación de verano abierta, cuando la
  afiliada postula a una casa y un turno, entonces ve su postulación con estado
  «Postulada»; y un funcionario de otro servicio público no puede postular.
- **C10 · Encargada regional.** Dada la encargada de Valparaíso, cuando abre su inicio,
  entonces ve llegadas y salidas de hoy y mañana, la ocupación de 4 semanas y las reservas
  nuevas de 7 días, sin botones para confirmar.
- **C11 · Nómina de descuentos.** Dado el mes con descuentos, cuando Oficina Central
  descarga la nómina, entonces obtiene un CSV y puede marcarla «Informada a
  Remuneraciones».
- **C12 · Carga de tarifas por planilla.** Dado el formato tipo descargado, cuando se
  sube con un ID 999 y un monto «mucho», entonces el sistema muestra «No existe una casa con
  ID 999» y «no es un monto», y no aplica nada; con 3 tarifas válidas (una con +100%),
  avisa la variación y aplica las 3 al confirmar, dejando registro en el historial.
- **C13 · Retirar una casa.** Dada una casa con 2 reservas futuras y una estadía en curso,
  cuando Oficina Central la retira con un motivo, entonces se anulan las 2 reservas
  futuras con aviso, la estadía en curso sigue y la casa figura «Retirada».
- **C14 · Bloqueo de fechas.** Dada una casa con reservas en las fechas elegidas, cuando
  se bloquea por mantención, entonces se advierte qué reservas se anularán y se anulan al
  confirmar.
- **C15 · Nueva temporada.** Dado el formulario de temporada con llegada 08-07-2028 y
  salida 25-07-2028 (sábado), cuando se intenta crear, entonces el sistema la rechaza
  porque no completa turnos enteros; con salida 22-07-2028 crea 2 turnos y la temporada
  queda con la «Postulación no habilitada».
- **C16 · Sorteo.** Dadas las postulaciones de verano, cuando Oficina Central realiza el
  sorteo, entonces cada turno con postulantes queda adjudicado a una persona, el resto en
  lista de espera, y se registra la semilla.
- **C17 · Dashboard.** Dado el período «año a la fecha», cuando Oficina Central abre el
  dashboard, entonces ve usuarios, reservas, noches, ocupación, ingresos y anticipación,
  sin indicadores de confirmación manual.
- **C18 · Habilitar la postulación (decisión 02-11-2026).** Dada la temporada «Vacaciones
  de invierno 2027» con la postulación no habilitada, cuando el solicitante abre
  «Temporadas», entonces la ve como «Postulación aún no habilitada»; y cuando Oficina
  Central pulsa «Habilitar postulación», entonces la temporada queda «Postulación abierta»
  hasta el 21-05-2027, el solicitante puede postular con código P-I27-NNNN y la
  postulación aparece en «Mis reservas».

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
