import { useState } from 'react'
import { REGIONES } from '../../datos/casas.js'
import { listarCasas } from '../../datos/servicio.js'
import { MOTIVOS_NO_ATENDIDA, registrarNoAtendida } from '../../datos/solicitudes.js'
import { rutValido } from '../../lib/formato.js'
import { VIAS } from '../../lib/reglas.js'
import { Aviso, Boton, Campo, claseEntrada } from '../../componentes/ui.jsx'
import { Dialogo } from '../encargada/comun.jsx'

/**
 * Registrar un pedido que no terminó en reserva (decisión 12-11-2026): sin
 * cupo, de otra región (se derivó), fuera de plazo, temporada alta u otro.
 * No aparta fechas; sirve para medir la demanda no atendida. `previo` trae lo
 * que ya se sabe (de la selección del tablero o del registro que no se pudo).
 */
export function DialogoNoAtendida({ gestor, previo = {}, onCerrar, onListo }) {
  const [d, setD] = useState(() => ({
    nombre: previo.persona?.nombre ?? '',
    rut: previo.persona?.rut ?? '',
    via: previo.via ?? '',
    region: previo.region ?? (gestor.perfil === 'encargada' ? gestor.region : ''),
    casa_id: previo.casa_id ? String(previo.casa_id) : '',
    entrada: previo.entrada ?? '',
    salida: previo.salida ?? '',
    personas: previo.personas ? String(previo.personas) : '',
    motivo: previo.motivo ?? '',
    detalle: '',
  }))
  const [intento, setIntento] = useState(false)
  const fijar = (k, v) => setD((x) => ({ ...x, [k]: v }))
  const casas = listarCasas().filter((c) => !d.region || c.region === d.region)
  const regiones = REGIONES.filter((r) => listarCasas().some((c) => c.region === r.codigo))
  const err = {
    nombre: d.nombre.trim().split(/\s+/).length < 2 ? 'Escriba nombre y apellido.' : null,
    rut: d.rut.trim() && !rutValido(d.rut) ? 'El RUT no es válido (o déjelo en blanco).' : null,
    via: !d.via ? 'Indique por qué vía llegó el pedido.' : null,
    motivo: !d.motivo ? 'Indique por qué no se pudo atender.' : null,
    detalle: d.motivo === 'otro' && !d.detalle.trim() ? 'Explique el motivo.' : null,
    fechas: d.entrada && d.salida && d.salida <= d.entrada ? 'La salida debe ser posterior a la llegada.' : null,
  }
  const valido = !Object.values(err).some(Boolean)

  return (
    <Dialogo titulo="Solicitud no atendida" onCerrar={onCerrar}>
      <p className="mt-1 text-[15px] text-tinta-700">Deja constancia de un pedido que no terminó en reserva. No aparta fechas ni avisa a la persona.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Campo etiqueta="Nombre y apellido" error={intento && err.nombre}>
          <input className={claseEntrada} value={d.nombre} onChange={(e) => fijar('nombre', e.target.value)} />
        </Campo>
        <Campo etiqueta="RUT (opcional)" error={intento && err.rut}>
          <input className={claseEntrada} value={d.rut} onChange={(e) => fijar('rut', e.target.value)} inputMode="text" />
        </Campo>
      </div>
      <fieldset className="mt-4">
        <legend className="text-sm font-medium text-tinta-700">Vía</legend>
        <div className="mt-1 flex flex-wrap gap-2">
          {Object.entries(VIAS).map(([k, t]) => (
            <label key={k} className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg px-3 text-[15px] ring-1 ring-inset ${d.via === k ? 'bg-verde-50 font-semibold text-verde-800 ring-verde-600' : 'bg-white text-tinta-700 ring-borde'}`}>
              <input type="radio" name="via-na" checked={d.via === k} onChange={() => fijar('via', k)} className="size-4 accent-verde-700" /> {t}
            </label>
          ))}
        </div>
        {intento && err.via && <p className="mt-1 text-sm text-error-700">{err.via}</p>}
      </fieldset>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Campo etiqueta="Región pedida">
          <select
            className={claseEntrada}
            value={d.region}
            onChange={(e) => {
              fijar('region', e.target.value)
              fijar('casa_id', '')
            }}
          >
            <option value="">Sin preferencia</option>
            {regiones.map((r) => (
              <option key={r.codigo} value={r.codigo}>
                {r.nombre}
              </option>
            ))}
          </select>
        </Campo>
        <Campo etiqueta="Casa pedida (opcional)">
          <select className={claseEntrada} value={d.casa_id} onChange={(e) => fijar('casa_id', e.target.value)}>
            <option value="">Cualquiera</option>
            {casas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </Campo>
        <Campo etiqueta="Llegada (opcional)">
          <input type="date" className={claseEntrada} value={d.entrada} onChange={(e) => fijar('entrada', e.target.value)} />
        </Campo>
        <Campo etiqueta="Salida (opcional)" error={intento && err.fechas}>
          <input type="date" className={claseEntrada} value={d.salida} onChange={(e) => fijar('salida', e.target.value)} />
        </Campo>
        <Campo etiqueta="Personas (opcional)">
          <input type="number" min={1} max={20} className={claseEntrada} value={d.personas} onChange={(e) => fijar('personas', e.target.value)} />
        </Campo>
      </div>
      <fieldset className="mt-4">
        <legend className="text-sm font-medium text-tinta-700">Por qué no se atendió</legend>
        <div className="mt-1 grid gap-1.5">
          {Object.entries(MOTIVOS_NO_ATENDIDA).map(([k, t]) => (
            <label key={k} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-3 text-[15px] ring-1 ring-inset ring-borde">
              <input type="radio" name="motivo-na" checked={d.motivo === k} onChange={() => fijar('motivo', k)} className="size-4 accent-verde-700" /> {t}
            </label>
          ))}
        </div>
        {intento && err.motivo && <p className="mt-1 text-sm text-error-700">{err.motivo}</p>}
      </fieldset>
      <Campo etiqueta={d.motivo === 'otro' ? 'Detalle' : 'Detalle (opcional)'} error={intento && err.detalle} className="mt-4">
        <textarea className={`${claseEntrada} min-h-20 py-2`} value={d.detalle} onChange={(e) => fijar('detalle', e.target.value)} placeholder="Por ejemplo: se derivó a la encargada de Los Lagos" />
      </Campo>
      {intento && !valido && (
        <div className="mt-3">
          <Aviso tipo="error">Revise los campos marcados.</Aviso>
        </div>
      )}
      <div className="mt-6 flex justify-end gap-3">
        <Boton variante="secundario" onClick={onCerrar}>
          Cancelar
        </Boton>
        <Boton
          onClick={() => {
            setIntento(true)
            if (!valido) return
            const id = registrarNoAtendida({ persona: { nombre: d.nombre, rut: d.rut }, via: d.via, region: d.region, casa_id: Number(d.casa_id) || null, entrada: d.entrada, salida: d.salida, personas: d.personas, motivo: d.motivo, detalle: d.detalle }, gestor)
            onListo(`Se registró la solicitud no atendida ${id}.`)
          }}
        >
          Registrar solicitud
        </Boton>
      </div>
    </Dialogo>
  )
}
