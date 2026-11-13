import { CheckCircle2, Clock } from "lucide-react";
import {
  nominaPlanilla,
  resumenCobranza,
  transferenciasDelPeriodo,
} from "../../datos/servicio.js";
import { fechaCorta, hoyISO, nombreMes } from "../../lib/fechas.js";
import { pesos, plural } from "../../lib/formato.js";
import { CALIDADES } from "../../lib/reglas.js";
import { descargarCSV } from "../../lib/csv.js";
import { Tarjeta } from "../../componentes/ui.jsx";
import { nombreRegion } from "../encargada/comun.jsx";

/**
 * Panel de descuentos (decisión 13-11-2026): mes a mes, lo que se descuenta del
 * sueldo y las transferencias electrónicas recibidas y pendientes, para que la
 * encargada regional (su región) y el encargado nacional (todo el país) lo
 * controlen. Una fila elige el mes que se detalla abajo.
 */
export function ResumenCobranza({ region, periodo, onPeriodo }) {
  const filas = [...resumenCobranza(region)].reverse();
  const actual = hoyISO().slice(0, 7);
  const leyenda = `Cobranza por mes${region ? `, casas de la Región de ${nombreRegion(region)}` : ", todo el país"}. Elija un mes para ver el detalle.`;
  const nombre = (f, sel) => (
    <>
      <button
        type="button"
        onClick={() => onPeriodo(f.periodo)}
        aria-pressed={sel}
        className={`whitespace-nowrap capitalize hover:underline ${sel ? "font-semibold text-verde-800" : "text-tinta-900"}`}
      >
        {nombreMes(f.periodo + "-01")}
      </button>
      {f.periodo === actual && (
        <span className="ml-2 text-[12px] text-tinta-500">mes actual</span>
      )}
    </>
  );
  const monto = (v) => (v ? pesos(v) : "—");
  return (
    <>
      {/* Teléfono: una tarjeta por mes, sin desplazamiento lateral */}
      <Tarjeta className="sm:hidden">
        <p className="px-4 pt-3 text-[13px] text-tinta-500">
          {leyenda} Recibidas y pendientes son transferencias.
        </p>
        <ul className="mt-1 divide-y divide-borde">
          {filas.map((f) => {
            const sel = f.periodo === periodo;
            return (
              <li
                key={f.periodo}
                className={`px-4 py-2.5 text-[14px] ${sel ? "bg-verde-50" : ""}`}
              >
                <div className="flex items-baseline justify-between gap-3 text-[15px]">
                  <span>{nombre(f, sel)}</span>
                  <span className="font-semibold tabular-nums">
                    {monto(f.total)}
                  </span>
                </div>
                <dl className="mt-1 grid grid-cols-3 gap-2 text-[12px] text-tinta-500">
                  <div>
                    <dt>Planilla</dt>
                    <dd className="tabular-nums text-tinta-900">
                      {monto(f.planilla)}
                    </dd>
                  </div>
                  <div>
                    <dt>Recibidas</dt>
                    <dd className="tabular-nums text-tinta-900">
                      {monto(f.recibidas)}
                    </dd>
                  </div>
                  <div>
                    <dt>Pendientes</dt>
                    <dd
                      className={`tabular-nums ${f.pendientes ? "font-medium text-alerta-700" : "text-tinta-900"}`}
                    >
                      {monto(f.pendientes)}
                    </dd>
                  </div>
                </dl>
              </li>
            );
          })}
        </ul>
      </Tarjeta>
      <Tarjeta className="hidden overflow-x-auto sm:block">
        <table className="w-full min-w-[680px] text-left text-[15px]">
          <caption className="px-4 pt-3 text-left text-[13px] text-tinta-500">
            {leyenda}
          </caption>
          <thead className="border-b border-borde text-[13px] text-tinta-500">
            <tr>
              <th className="px-4 py-3 font-medium">Mes</th>
              <th className="px-4 py-3 text-right font-medium">
                Descuento por planilla
              </th>
              <th className="px-4 py-3 text-right font-medium">
                Transferencias recibidas
              </th>
              <th className="px-4 py-3 text-right font-medium">
                Transferencias pendientes
              </th>
              <th className="px-4 py-3 text-right font-medium">
                Total del mes
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-borde">
            {filas.map((f) => {
              const sel = f.periodo === periodo;
              return (
                <tr
                  key={f.periodo}
                  className={sel ? "bg-verde-50" : "hover:bg-stone-50"}
                >
                  <th scope="row" className="px-4 py-2.5 text-left font-normal">
                    {nombre(f, sel)}
                  </th>
                  <td className="px-4 py-2.5 text-right tabular-nums">
                    {monto(f.planilla)}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums">
                    {monto(f.recibidas)}
                  </td>
                  <td
                    className={`px-4 py-2.5 text-right tabular-nums ${f.pendientes ? "font-medium text-alerta-700" : ""}`}
                  >
                    {monto(f.pendientes)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-semibold tabular-nums">
                    {monto(f.total)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Tarjeta>
    </>
  );
}

/** Transferencias de un mes: recibidas (quién las registró y con qué N°) y pendientes. */
export function TransferenciasDelMes({ periodo, region }) {
  const lineas = transferenciasDelPeriodo(periodo, region);
  const suma = (xs) => xs.reduce((s, l) => s + l.monto, 0);
  const recibidas = lineas.filter((l) => l.recibido);
  const pendientes = lineas.filter((l) => !l.recibido);
  return (
    <Tarjeta className="mt-4 p-5">
      <p className="text-[13px] text-tinta-500">Transferencias del mes</p>
      <p className="mt-0.5 text-2xl font-bold tabular-nums">
        {pesos(suma(lineas))}
      </p>
      <p className="text-sm text-tinta-500">
        {pesos(suma(recibidas))} recibidas · {pesos(suma(pendientes))}{" "}
        pendientes
      </p>
      {lineas.length === 0 ? (
        <p className="mt-3 text-[15px] text-tinta-500">
          No hay transferencias en este mes.
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-borde">
          {lineas.map((l) => (
            <li
              key={l.reserva + l.concepto}
              className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1 py-2.5 text-[15px]"
            >
              <span className="min-w-0">
                <span className="font-medium">{l.titular.nombre}</span>
                <span className="block text-[13px] text-tinta-500">
                  {l.casa} · {l.concepto} · {l.reserva}
                </span>
              </span>
              <span className="text-right">
                <span className="block font-semibold tabular-nums">
                  {pesos(l.monto)}
                </span>
                {l.recibido ? (
                  <span className="inline-flex items-center gap-1 text-[13px] text-verde-700">
                    <CheckCircle2 className="size-3.5" aria-hidden /> Registrada
                    por {l.por ?? "Bienestar"}, {fechaCorta(l.fecha, true)} · N°{" "}
                    {l.comprobante}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[13px] font-medium text-alerta-700">
                    <Clock className="size-3.5" aria-hidden /> Pendiente · antes
                    del {fechaCorta(l.vence, true)}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-3 text-[13px] text-tinta-500">
        {plural(lineas.length, "transferencia", "transferencias")}. Las
        recibidas cuentan en el mes en que se registraron; las pendientes, en el
        mes de la llegada.
      </p>
    </Tarjeta>
  );
}

/** Reporte de cobranza del mes (planilla y transferencias recibidas y pendientes), en CSV. */
export function descargarCobranza(periodo, region) {
  const filas = [
    ...nominaPlanilla(periodo, region).map((l) => [
      periodo,
      "Planilla",
      "Por descontar",
      l.titular.rut,
      l.titular.nombre,
      CALIDADES[l.titular.calidad],
      l.reserva,
      l.casa,
      l.concepto,
      l.cuota,
      l.monto,
      "",
      "",
    ]),
    ...transferenciasDelPeriodo(periodo, region).map((l) => [
      periodo,
      "Transferencia",
      l.recibido ? "Recibida" : "Pendiente",
      l.titular.rut,
      l.titular.nombre,
      CALIDADES[l.titular.calidad],
      l.reserva,
      l.casa,
      l.concepto,
      "1 de 1",
      l.monto,
      l.recibido ? (l.por ?? "") : "",
      l.recibido ? l.comprobante : "",
    ]),
  ];
  descargarCSV(
    `cobranza-bienestar-${periodo}${region ? `-region-${region}` : ""}.csv`,
    [
      "Período",
      "Forma de pago",
      "Estado",
      "RUT",
      "Nombre",
      "Calidad",
      "Reserva",
      "Casa",
      "Concepto",
      "Cuota",
      "Monto",
      "Registrada por",
      "N° de operación",
    ],
    filas,
  );
}
