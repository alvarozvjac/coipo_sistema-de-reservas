/**
 * Ficha de la reserva (decisión 12-11-2026): un solo PDF que reemplaza al
 * comprobante y al acta de entrega-recepción (Art. 2 f, Art. 13 y Anexo B).
 * Lleva la reserva, la persona, quienes viajan, todas las
 * direcciones de la casa (la principal y las otras: estacionamiento, retiro
 * de llaves…), el pago, el inventario y el acta para el ingreso y la salida.
 *
 * Se genera al registrar la reserva (con transferencia, al registrar el pago) y
 * cada vez que la encargada actualiza el inventario antes de la llegada. Se
 * envía al correo de la persona y queda en el historial de la reserva.
 *
 * Se carga bajo demanda (import dinámico) para no engrosar la carga inicial.
 */

import {
  CALIDADES,
  PARAMETROS,
  PARENTESCOS,
  glosaTransferencia,
  noches,
  VIAS,
} from "./reglas.js";
import { fechaCorta, fechaLarga } from "./fechas.js";
import { pesos } from "./formato.js";
import { correoEncargada } from "../datos/usuarios.js";
import { guardarArchivo } from "./guardar.js";

const VERDE = [24, 85, 48];
const GRIS = [107, 104, 98];
const ESTADO = { bueno: "Bueno", regular: "Regular", malo: "Malo" };
const parentesco = (v) =>
  v === "titular"
    ? "Responsable"
    : (PARENTESCOS.find((p) => p.valor === v)?.etiqueta ?? v);

export async function descargarFicha(reserva, acta) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const ancho = doc.internal.pageSize.getWidth();
  const M = 16;
  let y = 18;

  const titulo = (t) => {
    if (y > 260) {
      doc.addPage();
      y = 18;
    }
    doc
      .setFont("helvetica", "bold")
      .setFontSize(11)
      .setTextColor(...VERDE);
    doc.text(t, M, y);
    y += 2;
    doc
      .setDrawColor(...VERDE)
      .setLineWidth(0.3)
      .line(M, y, ancho - M, y);
    y += 6;
    doc.setTextColor(0);
  };
  const tabla = (opciones) => {
    autoTable(doc, {
      startY: y,
      margin: { left: M, right: M },
      styles: {
        font: "helvetica",
        fontSize: 9,
        cellPadding: 1.8,
        lineColor: [227, 224, 216],
        lineWidth: 0.2,
      },
      headStyles: {
        fillColor: [238, 246, 240],
        textColor: VERDE,
        fontStyle: "bold",
      },
      ...opciones,
    });
    y = doc.lastAutoTable.finalY + 7;
  };
  const lineas = (n, etiqueta) => {
    doc
      .setFont("helvetica", "normal")
      .setFontSize(9)
      .setTextColor(...GRIS);
    if (etiqueta) {
      doc.text(etiqueta, M, y);
      y += 5;
    }
    doc.setDrawColor(190);
    for (let i = 0; i < n; i++) {
      doc.line(M, y, ancho - M, y);
      y += 7;
    }
    doc.setTextColor(0);
  };

  // Encabezado
  doc
    .setFont("helvetica", "bold")
    .setFontSize(15)
    .setTextColor(...VERDE);
  doc.text("Ficha de la reserva", M, y);
  y += 6;
  doc
    .setFont("helvetica", "normal")
    .setFontSize(9)
    .setTextColor(...GRIS);
  doc.text(
    "Servicio de Bienestar · Corporación Nacional Forestal · Casas de Veraneo o Descanso",
    M,
    y,
  );
  doc.text(
    "Incluye el acta de entrega-recepción e inventario (Anexo B)",
    M,
    y + 4.5,
  );
  doc.text(`N° ${acta.numero}`, ancho - M, y - 6, { align: "right" });
  doc.text(
    `Emitida el ${fechaCorta(acta.generada_en.slice(0, 10), true)}`,
    ancho - M,
    y,
    { align: "right" },
  );
  y += 13;
  doc.setTextColor(0);

  const t = reserva.titular;
  const fp = reserva.forma_pago ?? {};
  const pago =
    fp.tipo === "planilla"
      ? `Descuento por planilla en ${fp.cuotas ?? 1} cuota(s)${fp.desde_mes ? " desde " + fp.desde_mes : ""}, autorizado por la persona`
      : fp.tipo === "efectivo"
        ? `Efectivo, antes de llegar, a la encargada regional o al encargado nacional${reserva.pago ? ` · recibido el ${fechaCorta(reserva.pago.registrado_en.slice(0, 10), true)} (recibo ${reserva.pago.comprobante})` : " · pendiente"}`
        : `Transferencia${reserva.pago ? ` registrada el ${fechaCorta(reserva.pago.registrado_en.slice(0, 10), true)} (N° ${reserva.pago.comprobante})` : ""} · ${glosaTransferencia(reserva.casa, reserva.codigo)}`;

  // 1. Reserva
  titulo("1. Reserva");
  tabla({
    theme: "plain",
    styles: { font: "helvetica", fontSize: 9, cellPadding: 1.2 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 42, textColor: GRIS } },
    body: [
      [
        "Código",
        `${reserva.codigo} · ${noches(reserva.entrada, reserva.salida)} noches · ${pesos(reserva.total)}`,
      ],
      [
        "Ingreso (check-in)",
        `${fechaLarga(reserva.entrada)}, desde las ${PARAMETROS.hora_ingreso}`,
      ],
      [
        "Salida (check-out)",
        `${fechaLarga(reserva.salida)}, hasta las ${PARAMETROS.hora_salida}`,
      ],
      [
        "Registrada por",
        reserva.registrada_por
          ? `${reserva.registrada_por.nombre}, a pedido de la persona${reserva.via ? ` (${VIAS[reserva.via].toLowerCase()})` : ""}`
          : "—",
      ],
      ["Pago", pago],
    ],
  });

  // 2. Solicitante y acompañantes
  titulo("2. Solicitante y acompañantes");
  tabla({
    theme: "plain",
    styles: { font: "helvetica", fontSize: 9, cellPadding: 1.2 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 42, textColor: GRIS } },
    body: [
      ["Usuario/a responsable", `${t.nombre} · RUT ${t.rut}`],
      ["Calidad", `${CALIDADES[t.calidad]}${t.rol ? " · " + t.rol : ""}`],
      [
        "Contacto",
        [reserva.contacto?.telefono, reserva.contacto?.correo]
          .filter(Boolean)
          .join(" · "),
      ],
      [
        "A cargo en la casa",
        reserva.titular_viaja === false
          ? reserva.a_cargo
          : `${t.nombre} (viaja)`,
      ],
      [
        "Perro de asistencia",
        reserva.perro_asistencia ? "Sí (Ley 20.422)" : "No",
      ],
    ],
  });
  tabla({
    head: [["Personas que viajan", "Relación", "Edad"]],
    body: reserva.ocupantes.map((o) => [
      o.nombre,
      parentesco(o.parentesco),
      o.edad ?? "—",
    ]),
    columnStyles: { 2: { cellWidth: 18, halign: "center" } },
  });

  // 3. Direcciones
  titulo("3. Direcciones de la casa");
  const otras = acta.otras_direcciones ?? reserva.casa.otras_direcciones ?? [];
  tabla({
    head: [["", "Dirección", "Indicación"]],
    body: [
      [
        `Casa: ${reserva.casa.nombre}`,
        acta.direccion ?? reserva.casa.direccion,
        "",
      ],
      ...otras.map((d) => [d.tipo, d.direccion, d.indicacion || ""]),
    ],
    columnStyles: { 0: { cellWidth: 46, fontStyle: "bold" } },
  });

  // 2. Inventario
  titulo("4. Inventario de la casa");
  if (!acta.inventario) {
    doc.setFont("helvetica", "normal").setFontSize(9);
    doc.text(
      doc.splitTextToSize(
        "La casa aún no tiene inventario registrado. La encargada regional enviará una ficha actualizada con el inventario antes de la llegada.",
        ancho - 2 * M,
      ),
      M,
      y,
    );
    y += 12;
  } else {
    doc
      .setFont("helvetica", "normal")
      .setFontSize(8.5)
      .setTextColor(...GRIS);
    doc.text(
      `Versión ${acta.inventario.version}, actualizada el ${fechaCorta(acta.inventario.actualizado_en.slice(0, 10), true)} por ${acta.inventario.actualizado_por}.`,
      M,
      y - 2,
    );
    y += 2;
    doc.setTextColor(0);
    tabla({
      head: [["Categoría", "Elemento", "Cant.", "Estado", "Observación"]],
      body: acta.inventario.items.map((x) => [
        x.categoria,
        x.nombre,
        x.cantidad,
        ESTADO[x.estado],
        x.observacion || "",
      ]),
      columnStyles: {
        0: { cellWidth: 28 },
        2: { cellWidth: 13, halign: "center" },
        3: { cellWidth: 18 },
      },
      didParseCell: (d) => {
        if (d.section === "body" && d.column.index === 3) {
          if (d.cell.raw === "Malo") d.cell.styles.textColor = [163, 32, 32];
          if (d.cell.raw === "Regular") d.cell.styles.textColor = [138, 90, 0];
        }
      },
    });

    // 3. Lecturas y seguridad
    titulo("5. Llaves, gas y seguridad");
    const s = acta.inventario.seguridad ?? {};
    tabla({
      theme: "plain",
      styles: { font: "helvetica", fontSize: 9, cellPadding: 1.2 },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 42, textColor: GRIS },
      },
      body: [
        ["Llaves entregadas", s.llaves || "—"],
        ["Controles", s.controles || "—"],
        ["Gas", s.gas || "—"],
        [
          "Extintor, vencimiento",
          s.extintor_vence ? fechaCorta(s.extintor_vence, true) : "—",
        ],
        ["Indicaciones", s.observaciones || "—"],
      ],
    });
  }

  // 4. Ingreso
  titulo("6. Ingreso: observaciones del usuario/a");
  doc.setFont("helvetica", "normal").setFontSize(9);
  doc.text(
    doc.splitTextToSize(
      `Revise el inventario al ingresar. Tiene ${PARAMETROS.plazo_observaciones_horas} horas para informar cualquier daño o faltante preexistente por correo a la encargada regional (${correoEncargada(reserva.casa.region)}), adjuntando esta ficha con la sección 6 completa; vencido ese plazo, la casa se entiende recibida conforme (Art. 13).`,
      ancho - 2 * M,
    ),
    M,
    y,
  );
  y += 11;
  lineas(1, "Fecha y hora de ingreso:");
  lineas(3, "Daños o faltantes detectados:");

  // 5. Salida
  titulo("7. Salida: estado de restitución");
  doc.setFont("helvetica", "normal").setFontSize(9);
  doc.text(
    "Estado de aseo:     [  ] Bueno     [  ] Regular     [  ] Malo",
    M,
    y,
  );
  y += 7;
  lineas(3, "Daños o faltantes detectados:");
  lineas(1, "Valorización estimada ($):");
  doc.setFont("helvetica", "normal").setFontSize(9);
  doc.text(
    "Conformidad del usuario/a:     [  ] Conforme     [  ] Con reservas (detallar arriba)",
    M,
    y,
  );
  y += 6;
  doc.setFontSize(8).setTextColor(...GRIS);
  doc.text(
    `Al salir, envíe esta ficha firmada por correo a ${correoEncargada(reserva.casa.region)}. Los daños o faltantes se cobran al valor de reposición (Art. 22).`,
    M,
    y,
  );
  doc.setTextColor(0);
  y += 10;

  // 6. Firmas
  if (y > 250) {
    doc.addPage();
    y = 30;
  }
  titulo("8. Firmas o validación electrónica");
  y += 14;
  const mitad = (ancho - 2 * M) / 2;
  doc.setDrawColor(120);
  doc.line(M, y, M + mitad - 10, y);
  doc.line(M + mitad + 10, y, ancho - M, y);
  y += 5;
  doc.setFontSize(9);
  doc.text(`Usuario/a responsable: ${t.nombre}`, M, y);
  doc.text("Encargada/o regional de Bienestar", M + mitad + 10, y);

  // Pie en todas las páginas
  const paginas = doc.getNumberOfPages();
  for (let i = 1; i <= paginas; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5).setTextColor(...GRIS);
    doc.text(
      "Reglamento General de Uso de Casas de Veraneo o Descanso · Anexo B · Documento de maqueta con datos ficticios",
      M,
      289,
    );
    doc.text(`Página ${i} de ${paginas}`, ancho - M, 289, { align: "right" });
  }

  await guardarArchivo(`${acta.numero}.pdf`, doc.output("blob"));
}
