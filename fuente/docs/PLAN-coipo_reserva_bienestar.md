# Plan: `coipo_reserva_bienestar`, el sistema de reservas en producción

Borrador del 25-11-2026, para Álvaro Zegers y Luis Monsalve. Sigue
`docs/COMO-USAR-LA-FABRICA.md` de `coipo_master_produccion` @ `fc1907b`; cada paso cita el
documento de la fábrica que lo manda.

## Qué se decidió

**25-11-2026 · Álvaro Zegers:** el aplicativo final se construye en un **repositorio nuevo,
`coipo_reserva_bienestar`**, sembrado con la fábrica. `reserva-bienestar.conaf.cl` lo sigue
sirviendo `coipo_cabania` (maqueta sin backend, vm2:8114) hasta el cambio. Ese día el vhost pasa
al sistema nuevo y `coipo_cabania` se apaga y se archiva.

No se renombra `coipo_cabania`: su despliegue usa el nombre del repositorio como carpeta del
servidor (`/opt/apps/<nombre>/`) y como proyecto de Docker, y renombrarlo después del primer
despliegue deja la carpeta huérfana (`COMO-USAR-LA-FABRICA.md`, paso 2).

La maqueta de `coipo_sistema-de-reservas` es la especificación: pantallas, reglas, textos y
datos de prueba. No se despliega.

## Lo que falta decidir

| # | Decisión | Quién | Propuesta |
|---|---|---|---|
| D1 | Funciones de `coipo_cabania` que se integran: mapa y zonas de interés, motivo y prelación, sanciones de usuarios, reportes, valoraciones, casas de huéspedes | Bienestar, con Álvaro Zegers | Ninguna por ahora: varias las quitó Bienestar (huéspedes; Dashboard, 18-11-2026). Se agregan después como módulos, si se piden |
| D2 | Puesta en marcha | Bienestar y Luis Monsalve | UAT primero; producción con la aprobación de Bienestar registrada (el objetivo 6 del rastro sigue bloqueado) |
| D3 | Banner de la gerencia | Bienestar | `9_CONAF_UIA`, el que lleva la maqueta desde el 18-11-2026. La alternativa es `5_DESARROLLO_PERSONAS`, que se probó y se revirtió |
| D4 | Puerto (`APP_PORT`) | Luis Monsalve, en vm2 | Un puerto nuevo libre (`sudo ss -tlnp \| grep :<puerto>`). El 8114 sigue ocupado por `coipo_cabania` hasta el cambio (paso 3) |
| D5 | Dominio de UAT | Luis Monsalve | DESCONOCIDO: lo define `infra-docker-base` (`deploy-uat.yml`) |
| D6 | De dónde sale la nómina de afiliados (RUT, calidad, grado, región, correo) y a quién se entrega el CSV de Remuneraciones | Bienestar y Remuneraciones | DESCONOCIDO. Es el dato personal real del sistema (Leyes 19.628 y 21.719) |
| D7 | Roles del IAM | Luis Monsalve, al preparar el alta | `encargado_regional` (con `region_id`), `encargado_nacional`, `trabajador` (etapa 2), y `administrador` y `auditor` para la Actividad, que la fábrica pone siempre (`docs/decisiones/2026-11-auditoria-siempre.md`) |
| D8 | Envío de correo (la ficha, los datos para transferir, los avisos) | Luis Monsalve | La capacidad ya resuelta de la flota: bandeja de salida y Gmail API (`capacidades/correo/`) |

## Cómo se siembra

Siembra **normal**, no `--maqueta`. La maqueta ya sigue el estándar de interfaz de la flota
(banner, tema claro y oscuro, foco; ver `CUMPLIMIENTO-FABRICA.md`), así que la cara de la
semilla coincide con la validada. Además, `--maqueta` no sirve para esta maqueta: espera HTML y
CSS planos (hallazgo G). Las pantallas se portan a mano a TypeScript y capas, mirando la maqueta.

```powershell
gh repo create Sud-Austral/coipo_reserva_bienestar --private --clone
cd coipo_reserva_bienestar
python ../coipo_master_produccion/semilla/sembrar.py --destino . --gerencia 9_CONAF_UIA `
  --dominio reserva-bienestar.conaf.cl --puerto <D4> --titulo "Casas de Veraneo" `
  --descripcion "Reservas de las casas de veraneo del Servicio de Bienestar de CONAF."
```

## Fases

| Fase | Qué | Quién | Fuente |
|---|---|---|---|
| F0 | El PC: Node, `gh` y Docker instalados; `git -C ../coipo_jueces fetch --tags --force`; `python semilla/doctor.py` sin FALTA | Álvaro Zegers | paso 0 |
| F1 | Crear el repositorio en Sud-Austral | Luis Monsalve (o quien tenga permiso en la organización) | paso 4 |
| F2 | Ficha `proyecto.coipo.yaml` y consulta a la fábrica: `docs/CONSTRUCCION.md` con la metodología y sus `correlation_id`, o la copia local con su sha256 | IA | `prompts/10`, `prompts/05` |
| F3 | Sembrar (comando de arriba) y pasar los jueces en verde sobre la siembra vacía | IA | paso 5 |
| F4 | Plan de implementación aprobado, con el modelo de datos | IA propone, Álvaro Zegers aprueba | `semilla/ESQUELETO/prompts/00-plan-de-implementacion.md` |
| F5 | Construir por módulos (tabla de abajo). Cada uno: dominio puro en TypeScript y en Python, tablas en `db/`, casos de uso con prueba (COD-4), API, pantallas iguales a la maqueta, `datos_prueba/` y jueces | IA, con revisión de Álvaro Zegers | `docs/ESTANDAR_CODIGO.md`, `docs/DATOS_DE_PRUEBA.md` |
| F6 | Alta en el IAM: la IA la prepara; una persona la envía desde vm2 | IA y Luis Monsalve | `prompts/15` |
| F7 | `.env` en `/opt/apps/coipo_reserva_bienestar/`, `SERVIDOR_LISTO`, y despliegue en UAT | Luis Monsalve | pasos 6 a 8, `prompts/20` |
| F8 | Validación de Bienestar en UAT, con el manual actualizado; la aprobación se registra en el rastro | Bienestar y Álvaro Zegers | objetivo 6 |
| F9 | Cambio: despliegue a producción, vhost de `reserva-bienestar.conaf.cl` al puerto nuevo, `/health` con `app: coipo_reserva_bienestar`, `coipo_cabania` detenido y archivado, sonda en Grafana | Luis Monsalve | pasos 6-bis y 8 |

### Módulos de F5, en orden

| # | Módulo | De la maqueta |
|---|---|---|
| 1 | Casas, tarifas y bloqueos de fechas | `datos/casas.js`, `paginas/central/Casas.jsx`, `CarrilTarifas.jsx`, `lib/planillaTarifas.js` |
| 2 | Nómina de personas y sus antecedentes | `datos/usuarios.js`, `datos/antecedentes.js` (con D6) |
| 3 | Reservas: tablero, registro, ficha (PDF), desistimiento y reglas | `lib/reglas.js`, `datos/servicio.js`, `paginas/gestion/*`, `lib/ficha.js` |
| 4 | Inventario y otras direcciones | `paginas/encargada/Inventario.jsx`, `datos/inventarios.js`, `DireccionesCasa.jsx` |
| 5 | Cobros: descuentos por planilla, transferencias y devoluciones | `paginas/gestion/Cobros.jsx`, `Cobranza.jsx` |
| 6 | Configuración: etapa, parámetros con vigencia, plantillas y correo (D8) | `paginas/central/config/*` |
| 7 | Panel nacional | `paginas/central/Inicio.jsx` |
| 8 | Etapa 2: portal del trabajador, temporadas, postulación y sorteo | `paginas/trabajador/*`, `lib/sorteo.js`, `datos/temporadas.js` |

La Actividad y la auditoría no se portan: las trae la semilla.

## Riesgos

- **No hay vuelta atrás en un despliegue.** El pipeline hace `rsync --delete` y después
  construye (paso 8). Por eso F7 va a UAT y F9 se prepara con `prompts/20`.
- **Datos personales reales** desde el primer día en producción: la nómina, los correos y los
  teléfonos. D6 y el alta en el IAM van antes que F9.
- **Tamaño.** La maqueta tiene unas 12.500 líneas de JavaScript y 101 errores de lint con las
  reglas de la fábrica. Se porta por módulos, no de una vez.
- **Alcance sin aprobar.** Bienestar no ha aprobado la maqueta de forma trazable. Lo que cambie en
  la validación (F8) cambia módulos ya construidos.
