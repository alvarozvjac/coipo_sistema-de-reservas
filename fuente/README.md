# Fuente de coipo_sistema-de-reservas — Reservas de Casas de Veraneo · Bienestar CONAF

Maqueta funcional del sistema de reservas de las casas de veraneo del Servicio de
Bienestar de CONAF, desarrollada por la Unidad de Información y Análisis (UIA).

Reemplaza a la maqueta anterior (`coipo_cabania`), que se usó solo como referencia
de datos, fotos y reglas. Rige el **Reglamento General de Uso de Casas de Veraneo o
Descanso (propuesta de actualización, octubre 2026)**.

## Estado

| Paso | Perfil | Estado |
|---|---|---|
| 0 | Ingreso con RUT y código al correo | Construido |
| 1 | Solicitante (afiliado, plazo fijo, jubilado, no afiliado, otro servicio público) | Construido |
| 2 | Encargada regional: inicio, reservas e inventario | Construido |
| 3 | Oficina Central: inicio nacional, cobros (la transferencia registrada confirma la reserva), casas (retiro), tarifas (pantalla o planilla Excel/CSV), bloqueos, dashboard | Construido |
| 3b | Oficina Central: temporadas altas (verano e invierno), habilitación de la postulación y sorteo de cada una | Construido |
| 4 | Mantenimiento UIA | Pendiente |

## Cómo ejecutarla

Requiere Node.js 20 o superior.

```powershell
cd frontend
npm install
npm run dev
```

Abrir http://localhost:5173. En la pantalla de ingreso, el recuadro **"Maqueta · probar
como"** carga una persona ficticia de cada perfil; el código de verificación se muestra en
pantalla porque la maqueta no envía correos. **"Reiniciar datos de prueba"**, en el pie,
vuelve los datos al estado inicial.

## Estructura

```
frontend/src/
  datos/        casas.js, usuarios.js (nómina ficticia), inventarios.js y servicio.js (imita la futura API)
  lib/          reglas.js (reglamento y parámetros), indicadores.js (dashboard), acta.js (PDF), csv.js, fechas.js, formato.js
  componentes/  plantilla, calendario, botones y elementos comunes
  paginas/      Ingreso.jsx, solicitante/ (paso 1), encargada/ (paso 2), central/ (paso 3) y otros/ (pendientes)
docs/DECISIONES.md  alcance, decisiones tomadas y puntos por confirmar
```

Todos los datos son de demostración: personas y RUT ficticios, fotos de stock,
tarifas referenciales. Nada sale del navegador.
