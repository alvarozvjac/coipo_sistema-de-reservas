# CON001 · Rastro

Fechas tomadas de los correos y de `date` (zona America/Santiago). Personas de Bienestar
nombradas por cargo (repositorio público).

## Objetivo en curso: 6 (validar con la contraparte)

Los objetivos 0 a 2 tienen pendientes abiertos con persona (`00-PROBLEMA.md`). El 3 está
escrito (`01-SOLUCION.md`) y falta acordarlo. El 4 y el 5 están hechos sobre la versión
`a4cff06` (02-11-2026). El 6 está bloqueado: no hay
aprobación trazable de quien decide.

## Entrevistas y reuniones

- 2026-07-24 · Álvaro Zegers, entonces Jefe de Sección Administración de Bienestar ·
  correo a 15 personas de la red de Bienestar · Aviso de mantención de las «planillas de
  reserva de las casas de Veraneo y de Huéspedes». Evidencia del proceso actual.
- 2026-07-27 · Jefatura del Servicio de Bienestar → UIA · correo · Envía la «Solicitud de
  desarrollo» (julio de 2026) tras una reunión con la UIA. Abre P2 y P3.
- 2026-08-12 · Profesional UIA a cargo entonces → Bienestar · correo · Comparte la maqueta
  preliminar (`reserva-bienestar.conaf.cl/catalogo`) y un formulario de levantamiento.
- 2026-08-18 · Bienestar → UIA · correo · Responde el formulario y reenvía la solicitud.
- 2026-08-25 · Bienestar y UIA · reunión presencial · Revisión de siguientes pasos (sin
  acta en este repositorio).
- 2026-08-27 · UIA → Bienestar · correo · Maqueta funcional anterior (GitHub Pages).
- 2026-09-14 · Jefatura del Servicio de Bienestar · correo · 11 observaciones a la maqueta
  anterior: tarifa sindicato, acompañantes dentro de la capacidad sin cobro adicional,
  tarifa de temporada alta y baja, a quién llegan las consultas, bloqueo de fechas
  mientras se confirma, separar casas de veraneo y de huéspedes, estado «Por confirmar»,
  descuento por planilla, perfil externo sin motivo, gestión central de solicitudes.
  Pendiente de revisar contra la maqueta nueva: tarifa sindicato y tarifa por temporada
  (no están en el reglamento de octubre) → P10.
- 2026-09-28 · Jefatura del Servicio de Bienestar · correo · «revisamos y estamos
  conforme a las observaciones» (sobre la maqueta anterior, no sobre esta).
- 2026-10-02 · Jefatura del Servicio de Bienestar · correo · Tres énfasis para el comité:
  transparencia de las reservas, más uso de las casas con imágenes, flujo transparente y
  eficiente.
- 2026-10-05 · Comité (sala SECOM) · presentación de la propuesta por la UIA y Bienestar
  (sin acta en este repositorio) → P1.
- 2026-10-06 · Álvaro Zegers (ya en la UIA) → Jefatura del Servicio de Bienestar ·
  correo · Maqueta versión 1 para revisión de formato, funcionalidades, perfiles e
  inmuebles.
- 2026-10-16 · Jefatura del Servicio de Bienestar → Álvaro Zegers · correo · Envía el
  reglamento con «una pequeña modificación». Profesionales de la Sección Administración
  de Bienestar informan que la maqueta versión 1 queda en blanco al ingresar.
- 2026-10-20 · Álvaro Zegers → Bienestar · correo · Nueva maqueta
  (`alvarozvjac.github.io/coipo_sistema-de-reservas`) y cinco puntos a validar:
  confirmación automática, formas de pago, sorteo, reserva asistida y tarifas, fechas y
  correos.
- 2026-10-30 · Reunión «Reservas Bienestar - UIA» (Bienestar y UIA) · Google Meet ·
  resultado no registrado → P9.
- 2026-11-04 · Reunión programada con Bienestar para revisar la propuesta (borrador de
  invitación con los cambios del 02-11, preparado el 2026-11-02).
- 2026-11-06 · Jefatura del Departamento de Bienestar del Personal · Memorándum N°
  6188/2026 (Cero Papel) · Llamado a postular a las casas en vacaciones de verano 2027,
  con formulario Google. Álvaro Zegers lo entrega como evidencia del proceso actual e
  indica que verano e invierno se operan igual. Documento interno: no se guarda en este
  repositorio público (su lista de distribución tiene nombres de funcionarios).
- 2026-11-12 · Bienestar (transmitido por Álvaro Zegers) · La primera etapa de la
  implementación será solo con la encargada regional y el encargado de oficina central,
  ahora llamado encargado nacional; las funciones de Mantenimiento UIA pasan al encargado
  nacional; se deshabilita la reserva directa de los afiliados/as.

## Decisiones

- 2026-11-12 · Módulo de registro de reservas: la encargada regional registra solo en su
  región; lo que registra el nacional lo aprueba la encargada de la región de la casa (con
  fechas apartadas); al aprobar se envía una ficha única (reemplaza comprobante y acta) con
  acompañantes, direcciones e inventario; con transferencia, la ficha sale con el pago;
  consulta de disponibilidad nacional (buscador y calendario); direcciones ficticias de
  ejemplo y editables · Álvaro Zegers · detalle en `fuente/docs/DECISIONES.md`.
  [PENDIENTE: quién aprueba en regiones sin encargada; direcciones reales; si las
  postulaciones también se restringen por región.]

- 2026-11-12 · El ingreso se simula con el COIPO IAM: el perfil y la región salen del rol
  y de `region_id`; se quitan el RUT y el código · Álvaro Zegers. [PENDIENTE: nombres de
  roles, con Luis Monsalve al preparar el alta.]
- 2026-11-12 · Alcance de «cumplir el estándar de la fábrica»: se corrige la interfaz
  (UI-1 a UI-20) y se informa la brecha de código sin reescribir; se corren los jueces ·
  Álvaro Zegers · `fuente/docs/CUMPLIMIENTO-FABRICA.md`.

- 2026-11-12 · Solo encargados en la primera etapa: los afiliados/as no ingresan; el
  encargado registra reservas, postulaciones al sorteo y desistimientos; su declaración
  reemplaza la aceptación de la persona; Mantenimiento UIA pasa a la pestaña
  «Administración» del encargado nacional, igual de básica · Álvaro Zegers, a partir de lo
  planteado por Bienestar · detalle en `fuente/docs/DECISIONES.md`. [PENDIENTE: Bienestar
  confirma si la declaración del encargado basta frente al Art. 27.]

Todas las decisiones de diseño, con su fecha y fuente, están en `fuente/docs/DECISIONES.md`. Las que cambiaron el producto:

- 2026-10 · Producto nuevo; `coipo_cabania` solo como referencia · Álvaro Zegers · la
  maqueta anterior era recargada y poco simple.
- 2026-10-20 · Solo casas de veraneo; rige el reglamento de octubre; confirmación
  automática; ingreso con RUT y código; otros servicios públicos reservan con 15 días;
  sorteo de temporada alta; reserva asistida · Álvaro Zegers (propuesta) · validación de
  Bienestar [PENDIENTE, P10].
- 2026-11-02 · Carga masiva de tarifas (pantalla o planilla Excel/CSV), retiro de casas
  separado de los bloqueos, temporadas configurables por Oficina Central · Álvaro Zegers.
- 2026-11-02 · Pago por transferencia: reserva «por confirmar» hasta que Oficina Central
  registra el pago · Álvaro Zegers.
- 2026-11-02 · Un sorteo por temporada (verano o invierno); la postulación se abre solo
  cuando Oficina Central la habilita; pestaña «Temporadas» · Álvaro Zegers.
- 2026-11-02 · El código fuente se versiona en `fuente/` de este repositorio · Álvaro
  Zegers.
- 2026-11-06 · La maqueta sigue la práctica vigente del Memorándum 6188/2026 donde el
  reglamento propuesto dice otra cosa: turnos de 6 noches en dos calendarios, tarifa en
  dos tramos por grado, desistimiento sin costo hasta 10 días hábiles antes (después se
  paga la estadía completa), 6 cuotas desde marzo en temporada alta, y las 22 casas del
  llamado · Álvaro Zegers · detalle en `fuente/docs/DECISIONES.md`.
- 2026-11-06 · El formulario de postulación de la maqueta deja de pedir correo, región,
  RUT y nombre (salen del ingreso y la nómina) · Álvaro Zegers.
- 2026-11-13 · Sin aprobación: lo registrado queda confirmado. Jubilados/as y otros
  servicios pueden pagar en efectivo (confirmada, con el pago pendiente); el efectivo lo
  registra la encargada (su región) o el encargado nacional, con recibo; Cobros muestra por
  mes planilla, efectivo recibido y pendiente · Álvaro Zegers · detalle en
  `fuente/docs/DECISIONES.md`.
- 2026-11-13 · Parámetro «veces que una persona puede reservar la misma casa en el año»:
  1 por año calendario, cuentan vigentes y realizadas, al llegar al límite no se registra ·
  Álvaro Zegers.
- 2026-11-13 · Sin efectivo: el pago de quienes no tienen planilla es por transferencia
  electrónica; la reserva queda confirmada con la transferencia pendiente (se quita «Por
  confirmar»); la registran la encargada (su región) o el nacional; el panel de descuentos
  muestra planilla, transferencias recibidas y pendientes · Álvaro Zegers.
- 2026-11-13 · La encargada regional queda sin Panel ni Cobros: entra a Reservas y solo el
  encargado nacional registra transferencias · Álvaro Zegers.
- 2026-11-13 · El límite de la misma casa pasa a ser por mes calendario de la llegada (1) y
  reemplaza la regla de una reserva por mes del Art. 7 · Álvaro Zegers.
- 2026-11-13 · Tarifas por noche en un carril horizontal de tarjetas (4 a la vista), con la
  nueva tarifa dentro de la tarjeta · Álvaro Zegers.
- 2026-11-18 · El cliente no quería quitar que los afiliados reserven: marcha blanca con
  encargados y, después, etapa 2 con los trabajadores de CONAF. Se hacen las dos etapas con un
  selector; en la etapa 2 reservan los trabajadores y vuelven las temporadas con sorteo ·
  Álvaro Zegers, transmitiendo lo que explicó el cliente.
- 2026-11-02 · Insumos en este repositorio público, con cargos en vez de nombres de
  Bienestar · Álvaro Zegers eligió el repositorio; el criterio de nombres es de esta
  documentación (regla 8 de la metodología).

## Verificación de la maqueta

Estándar leído: `coipo_master_produccion/identidad/ESTANDAR_UI.md` @ `0853a0e`
(2026-10-30). La maqueta no está sembrada (no tiene `.semilla`), así que el estándar no la
obliga (§1-bis); las diferencias quedan para Luis en `03-ENTREGA.md`.

- 2026-11-02 · local (página única servida en `localhost`, y `vite preview`) · fuente
  versionada en `fuente/` desde el 02-11-2026 ·
  - Capturas de viewport miradas: 15 vistas por tamaño (ingreso y cada pestaña de
    Afiliada, Otro servicio público, Encargada regional y Oficina Central) en teléfono
    390 × 844 y escritorio 1440 × 960. El contenido principal empieza en y = 213 en el
    teléfono (la cabecera ocupa un cuarto de la primera pantalla) y en y = 149 en
    escritorio. La navegación de Oficina Central en el teléfono se desplaza de lado y
    corta «Dashboard» (es la pista de que hay más). Sin tema oscuro.
  - Criterios recorridos: C1 a C18 con pruebas automáticas (Playwright), en escritorio
    1366 × 900 y en teléfono 390 × 844 con toque: 163 comprobaciones en cada tamaño, 0
    fallas (corrida final del 02-11-2026, sobre el código publicado en `a4cff06`).
  - Consola: 0 errores en las 30 vistas.
  - Barrido de datos: 10 RUT y 6 correos `@conaf.cl`, todos de la nómina ficticia de la
    maqueta (inventados, no se cruzaron con una nómina real); 0 apellidos de las personas
    de los correos de esta iniciativa (una coincidencia dentro de una imagen en base64,
    falso positivo).
- 2026-11-02 · pública · https://alvarozvjac.github.io/coipo_sistema-de-reservas/ @
  `7a7ad92` · el SHA-256 de lo servido coincide con el `index.html` del commit; captura
  de escritorio en el navegador del usuario sin errores de consola; las vistas de
  teléfono se hicieron con los mismos bytes servidos localmente (el navegador no se pudo
  achicar).
- 2026-11-02 · pública @ `38662a8` y @ `a4cff06` · despliegues de GitHub Pages
  terminados con éxito (GitHub Actions, 21:37 y 21:53 UTC). **No los comprobé en un
  navegador**: el computador del usuario no respondió y este entorno no llega a
  `github.io`.
- Defectos vistos el 2026-11-02:
  - «Bloquear fechas» dejaba la pantalla en blanco (variable sin definir tras una edición
    del mismo día). Visto al correr las pruebas en teléfono; arreglado; se activó la regla
    `no-undef` del linter para que no vuelva.
  - En el teléfono, el resultado de una reserva («Reserva por confirmar») abría a mitad de
    página. Captura antes y después en el scratchpad de la sesión; arreglado volviendo
    arriba al cambiar de página.
  - Desborde horizontal de 663 px en el teléfono en Temporadas y Casas por un texto
    oculto para lectores de pantalla dentro de una tabla desplazable; arreglado.
  - Al habilitar una temporada sin sorteo anterior la página fallaba (prioridad sin
    sorteo previo); arreglado.
- No comprobado: teléfono real; lectores de pantalla; Firefox y Safari; las versiones
  `38662a8` y `a4cff06` vistas en la URL pública.
- 2026-11-03 · pública · https://alvarozvjac.github.io/coipo_sistema-de-reservas/ @
  `3e75e92` · el SHA-256 de lo servido coincide con el `index.html` del commit. En el Chrome
  del usuario (versión actual) la pantalla queda en blanco al primer cambio de página
  («TypeError: l is not a function» en la consola). Causa: el efecto que vuelve arriba
  (`useEffect(() => window.scrollTo(...))`, del 02-11) devolvía el resultado de
  `scrollTo`, que en el Chrome actual es una promesa; React la llamaba como función de
  limpieza. Las pruebas no lo vieron porque el Chromium de Playwright devuelve `undefined`.
  Reproducido en local imitando ese `scrollTo` (versión publicada: 1 de 3 cambios de página
  y pantalla vacía; versión corregida: 3 de 3 sin errores). Corregido con llaves en el
  efecto (`736e5d8`). Batería completa imitando el Chrome actual: escritorio y teléfono
  390 × 844, 0 fallas.
- 2026-11-03 · pública @ `736e5d8` · SHA-256 de lo servido coincide con el commit. En el
  Chrome del usuario: reserva de afiliada con descuento por planilla (confirmada al
  instante), regla de una reserva por mes, reserva de jubilado por transferencia («Reserva
  por confirmar» con datos de la transferencia), registro del pago en Cobros (la reserva
  pasa a confirmada), las cinco pestañas de Oficina Central y las tres de la encargada
  regional; 0 errores de consola. No comprobado en la URL pública: vista de teléfono (la
  ventana no se pudo achicar).

- 2026-11-06 · local (`vite preview`), con la fecha del navegador fijada en el
  02-11-2026 y `scrollTo` como en el Chrome actual · batería completa en escritorio
  1366 × 900 y teléfono 390 × 844: 0 fallas. Prueba nueva (`e2e11`, 13 comprobaciones
  por tamaño): tarifa por grado, plazo de desistimiento en días hábiles, postulación sin
  datos de la nómina, 6 cuotas desde marzo en postulaciones y adjudicadas, formulario de
  temporada con dos calendarios, 22 casas, sin desborde. Capturas de la postulación y del
  formulario de temporada miradas: se corrigieron la frase de los turnos («entre el … –
  …») y la fecha de inicio del verano en la tarjeta (mostraba el 5 y no el 2 de enero).
- 2026-11-06 · pública @ `c0d1926` · el SHA-256 de lo servido coincide con el commit; en el
  Chrome del usuario: tarifas del tramo 15–19 en el buscador, postulación a la Cabaña 02
  de Puyehue con sus 13 turnos y las 6 cuotas desde marzo, 0 errores de consola (sin
  enviar la postulación). Manual (PDF y documento) actualizado el mismo día con capturas
  nuevas; el pie de la maqueta ya no dice que las tarifas son ficticias.
- 2026-11-12 · local (`vite preview`), fecha fijada en el 02-11-2026 · prueba nueva
  `e2e14` (35 comprobaciones) en escritorio y teléfono 390 × 844: 0 fallas. Cubre el
  ingreso solo de encargados (un afiliado recibe el aviso), el registro de reserva con la
  declaración y la autorización del descuento, el desistimiento registrado, la postulación
  registrada y retirada, los menús, Administración, las reservas de todo el país, la
  respuesta a un cupo de la lista de espera, una reserva de otro servicio con
  transferencia y su pago en Cobros, y las rutas antiguas del afiliado. `e2e4` y `e2e9`,
  adaptadas sin los pasos del afiliado, pasan; las pruebas del afiliado de la versión
  anterior quedan obsoletas. Capturas del ingreso, del inicio de la encargada en teléfono
  y de las reservas nacionales miradas. Manual de usuario (PDF y documento) rehecho
  para los encargados, con capturas nuevas.
- 2026-11-12 · pública @ `051a2f3` · el SHA-256 de lo servido coincide con el commit (página
  y manual); en el Chrome del usuario: ingreso del encargado nacional, panel con «Registrar
  postulación» y «Registrar reserva», Administración y reservas de todo el país; 0 errores
  de consola.
- 2026-11-12 · local (`vite preview`), fecha fijada en el 02-11-2026 · `e2e14` con 48
  comprobaciones (9 nuevas del ingreso con el IAM y 5 del tema) en 1366 × 900 y 390 × 844:
  0 fallas; `e2e4` y `e2e9`: 0 fallas. axe-core 4.10.2 (WCAG 2.0/2.1/2.2 A y AA) en 14
  pantallas, tema claro y oscuro: 0 violaciones tras corregir un contador con opacidad.
  Jueces `coipo_jueces` @ `1bd9ad5`: 0 bloqueantes y 0 avisos (se corrigió `.env` en
  `.gitignore`); con `adopta: interfaz` en una copia, `j13` OK en 3 comprobaciones y `j16`
  AVISA `COD-1` × 3. Banner medido a 390, 768, 1024, 1366 y 1920 px. Capturas del
  ingreso, del IAM, del rechazo sin rol y del tema oscuro miradas.
- 2026-11-12 · pública @ `24ff480` · el SHA-256 de lo servido coincide con el commit; en el
  Chrome del usuario: ingreso con el COIPO IAM simulado (cuenta `cnunez`) hasta el inicio de
  la Región de Valparaíso, cambio de tema hasta oscuro (fondo `#1a1f1c`) y vuelta a
  Sistema; 0 errores de consola.
- 2026-11-12 · local, fecha fijada en el 02-11-2026 · prueba nueva `e2e15` (25
  comprobaciones: por aprobar, fechas apartadas, no aprobar con motivo y fechas liberadas,
  consulta nacional, registro solo en la región, aprobación desde el comprobante, edición de
  direcciones y texto del PDF de la ficha) en 1366 × 900 y 390 × 844: 0 fallas. `e2e14` (55,
  adaptada a la aprobación) en ambos tamaños, `e2e4` y `e2e9`: 0 fallas. axe-core, 15
  pantallas por tema: 0 violaciones. Jueces: 0 bloqueantes; `servicio.js` bajó de 1154 a 976
  líneas al separar las semillas. Ficha PDF mirada página por página (se corrigió un
  subtítulo que se montaba sobre la fecha).

### Rediseño: Panel, Reservas con tablero y vía (12-11-2026, local, sin publicar)

- Pedido: Álvaro Zegers, 12-11-2026 15:35. Decisiones en `fuente/docs/DECISIONES.md`.
- Pruebas de punta a punta (Playwright, fecha fija 02-11-2026), en 1366×900 y 390×844:
  e2e16 (rediseño: panel, enlaces de las cifras, búsqueda, teclado del tablero, aprobar
  desde la barra, filtro de personas, rutas antiguas) 16 comprobaciones, 0 fallas;
  e2e15 (aprobación, ficha y tablero por región) 26/0; e2e14 (registro con vía) 55/0;
  e2e4 17/0 y e2e9 26/0 en escritorio.
- axe-core 4.10.2: 0 infracciones WCAG 2.2 AA en 14 pantallas, tema claro y oscuro.
- Capturas miradas en escritorio y teléfono, claro y oscuro. Lo visto y corregido: la barra
  de selección fija tapaba noches del tablero en el teléfono (se dejó en su lugar, bajo el
  tablero); «En curso» y «Confirmada» no se distinguían (se juntaron en la leyenda); faltaba
  marcar hoy (se marca en la cabecera); la cabecera de fechas se perdía al bajar con todo el
  país (el tablero tiene alto máximo y la cabecera queda fija).
- Jueces de `coipo_jueces` (perfil aplicacion): 0 bloqueantes. Sobre una copia con
  `adopta: interfaz`: j13 OK; j16 avisa COD-1 en `datos/casas.js` y `datos/servicio.js`
  (bajo 1000 líneas; brecha ya declarada en `CUMPLIMIENTO-FABRICA.md`).
- Publicado en `f7d4360`: GitHub Pages sirve el mismo `index.html` (sha256 igual al local,
  7.933.155 bytes). Recorrido en la URL pública con la fecha real (12-11-2026): ingreso como
  `cnunez`, Panel con sus cifras y enlaces, Reservas con el tablero marcando hoy; consola sin
  errores. No lo recorrí en teléfono contra la URL pública (sí en local).

### Panel lateral de registro, no atendidas y antecedentes (12-11-2026, publicado en `1cb52e2`)

- Pedido: Álvaro Zegers, 12-11-2026 (mejoras elegidas). Decisiones en `fuente/docs/DECISIONES.md`.
- Playwright (fecha fija 02-11-2026), 1366×900 y 390×844: e2e16 24 comprobaciones (agrega
  no atendidas, derivar desde el tablero, antecedentes, Escape y dashboard), e2e15 26 y
  e2e14 60 (registro en el panel, con exigencias de autorización, vía y declaración, y el
  aviso de anticipación de otro servicio), 0 fallas; e2e4 17/0 y e2e9 26/0 en escritorio.
- axe-core 4.10.2: 0 infracciones WCAG 2.2 AA en 15 pantallas (incluido el panel abierto),
  claro y oscuro.
- Capturas miradas en escritorio y teléfono. Corregido tras mirarlas: el panel repetía la
  tarjeta de la persona; la numeración de los pasos se duplicaba («2. Persona» + «1. ¿A
  nombre de quién?»); el selector de casa se cortaba.
- Jueces: 0 bloqueantes. Con `adopta: interfaz`: j13 OK; j16 avisa COD-1 en `casas.js`,
  `servicio.js` y `Casas.jsx` (todos bajo 1000 líneas).
- Pública: GitHub Pages sirve `1cb52e2` (sha256 igual al local, 7.951.987 bytes); en Chrome de
  escritorio, ingreso como `cnunez`, «Nueva solicitud» del Panel abre el panel lateral en
  Reservas; consola sin errores. No recorrí en la URL pública el registro completo ni el
  teléfono (sí en local).

### Configuración del encargado nacional (12-11-2026, publicado en `a13cfb9`)

- Pedido: Álvaro Zegers, 12-11-2026 16:25; respuestas: las cuatro secciones, roles en el IAM,
  parámetros con fecha de vigencia. Decisiones en `fuente/docs/DECISIONES.md`.
- Playwright (fecha fija 02-11-2026), 1366×900 y 390×844: e2e17 (Configuración) 25
  comprobaciones, e2e16 24, e2e15 26, e2e14 60, 0 fallas; e2e4 17/0 y e2e9 26/0.
- axe-core 4.10.2: 0 infracciones WCAG 2.2 AA en 19 pantallas (incluidas las cuatro
  pestañas nuevas), claro y oscuro.
- Defecto visto en el teléfono y corregido: el texto oculto de la cabecera de la tabla de
  parámetros ensanchaba la página a 628 px, y el diálogo de cambio quedaba fuera de la
  pantalla (la prueba no podía pulsar «Guardar cambio»).
- Pública: GitHub Pages sirvió `a13cfb9` (sha256 igual al local, 7.979.959 bytes); en Chrome
  de escritorio (Windows), ingreso como `pherrera`, Configuración › Parámetros sin errores de
  consola. Visto ahí y no en las capturas locales: las filas de pestañas (Configuración,
  Cobros, Temporadas) mostraban una barra de desplazamiento vertical; se corrigió.

### Se quitan las solicitudes no atendidas (12-11-2026, publicado en `a9ae7d6`)

- Pedido: Álvaro Zegers, 12-11-2026 16:45: solo se ingresan las solicitudes con disponibilidad.
- Se quitaron el diálogo, la lista, el botón del tablero, el conteo del Dashboard, la sección
  de los antecedentes, el área de la actividad, las semillas y `datos/solicitudes.js` (lo que
  quedaba, los antecedentes de la persona, pasó a `datos/antecedentes.js`).
- Playwright, 1366×900 y 390×844: e2e16 22, e2e17 25, e2e15 26, e2e14 60, 0 fallas (e2e16
  comprueba ahora que otra región es solo consulta, que no aparece nada de «no atendidas» y
  que, si las reglas no lo permiten, el panel no deja registrar); e2e4 17/0 y e2e9 26/0.
  axe-core: 0 infracciones en 19 pantallas, claro y oscuro.
- Pública: GitHub Pages sirve `a9ae7d6` (sha256 igual al local, 7.968.139 bytes) y el HTML
  publicado no contiene «no atendid».

### Nombre «Sistema de Gestión de Reservas» y banner de la gerencia (12-11-2026, publicado en `b0bcec0`)

- Pedido: Álvaro Zegers, 12-11-2026 17:07. Formato tomado de `alvarozvjac/coipo_gestion_flota_vehiculos`
  (commit `bff6570`, `index.html` líneas 87-95 y 770-773): banner de la gerencia y título
  superpuesto desde el píxel 875 del asset.
- Capturas miradas a 1920, 1366, 1024 y 390 px de ancho: el título y el departamento quedan en
  la zona plana, sin pisar la marca ni el remate; en el teléfono el banner corto muestra la
  gerencia y el nombre va en la cabecera. Sin desborde horizontal en ningún ancho.
- e2e16 24/0 y e2e14 60/0 en 1366×900 y 390×844 (agregan el título, el departamento y el
  `alt` del banner); e2e15 26/0 y e2e17 25/0; axe 0 infracciones en 19 pantallas.
- Al publicar, `main` traía dos commits de otra sesión (6bd7688, 17:02, con este mismo cambio,
  y fa487a1, 17:08, que lo revierte); el árbol quedaba igual al anterior y este commit se puso
  encima sin conflicto. Pública: GitHub Pages sirve `b0bcec0` (sha256 igual al local,
  8.034.141 bytes); en Chrome (Windows) se ven el banner de la gerencia, el título y el
  departamento; consola sin errores. Ojo: Chrome mostró primero la versión anterior desde su
  caché; con la dirección `?v=` cargó la nueva.

### Sin temporadas altas ni sorteo (12-11-2026, publicado en `3eaf7d7`)

- Pedido: Álvaro Zegers, 12-11-2026 17:29; respuestas: verano como cualquier fecha, todas las
  reglas de la persona siguen, quitar las reservas de prueba del sorteo.
- Playwright (fecha fija 02-11-2026), 1366×900 y 390×844: e2e14 52 (agrega: enero se registra
  sin sorteo; `/gestion/postular` y `/central/sorteo` ya no existen; menú sin Temporadas),
  e2e15 26, e2e16 24, e2e17 25, 0 fallas; e2e4 17/0 y e2e9 20/0 (el estado ya no guarda
  temporadas ni sorteos). axe-core: 0 infracciones en 17 pantallas, claro y oscuro.
- Capturas miradas: Panel nacional sin «Registrar postulación» y tablero de enero de 2027 con
  reservas normales y la leyenda sin «Temporada alta».
- Pública: GitHub Pages sirve `3eaf7d7` (sha256 igual al local, 1.614.106 bytes; el HTML no
  contiene «Realizar sorteo» ni «Registrar postulación»); consola sin errores. La página bajó
  de 8 MB a 1,6 MB porque las fotos de las casas solo se mostraban en el formulario de tres
  pasos, que ya no existe.

### Sin aprobación y pago en efectivo (13-11-2026, publicado en `d373177`)

- Pedido: Álvaro Zegers, 13-11-2026 12:43; respuestas: efectivo solo para quienes no tienen
  planilla; confirmada con pago pendiente; registra la encargada (su región) o el nacional,
  con quién, fecha y N° de recibo; panel por mes con planilla, efectivo y total.
- Playwright (fecha fija 02-11-2026), 1366×900 y 390×844, 0 fallas: e2e14 65 (agrega: el
  nacional registra sin aprobación; jubilado en efectivo queda confirmado con ficha y pago
  pendiente; recibo REC-0042; panel de descuentos y reporte de cobranza con el efectivo; la
  encargada tiene Cobros, ve solo el efectivo de su región y registra R-2026-0195), e2e15 21,
  e2e16 23, e2e17 24, e2e4 17, e2e9 20. axe-core: 0 infracciones en 19 pantallas (agrega
  Cobros de la encargada y Pagos por registrar), claro y oscuro. Jueces: 0 bloqueantes,
  0 avisos.
- Capturas miradas: Cobros de la encargada en escritorio y teléfono, «Efectivo por recibir»
  y el panel nacional con enero 2027. Corregido al mirarlas: la tabla por mes obligaba a
  desplazarse de lado en el teléfono (ahora una tarjeta por mes) y a la encargada se le
  decía «Revise y envíe la nómina a Remuneraciones», que no le corresponde.
- Pública: GitHub Pages sirve `d373177` (sha256 igual al local, 1.611.270 bytes; el HTML
  contiene «Efectivo por recibir»); consola sin errores.

### Parámetro de veces por la misma casa (13-11-2026, publicado en `9f30f03`)

- Pedido: Álvaro Zegers, 13-11-2026 14:33; respuestas: año calendario, valor 1, no permite
  registrar, cuentan vigentes y realizadas.
- Playwright (fecha fija 02-11-2026), 1366×900 y 390×844, 0 fallas: e2e17 31 (agrega: el
  parámetro aparece en «1 vez por año calendario»; la misma casa en 2026 no se registra; en
  2027 sí; otra casa sí; con 2 desde hoy sí; el RUT de Nora la trae a ella), e2e14 65,
  e2e15 21, e2e16 23, e2e4 17, e2e9 20. axe-core: 0 infracciones; jueces: 0 bloqueantes.
- Capturas miradas: fila del parámetro en Parámetros y el motivo en el panel de registro.
- Defecto de datos visto en la captura y corregido con acuerdo de Álvaro Zegers: R-2026-0195
  estaba a nombre de «Nora Castillo Vergara» con un RUT que en la nómina era de otra persona
  (afiliada activa). Nora quedó en la nómina de demostración como jubilada, con RUT ficticio
  propio (desde el 25-11-2026, el de prueba 77.777.777-7). La clave de datos pasó a `reserva_veraneo_v20`.
- Pública: GitHub Pages sirve `9f30f03` (sha256 igual al local, 1.612.357 bytes); consola sin
  errores.

### Sin efectivo: transferencia electrónica (13-11-2026, publicado en `aabafe3`)

- Pedido: Álvaro Zegers, 13-11-2026 15:00 («el pago no es en efectivo, es una transferencia
  electrónica»); respuestas: quitar el efectivo; confirmada con pago pendiente; registran la
  encargada y el nacional; panel con «Planilla y transferencias». Primera versión sin la
  columna de pendientes; al ver las capturas pidió agregarla.
- Playwright (fecha fija 02-11-2026), 1366×900 y 390×844, 0 fallas: e2e14 63 (agrega: el
  jubilado no ve «Efectivo»; la transferencia queda confirmada con ficha y datos para
  transferir; el nacional y la encargada la registran con N° de operación; panel y CSV con
  planilla y transferencias recibidas y pendientes), e2e15 21, e2e16 24 (el panel ya no muestra «por confirmar»),
  e2e17 31, e2e4 17, e2e9 20. axe-core: 0 infracciones; jueces: 0 bloqueantes.
- Capturas miradas: Cobros nacional en escritorio y de la encargada en teléfono, antes y
  después de agregar la columna de pendientes.
- Pública: GitHub Pages sirve `aabafe3` (sha256 igual al local, 1.609.622 bytes; el HTML trae
  «Transferencias pendientes» y ya no «Registrar efectivo»); consola sin errores.

### Encargada sin Panel ni Cobros (13-11-2026, publicado en `8b9e5c0`)

- Pedido: Álvaro Zegers, 13-11-2026 15:27; respuestas: solo el nacional registra las
  transferencias; la encargada entra a Reservas.
- Playwright (fecha fija 02-11-2026), 1366×900 y 390×844, 0 fallas: e2e14 62 (agrega: menú
  «Reservas, Inventario»; entra a Reservas; `/encargada`, `/encargada/cobros` y
  `/central/cobros` la llevan a Reservas), e2e15 21, e2e16 23, e2e17 31, e2e4 17, e2e9 20.
  axe-core: 0 infracciones (sin las pantallas quitadas); jueces: 0 bloqueantes.
- Capturas miradas: Reservas de la encargada al ingresar, en escritorio y teléfono.
- Pública: GitHub Pages sirve `8b9e5c0` (sha256 igual al local, 1.606.997 bytes); consola sin
  errores.

### Misma casa por mes, en lugar del Art. 7 (13-11-2026, publicado en `d6701eb`)

- Pedido: Álvaro Zegers, 13-11-2026 15:59; respuestas: reemplazar el Art. 7, mes calendario
  de la llegada, valor 1.
- Playwright (fecha fija 02-11-2026), 1366×900 y 390×844, 0 fallas: e2e17 32 (agrega: el
  parámetro dice «1 vez por mes calendario»; la misma casa en diciembre no se registra; la
  misma casa en noviembre y otra casa en diciembre sí; no aparece el Art. 7; con 2 sí),
  e2e14 62, e2e15 21, e2e16 23, e2e4 17, e2e9 20. axe-core: 0 infracciones; jueces:
  0 bloqueantes.
- Capturas miradas: fila del parámetro y el motivo en el panel de registro.
- Pública: GitHub Pages sirve `d6701eb` (sha256 igual al local, 1.606.685 bytes); consola sin
  errores.

### Tarifas en carril horizontal (13-11-2026, publicado en `2d80015`)

- Pedido: Álvaro Zegers, 13-11-2026 16:19; respuestas: carril horizontal, edición dentro de la
  tarjeta.
- Playwright (fecha fija 02-11-2026), 1366×900 y 390×844, 0 fallas: e2e9 28 (agrega: 22
  tarjetas, «Casas 1–4 de 22», el carril mide menos de 520 px de alto, la flecha pasa a 5–8,
  el punto final desactiva «siguientes», la búsqueda filtra y vuelve al inicio, la tarjeta
  editada dice «Cambia», en el teléfono «Casa 1 de 22» sin desborde), e2e14 62, e2e15 21,
  e2e16 23, e2e17 32, e2e4 17. axe-core: 0 infracciones (agrega la pestaña Tarifas);
  jueces: 0 bloqueantes.
- Capturas miradas en escritorio y teléfono. Corregido al mirarlas: el borde de la tarjeta
  editada salía negro (color inexistente), el borde superior de las tarjetas se cortaba, y en
  el teléfono los 22 puntos desbordaban la página (ahora los puntos se muestran desde
  tableta).
- Pública: GitHub Pages sirve `2d80015` (sha256 igual al local, 1.612.068 bytes); consola sin
  errores.

### Etapa 2: selector y portal del trabajador (18-11-2026, publicado en `91d178e`)

- Pedido: Álvaro Zegers, 18-11-2026 08:33; respuestas: ambas etapas con un selector; vuelven
  las temporadas con sorteo en la etapa 2 (segunda entrega); reservan los trabajadores de
  CONAF.
- Se reaprovechó del historial lo que había quitado el commit `051a2f3` (ficha de la casa y
  calendario de `d98e20d`/`e81ce1d`), adaptado a las reglas vigentes; el formulario de
  reserva es el mismo de los encargados.
- Playwright (fecha fija 02-11-2026), 1366×900 y 390×844, 0 fallas: e2e18 31 (nueva:
  marcha blanca sin ingreso de la trabajadora; el nacional abre la etapa 2 con respaldo;
  ella reserva Rocas de Santo Domingo, ve Mis reservas y desiste; no ve reservas ajenas ni
  pantallas de encargados; Actividad; vuelta a la marcha blanca; cambio programado y su
  anulación), e2e14 62, e2e15 21, e2e16 23, e2e17 32, e2e4 17, e2e9 28. axe-core: 0
  infracciones, ahora también en Etapa y en las cinco pantallas del trabajador; jueces: 0
  bloqueantes.
- Corregido con axe y al mirar las capturas: los días del calendario medían 23,9 px de ancho
  (mínimo 24); el radio de «Descuento por planilla» contenía controles (cuotas y
  autorización); una casilla se encogía a 13 px; y si la llegada estaba a menos de 10 días
  hábiles, el formulario decía «si desiste hasta el 23 oct» (fecha ya pasada).
- Pública: GitHub Pages sirve `91d178e` (sha256 igual al local, 7.981.199 bytes: vuelven las
  fotografías de referencia de las casas, como en `d98e20d`); consola sin errores.

### Etapa 2: temporadas con postulación y sorteo (18-11-2026, publicado en `76181dc`)

- Segunda entrega del pedido del 18-11-2026. Restaurado de `e81ce1d`: `lib/sorteo.js`,
  temporadas y sorteo del nacional, postulación (ahora para el trabajador y para los
  encargados) y su tarjeta; el servicio pasó a `datos/temporadas.js` para no inflar
  `servicio.js`.
- Playwright (fecha fija 02-11-2026), 1366×900 y 390×844, 0 fallas: e2e19 30 (nueva: marcha
  blanca sin sorteo; etapa 2 con Temporadas; la trabajadora no reserva en temporada, postula,
  retira y vuelve a postular; la encargada registra la postulación de Nora; el sorteo deja
  semilla, reservas confirmadas con ficha y cuotas desde marzo 2027; ella ve su resultado),
  e2e14 62, e2e15 21, e2e16 23, e2e17 32, e2e18 31, e2e4 17, e2e9 28. axe-core: 0
  infracciones, ahora también en Temporadas, Registrar postulación y Postular al sorteo;
  jueces: 0 bloqueantes.
- Capturas miradas: Temporadas antes y después del sorteo, Postular al sorteo en escritorio
  y Mis reservas con la postulación en teléfono.
- Pública: GitHub Pages sirve `76181dc` (sha256 igual al local, 8.059.414 bytes); consola sin
  errores.

### Panel nacional sin tabla de regiones y sin Dashboard (18-11-2026)

- Pedido de Álvaro Zegers (VERIFICADO, 18-11-2026, 11:12 y 11:21): «quita del perfil del
  encargado nacional: Regiones · próximos 30 días» y «quita la pestaña del dashboard»; ante la
  pregunta, eligió quitar la página completa, no solo la pestaña.
- Cambios: `paginas/central/Inicio.jsx` sin la tabla por región; se borraron
  `paginas/central/Dashboard.jsx` y `lib/indicadores.js`; se quitaron la ruta y la pestaña.
- Verificación local (390×844 y 1366×900, fecha fija 2026-11-02): e2e14 62, e2e15 21, e2e16
  22, e2e17 32, e2e18 31, e2e19 30, e2e4 y e2e9 28 sin fallas; axe 0 violaciones; oxlint
  sin hallazgos. Las pruebas que miraban el Dashboard ahora comprueban que no está.
- VERIFICADO (pdftotext): el manual de usuario en PDF (`public/manual-usuario.pdf`, del
  12-11-2026) todavía describe el Dashboard (sección 7.6) y la tabla por región. Ya estaba
  desfasado antes de este cambio (cita pestañas «Casas y tarifas» y «Administración»); no se
  regeneró. [PENDIENTE: Álvaro Zegers] Si se actualiza el manual.
- VERIFICADO: publicado en `e7bed7c`; GitHub Pages sirve el mismo `index.html` (sha256
  f855168f6d19e192…, 8.040.247 bytes), sin «Hallazgos del período» ni «Regiones · próximos
  30 días». Consola de Chrome: 0 errores.

### Vuelta al nombre y banner anteriores (18-11-2026)

- Pedido de Álvaro Zegers (VERIFICADO, 18-11-2026, 15:01): «El ingreso a la maqueta debe ser
  de la forma inicial que definimos, actualmente se encuentra de la forma posterior a los
  cambios que luego fueron revertidos». Ante las preguntas eligió «IAM, antes del cambio de
  nombre» y «toda la aplicación».
- Cambios: banner CONAF · UIA recuperado de `fa487a1` (se borraron los de Desarrollo de las
  Personas); «Casas de Veraneo · Servicio de Bienestar · CONAF» en el banner, la cabecera, el
  ingreso, el IAM simulado, la pestaña y la firma de las cinco plantillas. El ingreso sigue
  con el COIPO IAM simulado.
- Verificación local (390×844 y 1366×900): e2e14 62, e2e15 21, e2e16 22, e2e17 32, e2e18 31,
  e2e19 30, e2e4 y e2e9 28 sin fallas; axe 0 violaciones. Capturas del ingreso en teléfono y
  escritorio miradas: banner CONAF · UIA con «Casas de Veraneo» en la zona del título.
- VERIFICADO: publicado en `dc9020d`; GitHub Pages sirve el mismo `index.html` (sha256
  ea6772558e7d0dc3…, 7.974.249 bytes), pestaña «Reservas Casas de Veraneo», sin «Sistema de
  Gestión de Reservas». Consola de Chrome: 0 errores.

### Prueba de la maqueta publicada y correcciones (18-11-2026)

- Pedido de Álvaro Zegers (VERIFICADO, 17:09): «prueba la maqueta»; eligió «Recorrido
  completo publicado». Recorrido en Chrome de escritorio sobre la URL pública (`60b92dd`),
  con la fecha real: ingreso por el IAM simulado con `cnunez`, `pherrera` y `mfuentes`;
  registro con transferencia; registro de la transferencia; pestañas de Configuración;
  cambio a la etapa 2 (sin respaldo no guarda); postulación (exige autorizar el descuento);
  reserva directa confirmada; límite de una vez por mes en la misma casa; desistimiento
  sin costo; sorteo; resultado «Adjudicada» de la trabajadora. Datos de prueba borrados del
  navegador al terminar. No lo comprobé en teléfono en Chrome (la ventana no se achicó).
- Hallazgos: seis (ver DECISIONES, «Correcciones de la prueba publicada»). A las 17:18
  Álvaro Zegers pidió «LAS SEIS».
- Verificación local (390×844 y 1366×900, fecha fija 2026-11-02): e2e20 nueva, 20 sin
  fallas (cargos registrables y con Enter, hora local, sin ventana para la encargada,
  postulación a la vista, textos tras el sorteo); e2e14 63, e2e15 21, e2e16 22, e2e17 32,
  e2e18 31, e2e19 30, e2e4 y e2e9 28 sin fallas; axe 0 violaciones. Capturas en teléfono
  miradas: la confirmación de la postulación y el aviso del resultado quedan a la vista.
- VERIFICADO: publicado en `4428cce`; GitHub Pages sirve el mismo `index.html` (sha256
  d226d1bff7598bdf…, 7.975.727 bytes) y contiene «Cargo por desistir fuera de plazo».
  Consola de Chrome: 0 errores.

### Revisión contra la fábrica al 25-11-2026 y arreglos rápidos (25-11-2026, local, sin publicar)

- Pedido de Álvaro Zegers: «Revisa el aplicativo bajo los criterios del coipo master»; tras
  el informe, «haz los arreglos rápidos y actualiza la documentación». Fuentes:
  `coipo_master_produccion` @ `fc1907b` y `coipo_jueces` @ `93fee54`. Detalle en
  `fuente/docs/CUMPLIMIENTO-FABRICA.md` §0.
- Datos de prueba según `docs/DATOS_DE_PRUEBA.md` de la fábrica: los ocho RUT de la nómina
  de demostración pasan a los RUT de prueba de Clave Única (María Fuentes 11.111.111-1,
  Paula Ortiz 22.222.222-2, Hernán Soto 33.333.333-3, Nora Castillo 77.777.777-7…); los
  RUT generados llevan el dígito verificador incorrecto a propósito; los correos terminan
  en `.invalid`; los teléfonos, en `+56 9 0000 NNNN`; el `sub` del IAM simulado empieza por
  `local-`. La clave de datos pasó a `reserva_veraneo_v24`.
- `scripts/pagina.mjs` descartaba los scripts en línea de `index.html`: la página publicada
  salía sin la «Vista celular» y sin el tema antes de pintar (VERIFICADO en el `index.html`
  de `4428cce`: 0 apariciones de `vc-btn`). Corregido; además `<meta name="color-scheme">`
  y `fetchPriority="high"` en el banner (UI-21), y `.oxlintrc.json` con las reglas del Zen
  de la semilla (COD-5).
- Primer commit (`03413d3`) sin Node en el PC. Después, a pedido de Álvaro Zegers
  («regenera el manual PDF»; eligió «Node portátil y manual nuevo»), con Node 22.12 portátil:
  `npm run lint` da 101 errores y 60 avisos con las reglas nuevas (deuda COD-5, detalle en
  CUMPLIMIENTO §0.3); build y `build:pagina` sin errores; `index.html` regenerado.
- Manual de usuario nuevo: la fuente del anterior nunca se versionó. Ahora
  `fuente/docs/manual/manual.html` con 30 capturas (`npm run manual:capturas`, Chrome, fecha
  fija 25-11-2026, 0 errores de página) y el PDF de `npm run manual:pdf` (25 páginas,
  2,9 MB), mirado página por página. Cubre los tres perfiles, las dos etapas, el registro
  paso a paso, Cobros, Configuración, temporadas y sorteo, reglas y datos de prueba.
- Texto de Actividad sin «aprobaciones» (`d174ac2`, publicado y verificado por sha256).
- «Vista celular» con `<dialog>` nativo y `postMessage` al mismo origen (hallazgo H). Pedido
  de Álvaro Zegers; la consulta a `modern-web-guidance` que pide `prompts/07` no corrió (el
  permiso automático rechazó el `npx`) y él eligió «sigue sin la guía». Playwright sobre la
  página publicada en local: abre modal con el foco en «Cerrar», Tab no sale, Esc y «Cerrar»
  cierran y el foco vuelve al botón, Esc dentro del marco cierra, un mensaje ajeno no; 0
  errores de página. Captura mirada: igual que antes.

## Validación

- Sin aprobación trazable de la maqueta nueva. La conformidad del 28-09-2026 fue sobre la
  maqueta anterior. Próxima instancia: reunión del 04-11-2026 → registrar aquí asistentes,
  versión mostrada (URL + commit), observaciones clasificadas y aprobación.

## Aprendizajes

- 2026-11-25 · CON001 · «Ficticio» no basta para un RUT: con dígito verificador válido
  puede ser de una persona real, y la maqueta es pública. Usar desde el inicio los RUT de
  prueba de Clave Única y correos `.invalid` (`docs/DATOS_DE_PRUEBA.md` de la fábrica).
- 2026-11-25 · CON001 · Lo que el paso de empaquetado descarta no lo ve quien prueba en
  local: la «Vista celular» y el tema antes de pintar funcionaban con `npm run dev` y no
  estaban en la página publicada. Buscar en el `index.html` publicado lo que el README
  promete, no solo recorrer la página.

- 2026-11-12 · CON001 · Un juez que no encuentra lo que busca puede no decirlo: `j16`
  no evaluó TypeScript ni capas porque el frontend vive en `fuente/frontend/`, y su
  resumen no lo marcó como SIN_EVALUAR. Leer qué comprobó cada juez, no solo su veredicto.

- 2026-11-12 · CON001 · Una comprobación envuelta en «si el botón existe…, si no, OK»
  pasaba sin probar nada: la aceptación de un cupo de la lista de espera nunca se ejercía,
  porque el desistimiento elegido caía en un turno sin lista. Una prueba no debe tener
  rama que apruebe sin comprobar; hay que preparar el caso que se quiere ver.

- 2026-11-12 · CON001 · La estrategia de implementación (quién usa el sistema en la
  primera etapa) no se preguntó en el objetivo 3 y cambió la mitad de las pantallas:
  preguntar en el diseño con qué perfiles parte la operación, no solo cuáles existen.

- 2026-11-02 · CON001 · Un reemplazo de texto aplicado a todo un archivo tocó dos
  componentes y dejó una variable sin definir que el linter no veía: activar `no-undef` y
  correr la batería completa (también en teléfono) después de cada cambio.
- 2026-11-02 · CON001 · Las pruebas que eligen fechas «dentro de dos meses» se rompen
  cuando cambia el día (en noviembre caen en temporada alta): fijar la fecha de la
  prueba o elegirla por regla, no por desplazamiento de meses.
- 2026-11-02 · CON001 · El código fuente de la maqueta quedó solo en copias locales
  cuando se borró la rama `veraneo` de `Sud-Austral/coipo_cabania`: versionar la fuente
  antes de publicar la página, que es solo el resultado compilado.
- 2026-11-06 · CON001 · El documento con que la contraparte opera hoy (el llamado y su
  formulario) traía reglas distintas del reglamento propuesto: pedirlo en el objetivo 1
  habría evitado construir turnos de 7 noches de sábado a sábado.
- 2026-11-06 · CON001 · Las pruebas deben fijar la fecha del navegador: tres de ellas
  fallaron solo porque «un mes más» cayó en un mes con otra reserva de la misma persona.
- 2026-11-03 · CON001 · Un navegador de pruebas más antiguo que el de las personas oculta
  defectos: la maqueta pasó 163 comprobaciones y se caía en el Chrome actual. Verificar
  contra la URL pública en un navegador real después de cada publicación (objetivo 5,
  paso 6), y escribir los efectos de React siempre con llaves.
- 2026-11-02 · CON001 · La maqueta se construyó antes de levantar el problema con la
  contraparte (anti-patrón del objetivo 0): faltó preguntar desde el inicio quién aprueba
  y cuántas reservas hay por año.

### Verificación pública del módulo de registro, aprobación y ficha (12-11-2026)

- VERIFICADO: GitHub Pages sirve el commit `fd19f0a` (sha256 del `index.html` público igual al local, 7.926.375 bytes).
- Recorrido en la URL pública, en Chrome de escritorio: ingreso por el IAM simulado como `cnunez` (encargada regional de Valparaíso); en «Reservas por aprobar» aparece R-2026-0197 (registrada por el encargado nacional); «Aprobar» la confirma y avisa «se envió la ficha de la reserva»; «Disponibilidad» lista las casas del país, con «Registrar reserva» solo en las de Valparaíso y «Solo consulta» en las de otras regiones. Consola: 0 errores.
- No lo comprobé en teléfono contra la URL pública (sí en local: e2e15 y e2e14 en 390×844).
