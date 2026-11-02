# CON001 · Red de Casas Bienestar (casas de veraneo) · Problema

Fecha: 2026-11-02 · Levantado por: Álvaro Zegers (UIA) · Documentado hacia atrás desde la
maqueta vigente, según la metodología UIA del tramo previo a la fábrica (objetivos 0 a 2).

> Este repositorio es público. Por eso las personas de Bienestar se nombran por su cargo y
> no por su nombre, y no se copian aquí documentos internos (solicitud, reglamento,
> planillas): se indica dónde están. Marcas: `VERIFICADO` (leído u oído, con fuente),
> `INFERIDO` (deducido, se dice de qué), `[PENDIENTE]` (falta preguntar, se dice a quién),
> `[VERIFICAR]` (afirmación legal o normativa sin confirmar).

## Encargo

- **Solicitante:** Servicio de Bienestar de CONAF, por medio de su Jefatura. VERIFICADO
  (documento «Solicitud de desarrollo · Sistema de Reservas en Línea para la Red de Casas
  de Huéspedes y Veraneo», Servicio de Bienestar, julio de 2026, enviado por correo a la
  UIA el 27-07-2026).
- **Palabras del encargo:** «diseño, construcción e implementación de un sistema de
  reservas en línea, de tipo hotelería, para la Red de Casas de Huéspedes y Veraneo […] que
  permita a los afiliados y afiliadas reservar los inmuebles según disponibilidad de
  calendario […] y que entregue a las encargadas regionales y a Oficina Central las
  herramientas de gestión, control, descuento y reportería». VERIFICADO (misma solicitud,
  punto 2).
- **Cambio de alcance:** después de las reuniones con Bienestar, el sistema queda solo para
  las **casas de veraneo**; las de uso mixto cuentan como de veraneo. Rige el Reglamento
  General de Uso de Casas de Veraneo o Descanso (propuesta de octubre de 2026), que
  prevalece sobre la solicitud de julio. VERIFICADO (decisión registrada el 20-10-2026 en
  `docs/DECISIONES.md` del proyecto fuente; reglamento recibido de la Jefatura del Servicio
  de Bienestar por correo el 16-10-2026).
- **Contraparte técnica:** Jefatura del Servicio de Bienestar y profesionales de la
  Sección Administración de Bienestar (Oficina Central). VERIFICADO (destinatarios y
  asistentes en los correos y reuniones del 12-08, 25-08, 06-10, 20-10 y 30-10-2026).
- **Decide que está terminado:** [PENDIENTE: preguntar a la Jefatura del Servicio de
  Bienestar quién aprueba la maqueta y por qué medio; INFERIDO que podría ser el comité
  donde la Jefatura presentó la propuesta el 05-10-2026, porque se le propusieron
  «decisiones» a ese comité].
- **Ya existe algo parecido:**
  - `Sud-Austral/coipo_cabania`: maqueta anterior de la UIA (casas de huéspedes y de
    veraneo), con despliegue a `reserva-bienestar.conaf.cl`. El contrato de la fábrica
    (`coipo_master_produccion/AGENTS.md` §1) lo describe sin backend ni código
    correspondiente a lo que corre en producción. Sus `insumos/` fueron generados por
    ingeniería inversa y describen esa maqueta, no esta. VERIFICADO (leído el 02-11-2026).
  - Iniciativa **CON001 · Red Casas Bienestar** en Confluence: carpeta vacía al
    10-09-2026. VERIFICADO (informe de cruce repos/Confluence del proyecto UIA).
  - Esta maqueta (`coipo_sistema-de-reservas`, fuente `coipo_reserva_veraneo`) es un
    producto nuevo que usó `coipo_cabania` solo como referencia de datos, fotos y reglas.
    VERIFICADO (decisión de Álvaro Zegers, octubre de 2026).

## Problema (sin solución dentro)

1. Hoy la reserva de una casa se pide por correo a la encargada y se entiende confirmada
   cuando ella responde; quien pide no ve la disponibilidad real ni tiene un comprobante
   formal. VERIFICADO (solicitud, punto 1) · [PENDIENTE: confirmación de la Jefatura del
   Servicio de Bienestar de que el problema sigue descrito así].
2. Cada región lleva sus reservas en planillas propias, y Oficina Central consolida a mano
   la información para aplicar los descuentos por planilla, con riesgo de error,
   duplicidad y demora. VERIFICADO (solicitud, punto 1; correo del 24-07-2026 sobre la
   mantención de las «planillas de reserva de las casas de Veraneo y de Huéspedes», enviado
   a 15 personas de la red de Bienestar).
3. Queda la sensación de que los cupos se ceden de forma arbitraria, y las casas se usan
   menos de lo que podrían porque su información es escasa. VERIFICADO (Jefatura del
   Servicio de Bienestar, correo del 02-10-2026: «transparencia de las reservas (muchas
   veces queda la sensación que se cedió el cupo arbitrariamente)», «aumentar el uso de las
   cabañas»).

## Proceso actual

| Paso | Quién | Herramienta | Tiempo | Dónde se rompe | Estado |
|---|---|---|---|---|---|
| Pide la reserva | Afiliado/a | Correo a la encargada | [PENDIENTE] | No ve la disponibilidad; no hay comprobante | VERIFICADO (solicitud) |
| Revisa y responde | Encargada regional | Correo y planilla de reservas de su región | «Tiempos de respuesta variables» | Depende de la casilla de una persona | VERIFICADO (solicitud, 3.1) |
| Registra la reserva | Encargada regional | Planilla de reservas (casas de veraneo y de huéspedes) | [PENDIENTE] | Registros locales no integrados | VERIFICADO (correo 24-07-2026) |
| Temporada alta | Bienestar | [PENDIENTE: cómo se asigna hoy; el reglamento propone sorteo] | [PENDIENTE] | Sensación de asignación arbitraria | INFERIDO (correo 02-10-2026 y Art. 6 del reglamento propuesto) |
| Descuento por planilla | Oficina Central | Consolidación manual → Remuneraciones | [PENDIENTE] | Error, duplicidad, demora | VERIFICADO (solicitud, punto 1) |

## Escala

- **34 inmuebles** en la red (casas de huéspedes y de veraneo), entre Antofagasta y
  Magallanes. VERIFICADO (anexo de la solicitud; su fuente es la Guía de Beneficios y
  Obligaciones del Servicio de Bienestar).
- **30 casas de veraneo** en el alcance actual (se excluyen 4 solo de huéspedes: Copiapó,
  Concepción, Santiago 1 y 2). INFERIDO de la planilla de inmuebles usada para construir la
  maqueta · [PENDIENTE: planilla oficial de inmuebles, a la Sección Administración de
  Bienestar].
- **15 personas** reciben los avisos de las planillas de reserva (encargadas regionales y
  otras de la red). VERIFICADO (correo del 24-07-2026) · INFERIDO que son las encargadas
  regionales · [PENDIENTE: número exacto de encargadas, a la Jefatura del Servicio de
  Bienestar].
- **Reservas por año, por temporada alta y número de afiliados/as:** [PENDIENTE: a la
  Sección Administración de Bienestar, con la planilla de reservas 2025-2026 como fuente].

## Norma

- Reglamento General de Uso de Casas de Veraneo o Descanso, **propuesta** de octubre de
  2026. [VERIFICAR: estado de aprobación y resolución que lo aprueba, con la Jefatura del
  Servicio de Bienestar y Fiscalía]. La maqueta se aparta de su texto en dos puntos que
  Bienestar debe resolver: confirmación automática (Art. 5) y formas de pago (Art. 21).
- Leyes N° 19.628 y N° 21.719 (protección de datos personales), citadas en el Art. 3 del
  reglamento y en la solicitud. [VERIFICAR: Fiscalía o encargado/a de protección de datos
  de CONAF].
- Ley N° 20.422 y D.S. N° 223/2006 (perros de asistencia), Art. 15 del reglamento.
  [VERIFICAR: Fiscalía].
- Ley N° 19.419 (ambientes libres de humo), Art. 3 del reglamento. [VERIFICAR].
- Paso de CONAF a SERNAFOR en 2027 y alcance de la Contraloría. [VERIFICAR: efecto sobre
  el reglamento y la administración del beneficio, con Fiscalía].

## Datos

| Dato | Fuente | Dueño | Formato | Frecuencia | Personal | Estado |
|---|---|---|---|---|---|---|
| Casas: nombre, región, localidad, tipo | Planilla de inmuebles; anexo de la solicitud | Servicio de Bienestar | Planilla (formato [PENDIENTE]) | Cambia poco | No | [PENDIENTE: planilla oficial, a la Sección Administración de Bienestar] |
| Capacidad máxima por casa | Resolución anual (Art. 14 y 19) | Servicio de Bienestar | Resolución | Anual | No | [PENDIENTE: resolución 2026, a la Jefatura] |
| Fotos, descripción, equipamiento, cercanías | Encargadas regionales | Servicio de Bienestar | Imágenes y texto | Cuando cambia | No | Simulado (fotos de banco; solo Bahía Inglesa 1 tuvo fotos reales en la maqueta anterior) · [PENDIENTE] |
| Tarifa por noche y tarifas diferenciadas | Resolución anual de tarifas (Art. 19) | Servicio de Bienestar | Resolución → planilla de carga (formato tipo de la maqueta) | Anual (1 de enero a 31 de diciembre) | No | Simulado · [PENDIENTE: resolución 2026] |
| Nómina de afiliados/as (RUT, nombre, correo, región, calidad, jubilados) | Registro de afiliados de Bienestar | Servicio de Bienestar | [PENDIENTE] | [PENDIENTE] | **Sí** | Simulado · [PENDIENTE: sistema de origen y forma de acceso, a la Sección Administración de Bienestar] |
| Nómina de personal de CONAF (no afiliados, plazo fijo) | Sistema de personal | Gerencia de Personas | [PENDIENTE] | [PENDIENTE] | **Sí** | Simulado · [PENDIENTE: a Gerencia de Personas] |
| Funcionarios/as de otros servicios públicos | Declarado por la persona al ingresar | La persona | Formulario | Por reserva | **Sí** | Construido en la maqueta |
| Personas que viajan (nombre, edad, relación) | Declarado al reservar (Anexo A) | Usuario/a responsable | Formulario | Por reserva | **Sí** | Construido en la maqueta |
| Credencial de perro de asistencia y certificado sanitario | Adjuntos al reservar | Usuario/a responsable | Archivo | Por reserva | **Sí, sensible** | Construido (simulado) · [VERIFICAR: la credencial revela una discapacidad; tratamiento como dato sensible, Ley 21.719] |
| Inventario por casa (Anexo B) | Encargada regional | Servicio de Bienestar | Formulario de la maqueta | Cuando cambia | No | Simulado · [PENDIENTE: inventarios actuales, a las encargadas] |
| Correo de cada encargada regional | Bienestar | Servicio de Bienestar | Texto | Cambia poco | Sí (institucional) | [PENDIENTE: casilla oficial por región; hoy solo Valparaíso] |
| Fechas de temporada alta y plazo de postulación | Oficina Central (Art. 6) | Servicio de Bienestar | Formulario de la maqueta | Por temporada | No | Simulado · [PENDIENTE: fechas oficiales 2027] |
| Cuenta para transferencias | Datos entregados por Álvaro Zegers | Finanzas CONAF | Texto | Cambia poco | No | VERIFICADO (decisión 20-10-2026) · [PENDIENTE: confirmación de Finanzas] |
| Nómina de descuentos por planilla | Sistema (cálculo) → Remuneraciones | Servicio de Bienestar / Remuneraciones | CSV (separador «;») | Mensual | **Sí** | Construido · [PENDIENTE: formato que recibe Remuneraciones] |
| Reservas históricas | Planillas de reserva de las regiones | Servicio de Bienestar | Planilla | Continua | **Sí** | [PENDIENTE: muestra anonimizada, a la Sección Administración de Bienestar] |

## Qué pasa si no se hace nada

[PENDIENTE: respuesta textual de la Jefatura del Servicio de Bienestar]. Lo que dice la
solicitud: se mantienen los «riesgos de error, duplicidad de reservas y demoras en la
atención» y la consolidación manual de descuentos. VERIFICADO (solicitud, punto 1).

## Pendientes

| # | Pregunta | A quién | Desde | Estado |
|---|---|---|---|---|
| P1 | ¿Quién aprueba la maqueta y por qué medio (correo, acta de comité)? | Jefatura del Servicio de Bienestar | 2026-11-02 | Abierto |
| P2 | ¿El problema sigue descrito como en la solicitud de julio? ¿Qué pasa si no se hace nada? | Jefatura del Servicio de Bienestar | 2026-11-02 | Abierto |
| P3 | Reservas por año, por temporada alta y número de afiliados/as | Sección Administración de Bienestar | 2026-11-02 | Abierto |
| P4 | Planilla oficial de inmuebles, capacidad y resolución de tarifas 2026 | Sección Administración de Bienestar | 2026-10-20 | Abierto |
| P5 | Sistema de origen y acceso a la nómina de afiliados y de personal | Sección Administración de Bienestar y Gerencia de Personas | 2026-11-02 | Abierto |
| P6 | Formato de la nómina de descuentos que recibe Remuneraciones | Remuneraciones | 2026-11-02 | Abierto |
| P7 | Estado de aprobación del reglamento propuesto | Jefatura del Servicio de Bienestar | 2026-11-02 | Abierto |
| P8 | Tratamiento de datos personales y de la credencial de perro de asistencia | Fiscalía / encargado/a de protección de datos | 2026-11-02 | Abierto |
| P9 | Resultado de la reunión del 30-10-2026 | Álvaro Zegers | 2026-11-02 | Abierto |
| P10 | Reglas por confirmar listadas en `docs/DECISIONES.md` del proyecto fuente (fechas de temporada, 48 horas, 90 días, montos, plazo para transferir, etc.) | Jefatura del Servicio de Bienestar | 2026-10-20 | Abierto |
