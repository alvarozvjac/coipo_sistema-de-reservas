import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, UserCheck } from "lucide-react";
import { REGIONES } from "../../datos/casas.js";
import {
  buscarPersona,
  listarCasas,
  obtenerCasa,
  useDatos,
} from "../../datos/servicio.js";
import { formatearRut, rutValido } from "../../lib/formato.js";
import { CALIDADES, PARAMETROS } from "../../lib/reglas.js";
import {
  Aviso,
  Boton,
  Campo,
  Tarjeta,
  claseEntrada,
} from "../../componentes/ui.jsx";
import { INICIO, useSesion } from "../../componentes/Perfil.jsx";
import { Reservar } from "./Reservar.jsx";

const nombreRegion = (c) => REGIONES.find((r) => r.codigo === c)?.nombre ?? "—";

/**
 * Registro de una reserva: la encargada regional o el encargado nacional
 * registra la reserva que una persona le pidió (por teléfono, correo o en
 * persona). Rigen las reglas del reglamento para esa persona; la declaración
 * del encargado reemplaza la aceptación de la persona (decisión 12-11-2026).
 */
export function ReservaAsistida() {
  useDatos();
  const { usuario: gestor } = useSesion();
  const [persona, setPersona] = useState(null);
  // Desde la consulta de disponibilidad llega ?casa=ID&entrada&salida.
  const [busqueda] = useSearchParams();
  const casaInicial = busqueda.get("casa") ?? "";
  const [casaId, setCasaId] = useState(() => {
    const c = casaInicial && obtenerCasa(Number(casaInicial));
    return c && (gestor.perfil !== "encargada" || c.region === gestor.region) ? casaInicial : "";
  });
  const [listo, setListo] = useState(false);

  if (listo && persona && casaId)
    return (
      <Reservar
        key={`${persona.id}-${casaId}`}
        titular={persona}
        gestor={gestor}
        casaId={Number(casaId)}
        onCambiar={() => setListo(false)}
      />
    );

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        to={INICIO[gestor.perfil]}
        className="text-sm font-medium text-verde-700 hover:underline"
      >
        ← Volver al inicio
      </Link>
      <h1 className="mt-3 text-2xl font-bold">Registrar una reserva</h1>
      <p className="mt-1 text-[15px] text-tinta-500">
        Registre la reserva que la persona le pidió. Rigen las reglas del
        reglamento para esa persona: disponibilidad, anticipación, una reserva
        por mes y temporada alta por sorteo. Queda registrado que usted la hizo.
      </p>

      <div className="mt-6 space-y-5">
        <Persona persona={persona} onPersona={setPersona} />
        {persona && (
          <ElegirCasa
            gestor={gestor}
            persona={persona}
            casaId={casaId}
            onCasa={setCasaId}
            onListo={() => setListo(true)}
          />
        )}
      </div>
    </div>
  );
}

/** Paso 1: a nombre de quién. Con `soloConaf` (postulaciones) no se ofrece la opción de otro servicio público. */
export function Persona({ persona, onPersona, soloConaf = false }) {
  const [tipo, setTipo] = useState("conaf");
  const [rut, setRut] = useState("");
  const [error, setError] = useState(null);
  const [ext, setExt] = useState({
    nombre: "",
    rut: "",
    institucion: "",
    region: "",
    correo: "",
    telefono: "",
  });
  const [intento, setIntento] = useState(false);

  if (persona)
    return (
      <Tarjeta className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
        <UserCheck className="size-8 shrink-0 text-verde-700" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-[13px] text-tinta-500">A nombre de</p>
          <p className="font-semibold">{persona.nombre}</p>
          <p className="text-[15px] text-tinta-700">
            {persona.rut} · {CALIDADES[persona.calidad]}
            {persona.plazo_fijo ? " · plazo fijo" : ""} ·{" "}
            {persona.calidad === "otro_servicio"
              ? persona.institucion
              : nombreRegion(persona.region)}
          </p>
          <p className="text-[13px] text-tinta-500">Correo: {persona.correo}</p>
        </div>
        <Boton variante="secundario" onClick={() => onPersona(null)}>
          Cambiar
        </Boton>
      </Tarjeta>
    );

  function buscar() {
    if (!rutValido(rut))
      return setError("El RUT no es válido. Revise el dígito verificador.");
    const p = buscarPersona(rut);
    if (!p)
      return setError(
        soloConaf
          ? "Ese RUT no está en la nómina de CONAF ni de Bienestar. Los funcionarios de otros servicios públicos no postulan al sorteo (Art. 9)."
          : "Ese RUT no está en la nómina de CONAF ni de Bienestar. Si es funcionario/a de otro servicio público, elija esa opción.",
      );
    setError(null);
    onPersona(p);
  }

  const errExt = {
    nombre:
      ext.nombre.trim().split(/\s+/).length < 2 && "Escriba nombre y apellido.",
    rut: !rutValido(ext.rut) && "RUT no válido.",
    institucion: !ext.institucion.trim() && "Indique el servicio.",
    region: !ext.region && "Elija la región.",
    correo: !/^\S+@\S+\.\S+$/.test(ext.correo) && "Correo no válido.",
    telefono:
      ext.telefono.replace(/\D/g, "").length < 8 && "Teléfono no válido.",
  };
  const campo = (k, etiqueta, props = {}) => (
    <Campo etiqueta={etiqueta} error={intento && errExt[k]}>
      <input
        className={claseEntrada}
        value={ext[k]}
        onChange={(e) => setExt({ ...ext, [k]: e.target.value })}
        {...props}
      />
    </Campo>
  );

  return (
    <Tarjeta className="p-5">
      <h2 className="text-lg font-semibold">1. ¿A nombre de quién?</h2>
      {!soloConaf && (
        <div
          className="mt-3 grid gap-2 sm:grid-cols-2"
          role="radiogroup"
          aria-label="Tipo de persona"
        >
          {[
            [
              "conaf",
              "Funcionario/a de CONAF o afiliado/a jubilado/a",
              "Se busca por RUT en la nómina.",
            ],
            [
              "externo",
              "Funcionario/a de otro servicio público",
              `Reserva con hasta ${PARAMETROS.anticipacion_maxima_otro_servicio_dias} días de anticipación (Art. 9).`,
            ],
          ].map(([v, t, d]) => (
            <button
              key={v}
              type="button"
              role="radio"
              aria-checked={tipo === v}
              onClick={() => setTipo(v)}
              className={`rounded-lg p-3 text-left ring-inset ${tipo === v ? "bg-verde-50 ring-2 ring-verde-600" : "bg-white ring-1 ring-borde hover:bg-stone-50"}`}
            >
              <span className="block font-semibold">{t}</span>
              <span className="block text-sm text-tinta-500">{d}</span>
            </button>
          ))}
        </div>
      )}

      {tipo === "conaf" || soloConaf ? (
        <div className="mt-4">
          <form
            className="flex flex-col gap-3 sm:flex-row sm:items-end"
            onSubmit={(e) => {
              e.preventDefault();
              buscar();
            }}
          >
            <Campo etiqueta="RUT de la persona" className="sm:w-64">
              <input
                className={claseEntrada}
                value={rut}
                onChange={(e) => setRut(e.target.value)}
                onBlur={() => rutValido(rut) && setRut(formatearRut(rut))}
                placeholder="12.345.678-9"
                inputMode="text"
              />
            </Campo>
            <Boton type="submit" variante="secundario">
              <Search className="size-4" aria-hidden /> Buscar en la nómina
            </Boton>
          </form>
          {error && (
            <div className="mt-3">
              <Aviso tipo="error">{error}</Aviso>
            </div>
          )}
          <p className="mt-3 text-[13px] text-tinta-500">
            Maqueta: pruebe con 13.457.902-1 (María Fuentes), 16.882.409-2
            (Paula Ortiz, plazo fijo) o 6.884.215-8 (Hernán Soto, jubilado).
          </p>
        </div>
      ) : (
        <div className="mt-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {campo("nombre", "Nombre y apellidos")}
            {campo("rut", "RUT", {
              onBlur: () =>
                rutValido(ext.rut) &&
                setExt({ ...ext, rut: formatearRut(ext.rut) }),
            })}
            {campo("institucion", "Servicio público donde trabaja")}
            <Campo etiqueta="Región" error={intento && errExt.region}>
              <select
                className={claseEntrada}
                value={ext.region}
                onChange={(e) => setExt({ ...ext, region: e.target.value })}
              >
                <option value="">Elija la región</option>
                {REGIONES.map((r) => (
                  <option key={r.codigo} value={r.codigo}>
                    {r.nombre}
                  </option>
                ))}
              </select>
            </Campo>
            {campo("correo", "Correo", { type: "email" })}
            {campo("telefono", "Teléfono", { type: "tel" })}
          </div>
          <Boton
            className="mt-4"
            onClick={() => {
              setIntento(true);
              if (Object.values(errExt).some(Boolean)) return;
              onPersona({
                ...ext,
                nombre: ext.nombre.trim(),
                rut: formatearRut(ext.rut),
                id: "ext-" + formatearRut(ext.rut),
                calidad: "otro_servicio",
                plazo_fijo: false,
                perfil: "solicitante",
                rol: "Funcionario/a de " + ext.institucion.trim(),
                grupo_familiar: [],
              });
            }}
          >
            Continuar
          </Boton>
        </div>
      )}
    </Tarjeta>
  );
}

/**
 * Paso 2. Desde el 12-11-2026 la encargada regional solo registra en las casas
 * de su región; el encargado nacional, en todas (y la reserva queda por
 * aprobar por la encargada de la región de la casa).
 */
function ElegirCasa({ gestor, persona, casaId, onCasa, onListo }) {
  const regional = gestor.perfil === "encargada";
  const casas = listarCasas().filter((c) => !regional || c.region === gestor.region);
  const [region, setRegion] = useState(() =>
    regional ? gestor.region : (obtenerCasa(Number(casaId))?.region ?? ""),
  );
  const visibles = casas.filter((c) => !region || c.region === region);
  return (
    <Tarjeta className="p-5">
      <h2 className="text-lg font-semibold">2. ¿Qué casa?</h2>
      <p className="mt-1 text-[13px] text-tinta-500">
        {regional
          ? `Puede registrar en las casas de la Región de ${nombreRegion(gestor.region)}. Para otra región, la registra su encargada o el encargado nacional.`
          : "Puede registrar en cualquier casa del país; quedará por aprobar por la encargada de la región de la casa."}{" "}
        Luego verá su calendario de disponibilidad.
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Campo etiqueta="Región">
          <select
            className={claseEntrada}
            disabled={regional}
            value={region}
            onChange={(e) => {
              setRegion(e.target.value);
              onCasa("");
            }}
          >
            <option value="">Todas las regiones</option>
            {REGIONES.filter((r) =>
              casas.some((c) => c.region === r.codigo),
            ).map((r) => (
              <option key={r.codigo} value={r.codigo}>
                {r.nombre}
              </option>
            ))}
          </select>
        </Campo>
        <Campo etiqueta="Casa">
          <select
            className={claseEntrada}
            value={casaId}
            onChange={(e) => onCasa(e.target.value)}
          >
            <option value="">Elija una casa</option>
            {visibles.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre} · hasta {c.capacidad} personas
                {region ? "" : ` · ${nombreRegion(c.region)}`}
              </option>
            ))}
          </select>
        </Campo>
      </div>
      <div className="mt-4 flex justify-end">
        <Boton disabled={!casaId} onClick={onListo}>
          Ver calendario y reservar
        </Boton>
      </div>
      {persona.calidad === "otro_servicio" && (
        <p className="mt-3 text-[13px] text-tinta-500">
          Por ser de otro servicio público, solo puede reservar fechas dentro de
          los próximos {PARAMETROS.anticipacion_maxima_otro_servicio_dias} días
          (Art. 9).
        </p>
      )}
    </Tarjeta>
  );
}
