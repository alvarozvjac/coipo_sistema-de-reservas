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

## Validación

- Sin aprobación trazable de la maqueta nueva. La conformidad del 28-09-2026 fue sobre la
  maqueta anterior. Próxima instancia: reunión del 04-11-2026 → registrar aquí asistentes,
  versión mostrada (URL + commit), observaciones clasificadas y aprobación.

## Aprendizajes

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
