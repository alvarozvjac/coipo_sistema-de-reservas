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

## Decisiones

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
  No comprobado: la URL pública con esta versión.

## Validación

- Sin aprobación trazable de la maqueta nueva. La conformidad del 28-09-2026 fue sobre la
  maqueta anterior. Próxima instancia: reunión del 04-11-2026 → registrar aquí asistentes,
  versión mostrada (URL + commit), observaciones clasificadas y aprobación.

## Aprendizajes

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
