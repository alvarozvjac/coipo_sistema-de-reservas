import { useState } from 'react'
import { CalendarPlus, Eye, Pencil, Unlock } from 'lucide-react'
import { abrirPostulacion, edicionTemporada, elegirSorteo, estadoTemporada, guardarTemporada, listarTemporadas, sorteoDe, sorteoVigente, useDatos } from '../../datos/servicio.js'
import { diaSemana, fechaCorta, hoyISO, rangoFechas, sumarDias } from '../../lib/fechas.js'
import { plural } from '../../lib/formato.js'
import { PARAMETROS } from '../../lib/reglas.js'
import { DIAS_SEMANA, turnosDe } from '../../lib/sorteo.js'
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
            Las fechas de cada temporada se asignan por sorteo en turnos de {PARAMETROS.noches_max_temporada_alta} noches y quedan cerradas a la reserva directa desde que se guarda (Art. 6). La postulación se abre solo cuando Oficina Central la habilita. Las vacantes que queden después del sorteo se pueden reservar directo.
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
              const turnos = turnosDe(t)
              return (
                <tr key={t.id} className={t.id === enFoco ? 'bg-verde-50/60' : ''}>
                  <td className="px-4 py-2.5 font-medium">{t.nombre}</td>
                  <td className="px-4 py-2.5">{rangoFechas(t.desde, t.hasta)}</td>
                  <td className="px-4 py-2.5 text-sm">
                    {turnos.length} · {DIAS_SEMANA[t.dia_cambio]} a {DIAS_SEMANA[t.dia_cambio]}
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
  const modo = previa ? edicionTemporada(previa) : 'completa'
  const soloCierre = modo === 'solo_cierre'
  const [d, setD] = useState(
    previa
      ? { ...previa, postulacion: { ...previa.postulacion } }
      : { tipo: 'verano', nombre: '', desde: '', hasta: '', dia_cambio: 5, postulacion: { desde: '', hasta: '' } },
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

  const fechasListas = d.desde && d.hasta && d.hasta > d.desde
  const turnos = fechasListas && diaSemana(d.desde) === Number(d.dia_cambio) ? turnosDe({ ...d, dia_cambio: Number(d.dia_cambio) }) : []
  const fin = turnos.length ? turnos[turnos.length - 1].salida : null
  const sobran = fin && fin < d.hasta ? Math.round((new Date(d.hasta) - new Date(fin)) / 864e5) : 0

  function guardar() {
    const r = guardarTemporada({ ...d, nombre: d.nombre.trim() }, usuario)
    if (r.error) return setErrores(r.errores)
    onListo(previa ? `Se guardaron los cambios de ${d.nombre}.` : `${d.nombre} quedó creada: sus fechas ya no se pueden reservar directo.`)
    onCerrar()
  }

  return (
    <Dialogo titulo={previa ? `Editar ${previa.nombre}` : 'Nueva temporada alta'} onCerrar={onCerrar}>
      {soloCierre && (
        <div className="mt-3">
          <Aviso>Ya hay postulaciones: solo se puede extender o adelantar el cierre de la postulación.</Aviso>
        </div>
      )}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Campo etiqueta="Tipo">
          <select
            className={claseEntrada}
            value={d.tipo}
            disabled={Boolean(previa)}
            onChange={(e) => cambiar({ tipo: e.target.value, nombre: d.nombre || '' })}
          >
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
        <Campo etiqueta="Día de cambio de turno">
          <select className={claseEntrada} value={d.dia_cambio} disabled={soloCierre} onChange={(e) => cambiar({ dia_cambio: Number(e.target.value) })}>
            {DIAS_SEMANA.map((n, i) => (
              <option key={n} value={i}>
                {n[0].toUpperCase() + n.slice(1)}
              </option>
            ))}
          </select>
        </Campo>
        <div className="hidden sm:block" />
        <Campo etiqueta="Llegada del primer turno" ayuda={`Debe ser ${DIAS_SEMANA[d.dia_cambio]}.`}>
          <input type="date" className={claseEntrada} value={d.desde} disabled={soloCierre} onChange={(e) => cambiar({ desde: e.target.value, hasta: d.hasta || (e.target.value ? sumarDias(e.target.value, 56) : '') })} />
        </Campo>
        <Campo etiqueta="Salida del último turno">
          <input type="date" className={claseEntrada} value={d.hasta} disabled={soloCierre} onChange={(e) => cambiar({ hasta: e.target.value })} />
        </Campo>
        <Campo etiqueta="Apertura prevista" ayuda="Se abre cuando Oficina Central la habilita.">
          <input type="date" className={claseEntrada} value={d.postulacion.desde} disabled={soloCierre} onChange={(e) => cambiarPost({ desde: e.target.value })} />
        </Campo>
        <Campo etiqueta="Postulación hasta" ayuda="El sorteo se realiza ese día.">
          <input type="date" className={claseEntrada} value={d.postulacion.hasta} onChange={(e) => cambiarPost({ hasta: e.target.value })} />
        </Campo>
      </div>

      <div className="mt-4 rounded-lg bg-stone-50 px-4 py-3">
        <h3 className="text-[15px] font-semibold">Turnos que se sortearán</h3>
        {!fechasListas ? (
          <p className="mt-1 text-sm text-tinta-500">Indique la llegada del primer turno y la salida del último para ver los turnos.</p>
        ) : !turnos.length ? (
          <p className="mt-1 text-sm text-alerta-700">
            {diaSemana(d.desde) !== Number(d.dia_cambio)
              ? `La llegada del primer turno no cae en ${DIAS_SEMANA[d.dia_cambio]}.`
              : `Entre esas fechas no cabe un turno de ${PARAMETROS.noches_max_temporada_alta} noches.`}
          </p>
        ) : (
          <>
            <p className="mt-1 text-sm text-tinta-500">
              {plural(turnos.length, 'turno', 'turnos')} de {PARAMETROS.noches_max_temporada_alta} noches, de {DIAS_SEMANA[d.dia_cambio]} a {DIAS_SEMANA[d.dia_cambio]}, en cada casa.
            </p>
            <ol className="mt-2 grid gap-x-4 gap-y-0.5 text-sm text-tinta-700 sm:grid-cols-2">
              {turnos.map((t) => (
                <li key={t.entrada}>
                  Turno {t.numero}: {rangoFechas(t.entrada, t.salida)}
                </li>
              ))}
            </ol>
            {sobran > 0 && (
              <p className="mt-2 text-sm text-alerta-700">
                {plural(sobran, 'noche', 'noches')} al final ({rangoFechas(fin, d.hasta)}) no completan un turno: ajuste la salida al {fechaCorta(fin, true)} o alárguela hasta completar otro turno.
              </p>
            )}
          </>
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
        La postulación quedará abierta desde hoy hasta el {fechaCorta(t.postulacion.hasta, true)}. Funcionarios/as de CONAF activos/as y jubilados/as verán la temporada en «Temporadas» y podrán postular a una casa y un turno ({plural(turnosDe(t).length, 'turno', 'turnos')} de {DIAS_SEMANA[t.dia_cambio]} a {DIAS_SEMANA[t.dia_cambio]}, {rangoFechas(t.desde, t.hasta)}).
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
