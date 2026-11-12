# coipo_sistema-de-reservas — Maqueta del sistema de reservas de casas de veraneo

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
Central) registra sus reservas y postulaciones. En la pantalla de ingreso, el recuadro
**«Maqueta · probar como»** carga a cada encargado; presione **Continuar** y use el código
que aparece en pantalla (la maqueta no envía correos).

| Perfil | Qué se puede probar |
|---|---|
| Encargada regional | Llegadas y salidas, ocupación, reservas de la región, inventario y acta de entrega; registrar reservas (a nombre de cualquier persona de la nómina o de otro servicio público), postulaciones al sorteo y desistimientos |
| Encargado nacional | Lo mismo para todo el país, más alertas, nómina de descuentos, registro de transferencias (confirma la reserva), casas, tarifas (digitadas o por planilla Excel/CSV), bloqueos de fechas, temporadas altas y su sorteo (con las respuestas a los cupos ofrecidos), dashboard y Administración (en construcción) |

Para registrar a nombre de una persona, pruebe con los RUT ficticios 13.457.902-1 (María
Fuentes, afiliada), 16.882.409-2 (Paula Ortiz, plazo fijo) o 6.884.215-8 (Hernán Soto,
jubilado).

**Sorteo de temporada alta:** la postulación de verano 2027 está abierta y la de invierno
2027 todavía no se habilita. Registre una postulación con «Registrar postulación»; luego,
como encargado nacional, entre a «Temporadas»: ahí puede habilitar la postulación de
invierno y usar «Realizar sorteo» (en la maqueta se puede adelantar). Desde ahí también se
registra un desistimiento, para ver cómo el cupo se ofrece a la lista de espera, y la
respuesta de la persona a ese cupo.

**Reiniciar datos de prueba**, en el pie de página, vuelve todo al estado inicial.

## Contenido del repositorio

- `insumos/`: problema, solución, rastro y entrega de la iniciativa CON001 según la
  metodología UIA del tramo previo a la fábrica (`00-PROBLEMA.md`, `01-SOLUCION.md`,
  `02-RASTRO.md`, `03-ENTREGA.md`).
- `manual-usuario.pdf`: manual de usuario de los encargados, con capturas y diagramas de flujo.
- `index.html`: la maqueta completa en un solo archivo (código, estilos e imágenes
  incluidos). Se genera desde `fuente/` con `npm run build:pagina` (archivo
  `fuente/frontend/dist-pagina/github-pages/index.html`).
- `fuente/`: código fuente de la maqueta (React 19 + Vite + Tailwind 4, sin backend) y
  `fuente/docs/DECISIONES.md` con las decisiones y los pendientes con Bienestar.

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
