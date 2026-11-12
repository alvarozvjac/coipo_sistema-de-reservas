import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  X,
} from "lucide-react";
import { REGIONES } from "../../datos/casas.js";
import {
  listarCasas,
  reservasRegion,
  useDatos,
} from "../../datos/servicio.js";
import {
  diasEntre,
  fechaCorta,
  hoyISO,
  rangoFechas,
  sumarDias,
} from "../../lib/fechas.js";
import { pesos, plural } from "../../lib/formato.js";
import { CALIDADES, ESTADOS, VIAS, estadoReserva } from "../../lib/reglas.js";
import {
  Aviso,
  Boton,
  Estado,
  Tarjeta,
  claseEntrada,
} from "../../componentes/ui.jsx";
import { useSesion } from "../../componentes/Perfil.jsx";
import { LeyendaTablero, Tablero } from "../../componentes/Tablero.jsx";
import { DetalleReserva } from "./DetalleReserva.jsx";
import { RegistroLateral } from "./RegistroLateral.jsx";

const FILTROS = [
  "todas",
  "por_aprobar",
  "por_confirmar",
  "confirmada",
  "en_curso",
  "finalizada",
  "desistida",
  "anulada",
  "rechazada",
];
const nombreRegion = (c) => REGIONES.find((r) => r.codigo === c)?.nombre ?? "";
const angosta = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(max-width: 639px)").matches;

/**
 * Reservas (decisión 12-11-2026): una sola pantalla para registrar y gestionar
 * lo que las personas piden al encargado por cualquier vía. Junta lo que eran
 * «Reservas» y «Disponibilidad»: arriba el tablero de ocupación (se elige un
 * tramo libre para registrar o se toca una reserva para gestionarla) y abajo el
 * listado con filtros. La encargada ve cualquier región, pero registra solo en
 * la suya; el encargado nacional, en todas.
 */
export function Reservas() {
  useDatos();
  const { usuario } = useSesion();
  const regional = usuario.perfil === "encargada";
  const [params, setParams] = useSearchParams();
  const hoy = hoyISO();
  const manana = sumarDias(hoy, 1);
  const dias = angosta() ? 14 : 28;

  const [region, setRegion] = useState(regional ? usuario.region : "");
  const [texto, setTexto] = useState("");
  const [personas, setPersonas] = useState("");
  const [desde, setDesde] = useState(hoy);
  const [seleccion, setSeleccion] = useState(null);
  const [filtro, setFiltro] = useState(
    FILTROS.includes(params.get("estado")) ? params.get("estado") : "todas",
  );
  const [casaLista, setCasaLista] = useState("");
  const [mensaje, setMensaje] = useState(null);
  // Panel lateral de registro: se abre con «Nueva solicitud», con el tramo del tablero o desde /gestion/reservar.
  const [registro, setRegistro] = useState(() =>
    params.get("nueva")
      ? {
          casaId: Number(params.get("casa")) || null,
          entrada: params.get("entrada"),
          salida: params.get("salida"),
        }
      : null,
  );
  const abierta = params.get("codigo");
  const abrir = (codigo) =>
    setParams(
      (p) =>
        codigo
          ? { ...Object.fromEntries(p), codigo }
          : Object.fromEntries([...p].filter(([k]) => k !== "codigo")),
      { replace: true },
    );

  const casasTodas = listarCasas();
  const regiones = REGIONES.filter((r) =>
    casasTodas.some((c) => c.region === r.codigo),
  );
  const casas = casasTodas.filter((c) => !region || c.region === region);
  const grupos = region
    ? null
    : Object.fromEntries(
        casas
          .map((c, i) => [
            i,
            i === 0 || casas[i - 1].region !== c.region
              ? `Región de ${nombreRegion(c.region)}`
              : null,
          ])
          .filter(([, g]) => g),
      );

  const reservas = reservasRegion(region).map((r) => ({
    ...r,
    visible: estadoReserva(r),
  }));
  const q = texto.trim().toLowerCase();
  const coincide = (r) =>
    !q ||
    r.codigo.toLowerCase().includes(q) ||
    r.titular.nombre.toLowerCase().includes(q) ||
    r.titular.rut.replace(/\./g, "").includes(q.replace(/\./g, ""));
  const resaltar = q
    ? new Set(reservas.filter(coincide).map((r) => r.codigo))
    : null;

  const listaBase = reservas
    .filter(coincide)
    .sort((a, b) => (a.entrada < b.entrada ? 1 : -1));
  const cuenta = (f) =>
    f === "todas"
      ? listaBase.length
      : listaBase.filter((r) => r.visible === f).length;
  const lista = listaBase
    .filter((r) => filtro === "todas" || r.visible === filtro)
    .filter((r) => !casaLista || r.casa_id === Number(casaLista));

  const detalle = abierta
    ? reservasRegion("")
        .map((r) => ({ ...r, visible: estadoReserva(r) }))
        .find((r) => r.codigo === abierta)
    : null;
  const casaSel = seleccion
    ? casasTodas.find((c) => c.id === seleccion.casaId)
    : null;
  const puedeRegistrar =
    casaSel && (!regional || casaSel.region === usuario.region);
  const nuevaSolicitud = (inicial = {}) => {
    setRegistro(inicial);
    setParams(
      (p) =>
        Object.fromEntries(
          [...p].filter(
            ([k]) => !["nueva", "casa", "entrada", "salida"].includes(k),
          ),
        ),
      { replace: true },
    );
  };

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Reservas</h1>
          <p className="mt-1 text-[15px] text-tinta-500">
            {regional
              ? `Registra en las casas de la Región de ${nombreRegion(usuario.region)}; las demás regiones son solo consulta.`
              : "Registra en cualquier casa del país; queda por aprobar por la encargada de la región de la casa."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Boton onClick={() => nuevaSolicitud()}>
            <Plus className="size-4" aria-hidden /> Nueva solicitud
          </Boton>
        </div>
      </div>

      {mensaje && (
        <div className="mt-4">
          <Aviso tipo="info">{mensaje}</Aviso>
        </div>
      )}

      <Tarjeta className="mt-4 p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_14rem_8rem]">
          <label className="relative block">
            <span className="mb-1 block text-[13px] font-medium text-tinta-700">
              Buscar
            </span>
            <Search
              className="pointer-events-none absolute bottom-3.5 left-3 size-4 text-tinta-400"
              aria-hidden
            />
            <input
              className={`${claseEntrada} pl-9`}
              placeholder="Nombre, RUT o código"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[13px] font-medium text-tinta-700">
              Región
            </span>
            <select
              className={claseEntrada}
              value={region}
              onChange={(e) => {
                setRegion(e.target.value);
                setSeleccion(null);
                setCasaLista("");
              }}
            >
              <option value="">Todo el país</option>
              {regiones.map((r) => (
                <option key={r.codigo} value={r.codigo}>
                  {r.nombre}
                  {regional && r.codigo === usuario.region
                    ? " (su región)"
                    : ""}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-[13px] font-medium text-tinta-700">
              Personas
            </span>
            <input
              type="number"
              min={1}
              max={12}
              inputMode="numeric"
              className={claseEntrada}
              placeholder="Todas"
              value={personas}
              onChange={(e) =>
                setPersonas(
                  e.target.value
                    ? String(Math.max(1, Number(e.target.value) || 1))
                    : "",
                )
              }
            />
          </label>
        </div>
      </Tarjeta>

      <section className="mt-6" aria-labelledby="t-tablero">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="t-tablero" className="text-lg font-semibold">
            Ocupación · {fechaCorta(desde)} al{" "}
            {fechaCorta(sumarDias(desde, dias - 1), true)}
          </h2>
          <div className="flex items-center gap-1">
            <Boton
              variante="secundario"
              className="px-3"
              aria-label={`${dias / 7} semanas antes`}
              disabled={desde <= hoy}
              onClick={() =>
                setDesde((d) =>
                  sumarDias(d, -dias) < hoy ? hoy : sumarDias(d, -dias),
                )
              }
            >
              <ChevronLeft className="size-4" aria-hidden />
            </Boton>
            <Boton variante="secundario" onClick={() => setDesde(hoy)}>
              Hoy
            </Boton>
            <Boton
              variante="secundario"
              className="px-3"
              aria-label={`${dias / 7} semanas después`}
              onClick={() => setDesde((d) => sumarDias(d, dias))}
            >
              <ChevronRight className="size-4" aria-hidden />
            </Boton>
            <label className="ml-1">
              <span className="sr-only">Ir a la fecha</span>
              <input
                type="date"
                className={`${claseEntrada} w-40`}
                min={hoy}
                value={desde}
                onChange={(e) =>
                  e.target.value &&
                  setDesde(e.target.value < hoy ? hoy : e.target.value)
                }
              />
            </label>
          </div>
        </div>
        <p className="mt-1 text-[13px] text-tinta-500">
          Toque una reserva para gestionarla. Para registrar, toque la primera
          noche libre y luego la última.
        </p>

        <div className="mt-3">
          <Tablero
            casas={casas}
            reservas={reservas}
            desde={desde}
            dias={dias}
            minimo={manana}
            hoy={hoy}
            personas={Number(personas) || 0}
            seleccion={seleccion}
            onSeleccion={setSeleccion}
            onAbrir={abrir}
            resaltar={resaltar}
            grupos={grupos}
          />
        </div>
        <LeyendaTablero />
        {seleccion && casaSel && (
          <div
            className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-verde-700 bg-white p-3 shadow-lg"
            role="status"
          >
            <div className="min-w-0 text-[15px]">
              <p className="font-semibold text-tinta-900">
                {casaSel.nombre} ·{" "}
                {rangoFechas(seleccion.entrada, seleccion.salida)} ·{" "}
                {plural(
                  diasEntre(seleccion.entrada, seleccion.salida),
                  "noche",
                  "noches",
                )}
              </p>
              <p className="text-[13px] text-tinta-500">
                {!puedeRegistrar
                  ? `Solo consulta: la casa es de la Región de ${nombreRegion(casaSel.region)}. Derive la solicitud a su encargada o al encargado nacional.`
                  : seleccion.abierta
                    ? "Toque la última noche para alargar el tramo, o registre esta noche."
                    : `Llegada ${fechaCorta(seleccion.entrada)} desde las 15:00 · salida ${fechaCorta(seleccion.salida)} hasta las 12:00.`}
              </p>
            </div>
            <div className="flex gap-2">
              <Boton
                variante="secundario"
                className="px-3"
                aria-label="Quitar la selección"
                onClick={() => setSeleccion(null)}
              >
                <X className="size-4" aria-hidden />
              </Boton>
              {puedeRegistrar ? (
                <Boton
                  onClick={() =>
                    nuevaSolicitud({
                      casaId: casaSel.id,
                      entrada: seleccion.entrada,
                      salida: seleccion.salida,
                    })
                  }
                >
                  Registrar reserva
                </Boton>
              ) : null}
            </div>
          </div>
        )}
      </section>

      <section className="mt-10" aria-labelledby="t-listado">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="t-listado" className="text-lg font-semibold">
            Listado{" "}
            {region ? `· Región de ${nombreRegion(region)}` : "· todo el país"}
          </h2>
        </div>
        <>
            <div
              className="mt-3 flex flex-wrap gap-2"
              role="tablist"
              aria-label="Filtrar por estado"
            >
              {FILTROS.map((f) => (
                <button
                  key={f}
                  type="button"
                  role="tab"
                  aria-selected={filtro === f}
                  onClick={() => setFiltro(f)}
                  className={`rounded-full px-3 py-1.5 text-sm ring-1 ring-inset pointer-coarse:min-h-11 ${filtro === f ? "bg-verde-700 font-semibold text-white ring-verde-700" : "bg-white text-tinta-700 ring-borde hover:bg-stone-50"}`}
                >
                  {f === "todas" ? "Todas" : ESTADOS[f].etiqueta}{" "}
                  <span className="tabular-nums">{cuenta(f)}</span>
                </button>
              ))}
            </div>
            <div className="mt-3 max-w-xs">
              <select
                className={claseEntrada}
                value={casaLista}
                onChange={(e) => setCasaLista(e.target.value)}
                aria-label="Casa"
              >
                <option value="">Todas las casas</option>
                {casas.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            <Tarjeta className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-[15px]">
                <thead className="border-b border-borde text-[13px] text-tinta-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Fechas</th>
                    <th className="px-4 py-3 font-medium">Casa</th>
                    <th className="px-4 py-3 font-medium">
                      Usuario/a responsable
                    </th>
                    <th className="px-4 py-3 font-medium">Vía</th>
                    <th className="px-4 py-3 font-medium">Estado</th>
                    <th className="px-4 py-3 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-borde">
                  {lista.map((r) => (
                    <tr
                      key={r.codigo}
                      className="cursor-pointer hover:bg-stone-50"
                      onClick={() => abrir(r.codigo)}
                    >
                      <td className="whitespace-nowrap px-4 py-3">
                        <button
                          type="button"
                          className="text-left font-medium text-verde-800 hover:underline"
                          onClick={() => abrir(r.codigo)}
                        >
                          {rangoFechas(r.entrada, r.salida)}
                        </button>
                        <span className="block text-[13px] text-tinta-500">
                          {r.codigo}
                        </span>
                      </td>
                      <td className="px-4 py-3">{r.casa.nombre}</td>
                      <td className="px-4 py-3">
                        {r.titular.nombre}
                        <span className="block text-[13px] text-tinta-500">
                          {CALIDADES[r.titular.calidad]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-tinta-700">
                        {r.via ? VIAS[r.via] : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Estado estado={r.visible} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
                        {pesos(r.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {lista.length === 0 && (
                <p className="p-6 text-center text-tinta-500">
                  No hay reservas con esos filtros.
                </p>
              )}
            </Tarjeta>
            <p className="mt-2 text-[13px] text-tinta-500">
              {plural(lista.length, "reserva", "reservas")}
            </p>
        </>
      </section>

      {registro && (
        <RegistroLateral
          gestor={usuario}
          inicial={registro}
          onCerrar={() => setRegistro(null)}
          onListo={(codigo) => {
            setRegistro(null);
            setSeleccion(null);
            const r = reservasRegion("").find((x) => x.codigo === codigo);
            setMensaje(
              <>
                {codigo} registrada a nombre de {r.titular.nombre}:{" "}
                {r.estado === "pendiente_aprobacion"
                  ? "queda por aprobar por la encargada de la región."
                  : estadoReserva(r) === "por_confirmar"
                    ? "por confirmar; se enviaron los datos para transferir."
                    : "confirmada; se envió la ficha de la reserva."}{" "}
                <button
                  type="button"
                  onClick={() => abrir(codigo)}
                  className="font-semibold underline"
                >
                  Ver detalle
                </button>
              </>,
            );
          }}
        />
      )}

      {detalle && (
        <DetalleReserva
          reserva={detalle}
          gestor={usuario}
          onCerrar={() => abrir(null)}
          onListo={(que) => {
            setMensaje(
              que === "aprobada"
                ? `${detalle.codigo} aprobada.`
                : `${detalle.codigo} no aprobada: se liberaron las fechas y se avisó a la persona.`,
            );
            abrir(null);
          }}
        />
      )}
    </>
  );
}
