import { useCallback, useState } from "react";
import { Landmark, Plus, Trash2 } from "lucide-react";
import {
  crearReserva,
  misReservas,
  obtenerCasa,
  ocupacionesDe,
  proximoCodigo,
  useDatos,
} from "../../datos/servicio.js";
import { fechaCorta } from "../../lib/fechas.js";
import { pesos, plural } from "../../lib/formato.js";
import {
  CONDICIONES_USO,
  PARAMETROS,
  PARENTESCOS,
  formasDePago,
  glosaTransferencia,
  limiteDesistimiento,
  nochesNoDisponibles,
  noches,
  tarifaPara,
  validarFechas,
  VIAS,
} from "../../lib/reglas.js";
import {
  Aviso,
  Boton,
  Campo,
  Tarjeta,
  claseEntrada,
} from "../../componentes/ui.jsx";
import { CuadroTransferencia } from "../../componentes/Transferencia.jsx";

/**
 * Datos de la reserva en el panel lateral de Reservas (decisión 12-11-2026):
 * quiénes van, contacto, pago, vía y declaración, en una sola vista. La usan
 * solo los encargados (regional y nacional), con `titular` y `gestor`; su
 * declaración reemplaza la aceptación de la persona. Casa y fechas vienen del
 * panel (`panel.entrada`, `panel.salida`).
 */
export function Reservar({ titular, gestor, casaId, panel }) {
  useDatos();
  const usuario = titular;
  const asistida = Boolean(gestor);
  const casa = obtenerCasa(casaId);

  // En el panel lateral de Reservas (decisión 12-11-2026) las fechas vienen del tablero y todo va en una sola vista.
  const { entrada, salida } = panel;
  const [viaja, setViaja] = useState(true);
  const [aCargo, setACargo] = useState("");
  const [otros, setOtros] = useState([]);
  const [telefono, setTelefono] = useState(usuario.telefono ?? "");
  const [correo, setCorreo] = useState(usuario.correo);
  const [perro, setPerro] = useState(false);
  const [credencial, setCredencial] = useState(null);
  const [sanitario, setSanitario] = useState(null);
  const formas = formasDePago(usuario);
  // Si hay transferencia, nada viene marcado: al elegirla se abre el cuadro con la cuenta.
  const [pago, setPago] = useState(
    formas.length === 1 && formas[0] === "planilla" ? "planilla" : null,
  );
  const [cuadro, setCuadro] = useState(false);
  const [vioCuenta, setVioCuenta] = useState(false);
  const cerrarCuadro = useCallback(() => {
    setCuadro(false);
    setVioCuenta(true);
  }, []);
  const [cuotas, setCuotas] = useState(1);
  const [autoriza, setAutoriza] = useState(false);
  const [acepta, setAcepta] = useState(false);
  const [via, setVia] = useState("");
  const [intento, setIntento] = useState(false);
  const [ocupada, setOcupada] = useState(false);

  if (!casa) return <p>No encontramos esa casa.</p>;

  const tarifa = tarifaPara(casa, usuario);
  const noDisponibles = nochesNoDisponibles(ocupacionesDe(casa.id));
  const erroresFechas = validarFechas({
    entrada,
    salida,
    noDisponibles,
    reservasUsuario: misReservas(usuario.id),
    calidad: usuario.calidad,
  });
  const n = noches(entrada, salida);
  const total = tarifa * n;

  const personas = (viaja ? 1 : 0) + otros.length;
  const excede = personas > casa.capacidad;
  const adultos = otros.filter((o) => o.nombre.trim() && Number(o.edad) >= 18);
  const errorGrupo =
    personas === 0
      ? "Agregue a las personas que viajan."
      : !viaja && !adultos.some((o) => o.nombre.trim() === aCargo)
        ? "Indique qué persona mayor de edad estará a cargo en la casa."
        : null;
  const errorPerro =
    perro && (!credencial || !sanitario)
      ? "Adjunte la credencial y el certificado sanitario del perro de asistencia."
      : null;
  const errorOtro = (o) => ({
    nombre:
      o.nombre.trim().split(/\s+/).length < 2
        ? "Escriba nombre y apellido."
        : null,
    edad:
      o.edad === "" || Number(o.edad) < 0 || Number(o.edad) > 110
        ? "Indique la edad."
        : null,
  });
  const otrosConError = otros.some((o) =>
    Object.values(errorOtro(o)).some(Boolean),
  );
  const contactoError = !/^\S+@\S+\.\S+$/.test(correo)
    ? "Escriba un correo válido."
    : telefono.replace(/\D/g, "").length < 8
      ? "Escriba un teléfono donde ubicarlo durante la estadía."
      : null;

  const pagoValido =
    pago === "planilla"
      ? autoriza
      : pago === "transferencia"
        ? vioCuenta
        : false;
  const pasoValido = [
    erroresFechas.length === 0,
    !excede && !otrosConError && !contactoError && !errorGrupo && !errorPerro,
    acepta && pagoValido && (!asistida || Boolean(via)),
  ];
  const glosa = glosaTransferencia(casa, proximoCodigo());
  const elegirTransferencia = () => {
    setPago("transferencia");
    setCuadro(true);
  };
  const limiteDesistir = limiteDesistimiento(entrada ?? "2026-01-01");

  function avanzar() {
    setIntento(true);
    if (!pasoValido.every(Boolean)) return;
    setIntento(false);
    const codigo = crearReserva({
      usuario,
      casa,
      entrada,
      salida,
      tarifa_noche: tarifa,
      ocupantes: [
        ...(viaja ? [{ nombre: usuario.nombre, parentesco: "titular" }] : []),
        ...otros.map((o) => ({
          ...o,
          nombre: o.nombre.trim(),
          edad: Number(o.edad),
        })),
      ],
      contacto: { telefono, correo },
      titular_viaja: viaja,
      a_cargo: viaja ? usuario.nombre : aCargo,
      perro_asistencia: perro
        ? { credencial: credencial.name, certificado_sanitario: sanitario.name }
        : false,
      forma_pago:
        pago === "planilla"
          ? { tipo: "planilla", cuotas, autorizacion: true }
          : { tipo: "transferencia", anticipado: true, glosa },
      ...(asistida && {
        registrada_por: {
          nombre: gestor.nombre,
          perfil: gestor.perfil,
          region: gestor.region ?? null,
        },
        via,
      }),
    });
    if (!codigo) {
      setOcupada(true);
      return;
    }
    panel.onListo(codigo);
  }

  function cuerpo() {
    return (
      <>
        {
          <>
            <Tarjeta className="p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-lg font-semibold">¿Quiénes van?</h2>
                <span
                  className={`text-[15px] font-semibold ${excede ? "text-error-700" : "text-tinta-500"}`}
                >
                  {personas} de {casa.capacidad} personas
                </span>
              </div>
              <p className="mt-1 text-[13px] text-tinta-500">
                Incluya a todas las personas que pernoctarán, también niños y
                niñas (Art. 14).
              </p>

              <div className="mt-4 rounded-lg border border-borde px-4 py-3">
                <p className="font-medium">{usuario.nombre}</p>
                <p className="text-sm text-tinta-500">
                  Usuario/a responsable ·{" "}
                  {asistida
                    ? `pide la reserva por medio de ${gestor.nombre}`
                    : "hace la solicitud"}{" "}
                  y responde por el grupo (Art. 2 a)
                </p>
                <label className="mt-3 flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    className="size-5 accent-verde-700"
                    checked={viaja}
                    onChange={(e) => setViaja(e.target.checked)}
                  />
                  <span className="text-[15px]">
                    {asistida ? "Viaja" : "Yo también viajo"}
                  </span>
                </label>
              </div>
              {!viaja && (
                <div className="mt-3 space-y-3">
                  <Aviso>
                    {asistida
                      ? `${usuario.nombre} sigue siendo el usuario/a responsable:`
                      : "Usted sigue siendo el usuario/a responsable:"}{" "}
                    responde por el grupo, por los daños y por el cumplimiento
                    del reglamento durante toda la estadía, aunque no viaje
                    (Art. 2 a y 22). La reserva no se puede ceder (Art. 8).
                  </Aviso>
                  <Campo
                    etiqueta="Persona a cargo en la casa"
                    ayuda="Debe ser una de las personas que viajan, mayor de edad."
                  >
                    <select
                      className={claseEntrada}
                      value={aCargo}
                      onChange={(e) => setACargo(e.target.value)}
                    >
                      <option value="">
                        {adultos.length
                          ? "Elija a una persona"
                          : "Primero agregue a las personas que viajan"}
                      </option>
                      {adultos.map((o, i) => (
                        <option key={i} value={o.nombre.trim()}>
                          {o.nombre.trim()}
                        </option>
                      ))}
                    </select>
                  </Campo>
                </div>
              )}

              {otros.map((o, i) => {
                const err = intento ? errorOtro(o) : {};
                const cambiar = (k, v) =>
                  setOtros(
                    otros.map((x, j) => (j === i ? { ...x, [k]: v } : x)),
                  );
                return (
                  <fieldset
                    key={i}
                    className="mt-4 rounded-lg border border-borde p-4"
                  >
                    <legend className="px-1 text-sm font-semibold text-tinta-700">
                      Persona {i + 1}
                    </legend>
                    <div className="grid gap-3 sm:grid-cols-[1fr_90px_1fr]">
                      <Campo etiqueta="Nombre y apellido" error={err.nombre}>
                        <input
                          className={claseEntrada}
                          value={o.nombre}
                          onChange={(e) => cambiar("nombre", e.target.value)}
                          autoComplete="off"
                        />
                      </Campo>
                      <Campo etiqueta="Edad" error={err.edad}>
                        <input
                          className={claseEntrada}
                          type="number"
                          min="0"
                          max="110"
                          value={o.edad}
                          onChange={(e) => cambiar("edad", e.target.value)}
                        />
                      </Campo>
                      <Campo etiqueta="Relación">
                        <select
                          className={claseEntrada}
                          value={o.parentesco}
                          onChange={(e) =>
                            cambiar("parentesco", e.target.value)
                          }
                        >
                          {PARENTESCOS.map((x) => (
                            <option key={x.valor} value={x.valor}>
                              {x.etiqueta}
                            </option>
                          ))}
                        </select>
                      </Campo>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOtros(otros.filter((_, j) => j !== i))}
                      className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-error-700 hover:underline"
                    >
                      <Trash2 className="size-4" aria-hidden /> Quitar
                    </button>
                  </fieldset>
                );
              })}

              <Boton
                variante="secundario"
                className="mt-4"
                disabled={personas >= casa.capacidad}
                onClick={() =>
                  setOtros([
                    ...otros,
                    { nombre: "", edad: "", parentesco: "familiar" },
                  ])
                }
              >
                <Plus className="size-4" aria-hidden /> Agregar persona
              </Boton>
              {excede && (
                <div className="mt-3">
                  <Aviso tipo="error">
                    La casa admite hasta {casa.capacidad} personas. Quite a
                    alguien para continuar.
                  </Aviso>
                </div>
              )}

              {intento && errorGrupo && (
                <div className="mt-3">
                  <Aviso tipo="error">{errorGrupo}</Aviso>
                </div>
              )}

              <label className="mt-5 flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-0.5 size-5 accent-verde-700"
                  checked={perro}
                  onChange={(e) => setPerro(e.target.checked)}
                />
                <span className="text-[15px]">
                  Viaja un perro de asistencia (Ley 20.422)
                </span>
              </label>
              {perro && (
                <div className="mt-3 rounded-lg bg-stone-50 p-4">
                  <p className="text-[15px] text-tinta-700">
                    Las mascotas no pueden ingresar a las casas; los perros de
                    asistencia de personas con discapacidad sí (Art. 15). Para
                    acreditarlo, adjunte:
                  </p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-[15px] text-tinta-700">
                    <li>
                      <strong>
                        Credencial de usuario de perro de asistencia
                      </strong>
                      , emitida por la entidad que adiestró al perro, inscrita
                      en el Registro Nacional de la Discapacidad. Incluye la
                      foto de la persona con el perro y sus datos (D.S. N°
                      223/2006, Art. 6).
                    </li>
                    <li>
                      <strong>Certificado sanitario vigente</strong>, firmado
                      por un médico veterinario, con la vacuna antirrábica del
                      último año (D.S. N° 223/2006, Art. 9).
                    </li>
                  </ul>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <Adjunto
                      etiqueta="Credencial del perro de asistencia"
                      archivo={credencial}
                      onCambio={setCredencial}
                    />
                    <Adjunto
                      etiqueta="Certificado sanitario vigente"
                      archivo={sanitario}
                      onCambio={setSanitario}
                    />
                  </div>
                  <p className="mt-2 text-[13px] text-tinta-500">
                    PDF o imagen, hasta 5 MB cada uno. Los revisa la encargada
                    regional.
                  </p>
                  {intento && errorPerro && (
                    <p className="mt-2 text-sm text-error-700">{errorPerro}</p>
                  )}
                </div>
              )}
            </Tarjeta>

            <Tarjeta className="p-5">
              <h2 className="text-lg font-semibold">
                Contacto durante la estadía
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Campo etiqueta="Teléfono">
                  <input
                    className={claseEntrada}
                    type="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    autoComplete="tel"
                  />
                </Campo>
                <Campo
                  etiqueta="Correo"
                  ayuda="Aquí le avisaremos la confirmación."
                >
                  <input
                    className={claseEntrada}
                    type="email"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    autoComplete="email"
                  />
                </Campo>
              </div>
              {intento && contactoError && (
                <div className="mt-3">
                  <Aviso tipo="error">{contactoError}</Aviso>
                </div>
              )}
            </Tarjeta>
          </>
        }

        {
          <>
            <Tarjeta className="p-5">
              <h2 className="text-lg font-semibold">¿Cómo pagará?</h2>
              <p className="mt-1 text-[15px] text-tinta-500">
                Total de la estadía:{" "}
                <strong className="text-tinta-900">{pesos(total)}</strong>
              </p>
              <p className="mt-3 text-[15px] text-tinta-700">
                {formas.length === 1 && formas[0] === "transferencia"
                  ? usuario.calidad === "jubilado"
                    ? "Como persona pensionada, paga por transferencia antes de llegar (Art. 21)."
                    : "Como funcionario/a de otro servicio público, paga por transferencia antes de llegar (Art. 21)."
                  : formas.length > 1
                    ? "Con contrato a plazo fijo puede elegir descuento por planilla o transferencia."
                    : "Como funcionario/a de CONAF, paga con descuento por planilla."}
              </p>
              <div
                className="mt-4 grid gap-3"
                role="radiogroup"
                aria-label="Forma de pago"
              >
                {formas.includes("planilla") && (
                  <OpcionPago
                    activa={pago === "planilla"}
                    onClick={() => setPago("planilla")}
                    titulo="Descuento por planilla"
                    detalle="Se descuenta de su remuneración."
                  >
                    {pago === "planilla" && (
                      <div onClick={(e) => e.stopPropagation()}>
                        <div
                          className="mt-3 flex flex-wrap gap-2"
                          role="radiogroup"
                          aria-label="Número de cuotas"
                        >
                          {Array.from(
                            { length: PARAMETROS.cuotas_maximas_planilla },
                            (_, i) => i + 1,
                          ).map((c) => (
                            <button
                              key={c}
                              type="button"
                              role="radio"
                              aria-checked={cuotas === c}
                              onClick={() => setCuotas(c)}
                              className={`rounded-lg px-3 py-2 text-sm ring-1 ring-inset ${cuotas === c ? "bg-verde-700 font-semibold text-white ring-verde-700" : "bg-white text-tinta-700 ring-borde hover:bg-stone-50"}`}
                            >
                              {c === 1
                                ? `1 cuota de ${pesos(total)}`
                                : `${c} cuotas de ${pesos(total / c)}`}
                            </button>
                          ))}
                        </div>
                        <label className="mt-3 flex cursor-pointer items-start gap-3 rounded-lg bg-white p-3 ring-1 ring-borde">
                          <input
                            type="checkbox"
                            className="mt-0.5 size-5 accent-verde-700"
                            checked={autoriza}
                            onChange={(e) => setAutoriza(e.target.checked)}
                          />
                          <span className="text-[15px]">
                            {asistida
                              ? `${usuario.nombre} autorizó`
                              : "Autorizo"}{" "}
                            el descuento por planilla de{" "}
                            <strong>{pesos(total)}</strong> en{" "}
                            {plural(cuotas, "cuota", "cuotas")}, más los cargos
                            que correspondan según el reglamento (Anexo A).
                          </span>
                        </label>
                        {intento && !autoriza && (
                          <p className="mt-2 text-sm text-error-700">
                            Debe autorizar el descuento
                            {formas.length > 1
                              ? ", o elegir la transferencia"
                              : ""}
                            .
                          </p>
                        )}
                      </div>
                    )}
                  </OpcionPago>
                )}
                {formas.includes("transferencia") && (
                  <OpcionPago
                    activa={pago === "transferencia"}
                    onClick={elegirTransferencia}
                    titulo="Transferencia electrónica"
                    detalle="Antes de llegar, a la cuenta corriente de CONAF."
                  >
                    {pago === "transferencia" && vioCuenta && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="mt-3 rounded-lg bg-white p-3 text-[15px] ring-1 ring-borde"
                      >
                        <span className="text-[13px] text-tinta-500">
                          Glosa de su transferencia
                        </span>
                        <span className="block font-semibold text-verde-800">
                          {glosa}
                        </span>
                        <button
                          type="button"
                          onClick={() => setCuadro(true)}
                          className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-verde-700 hover:underline"
                        >
                          <Landmark className="size-4" aria-hidden /> Ver datos
                          de la cuenta
                        </button>
                      </div>
                    )}
                  </OpcionPago>
                )}
              </div>
              {intento && !pago && (
                <div className="mt-3">
                  <Aviso tipo="error">Elija una forma de pago.</Aviso>
                </div>
              )}
            </Tarjeta>

            <Tarjeta className="p-5">
              <h2 className="text-lg font-semibold">Antes de enviar</h2>
              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[15px] text-tinta-700">
                {gestor?.perfil === "central" && (
                  <li>
                    Si las fechas siguen disponibles, quedan apartadas y la
                    reserva queda <strong>por aprobar</strong>: la aprueba la
                    encargada regional de la casa (decisión del 12-11-2026). A
                    la persona no se le envía nada hasta entonces.
                  </li>
                )}
                {pago === "transferencia" ? (
                  <li>
                    {gestor?.perfil === "central"
                      ? "Al aprobarla"
                      : "Si las fechas siguen disponibles, quedan apartadas y"}{" "}
                    la reserva queda <strong>por confirmar</strong> y se envían
                    los datos para transferir. Cuando Bienestar compruebe la
                    transferencia, se confirma y se envía por correo la{" "}
                    <strong>ficha de la reserva</strong>.
                  </li>
                ) : (
                  <li>
                    {gestor?.perfil === "central"
                      ? "Al aprobarla, la reserva queda"
                      : "Si las fechas siguen disponibles, la reserva queda"}{" "}
                    <strong>confirmada</strong> y se envía por correo la{" "}
                    <strong>ficha de la reserva</strong>: quienes viajan, las
                    direcciones de la casa y el inventario.
                  </li>
                )}
                <li>
                  Si desiste{" "}
                  <strong>hasta el {fechaCorta(limiteDesistir, true)}</strong> (
                  {PARAMETROS.aviso_desistimiento_dias_habiles} días hábiles
                  antes de la llegada) no tiene costo. Después, o si no se
                  presenta, se paga la estadía completa ({pesos(total)}), salvo
                  fuerza mayor acreditada.
                </li>
              </ul>
              <details className="mt-3 rounded-lg bg-stone-50 px-4 py-3">
                <summary className="cursor-pointer text-[15px] font-medium text-verde-800">
                  Condiciones de uso de la casa
                </summary>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-[15px] text-tinta-700">
                  {CONDICIONES_USO.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </details>
              {asistida && (
                <fieldset className="mt-4">
                  <legend className="text-[15px] font-medium text-tinta-900">
                    ¿Por qué vía le pidió la reserva?
                  </legend>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {Object.entries(VIAS).map(([k, t]) => (
                      <label
                        key={k}
                        className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg px-3 text-[15px] ring-1 ring-inset ${via === k ? "bg-verde-50 font-semibold text-verde-800 ring-verde-600" : "bg-white text-tinta-700 ring-borde hover:bg-stone-50"}`}
                      >
                        <input
                          type="radio"
                          name="via"
                          value={k}
                          checked={via === k}
                          onChange={() => setVia(k)}
                          className="size-4 accent-verde-700"
                        />
                        {t}
                      </label>
                    ))}
                  </div>
                  {intento && !via && (
                    <div className="mt-2">
                      <Aviso tipo="error">
                        Indique por qué vía le pidió la reserva.
                      </Aviso>
                    </div>
                  )}
                </fieldset>
              )}
              <label className="mt-4 flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-0.5 size-5 accent-verde-700"
                  checked={acepta}
                  onChange={(e) => setAcepta(e.target.checked)}
                />
                <span className="text-[15px]">
                  {asistida
                    ? `Declaro que ${usuario.nombre} me pidió esta reserva y que conoce y acepta el Reglamento General de Uso de Casas de Veraneo o Descanso. Recibirá en ${correo} ${pago === "transferencia" ? "los datos para transferir y, cuando se compruebe el pago, " : ""}la ficha de la reserva.`
                    : "Conozco y acepto el Reglamento General de Uso de Casas de Veraneo o Descanso."}
                </span>
              </label>
              {intento && !acepta && (
                <div className="mt-3">
                  <Aviso tipo="error">
                    {asistida
                      ? "Debe declarar que la persona pidió la reserva y conoce el reglamento."
                      : "Debe aceptar el reglamento para confirmar la reserva."}
                  </Aviso>
                </div>
              )}
              {ocupada && (
                <div className="mt-3">
                  <Aviso tipo="error">
                    Otra persona acaba de reservar esas fechas. Elija otras
                    fechas arriba.
                  </Aviso>
                </div>
              )}
            </Tarjeta>
          </>
        }

        {
          <div className="flex flex-wrap justify-end gap-3">
            <Boton variante="secundario" onClick={panel.onCancelar}>
              Cancelar
            </Boton>
            <Boton onClick={avanzar}>Registrar reserva</Boton>
          </div>
        }
        {cuadro && (
          <CuadroTransferencia
            monto={total}
            glosa={glosa}
            plazo="antes de su llegada"
            onCerrar={cerrarCuadro}
          />
        )}
      </>
    );
  }

  return (
    <div className="space-y-5">
      {erroresFechas.length > 0 && (
        <Tarjeta className="p-5">
          <h3 className="font-semibold">
            No se puede registrar para esta persona
          </h3>
          {erroresFechas.map((e) => (
            <div key={e} className="mt-3">
              <Aviso tipo="error">{e}</Aviso>
            </div>
          ))}
          <p className="mt-3 text-[15px] text-tinta-700">
            Elija otras fechas u otra casa con disponibilidad: solo se registran
            las reservas que se pueden dar.
          </p>
        </Tarjeta>
      )}
      {erroresFechas.length === 0 && cuerpo()}
    </div>
  );
}

function OpcionPago({ activa, onClick, titulo, detalle, children }) {
  return (
    <div
      role="radio"
      aria-checked={activa}
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) =>
        (e.key === " " || e.key === "Enter") &&
        e.target === e.currentTarget &&
        (e.preventDefault(), onClick())
      }
      className={`cursor-pointer rounded-lg p-4 ring-inset ${activa ? "bg-verde-50 ring-2 ring-verde-600" : "bg-white ring-1 ring-borde hover:bg-stone-50"}`}
    >
      <span className="flex items-center gap-3">
        <span
          className={`grid size-5 shrink-0 place-items-center rounded-full ring-2 ${activa ? "ring-verde-700" : "ring-stone-300"}`}
        >
          {activa && <span className="size-2.5 rounded-full bg-verde-700" />}
        </span>
        <span>
          <span className="block font-semibold">{titulo}</span>
          <span className="block text-sm text-tinta-500">{detalle}</span>
        </span>
      </span>
      {children}
    </div>
  );
}

function Adjunto({ etiqueta, archivo, onCambio }) {
  const [error, setError] = useState(null);
  return (
    <label className="relative block cursor-pointer rounded-lg border border-dashed border-borde bg-white px-3 py-3 hover:border-verde-600">
      <span className="block text-sm font-medium text-tinta-700">
        {etiqueta}
      </span>
      <span
        className={`mt-1 block truncate text-[13px] ${archivo ? "text-verde-700" : "text-tinta-500"}`}
      >
        {archivo ? `✓ ${archivo.name}` : "Seleccionar archivo"}
      </span>
      {error && (
        <span className="mt-1 block text-[13px] text-error-700">{error}</span>
      )}
      <input
        type="file"
        accept="application/pdf,image/*"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          if (f.size > 5 * 1024 * 1024) {
            setError("El archivo supera 5 MB.");
            return;
          }
          setError(null);
          onCambio({ name: f.name });
        }}
      />
    </label>
  );
}
