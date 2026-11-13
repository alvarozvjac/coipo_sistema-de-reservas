# Decisiones del producto

Registro de lo decidido y de lo que falta confirmar con Bienestar.

**Norma que rige:** Reglamento General de Uso de Casas de Veraneo o Descanso, propuesta de
actualización de octubre de 2026 (en adelante, "el reglamento"). Reemplaza a la versión de
agosto y prevalece sobre la solicitud de julio y sobre la especificación del 08-10-2026
cuando se contradicen.

## Alcance

- Solo casas de veraneo. Se eliminan las casas solo de huéspedes (Copiapó, Concepción,
  Santiago 1 y 2). Las de uso mixto (veraneo/huéspedes) se tratan como casas de veraneo.
- Quedan 30 casas. Los nombres repetidos se numeraron (Puerto Montt 1 y 2, P.N. Río
  Clarillo 1 y 2, Pichilemu 3, P.N. Puyehue 3).
- Se construye un producto nuevo; `coipo_cabania` no se repara.

## Confirmación automática (decisión 20-10-2026)

- **No hay confirmación manual.** Si las fechas están disponibles y se cumplen las reglas
  (anticipación, una reserva por mes, capacidad, aseo, temporada alta), la reserva queda
  **confirmada al instante** y se envían el comprobante y el acta de entrega.
- Ni la encargada regional ni la Oficina Central confirman o "no asignan"; se eliminó esa
  cola de sus paneles.
- **Otros servicios públicos (Art. 9):** como nadie revisa ya si el cupo lo demanda
  personal de CONAF, solo pueden reservar con **hasta 15 días de anticipación**
  (parámetro `anticipacion_maxima_otro_servicio_dias`). Así toman cupos que siguen libres
  cerca de la fecha.
- **Pago anticipado (Art. 21 a):** desde el 02-11-2026 la reserva queda **por confirmar**
  hasta que se registra el pago (ver sección siguiente); si el pago no se registra antes de
  la llegada, **solo se alerta a Bienestar** (Oficina Central, "Requiere atención" y
  "Pagos por registrar"). No se anula automáticamente.
- El backend debe validar la disponibilidad dentro de una transacción al confirmar, para
  que dos personas no tomen las mismas fechas a la vez. La maqueta ya avisa al usuario si
  otra persona tomó las fechas mientras completaba el formulario.
- **Diferencia con el reglamento:** el Art. 5 dice que la reserva "queda pendiente hasta
  la confirmación final". Bienestar debe ajustar ese texto o aceptar la diferencia.

## Reserva por confirmar cuando se paga por transferencia (decisión 02-11-2026)

- Quien paga por **transferencia** (jubilados/as, otros servicios públicos y plazo fijo que
  la elija) queda con la reserva **«Por confirmar»**: las fechas quedan apartadas y recibe
  por correo los datos para transferir.
- Cuando Oficina Central registra el pago en *Cobros › Pagos por registrar*, la reserva pasa
  a **Confirmada** y recién entonces se envían el comprobante y el acta de entrega.
- Las reservas con **descuento por planilla** se siguen confirmando al instante.
- Mensaje al solicitante: «Reserva por confirmar. Le enviamos a {correo} los datos para
  transferir. Sus fechas quedan apartadas: cuando Bienestar compruebe el pago, la reserva
  quedará confirmada y le enviaremos el comprobante y el acta de entrega al mismo correo.»
- En el código: `porConfirmar(r)` en `lib/reglas.js` (transferencia sin pago registrado) y
  `registrarPago` en `datos/servicio.js`, que confirma y envía el acta.

## Sin aprobación y pago en efectivo (decisión 13-11-2026)

Fuente: Álvaro Zegers (UIA), 13-11-2026, 12:43: «no debe existir una aprobación en el
sistema, ya que, si se registra la reserva, ésta queda automáticamente aprobada. Sobre la
cobranza de las personas que paguen con efectivo, éste se registrará igualmente y es el
encargado regional y el encargado nacional quien deberá comprobar que se haya realizado el
pago, el cual se registrará en el reporte de cobranza; en el panel de descuento deberá
aparecer el monto del mes de acuerdo al descuento desde el sueldo y el descuento por pago en
efectivo». Respuestas del mismo día a las preguntas de diseño:

- **Sin aprobación.** Toda reserva registrada (por la encargada regional o por el encargado
  nacional) queda confirmada al registrarla. Ya no existen los estados «Por aprobar» ni
  «No aprobada», ni la tabla de quién aprueba en cada región, ni la plantilla de correo de
  no aprobación. Reemplaza la aprobación de la decisión del 12-11-2026.
- **Quién puede pagar en efectivo.** Solo quienes no tienen planilla: **jubilados/as y
  funcionarios/as de otros servicios públicos**, que eligen transferencia o efectivo. Los
  trabajadores activos de CONAF siguen con descuento por planilla.
- **Efectivo: confirmada con pago pendiente.** Al registrar una reserva en efectivo se envía
  la ficha de inmediato; el pago queda pendiente en *Cobros* hasta que se registra. (Con
  transferencia no cambia: queda por confirmar y la ficha sale con el pago.)
- **Quién registra el efectivo recibido.** La encargada regional, el de las casas de su región
  (nueva sección *Cobros* en su menú, pestaña «Efectivo por recibir»); el encargado nacional,
  el de todas las regiones. Queda **quién lo recibió, la fecha y el N° de recibo**.
- **Panel de descuentos.** *Cobros* abre en una tabla por mes con **descuento por planilla,
  efectivo recibido, efectivo pendiente y total**; al elegir un mes se ve el detalle por
  persona (planilla y efectivo) y se descarga el **reporte de cobranza** (CSV con ambas
  formas de pago, quién recibió y el recibo). La encargada ve su región y no tiene las
  acciones de nómina (CSV para Remuneraciones, marcar informada), que siguen siendo del
  encargado nacional. El efectivo recibido cuenta en el mes en que se registró; el
  pendiente, en el mes de llegada.
- [PENDIENTE: con Bienestar] formato del recibo de efectivo, dónde se deposita lo recibido y
  si la encargada rinde a la Oficina Central.
- La clave de datos pasó a `reserva_veraneo_v19`.

## Registro, aprobación y ficha de la reserva (decisión 12-11-2026, tarde) — aprobación quitada el 13-11-2026

Pedido por Álvaro Zegers el 12-11-2026 («crear un módulo de registro de reservas
solicitadas…»), con sus respuestas a las preguntas de diseño.

- **Dónde registra cada encargado.** El encargado nacional registra en todas las casas; la
  encargada regional, **solo en las casas de su región** (antes podía en cualquiera).
- ~~**Aprobación.**~~ *Sin vigencia desde el 13-11-2026 (ver arriba).* Lo que registra el **encargado nacional** quedaba **«Por aprobar»** y lo
  aprueba la **encargada regional de la región de la casa**. Lo que registra la propia
  encargada en su región queda aprobado al registrarlo. Si la región no tiene encargada con
  rol en el COIPO IAM, la aprueba el encargado nacional ([PENDIENTE] confirmar con Bienestar;
  en la maqueta solo Valparaíso tiene encargada).
- **Fechas apartadas.** *(Sin vigencia desde el 13-11-2026.)* Mientras está por aprobar, las fechas quedan apartadas. Si no se
  aprueba (con motivo obligatorio), se liberan y se avisa a la persona.
- **Correo con la ficha.** Al aprobar (desde el 13-11-2026, al registrar), se envía a la persona la **ficha de la reserva** en
  PDF, que **reemplaza al comprobante y al acta de entrega**: reserva y aprobación,
  solicitante, acompañantes (nombre, relación y edad), **todas las direcciones de la casa**,
  pago, inventario y el acta para el ingreso y la salida (Anexo B). Con **transferencia**, al
  aprobar se envían los datos para transferir y la ficha sale **cuando se registra el pago**.
  Si la casa no tiene inventario, la ficha lo dice. Cada versión nueva del inventario
  reenvía la ficha a las reservas confirmadas que aún no comienzan.
- **Otras direcciones.** Cada casa puede tener direcciones además de la principal
  (estacionamiento en otro edificio, retiro de llaves, acceso vehicular, bodega). Las edita
  el encargado nacional en *Casas y tarifas*; rigen para las fichas que se emitan desde
  entonces. Las de ejemplo (Departamento Viña del Mar, Bahía Inglesa 1 y Cabaña 02 de
  Puyehue) son **ficticias**. [PENDIENTE: direcciones reales, con Bienestar.]
- **Autocompletar por RUT.** Ya existía: al escribir el RUT se buscan en la nómina nombre,
  calidad, región, correo y teléfono.
- **Consulta de disponibilidad nacional** (pestaña *Disponibilidad*, ambos perfiles):
  fechas, personas y región opcional; muestra primero las casas libres, el motivo de las que
  no lo están (ocupada o bloqueada, temporada alta, capacidad) y el calendario de cada una.
  La encargada consulta todo el país, pero solo registra en su región. No aplica las reglas
  de la persona (anticipación, una por mes), que se revisan al registrar.
- Postulaciones al sorteo: sin cambio (cualquier encargado registra en cualquier casa).
  [PENDIENTE: confirmar si también se restringen por región.]
- La clave de datos pasó a `reserva_veraneo_v14`.

## Ingreso con el COIPO IAM (decisión 12-11-2026)

Reemplaza al ingreso con RUT y código de la sección siguiente. Pedido por Álvaro Zegers el
12-11-2026: «El login debe ser simulado con el IAM». Sigue el flujo de la fábrica
(`prompts/15-registrar-en-el-iam.md` e `IdentidadLocal` de la semilla).

- «Ingresar con COIPO IAM» → pantalla del IAM, rotulada como simulada, con usuario
  institucional y contraseña → vuelta a `/auth/callback` con un código de un solo uso.
- El perfil sale **solo** del rol que el IAM asigna para esta aplicación
  (`encargado_regional` → encargada, `encargado_nacional` → encargado nacional) y la región
  de la encargada, del atributo `region_id`. La nómina ya no decide quién entra.
- Cuenta sin rol en la aplicación: «Su cuenta no tiene acceso a esta aplicación», sin
  sesión. Cancelar en el IAM o un `state` que no corresponde también terminan sin sesión.
- Se eliminaron el RUT, el nombre y el código por correo del ingreso, y el recuadro
  «Probar como» (las cuentas de prueba están en la pantalla del IAM).
- La sesión guardada pasó a `reserva_veraneo_sesion_v4`.
- [PENDIENTE] Nombres definitivos de los roles y del atributo de región: se fijan al
  preparar el alta en el IAM (`registro-iam/preparar_alta.py`), con Luis Monsalve.
- En el producto el canje lo hace el backend (patrón BFF) y el token no llega al navegador;
  en la maqueta todo ocurre en el navegador (`datos/iam.js`).

## Tema oscuro y estándar de interfaz (12-11-2026)

La maqueta adopta las reglas de `identidad/ESTANDAR_UI.md` que bloquean: tema oscuro
(sistema, claro u oscuro, con la clave `coipo_tema` de la semilla), foco como token,
movimiento reducido completo, título del banner en la zona medida y banner corto en
teléfono. Detalle y brechas que quedan: `CUMPLIMIENTO-FABRICA.md`.

## Ingreso (ajuste 1, 20-10-2026) — reemplazado el 12-11-2026

1. Pregunta inicial: "¿Es usted funcionario/a de CONAF?"
   - **Sí** (incluye afiliados jubilados): RUT y nombre. El sistema busca el RUT en las
     nóminas de CONAF y Bienestar y deduce calidad, tipo de contrato, región, rol y perfil.
     La persona nunca elige su categoría.
   - **No, trabajo en otro servicio público** (Art. 9): RUT, nombre, servicio, región,
     correo institucional y teléfono opcional.
2. Verificación con un **código de 6 dígitos enviado al correo** (de la nómina, o el
   declarado por el externo). Vence en 10 minutos y se puede reenviar.
3. Si el RUT no existe o el nombre no coincide, el mensaje es el mismo en ambos casos,
   para no revelar quién está en la nómina.
4. Un RUT de la nómina no puede ingresar como externo.
5. El perfil (solicitante, encargada, Oficina Central, UIA) sale del RUT. Las personas
   internas entran por la misma pantalla.
6. Maqueta: el recuadro "Probar como" carga personas ficticias y el código se muestra en
   pantalla. Se eliminó el selector "Ver como".
7. Solo maqueta (20-10-2026): un RUT válido que no está en la nómina de prueba entra como
   afiliado/a activo/a de demostración de la Región Metropolitana, con un aviso visible.
   En la versión real ese caso muestra el mensaje de "no encontramos".

## Panel de la encargada regional (paso 2, 20-10-2026)

Ve solo las casas de su región. Tres pestañas: **Inicio**, **Reservas** e **Inventario**.

**Inicio**, en este orden:
1. **Llegadas y salidas** de hoy y mañana, con teléfono de contacto.
2. **Ocupación de las próximas 4 semanas**: una franja por casa (ocupada, bloqueada por
   mantención, libre).
3. **Reservas nuevas de los últimos 7 días**, solo informativas, marcando si son de otro
   servicio público, si tienen pago anticipado pendiente o si llevan perro de asistencia.

**Reservas**: todas las de la región, con filtro por estado y casa, búsqueda por nombre,
RUT o código, y detalle con personas, pago e historial de envíos al usuario.

**Inventario** (Art. 2 e, Art. 13, Anexo B):
- Por casa: mobiliario, equipamiento, menaje y ropa de cama, con cantidad, estado
  (bueno, regular, malo) y observación; además llaves, controles, gas, vencimiento del
  extintor (avisa si está vencido) e indicaciones.
- Una casa sin inventario parte de una lista sugerida según su capacidad, o en blanco.
- Al guardar se crea una nueva versión y **se envía automáticamente** a cada reserva
  confirmada de esa casa que aún no comienza. Al crearse una reserva también se envía.
- El usuario lo ve en el detalle de su reserva, con el aviso de las 12 horas para
  informar diferencias (Art. 13).

**Acta de entrega-recepción** (Art. 2 f, Art. 13 y Anexo B; decisión 20-10-2026):
- Es un archivo PDF que se genera **al confirmarse la reserva** y se envía al correo del
  usuario. Si la encargada actualiza el inventario antes de la llegada, se genera y envía
  una versión nueva (ACTA-AAAA-NNNN-1, -2, ...).
- Contenido completo del Anexo B: casa, fechas y personas; inventario con estado y
  observaciones; llaves, gas y extintor; sección de ingreso (observaciones dentro de 12
  horas); sección de salida (aseo, daños, valorización, conformidad); firmas.
- Cada acta guarda una copia del inventario tal como se envió, para que el archivo
  descargado después sea idéntico al recibido por el usuario.
- La encargada la descarga desde el historial de la reserva (pestaña Reservas). El
  usuario también puede descargar una copia desde el detalle de su reserva.
- **Devolución por correo** (decisión 20-10-2026): el usuario envía a la encargada
  regional, por correo, el acta con la sección de ingreso completa dentro de las 12 horas
  y, al salir, el acta firmada. El acta y el detalle de la reserva indican el correo de la
  encargada de la región de la casa. El sistema no recibe esos archivos.

## Panel de la Oficina Central (paso 3, 20-10-2026)

Cinco pestañas: **Inicio**, **Cobros**, **Casas y tarifas**, **Sorteo** y **Dashboard**.
El sorteo se describe en la sección siguiente.

**Inicio nacional**
- *Requiere atención*: pagos anticipados sin registrar con llegada en 7 días, extintores
  vencidos o por vencer en 30 días, casas sin inventario y devoluciones pendientes.
- *Regiones · próximos 30 días*: casas, ocupación y reservas nuevas de los últimos 7 días.

**Cobros** (Art. 10, 11 y 21; Anexo A)
- *Nómina de descuentos* por mes: cada estadía finalizada con planilla se descuenta en sus
  cuotas a partir del mes siguiente a la salida; los cargos por desistimiento, en el mes
  siguiente al aviso. Agrupada por persona con detalle desplegable. Estados: programada,
  por informar, informada a Remuneraciones, descontada. Descarga CSV (separador `;`,
  abre en Excel).
- *Pagos por registrar*: transferencias de reservas confirmadas, con plazo antes de llegar.
  La glosa trae el código de la reserva. Se registra el N° de operación.
- *Devoluciones*: reservas pagadas que Bienestar anuló (Art. 11).

**Casas y tarifas** (Art. 11 y 19). Tres pestañas (ajuste 02-11-2026):
- *Casas*: cada casa está **En servicio** o **Retirada**. «Retirar del sistema» es para
  sacar una casa sin fecha de término (venta o entrega, término de convenio o arriendo,
  daño mayor sin fecha de reparación, otro): pide el motivo, muestra las reservas que aún
  no comienzan y las anula con aviso y devolución si pagó. Una estadía en curso no se
  anula. «Reincorporar» la vuelve al buscador. Reemplaza al interruptor «Disponible».
- *Tarifas*: la tarifa de afiliado por noche se actualiza de dos formas, a elección:
  **digitar en pantalla** (tabla de todas las casas, revisión de cambios y guardado en un
  paso) o **cargar planilla Excel (.xlsx) o CSV**. Se descarga un formato tipo con las
  casas, su ID y su tarifa vigente, y una hoja de instrucciones. Columnas, en este orden:
  ID casa · Casa · Región · Tarifa vigente afiliado ($/noche) · Nueva tarifa afiliado
  ($/noche). El sistema identifica la casa por el ID; la nueva tarifa en blanco = sin
  cambio. Antes de aplicar valida la cabecera, IDs existentes y no repetidos, montos
  enteros entre $5.000 y $500.000 (`lib/planillaTarifas.js`), y avisa si el
  nombre no coincide o la variación supera 30%. Con un error no se aplica nada. Toda
  actualización queda en un historial (fecha, persona, forma y archivo). Los cambios rigen
  para reservas nuevas. La tarifa diferenciada global se mantiene.
- *Bloqueos de fechas*: cierran noches concretas de una casa que sigue en servicio
  (mantención, fumigación, fuerza mayor). Antes de bloquear muestra las reservas
  afectadas; al confirmar, se anulan, se avisa a cada persona con el motivo y se marca la
  devolución si había pagado.

**Dashboard para la toma de decisiones**
- Filtros: período (año a la fecha, últimos 90 días, este mes, próximos 90 días) y región.
- Indicadores: usuarios distintos, reservas, noches ocupadas, ocupación, ingresos e
  ingreso por noche, anticipación promedio, desistimientos con sus cargos y reservas
  anuladas por Bienestar.
- *Hallazgos del período* en texto: casa más usada, casa con más ingresos, concentración
  de ingresos en las 5 primeras, casa con menor ocupación, región con mayor ocupación y
  tasa de desistimiento.
- Gráficos: ingresos por mes, noches por mes, top 10 casas por uso y por ingresos,
  ocupación por región, reservas por calidad de usuario y por forma de pago.
- Tabla de todas las casas, ordenable por cualquier columna, con descarga CSV.
- Reglas de cálculo documentadas en `frontend/src/lib/indicadores.js`, para replicarlas en
  el backend.

## Reserva asistida (20-10-2026) — ajustada el 12-11-2026 (ver arriba)

Hay personas que no manejan el computador y piden la reserva a la encargada regional o a
Oficina Central. Ambas tienen en su inicio el aviso **«¿Alguien le pidió una reserva?»**
con el botón *Reservar para otra persona*.

1. **Persona**: si es de CONAF (activo/a o jubilado/a) se busca por RUT en la nómina; si es
   de otro servicio público se ingresan nombre, RUT, servicio, región, correo y teléfono.
2. **Casa**: cualquier casa del país (la encargada parte con las de su región).
3. **Reserva**: el mismo flujo del solicitante (calendario, quiénes van, pago), con las
   mismas reglas calculadas para la persona: anticipación según su calidad, una reserva por
   mes, temporada alta por sorteo y formas de pago.
4. **Respaldo**: quien registra declara que la persona le pidió la reserva. La reserva queda
   a nombre de la persona, con *registrada por* (nombre y perfil). La persona recibe por
   correo el comprobante, el acta y un enlace para aceptar el reglamento y, si paga por
   planilla, autorizar el descuento. Mientras no acepte, la reserva figura como pendiente
   de aceptación para la persona, la encargada y Oficina Central.

## Sorteo de temporada alta (paso 4, 20-10-2026)

> **Ya no rige** (decisión 12-11-2026, 17:29: sin temporadas altas ni sorteo). Se conserva como historia.

Aplica el Art. 6.

**Temporadas configurables** (ajuste 02-11-2026): Oficina Central crea y edita cada
temporada alta en la pestaña Sorteo: tipo (verano o invierno), nombre, llegada del
primer turno, salida del último, día de cambio de turno y plazo de postulación. Antes
de guardar ve los turnos que se sortearán; las fechas deben completar turnos enteros y
la postulación debe cerrar antes de que empiece la temporada. Desde que se guarda,
esas noches quedan cerradas a la reserva directa. Con postulaciones solo se puede
cambiar el cierre de la postulación; una temporada sorteada no se modifica.

**Un sorteo por temporada, con apertura manual** (decisión 02-11-2026): cada temporada
alta (verano o invierno) tiene su propio sorteo. La postulación **no se abre por fecha**:
se abre cuando Oficina Central pulsa «Habilitar postulación» en la temporada, y queda
abierta desde ese día hasta el cierre definido. La pestaña del solicitante se llama
«Temporadas»: muestra las temporadas de verano e invierno con su estado (postulación aún
no habilitada, abierta, cerrada o sorteo realizado) y abre el sorteo de la que elija. En
Oficina Central la pestaña también se llama «Temporadas»; «Ver sorteo» cambia el sorteo
que se muestra debajo. La prioridad (Art. 6 a) sale del último sorteo realizado antes de
esa temporada; si no hay uno, todos postulan con prioridad. «Mis reservas» muestra las
postulaciones de todos los sorteos.

Decisiones del 20-10-2026:

1. **Turnos fijos por casa**: 7 noches, de sábado a sábado por defecto (Art. 6 b). Verano
   2027: 8 turnos, del 2 de enero al 27 de febrero; invierno 2027: 2 turnos, del 10 al 24
   de julio. El cambio de turno se hace el mismo día (salida 12:00, ingreso 15:00).
2. **Una sola opción** por postulante: una casa y un turno. Se ve cuántas personas ya
   postularon a cada turno. Se puede retirar la postulación mientras siga abierta.
3. **Quién postula**: funcionarios/as de CONAF activos/as (afiliados, no afiliados y plazo
   fijo) y jubilados/as. Los funcionarios de otros servicios públicos no postulan: toman
   vacantes después del sorteo (Art. 9).
4. **Prioridad** (Art. 6 a): quien no tuvo casa en la temporada alta anterior queda antes
   que quien sí tuvo. Quien desistió tarde o no se presentó en la temporada alta anterior
   no puede postular (Art. 10 d).
5. **Sorteo**: por cada casa y turno se ordena al azar a los postulantes, primero los con
   prioridad. El primero se adjudica el turno y su reserva queda confirmada con la forma de
   pago que indicó al postular; el resto queda en lista de espera en ese orden. Se registra
   la semilla del sorteo para reproducir y auditar el resultado. Se avisa a todos por
   correo (Art. 6 c). Lo realiza Oficina Central al cierre de la postulación.
6. **Lista de espera** (Art. 6 d): si alguien desiste (por el sistema o por aviso escrito que
   registra Oficina Central), el sistema ofrece el turno por correo a la siguiente persona,
   que tiene **48 horas** para aceptar; si no responde o rechaza, pasa a la siguiente.
7. **Vacantes**: los turnos sin postulantes, o cuya lista de espera se agotó, quedan abiertos
   a reserva directa con las reglas habituales (anticipación, una reserva por mes, Art. 9).

En la maqueta, la postulación de verano 2027 está abierta con postulaciones ficticias, y
Oficina Central puede adelantar el sorteo y simular el vencimiento de una oferta.

## Práctica vigente del llamado a postular (decisión 06-11-2026)

> **Ya no rige** (decisión 12-11-2026, 17:29: sin temporadas altas ni sorteo). Se conserva como historia.

Fuente: Memorándum N° 6188/2026 de la Jefatura del Departamento de Bienestar del Personal
(06-11-2026, «Llamado a postular uso de casas en vacaciones de verano 2027») y el
formulario Google de postulación. Bienestar indica que verano e invierno se operan igual.
Álvaro Zegers decidió llevar a la maqueta la práctica vigente donde el reglamento
propuesto dice otra cosa:

| Tema | Práctica vigente (aplicada) | Reglamento propuesto (oct-2026) |
|---|---|---|
| Turno | 6 noches | máximo 7 noches (Art. 6 b) |
| Calendario | general: del martes 5 de enero al 1 de abril, 2 noches libres entre turnos (11 turnos, cada uno parte un día distinto); cabañas 02 y 10 de Puyehue: del sábado 2 de enero al 2 de abril, 1 noche libre (13 turnos, sábado a viernes) | — |
| Tarifa | por noche y por familia, en dos tramos según grado: 04 a 14 y 15 a 19 | una tarifa por casa y categoría (Art. 19) |
| Desistimiento | sin costo hasta 10 días hábiles antes de la llegada; después se paga la estadía completa | 7 días corridos; después una noche (Art. 10 a) |
| Pago de temporada alta | descuento por planilla en 6 cuotas desde marzo 2027 | número de cuotas según Anexo A |
| Casas | 22 casas en el llamado, con capacidad de 4 a 6 personas | — |

Cómo quedó en la maqueta:

- Cada temporada se define en Oficina Central con: noches por turno, fin de la temporada,
  calendario general (llegada del primer turno y noches libres) y, si hace falta, un
  calendario especial para algunas casas; además, cuotas y mes de la primera cuota.
  Los turnos se muestran como en el llamado (S01, S02…).
- Las casas son las 22 del memorándum, con sus nombres, capacidades y tarifas. Las ocho
  que estaban en la maqueta y no aparecen en el llamado (El Belloto, Temuco, P.N.
  Conguillío, Puerto Montt 1 Pelluco, Coyhaique, La Junta, Cochrane y Punta Arenas) se
  sacaron.
- La nómina de prueba tiene el grado de cada trabajador/a activo/a; jubilados/as y otros
  servicios pagan el tramo 04 a 14. El adicional de no afiliados y otros servicios se
  suma al tramo.
- La carga masiva de tarifas trae dos columnas nuevas (una por tramo) y avisa si la
  tarifa 15 a 19 queda mayor que la 04 a 14.
- El desistimiento cuenta los días hábiles de lunes a viernes, sin descontar feriados.
- La reserva directa fuera de temporada mantiene hasta 3 cuotas desde el mes siguiente a
  la salida.
- El formulario de postulación ya no pide correo, región, RUT ni nombre (salen del
  ingreso y de la nómina; el contacto se puede cambiar). Sigue pidiendo casa, turno,
  personas (para validar la capacidad), forma de pago y aceptación del reglamento. Una
  persona postula una vez; si se equivoca, retira la postulación y vuelve a postular,
  sin depuración manual.

Observaciones al formulario Google actual (para Bienestar):

- Quien elige una casa del calendario general también debe responder la fecha de las
  cabañas de Puyehue: el comprobante de una postulación real (06-11-2026) trae las dos
  fechas. VERIFICADO con ese comprobante.
- La opción S01 del calendario general tiene un destino distinto al de los demás turnos
  (VERIFICADO en la configuración; su efecto no se comprobó).

## Primera etapa solo con encargados (decisión 12-11-2026)

Bienestar definió que la implementación parte solo con los encargados. Fuente: lo que
Bienestar le planteó a la UIA, transmitido por Álvaro Zegers el 12-11-2026.

- **Los afiliados/as no ingresan al sistema.** El ingreso queda solo para la encargada
  regional y el encargado nacional; cualquier otro RUT recibe el aviso de pedir la reserva o
  la postulación a la encargada de su región.
- **«Oficina Central» pasa a llamarse encargado nacional** (perfil `central` en el código).
- **El perfil Mantenimiento UIA se elimina**: sus funciones (usuarios, nóminas, parámetros,
  estado del sistema) pasan al encargado nacional, en la pestaña «Administración», que en la
  maqueta muestra solo lo que tendrá.
- **Reservas:** la encargada regional y el encargado nacional las registran a nombre de la
  persona (de la nómina o de otro servicio público), con «Registrar reserva».
- **Postulaciones al sorteo:** también las registra el encargado («Registrar postulación»),
  que puede retirarlas.
- **La declaración del encargado reemplaza la aceptación de la persona.** Al registrar,
  el encargado declara que la persona le pidió la reserva o la postulación y que conoce y
  acepta el reglamento; con planilla, además, que la persona autorizó el descuento. La reserva
  queda con `registrada_por` y `declaracion_encargado`; ya no hay «aceptación pendiente».
- **Desistimientos y respuestas a la lista de espera:** los registra el encargado
  (`desistimiento_registrado_por`); en Temporadas, el encargado nacional marca si la persona
  acepta o no el cupo ofrecido.
- Se eliminaron las pantallas del solicitante (buscar casas, ficha, mis reservas) y la clave
  de sesión pasó a `reserva_veraneo_sesion_v3`, para que no se recupere una sesión de
  afiliado guardada.
- Lo que el reglamento pide al «solicitante» (Art. 5, 27, Anexo A) lo cumple ahora el
  encargado en su nombre. [PENDIENTE: confirmar con Bienestar si eso basta o si se necesita
  una firma o un correo de la persona.]

## Rediseño: Panel, Reservas con tablero y vía de la solicitud (decisión 12-11-2026, tarde)

Fuente: Álvaro Zegers (UIA), 12-11-2026 15:35: el foco es gestionar las reservas que las
personas piden a la encargada regional o al encargado nacional por cualquier vía.

- **Reservas y Disponibilidad se fusionan** en una sola pantalla, «Reservas»: arriba un
  tablero de ocupación (una fila por casa, una columna por noche, 28 noches en escritorio y
  14 en teléfono) y abajo el listado con filtros. Una reserva se gestiona tocando su barra
  (detalle con vía, historial y ficha; la opción de aprobar se quitó el 13-11-2026). Para
  registrar se toca la primera noche libre y luego la última. La encargada puede mirar
  cualquier región, pero solo registra en la suya. El filtro «Personas» cierra las casas
  que no alcanzan. Con teclado, el tablero es una sola parada de tabulación; las flechas
  recorren las noches y Enter elige o abre. `/gestion/disponibilidad` lleva a Reservas.
- **Inicio pasa a ser un Panel de control**: solo lo que pide acción hoy (por aprobar —desde el 13-11-2026, pagos en efectivo por recibir—, por
  confirmar o pagos por registrar, llegadas y salidas, inventario o extintores), cada cifra
  con enlace a donde se resuelve. Se quitó el aviso «¿Alguien le pidió una reserva…?»: el
  botón «Nueva solicitud» (y «Registrar postulación» con la postulación abierta) está en
  la cabecera del Panel y de Reservas. La franja de ocupación pasó al tablero.
- **Vía de la solicitud, obligatoria**: teléfono, correo electrónico, presencial, WhatsApp u
  otra. Queda en la reserva (`via`), el detalle, el listado, el comprobante y la ficha. Las
  reservas de la demostración tienen una vía ficticia repartida. Clave de almacenamiento
  `reserva_veraneo_v15`.
- **Menú del encargado nacional agrupado**: Panel · Reservas · Cobros · Temporadas ·
  Dashboard · Configuración. Configuración reúne Casas, Tarifas, Bloqueos de fechas y
  Administración (las rutas antiguas `/central/casas` y `/central/administracion` llevan ahí).
- **Inventario** queda como estaba (Álvaro Zegers: «el inventario está correcto»).
- [PENDIENTE: Bienestar] Si la postulación al sorteo también debe registrar la vía (hoy no).
- [PENDIENTE: Bienestar] Si «WhatsApp» es un canal aceptado institucionalmente para pedir
  reservas, o se reemplaza por «Mensajería».

## Registro en panel lateral, solicitudes no atendidas y antecedentes (decisión 12-11-2026, tarde)

Fuente: Álvaro Zegers (UIA), 12-11-2026, eligiendo entre mejoras propuestas.

- **Registro en un panel lateral de Reservas**: el formulario de tres pasos se reemplaza por
  un panel a la derecha (pantalla completa en el teléfono) con todo en una columna: casa y
  fechas (vienen del tramo del tablero y se pueden cambiar), persona por RUT con sus
  antecedentes, quiénes van, contacto, pago, vía y declaración. Al registrar, el panel se
  cierra y Reservas dice el resultado. Si las reglas de la persona no lo permiten, el panel
  lo dice (desde el 12-11-2026, 16:45, sin ofrecer registrar el pedido). `/gestion/reservar` y «Nueva
  solicitud» del Panel abren este panel.
- ~~Solicitudes no atendidas~~ **(quitado el 12-11-2026, 16:45)**: Álvaro Zegers: «quita todo lo
  que tenga que ver con las solicitudes no atendidas; la lógica es que solo se ingresen las
  que sí tengan disponibilidad». No hay registro de pedidos no atendidos, ni lista, ni conteo
  en el Dashboard, ni en los antecedentes ni en la actividad. Si las reglas de la persona no
  permiten registrar, el panel lo dice y pide elegir otras fechas u otra casa. Clave
  `reserva_veraneo_v17`.
- **Antecedentes de la persona**: al encontrarla por RUT (en el registro y en la postulación)
  se muestran avisos primero (ya tiene reserva ese mes, transferencia sin registrar, cargo
  por desistimiento, no podrá postular al próximo sorteo) y luego sus reservas de los últimos
  12 meses y próximas y sus postulaciones.
- Deuda técnica declarada: `Reservar.jsx` conserva el modo de tres pasos sin uso; se limpia
  en la próxima iteración.

## Sin temporadas altas ni sorteo (decisión 12-11-2026, 17:29)

Fuente: Álvaro Zegers (UIA), 12-11-2026: «ahora que el sistema de gestión de reservas no será
utilizado por los usuarios, todo lo referente a las temporadas debe ser quitado, ya que la
lógica solamente es registrar las solicitudes cuando haya disponibilidad». Respuestas del
mismo día: las fechas de verano e invierno se registran como cualquier otra, por orden de
llegada; siguen todas las reglas del reglamento para la persona (capacidad, una reserva por
mes, anticipación de 90 días y 15 para otros servicios, perro de asistencia, forma de pago);
las reservas de prueba que venían del sorteo se quitan.

- Se quitaron la pestaña Temporadas, «Registrar postulación», el sorteo (con lista de espera,
  ofertas y turnos vacantes), las noches cerradas por temporada alta en el tablero y su
  leyenda, las cuotas de temporada alta (y sus dos parámetros en Configuración), las
  postulaciones en los antecedentes, el aviso «no podrá postular al próximo sorteo» y la
  actividad de temporadas y sorteos. Se borraron `lib/sorteo.js`, `Sorteo.jsx`,
  `Temporadas.jsx`, `PostulacionAsistida.jsx`, `Postulacion.jsx` y `Calendario.jsx` (el
  calendario solo lo usaba el formulario de tres pasos, que ya no se usaba: `Reservar.jsx`
  quedó solo como el contenido del panel lateral). Clave `reserva_veraneo_v18`.
- Las secciones de este documento sobre temporada alta y sorteo quedan como historia: **ya
  no rigen**.
- Siguen las reglas de la persona: Art. 7 (una reserva por mes), Art. 9 (otros servicios, 15
  días), anticipación máxima de 90 días, Art. 14 (capacidad), Art. 15 (perro de asistencia),
  Art. 21 (forma de pago) y el desistimiento del Memo 6188/2026.
- [PENDIENTE: Bienestar] Si el Art. 6 del reglamento propuesto (sorteo de temporada alta) se
  elimina o se modifica, para que la norma y el sistema digan lo mismo.

## Configuración del encargado nacional (decisión 12-11-2026, tarde)

Fuente: Álvaro Zegers (UIA), 12-11-2026: «construye el perfil configuración».

Configuración tiene siete pestañas: Casas, Tarifas, Bloqueos de fechas, Usuarios y
encargadas, Parámetros, Plantillas de correo y Actividad. La pestaña va en la dirección
(`?pestana=`). Reemplaza a «Administración (en construcción)»; `/central/administracion`
lleva a Usuarios y encargadas.

- **Usuarios y encargadas**: quién entra, con qué rol del IAM, perfil y región, y quién
  aprueba en cada región (la encargada, o el encargado nacional si la región no tiene
  encargada). **Se ven aquí y se editan en el COIPO IAM**: la aplicación no guarda permisos
  propios.
- **Parámetros del reglamento**: anticipación (general y otros servicios), aviso de
  desistimiento, aviso de retiro anticipado, días de aseo, cuotas por planilla, plazo de
  observaciones del inventario, horas de ingreso y salida, y noches y cuotas por defecto de
  las temporadas nuevas. Cada cambio pide **desde cuándo rige** (hoy o una fecha futura) y
  su respaldo (resolución, memo o acuerdo); queda en un historial con el valor anterior; un
  cambio programado se puede anular antes de que rija. Las reservas ya registradas no
  cambian. INFERIDO: desde la fecha de vigencia, el valor nuevo se aplica a todo registro,
  aunque la estadía sea posterior; si Bienestar quiere que rija según la fecha de la
  estadía, hay que decirlo [PENDIENTE: Bienestar].
- **Plantillas de correo**: ficha de la reserva, datos para transferir, no aprobada (quitada el 13-11-2026),
  desistimiento y anulación por Bienestar. Asunto y cuerpo con variables entre llaves
  (`{nombre}`, `{codigo}`, `{casa}`, `{fechas}`, `{monto}`, `{glosa}`, `{motivo}`,
  `{registrada_por}`, `{hora_ingreso}`, `{plazo_observaciones}`); una variable mal escrita no se puede guardar; vista
  previa con una reserva de ejemplo; se puede restaurar el texto original. El historial de
  cada reserva muestra el correo tal como habría salido. En la maqueta no se envía nada.
- **Actividad**: quién hizo qué y cuándo (reservas registradas, desistimientos —las aprobaciones se quitaron el 13-11-2026—,
  pagos y devoluciones, bloqueos, tarifas, casas retiradas o reincorporadas, direcciones,
  inventarios, temporadas y sorteos, nómina, parámetros y plantillas), con
  búsqueda, filtros por área y persona, y descarga CSV. No es una bitácora aparte: se arma con
  el «quién y cuándo» que cada acción ya deja, así no puede desviarse de los datos. Las
  tarifas diferenciadas (Art. 19) aún no dejan quién las cambió, y no aparecen.
- [PENDIENTE: Bienestar] Quién aprueba en las regiones sin encargada (hoy el nacional) y
  cuántos días se conserva el registro de actividad.

## Nombre del sistema y banner (decisión 12-11-2026, 17:07)

Fuente: Álvaro Zegers (UIA), 12-11-2026: «El título del sistema debe ser: Sistema de Gestión
de Reservas […] Usa el mismo formato de la maqueta de Gestión de flota», y «al lado de UIA
debe decir Gerencia de Desarrollo de las Personas, Departamento de Bienestar».

- Nombre: **Sistema de Gestión de Reservas**, con «Departamento de Bienestar» debajo (antes
  «Casas de Veraneo · Servicio de Bienestar · CONAF»). Cambia en el banner, la cabecera del
  teléfono, el ingreso, el IAM simulado, el título de la pestaña del navegador y la firma de
  las plantillas de correo. «Casas de Veraneo o Descanso» se mantiene donde es el nombre del
  reglamento.
- Banner: el de la **Gerencia de Desarrollo de las Personas** de la fábrica
  (`coipo_master_produccion/identidad/5_banner_DESARROLLO_PERSONAS.jpg` y su versión corta,
  copiados sin modificar a `src/assets/`), como Gestión de Flota usa el de su gerencia. La
  imagen trae «Gerencia de desarrollo de las personas» junto a UIA; «Departamento de
  Bienestar» va bajo el título, en la zona del título (UI-1), porque el banner oficial no lo
  trae y editar el activo de identidad no corresponde (elegido por Álvaro Zegers).

## Perfiles (2 desde el 12-11-2026)

Los asigna el rol del COIPO IAM (sección «Ingreso con el COIPO IAM»).

1. **Encargada regional**: las casas de su región; registra reservas, postulaciones y
   desistimientos.
2. **Encargado nacional** (antes Administración Oficina Central): vista nacional, cobros,
   tarifas, temporadas, sorteo y Administración (antes Mantenimiento UIA).

Hasta el 12-11-2026 había además el perfil **Solicitante** (afiliados, jubilados, no
afiliados y otros servicios públicos) y **Mantenimiento UIA**.

## Reglas aplicadas al solicitante

Desde el 12-11-2026 las aplica el sistema cuando el encargado registra a nombre de la
persona.

| Regla | Aplicación | Fuente |
|---|---|---|
| Confirmación | Automática si hay disponibilidad y se cumplen las reglas (difiere del texto del Art. 5) | Decisión 20-10-2026 |
| Temporada alta (enero-febrero e invierno) | Solo por sorteo, a turnos de sábado a sábado; los turnos vacantes después del sorteo se reservan directo | Art. 6, decisión 20-10-2026 |
| Reservas por mes | Una por mes calendario | Art. 7 |
| Otros servicios públicos | Reservan con hasta 15 días de anticipación (cupos no tomados por personal de CONAF); tarifa diferenciada y pago anticipado | Art. 9, decisión 20-10-2026 |
| Desistimiento | Sin costo con 7 o más días corridos; si no, o si no se presenta, una noche; fuerza mayor acreditada sin costo | Art. 10 |
| Retiro anticipado | Aviso con 2 días; sin aviso se cobra el período completo (en condiciones de uso) | Art. 10 e) |
| Horarios | Ingreso 15:00, salida 12:00 | Art. 12 |
| Capacidad | No se puede superar al solicitar; se cuentan niños y niñas | Art. 14 |
| Perro de asistencia | Se informa en la solicitud y se adjuntan la credencial de usuario de perro de asistencia de la entidad adiestradora (D.S. N° 223/2006, Art. 6) y el certificado sanitario vigente con vacuna antirrábica (Art. 9) | Art. 15, Anexo A; decisión 20-10-2026 |
| Buscador | Solo filtra por región; las fechas se eligen en el calendario de cada casa y las personas en el paso 2 | Decisión 20-10-2026 |
| Quiénes van | Solo aparece quien hace la solicitud, con la opción «Yo también viajo»; el resto se ingresa a mano (no se sugiere el grupo familiar). Si no viaja, sigue siendo el usuario/a responsable y debe indicar a una persona mayor de edad a cargo en la casa | Art. 2 a), 8 y 22; decisión 20-10-2026 |
| Tarifa | Por noche y por casa; diferenciada para no afiliados y otros servicios | Art. 19 |
| Matrimonio o AUC | Aviso en la ficha a afiliados; se solicita a la encargada (flujo completo en un paso posterior) | Art. 20 |
| Formas de pago | Funcionarios/as de CONAF: descuento por planilla (con autorización y hasta 3 cuotas). Plazo fijo: planilla o transferencia. Jubilados y otros servicios públicos: solo transferencia antes de llegar. No hay pago en dependencias de Bienestar. Si una transferencia no se registra, solo se alerta a Bienestar | Art. 21, decisión 20-10-2026 |
| Datos de la transferencia | Corporación Nacional Forestal, RUT 61.313.000-4, Banco de Chile, cuenta corriente N° 500-04. Glosa: "Pago casa {nombre de la casa} {código}", por ejemplo "Pago casa Viña del Mar R-2026-0201". Se muestran en un cuadro al elegir la transferencia (hay que cerrarlo para continuar) y en el comprobante | Decisión 20-10-2026 |
| Datos de la solicitud | Usuario responsable: nombre, RUT, rol, región, calidad. Acompañantes: solo nombre y edad (y relación) | Anexo A |
| Aceptación del reglamento | Obligatoria al confirmar; desde el 12-11-2026, la declara el encargado que registra | Art. 27, Anexo A; decisión 12-11-2026 |
| Anticipación máxima | 90 días, como parámetro editable (el reglamento de octubre no la fija) | Decisión 20-10-2026 |
| Aseo | Un día libre entre reservas | Decisión de Bienestar |
| Motivo de la estadía | No se pide (médico, laboral o personal); el reglamento no lo usa para asignar | Decisión 20-10-2026 |

Todos los números están en `frontend/src/lib/reglas.js` (`PARAMETROS` y `ADICIONAL_TARIFA`).

### Cambios respecto de decisiones anteriores

- El 08-10 se definió confirmación automática en temporada normal; el reglamento de
  octubre exige confirmación (Art. 5). El 20-10 se volvió a la confirmación automática,
  ahora en todos los casos (ver sección "Confirmación automática").
- El 08-10 se definió que los contratos a plazo fijo podían usar planilla; luego se aplicó
  el pago anticipado del Art. 21 a). El 20-10 se decidió que el plazo fijo elige planilla
  o transferencia, que los afiliados de planta pagan solo por planilla y que se elimina el
  pago en dependencias de Bienestar. Difiere del Art. 21: conviene ajustar su redacción.
- El 08-10 los externos solo solicitaban por correo: ahora reservan en el sistema, con hasta
  15 días de anticipación (Art. 9).
- El 08-10 la tarifa del trabajador no afiliado era igual a la del afiliado: el Art. 19
  la hace diferenciada.

## Supuestos a validar con Bienestar

- Montos de la tarifa diferenciada (hoy: +$5.000 por noche para no afiliados y +$15.000
  para otros servicios, solo referenciales).
- Plazo de 15 días de anticipación para funcionarios de otros servicios públicos.
- Mes en que se inicia el descuento por planilla (hoy: mes siguiente a la salida).
- Tope de 3 cuotas para el descuento por planilla (el reglamento pide indicar las cuotas
  pero no fija un máximo).

## Por confirmar con Bienestar

- Resolución anual de tarifas 2026 por casa y categoría, con capacidad máxima (Art. 14 y 19).
- Planilla oficial de inmuebles y fotos reales.
- Fechas oficiales de temporada alta y ventana de postulación al sorteo (la maqueta ya
  permite que el encargado nacional las configure).
- Rango de tarifas aceptado en la carga masiva ($5.000 a $500.000) y umbral de aviso de
  variación (30%).
- Si la práctica del Memorándum 6188/2026 (turnos de 6 noches, tarifa por grado,
  desistimiento con 10 días hábiles, 6 cuotas desde marzo) reemplaza lo que dice el
  reglamento propuesto, o al revés.
- Qué tramo de tarifa pagan jubilados/as y funcionarios/as de otros servicios (hoy 04 a 14).
- Calendario de feriados para contar los días hábiles del desistimiento.
- Si las ocho casas que no aparecen en el llamado de verano siguen en la red el resto del
  año.
- Mes de la primera cuota y fechas del sorteo de invierno 2027 (hoy referenciales).
- Plazo de 48 horas para aceptar un cupo de la lista de espera.
- Si la prioridad del Art. 6 a) considera la temporada de invierno anterior para el verano
  (así está en la maqueta) o solo la temporada equivalente del año anterior.
- Si se mantiene la anticipación máxima de 90 días.
- Ajuste del texto del Art. 5 a la confirmación automática.
- Qué hacer con una reserva por confirmar que no paga antes de llegar, y si debe haber un
  plazo para transferir después del cual se liberan las fechas (hoy quedan apartadas
  hasta la llegada).
- Si la declaración del encargado basta como aceptación del reglamento (Art. 27) y como
  autorización del descuento por planilla, o se necesita la firma o el correo de la persona.
- Cuándo entran los afiliados/as al sistema (segunda etapa).
- Si se acepta que el usuario/a responsable no viaje (la maqueta lo permite con persona a cargo).
- Casilla oficial de correo de cada encargada regional (hoy solo Valparaíso tiene una
  persona en la nómina de prueba; el resto usa una casilla genérica ficticia).
- Clasificación de El Belloto y P.N. Puyehue; fila duplicada de Bahía Inglesa.
