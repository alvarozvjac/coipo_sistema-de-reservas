import { useState } from 'react'
import { CalendarPlus, Eye, Pencil, Unlock } from 'lucide-react'
import { abrirPostulacion, edicionTemporada, elegirSorteo, estadoTemporada, guardarTemporada, listarCasas, listarTemporadas, sorteoDe, sorteoVigente, useDatos } from '../../datos/servicio.js'
import { fechaCorta, hoyISO, rangoFechas } from '../../lib/fechas.js'
import { plural } from '../../lib/formato.js'
import { PARAMETROS } from '../../lib/reglas.js'
import { calendariosDe, codigoTurno, inicioTemporada, nochesTurno, nombreDia } from '../../lib/sorteo.js'
import { ResumenCalendarios } from '../../componentes/Postulacion.jsx'
import { Aviso, Boton, Campo, Tarjeta, claseEntrada } from '../../componentes/ui.jsx'
import { useSesion } from '../../componentes/Perfil.jsx'
import { Dialogo } from '../encargada/comun.jsx'

const ESTADOS = {
  programada: { etiqueta: 'Postulación no habilitada', clase: 'bg-stone-200 text-tinta-700' },
  postulacion: { etiqueta: 'Postulación abierta', clase: 'bg-sky-100 text-sky-800' },
  por_sortear: { etiqueta: 'Por sortear', clase: 'bg-alerta-50 text-alerta-700' },
  sorteada: { etiqueta: 'Sorteo realizado', clase: 'bg-verde-100 text-verde-800' },
  terminada: { etiqueta: 'Terminada', clase: 'bg-stone-100 text-tinta-500' },
}

/** Temporadas altas: Oficina Central define las fechas que se asignan por sorteo y quedan cerradas a la reserva directa. */
export function Temporadas() {
  useDatos()
  const [editar, setEditar] = useState(null)
  const [hecho, setHecho] = useState(null)
  const [abrir, setAbrir] = useState(null)
  const lista = listarTemporadas()
  const enFoco = sorteoVigente()?.id
  return (
    <section aria-labelledby="t-temp">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="t-temp" className="text-lg font-semibold">
            Temporadas altas
          </h2>
          <p className="mt-1 max-w-3xl text-sm text-tinta-500">
            Las fechas de cada temporada se asignan por sorteo en turnos fijos (verano 2027: {PARAMETROS.noches_turno_temporada_alta} noches, con un calendario general y otro para las cabañas de Puyehue) y quedan cerradas a la reserva directa desde que se guarda (Art. 6). La postulación se abre solo cuando Oficina Central la habilita. Las vacantes que queden después del sorteo se pueden reservar directo.
          </p>
        </div>
        <Boton onClick={() => setEditar({})}>
          <CalendarPlus className="size-4" aria-hidden /> Nueva temporada
        </Boton>
      </div>
      {hecho && (
        <div className="mt-3">
          <Aviso tipo="info">{hecho}</Aviso>
        </div>
      )}
      <Tarjeta className="relative mt-3 overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-[15px]">
          <thead className="border-b border-borde text-[13px] text-tinta-500">
            <tr>
              <th className="px-4 py-3 font-medium">Temporada</th>
              <th className="px-4 py-3 font-medium">Fechas cerradas al sorteo</th>
              <th className="px-4 py-3 font-medium">Turnos</th>
              <th className="px-4 py-3 font-medium">Cierre de postulación</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">
                <span className="sr-only">Acción</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-borde">
            {lista.map((t) => {
              const e = ESTADOS[estadoTemporada(t)]
              const modo = edicionTemporada(t)
              const cal = calendariosDe(t, listarCasas())
              return (
                <tr key={t.id} className={t.id === enFoco ? 'bg-verde-50/60' : ''}>
                  <td className="px-4 py-2.5 font-medium">{t.nombre}</td>
                  <td className="px-4 py-2.5">{rangoFechas(inicioTemporada(t), t.hasta)}</td>
                  <td className="px-4 py-2.5 text-sm">
                    {nochesTurno(t)} noches ·{' '}
                    {cal.map((c) => `${c.turnos.length}${cal.length > 1 ? (c.clave === 'general' ? ' generales' : ` en ${plural(c.casas.length, 'casa', 'casas')}`) : ''}`).join(' y ')}
                  </td>
                  <td className="px-4 py-2.5 text-sm">
                    {sorteoDe(t.id) ? `Abierta el ${fechaCorta(sorteoDe(t.id).postulacion.desde)} · cierra el ${fechaCorta(sorteoDe(t.id).postulacion.hasta, true)}` : `Cierra el ${fechaCorta(t.postulacion.hasta, true)}`}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[13px] font-semibold ${e.clase}`}>{e.etiqueta}</span>
                  </td>
                  <td className="space-x-2 whitespace-nowrap px-4 py-2.5 text-right">
                    {!sorteoDe(t.id) && estadoTemporada(t) !== 'terminada' && (
                      <Boton onClick={() => setAbrir(t)}>
                        <Unlock className="size-4" aria-hidden /> Habilitar postulación
                      </Boton>
                    )}
                    {sorteoDe(t.id) && t.id !== enFoco && (
                      <Boton variante="secundario" onClick={() => elegirSorteo(t.id)}>
                        <Eye className="size-4" aria-hidden /> Ver sorteo
                      </Boton>
                    )}
                    {modo !== 'cerrada' && estadoTemporada(t) !== 'terminada' && (
                      <Boton variante="secundario" onClick={() => setEditar(t)}>
                        <Pencil className="size-4" aria-hidden /> Editar
                      </Boton>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Tarjeta>
      {abrir && <DialogoAbrir temporada={abrir} onCerrar={() => setAbrir(null)} onListo={setHecho} />}
      {editar && <FormTemporada previa={editar.id ? editar : null} onCerrar={() => setEditar(null)} onListo={setHecho} />}
    </section>
  )
}

function FormTemporada({ previa, onCerrar, onListo }) {
  const { usuario } = useSesion()
  const casas = listarCasas({ incluirInactivas: true })
  const modo = previa ? edicionTemporada(previa) : 'completa'
  const soloCierre = modo === 'solo_cierre'
  const [d, setD] = useState(
    previa
      ? { ...previa, postulacion: { ...previa.postulacion }, especial: previa.especial ? { ...previa.especial, casas: [...previa.especial.casas] } : null }
      : {
          tipo: 'verano',
          nombre: '',
          noches: PARAMETROS.noches_turno_temporada_alta,
          desde: '',
          hasta: '',
          libres: 2,
          especial: null,
          cuotas: PARAMETROS.cuotas_temporada_alta,
          primera_cuota: '',
          postulacion: { desde: '', hasta: '' },
        },
  )
  const [errores, setErrores] = useState([])
  const cambiar = (c) => {
    setD({ ...d, ...c })
    setErrores([])
  }
  const cambiarPost = (c) => {
    setD({ ...d, postulacion: { ...d.postulacion, ...c } })
    setErrores([])
  }
  const cambiarEspecial = (c) => cambiar({ especial: { ...d.especial, ...c } })
  const alternarCasa = (id) => {
    const lista = d.especial.casas.includes(id) ? d.especial.casas.filter((x) => x !== id) : [...d.especial.casas, id]
    cambiarEspecial({ casas: lista })
  }

  const vista = { ...d, noches: Number(d.noches), libres: Number(d.libres), especial: d.especial?.casas.length ? { ...d.especial, libres: Number(d.especial.libres) } : null }
  const listas = d.desde && d.hasta && d.hasta > d.desde && Number(d.noches) > 0
  const calendarios = listas ? calendariosDe(vista, casas) : []

  function guardar() {
    const r = guardarTemporada({ ...d, nombre: d.nombre.trim() }, usuario)
    if (r.error) return setErrores(r.errores)
    onListo(previa ? `Se guardaron los cambios de ${d.nombre}.` : `${d.nombre} quedó creada: sus fechas ya no se pueden reservar directo.`)
    onCerrar()
  }

  const numero = (valor, alCambiar, props = {}) => (
    <input type="number" className={claseEntrada} value={valor} disabled={soloCierre} onChange={(e) => alCambiar(e.target.value)} {...props} />
  )

  return (
    <Dialogo titulo={previa ? `Editar ${previa.nombre}` : 'Nueva temporada alta'} onCerrar={onCerrar}>
      {soloCierre && (
        <div className="mt-3">
          <Aviso>Ya hay postulaciones: solo se puede extender o adelantar el cierre de la postulación.</Aviso>
        </div>
      )}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Campo etiqueta="Tipo">
          <select className={claseEntrada} value={d.tipo} disabled={Boolean(previa)} onChange={(e) => cambiar({ tipo: e.target.value })}>
            <option value="verano">Verano</option>
            <option value="invierno">Vacaciones de invierno</option>
          </select>
        </Campo>
        <Campo etiqueta="Nombre" ayuda="Se muestra a quienes postulan.">
          <input
            className={claseEntrada}
            value={d.nombre}
            disabled={soloCierre}
            placeholder={d.tipo === 'invierno' ? 'Vacaciones de invierno 2028' : 'Temporada de verano 2028'}
            onChange={(e) => cambiar({ nombre: e.target.value })}
          />
        </Campo>
        <Campo etiqueta="Noches por turno">{numero(d.noches, (v) => cambiar({ noches: v }), { min: 1, max: 14 })}</Campo>
        <Campo etiqueta="Fin de la temporada" ayuda="Última salida posible de un turno.">
          <input type="date" className={claseEntrada} value={d.hasta} disabled={soloCierre} onChange={(e) => cambiar({ hasta: e.target.value })} />
        </Campo>
      </div>

      <fieldset className="mt-4 rounded-lg border border-borde p-3">
        <legend className="px-1 text-[15px] font-semibold">Calendario general</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <Campo etiqueta="Llegada del primer turno">
            <input type="date" className={claseEntrada} value={d.desde} disabled={soloCierre} onChange={(e) => cambiar({ desde: e.target.value })} />
          </Campo>
          <Campo etiqueta="Noches libres entre turnos" ayuda="Para aseo y cambio. Con 2, cada turno parte un día distinto de la semana.">
            {numero(d.libres, (v) => cambiar({ libres: v }), { min: 0, max: 7 })}
          </Campo>
        </div>
      </fieldset>

      <fieldset className="mt-3 rounded-lg border border-borde p-3">
        <legend className="px-1 text-[15px] font-semibold">Calendario especial</legend>
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            className="mt-0.5 size-5 accent-verde-700"
            checked={Boolean(d.especial)}
            disabled={soloCierre}
            onChange={(e) => cambiar({ especial: e.target.checked ? { casas: [], desde: d.desde, libres: 1 } : null })}
          />
          <span className="text-[15px]">Algunas casas siguen otro calendario (por ejemplo, las cabañas de Puyehue, de sábado a viernes).</span>
        </label>
        {d.especial && (
          <>
            <div className="mt-3 grid max-h-40 gap-1 overflow-y-auto rounded-lg bg-stone-50 p-2 sm:grid-cols-2">
              {casas.map((c) => (
                <label key={c.id} className="flex cursor-pointer items-center gap-2 text-sm">
                  <input type="checkbox" className="size-4 accent-verde-700" checked={d.especial.casas.includes(c.id)} disabled={soloCierre} onChange={() => alternarCasa(c.id)} />
                  {c.nombre}
                </label>
              ))}
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Campo etiqueta="Llegada del primer turno">
                <input type="date" className={claseEntrada} value={d.especial.desde} disabled={soloCierre} onChange={(e) => cambiarEspecial({ desde: e.target.value })} />
              </Campo>
              <Campo etiqueta="Noches libres entre turnos">{numero(d.especial.libres, (v) => cambiarEspecial({ libres: v }), { min: 0, max: 7 })}</Campo>
            </div>
          </>
        )}
      </fieldset>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Campo etiqueta="Cuotas de descuento por planilla" ayuda="Para quienes pagan por planilla un turno adjudicado.">
          {numero(d.cuotas, (v) => cambiar({ cuotas: v }), { min: 1, max: 12 })}
        </Campo>
        <Campo etiqueta="Mes de la primera cuota">
          <input type="month" className={claseEntrada} value={d.primera_cuota} disabled={soloCierre} onChange={(e) => cambiar({ primera_cuota: e.target.value })} />
        </Campo>
        <Campo etiqueta="Apertura prevista" ayuda="Se abre cuando Oficina Central la habilita.">
          <input type="date" className={claseEntrada} value={d.postulacion.desde} disabled={soloCierre} onChange={(e) => cambiarPost({ desde: e.target.value })} />
        </Campo>
        <Campo etiqueta="Postulación hasta">
          <input type="date" className={claseEntrada} value={d.postulacion.hasta} onChange={(e) => cambiarPost({ hasta: e.target.value })} />
        </Campo>
      </div>

      <div className="mt-4 rounded-lg bg-stone-50 px-4 py-3">
        <h3 className="text-[15px] font-semibold">Turnos que se sortearán</h3>
        {!listas ? (
          <p className="mt-1 text-sm text-tinta-500">Indique las noches por turno, la llegada del primer turno y el fin de la temporada para ver los turnos.</p>
        ) : (
          calendarios.map((c) => (
            <div key={c.clave} className="mt-2">
              <p className="text-sm font-medium text-tinta-900">
                {c.clave === 'general' ? (calendarios.length > 1 ? 'Casas en general' : 'Todas las casas') : c.casas.map((x) => x.nombre).join(', ')}
                {' · '}
                {c.turnos.length ? plural(c.turnos.length, 'turno', 'turnos') : 'ningún turno cabe'}
              </p>
              <ol className="mt-1 grid gap-x-4 gap-y-0.5 text-sm text-tinta-700 sm:grid-cols-2">
                {c.turnos.map((x) => (
                  <li key={x.entrada}>
                    {codigoTurno(x)} · {nombreDia(x.entrada)} {fechaCorta(x.entrada)} al {nombreDia(x.salida)} {fechaCorta(x.salida)}
                  </li>
                ))}
              </ol>
            </div>
          ))
        )}
      </div>

      {errores.length > 0 && (
        <div className="mt-3">
          <Aviso tipo="error">
            <ul className="list-disc pl-5">
              {errores.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </Aviso>
        </div>
      )}
      <div className="mt-6 flex justify-end gap-3">
        <Boton variante="secundario" onClick={onCerrar}>
          Volver
        </Boton>
        <Boton onClick={guardar}>{previa ? 'Guardar cambios' : 'Crear temporada'}</Boton>
      </div>
    </Dialogo>
  )
}

/** Oficina Central habilita la postulación: desde ese momento la temporada aparece para postular. */
function DialogoAbrir({ temporada: t, onCerrar, onListo }) {
  const { usuario } = useSesion()
  const [error, setError] = useState(null)
  const vencida = t.postulacion.hasta < hoyISO()
  return (
    <Dialogo titulo={`Habilitar la postulación · ${t.nombre}`} onCerrar={onCerrar}>
      <p className="mt-2 text-[15px] text-tinta-700">
        La postulación quedará abierta desde hoy hasta el {fechaCorta(t.postulacion.hasta, true)}. Funcionarios/as de CONAF activos/as y jubilados/as verán la temporada en «Temporadas» y podrán postular a una casa y un turno. <ResumenCalendarios temporada={t} />
      </p>
      <p className="mt-2 text-[15px] text-tinta-700">Tendrán prioridad quienes no tuvieron casa en el último sorteo realizado (Art. 6 a).</p>
      {(vencida || error) && (
        <div className="mt-3">
          <Aviso tipo="error">{error ?? 'El cierre de la postulación ya pasó: cámbielo con «Editar» antes de habilitarla.'}</Aviso>
        </div>
      )}
      <div className="mt-6 flex justify-end gap-3">
        <Boton variante="secundario" onClick={onCerrar}>
          Volver
        </Boton>
        <Boton
          disabled={vencida}
          onClick={() => {
            const r = abrirPostulacion(t.id, usuario)
            if (r.error) return setError(r.error)
            onListo(`Postulación habilitada para ${t.nombre} hasta el ${fechaCorta(t.postulacion.hasta, true)}.`)
            onCerrar()
          }}
        >
          Habilitar postulación
        </Boton>
      </div>
    </Dialogo>
  )
}
