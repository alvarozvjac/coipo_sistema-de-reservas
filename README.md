# coipo_sistema-de-reservas — Maqueta del sistema de reservas de casas de veraneo

Maqueta de validación del sistema de reservas de las casas de veraneo del Servicio de
Bienestar de CONAF, elaborada por la Unidad de Información y Análisis (UIA).

**Ver la maqueta:** https://alvarozvjac.github.io/coipo_sistema-de-reservas/

> Demostración no operacional. Personas, RUT, tarifas, reservas y fotografías son
> ficticios. Lo que se haga en la maqueta se guarda solo en el navegador de quien la usa.

## Cómo probarla

En la pantalla de ingreso, el recuadro **«Maqueta · probar como»** carga una persona de
cada perfil; presione **Continuar** y use el código que aparece en pantalla (la maqueta no
envía correos).

| Perfil | Qué se puede probar |
|---|---|
| Afiliada, afiliada a plazo fijo, jubilado, no afiliado | Buscar casa, reservar (confirmación inmediata), acta de entrega, mis reservas y desistimiento |
| Otro servicio público | Reserva con hasta 15 días de anticipación, tarifa diferenciada y pago anticipado (Art. 9) |
| Encargada regional | Llegadas y salidas, ocupación, reservas de la región, inventario y acta de entrega |
| Oficina Central | Alertas, nómina de descuentos, pagos, casas y tarifas, bloqueos y dashboard |

**Reiniciar datos de prueba**, en el pie de página, vuelve todo al estado inicial.

## Contenido del repositorio

- `index.html`: la maqueta completa en un solo archivo (código, estilos e imágenes
  incluidos). Se genera desde el proyecto fuente `coipo_reserva_veraneo` con
  `npm run build:pagina` (archivo `frontend/dist-pagina/github-pages/index.html`).

Norma de referencia: Reglamento General de Uso de Casas de Veraneo o Descanso (propuesta
de actualización, octubre 2026). Las decisiones de diseño están en
`coipo_reserva_veraneo/docs/DECISIONES.md`.
