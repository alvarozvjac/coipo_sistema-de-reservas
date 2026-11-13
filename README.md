# coipo_sistema-de-reservas — Sistema de Gestión de Reservas (maqueta)

Departamento de Bienestar · Gerencia de Desarrollo de las Personas · CONAF.

Maqueta de validación del sistema de reservas de las casas de veraneo del Servicio de
Bienestar de CONAF, elaborada por la Unidad de Información y Análisis (UIA).

**Ver la maqueta:** https://alvarozvjac.github.io/coipo_sistema-de-reservas/

**Manual de usuario (PDF):** https://alvarozvjac.github.io/coipo_sistema-de-reservas/manual-usuario.pdf

> Demostración no operacional. Personas, RUT, reservas y fotografías son ficticios; las
> casas y tarifas son las del llamado de verano 2027. Lo que se haga en la maqueta se guarda solo en el navegador de quien la usa.

**Vista celular:** en computador, el botón flotante «Vista celular», abajo a la izquierda muestra la maqueta dentro de un marco de teléfono de 390 × 844 px, para presentarla sin abrir las herramientas del navegador. Se cierra con «Cerrar» o Esc. En un teléfono real el botón no aparece.

## Cómo probarla

Desde el 12-11-2026 la primera etapa es solo para los encargados de Bienestar: los
afiliados/as no ingresan, y la encargada regional o el encargado nacional (antes Oficina
Central) registra sus reservas. No hay temporadas altas ni sorteo: todas las fechas se
registran por orden de llegada si hay disponibilidad.

El ingreso es con el **COIPO IAM, simulado**: pulse **«Ingresar con COIPO IAM»** y, en la
pantalla del IAM, elija una cuenta de prueba (contraseña «maqueta»): `cnunez` (encargada
regional de Valparaíso), `pherrera` (encargado nacional) o `mfuentes` (afiliada sin rol en
esta aplicación, para ver el rechazo). El perfil y la región salen del rol que el IAM
asigna. El pie de página tiene el botón **«Tema»** (sistema, claro u oscuro).

| Perfil | Qué se puede probar |
|---|---|
| Encargada regional | Entra a Reservas (sin Panel ni Cobros desde el 13-11-2026): tablero de ocupación de todo el país y listado; registra en un panel lateral, en las casas de su región, lo que una persona le pidió por cualquier vía (teléfono, correo, presencial, WhatsApp u otra), solo si hay disponibilidad, viendo antes sus antecedentes (queda confirmada al registrarla), registra desistimientos; Inventario |
| Encargado nacional | Panel nacional; Reservas con tablero de todo el país (registra en cualquier casa, queda confirmada al registrarla); Cobros (panel de descuentos por mes con planilla y transferencias, nómina para Remuneraciones, transferencias por registrar); Dashboard; Configuración (casas y otras direcciones, tarifas digitadas o por planilla, bloqueos de fechas, usuarios y encargadas leídos del IAM, parámetros del reglamento con vigencia y respaldo, plantillas de correo y registro de actividad) |

Para registrar a nombre de una persona, pruebe con los RUT ficticios 13.457.902-1 (María
Fuentes, afiliada), 16.882.409-2 (Paula Ortiz, plazo fijo), 6.884.215-8 (Hernán Soto,
jubilado) o 7.215.346-4 (Nora Castillo, jubilada, paga por transferencia).

**Sin aprobación, ficha y transferencia (13-11-2026):** toda reserva registrada queda
confirmada y la persona recibe la ficha de la reserva (PDF con acompañantes, direcciones e
inventario). No hay pago en efectivo: jubilados/as y otros servicios públicos pagan por
transferencia electrónica; reciben además los datos para transferir y la transferencia queda
pendiente hasta que el encargado nacional la registra en Cobros.
De ejemplo: R-2026-0195 (Valparaíso, transferencia por registrar).

**Reiniciar datos de prueba**, en el pie de página, vuelve todo al estado inicial.

## Contenido del repositorio

- `insumos/`: problema, solución, rastro y entrega de la iniciativa CON001 según la
  metodología UIA del tramo previo a la fábrica (`00-PROBLEMA.md`, `01-SOLUCION.md`,
  `02-RASTRO.md`, `03-ENTREGA.md`).
- `manual-usuario.pdf`: manual de usuario de los encargados, con capturas y diagramas de flujo.
- `index.html`: la maqueta completa en un solo archivo (código, estilos e imágenes
  incluidos). Se genera desde `fuente/` con `npm run build:pagina` (archivo
  `fuente/frontend/dist-pagina/github-pages/index.html`).
- `fuente/`: código fuente de la maqueta (React 19 + Vite + Tailwind 4, sin backend),
  `fuente/docs/DECISIONES.md` con las decisiones y los pendientes con Bienestar, y
  `fuente/docs/CUMPLIMIENTO-FABRICA.md` con la revisión contra el estándar de
  `coipo_master_produccion`.

## Cómo actualizar la maqueta publicada

```powershell
cd fuente/frontend
npm install
npm run dev            # para trabajar: http://localhost:5173
npm run build:pagina   # genera la página única
copy dist-pagina\github-pages\index.html ..\..\index.html
copy public\manual-usuario.pdf ..\..\manual-usuario.pdf
```

Luego se hace commit y push a `main`; GitHub Pages publica en uno o dos minutos.

Norma de referencia: Reglamento General de Uso de Casas de Veraneo o Descanso (propuesta
de actualización, octubre 2026). Las decisiones de diseño están en
`fuente/docs/DECISIONES.md`.
