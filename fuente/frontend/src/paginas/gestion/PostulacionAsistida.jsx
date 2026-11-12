import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, Ticket } from 'lucide-react'
import { REGIONES } from '../../datos/casas.js'
import { condicionSorteo, demanda, elegirSorteo, estadoTemporada, listarTemporadas, sorteoDe, listarCasas, postulacionAbierta, postulacionDe, postular, sorteoVigente, turnosVacantes, useDatos } from '../../datos/servicio.js'
import { fechaCorta, fechaLarga, nombreMes, rangoFechas } from '../../lib/fechas.js'
import { pesos, plural } from '../../lib/formato.js'
import { PARAMETROS, TRAMOS, formasDePago, tarifaPara, tramoDe } from '../../lib/reglas.js'
import { HORAS_OFERTA, codigoTurno, inicioTemporada, nochesTurno, nombreDia, puedePostular } from '../../lib/sorteo.js'
import { rutaFoto } from '../../componentes/fotos.js'
import { ResumenCalendarios, TarjetaPostulacion, salidaTurno } from '../../componentes/Postulacion.jsx'
import { Aviso, Boton, Campo, Tarjeta, claseEntrada } from '../../componentes/ui.jsx'
import { INICIO, useSesion } from '../../componentes/Perfil.jsx'
import { Persona } from './Persona.jsx'
import { AntecedentesPersona } from './AntecedentesPersona.jsx'

const nombreRegion = (c) => REGIONES.find((r) => r.codigo === c)?.nombre ?? ''

/**
 * Postulación al sorteo de temporada alta registrada por un encargado
 * (regional o nacional) a pedido de la persona: desde el 12-11-2026 los
 * afiliados/as no ingresan al sistema. Aquí también se ve la postulación que
 * la persona ya tiene, para retirarla o registrar su respuesta a un cupo.
 */
export function PostulacionAsistida() {
  useDatos()
  const { usuario: gestor } = useSesion()
  const s = sorteoVigente()
  const [persona, setPersona] = useState(null)
  const [nueva, setNueva] = useState(null)
  const abierta = postulacionAbierta()

  const reiniciar = () => {
    setPersona(null)
    setNueva(null)
  }

  return (
    <>
      <Link to={INICIO[gestor.perfil]} className="text-sm font-medium text-verde-700 hover:underline">
        ← Volver al inicio
      </Link>
      <h1 className="mt-3 text-2xl font-bold text-tinta-900 sm:text-[28px]">Registrar una postulación al sorteo</h1>
      <p className="mt-1 max-w-3xl text-[15px] text-tinta-500">
        En temporada alta las casas no se reservan directo: se asignan por sorteo entre quienes postulan (Art. 6). Registre la postulación que la persona le pidió; queda constancia de que usted la registró.
      </p>
      <ListaTemporadas actual={s?.id} />

      {!s ? (
        <p className="mt-6">No hay un sorteo de temporada alta en curso.</p>
      ) : (
        <>
          <h2 className="mt-8 text-xl font-bold text-tinta-900">Sorteo · {s.nombre}</h2>
          <p className="mt-1 max-w-3xl text-[15px] text-tinta-500">
            <ResumenCalendarios temporada={s.temporada} />
          </p>
          <ul className="mt-4 grid gap-2 text-[15px] text-tinta-700 sm:grid-cols-3">
            <Regla t="Una opción" d="Una casa y un turno por persona. Se adjudica un solo período por temporada y no se puede ceder a terceros." />
            <Regla t="Prioridad" d="Tiene prioridad quien no tuvo casa en la temporada alta anterior (Art. 6 a)." />
            <Regla t="Lista de espera" d={`Si alguien desiste, el cupo se ofrece por correo en orden; la persona tiene ${HORAS_OFERTA} horas para responder.`} />
          </ul>

          <div className="mt-6 space-y-5">
            {nueva ? (
              <Exito codigo={nueva} postulacion={postulacionDe(persona.id)} onOtra={reiniciar} />
            ) : (
              <>
                <Persona persona={persona} onPersona={setPersona} soloConaf />
                {persona && <AntecedentesPersona persona={persona} />}
                {persona && <EstadoPersona sorteo={s} persona={persona} gestor={gestor} abierta={abierta} onListo={setNueva} />}
              </>
            )}
          </div>

          {s.estado === 'sorteado' && <Vacantes />}
        </>
      )}
    </>
  )
}

/** Lo que corresponde para esta persona: su postulación, un impedimento o el formulario. */
function EstadoPersona({ sorteo: s, persona, gestor, abierta, onListo }) {
  const mia = postulacionDe(persona.id)
  const condicion = condicionSorteo(persona.id)
  if (mia)
    return (
      <section>
        <h2 className="mb-3 text-lg font-semibold">Postulación de {persona.nombre}</h2>
        <TarjetaPostulacion postulacion={mia} sorteo={s} />
      </section>
    )
  if (!puedePostular(persona))
    return (
      <Aviso tipo="info">
        Los funcionarios de otros servicios públicos no postulan al sorteo. Después del sorteo, los turnos que queden vacantes se pueden reservar con hasta {PARAMETROS.anticipacion_maxima_otro_servicio_dias} días de anticipación (Art. 9).
      </Aviso>
    )
  if (condicion.pierde_posibilidad)
    return (
      <Aviso tipo="error">
        {persona.nombre} no puede participar en este sorteo: en {condicion.anterior?.toLowerCase()} desistió sin aviso o no se presentó (Art. 10 d). Después del sorteo podrá reservar los turnos que queden vacantes.
      </Aviso>
    )
  if (abierta) return <Formulario sorteo={s} usuario={persona} gestor={gestor} condicion={condicion} onListo={onListo} />
  if (s.estado === 'postulacion') return <Aviso>La postulación abre el {fechaLarga(s.postulacion.desde)}.</Aviso>
  return <Aviso>La postulación de este sorteo no está abierta. La habilita el encargado nacional en Temporadas.</Aviso>
}

function Regla({ t, d }) {
  return (
    <li className="rounded-lg bg-white px-4 py-3 ring-1 ring-borde">
      <span className="block font-semibold text-tinta-900">{t}</span>
      {d}
    </li>
  )
}

function Exito({ codigo, postulacion, onOtra }) {
  return (
    <Tarjeta className="mx-auto max-w-xl p-6 text-center">
      <CheckCircle2 className="mx-auto size-12 text-verde-600" aria-hidden />
      <h2 className="mt-3 text-xl font-bold">Postulación registrada</h2>
      <p className="mt-1 text-[15px] text-tinta-500">
        Código <strong className="text-tinta-900">{codigo}</strong>. Se envió el comprobante a {postulacion?.contacto.correo}.
      </p>
      {postulacion && (
        <p className="mt-3 text-[15px]">
          {postulacion.titular.nombre} · {postulacion.casa.nombre} · {rangoFechas(postulacion.turno, salidaTurno(postulacion))}
        </p>
      )}
      <p className="mt-3 text-[15px] text-tinta-700">El sorteo se realiza al cierre de la postulación y el resultado se avisa por correo. Para retirarla, busque de nuevo a la persona en esta página.</p>
      <Boton variante="secundario" className="mt-5" onClick={onOtra}>
        Registrar otra postulación
      </Boton>
    </Tarjeta>
  )
}

function Formulario({ sorteo: s, usuario, gestor, condicion, onListo }) {
  const casas = listarCasas()
  const [region, setRegion] = useState('')
  const [casaId, setCasaId] = useState('')
  const [turno, setTurno] = useState('')
  const [personas, setPersonas] = useState(1)
  const formas = formasDePago(usuario)
  const [pago, setPago] = useState(formas.length === 1 ? formas[0] : '')
  const [autoriza, setAutoriza] = useState(false)
  const [correo, setCorreo] = useState(usuario.correo)
  const [telefono, setTelefono] = useState(usuario.telefono ?? '')
  const [editarContacto, setEditarContacto] = useState(false)
  const [acepta, setAcepta] = useState(false)
  const [intento, setIntento] = useState(false)
  const [error, setError] = useState(null)

  const casa = casas.find((c) => String(c.id) === casaId)
  const dem = demanda()
  const visibles = casas.filter((c) => !region || c.region === region)
  const turnos = casa ? s.turnosCasa(casa.id) : []
  const elegido = turnos.find((t) => t.entrada === turno)
  const nochesN = nochesTurno(s.temporada)
  const tarifa = casa ? tarifaPara(casa, usuario) : 0
  const total = tarifa * nochesN
  const cuotas = s.temporada.cuotas ?? PARAMETROS.cuotas_temporada_alta
  const desdeMes = s.temporada.primera_cuota ? nombreMes(s.temporada.primera_cuota + '-01') : null

  const errores = {
    casa: !casa && 'Elija una casa.',
    turno: !turno && 'Elija un turno.',
    personas: casa && (personas < 1 || personas > casa.capacidad) && `La casa admite hasta ${casa.capacidad} personas.`,
    pago: !pago ? 'Elija una forma de pago.' : pago === 'planilla' && !autoriza ? 'Debe autorizar el descuento si se adjudica el turno.' : null,
    contacto: !/^\S+@\S+\.\S+$/.test(correo) ? 'Escriba un correo válido.' : telefono.replace(/\D/g, '').length < 8 ? 'Escriba un teléfono de contacto.' : null,
    acepta: !acepta && 'Debe declarar que la persona pidió la postulación y conoce el reglamento.',
  }
  const valido = !Object.values(errores).some(Boolean)

  function enviar() {
    setIntento(true)
    if (!valido) return
    const r = postular({
      usuario,
      casa_id: casa.id,
      turno,
      personas,
      forma_pago: pago === 'planilla' ? { tipo: 'planilla', autorizacion: true } : { tipo: 'transferencia', anticipado: true },
      contacto: { correo, telefono },
      registrada_por: { nombre: gestor.nombre, perfil: gestor.perfil, region: gestor.region ?? null },
    })
    if (r.error) setError(r.error)
    else {
      window.scrollTo({ top: 0 })
      onListo(r.codigo)
    }
  }

  const err = (k) => intento && errores[k] && <p className="mt-2 text-sm text-error-700">{errores[k]}</p>

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="min-w-0 space-y-5">
        <Aviso tipo={condicion.prioridad ? 'info' : 'alerta'}>
          Postulación abierta hasta el <strong>{fechaLarga(s.postulacion.hasta)}</strong>.{' '}
          {!condicion.anterior
            ? 'Todas las personas postulan con prioridad: no hay un sorteo anterior realizado (Art. 6 a).'
            : condicion.prioridad
              ? `Tiene prioridad: no tuvo casa en ${condicion.anterior.toLowerCase()}.`
              : `Participa sin prioridad porque tuvo casa en ${condicion.anterior.toLowerCase()} (Art. 6 a).`}
        </Aviso>

        <p className="text-[15px] text-tinta-700">
          Postulación a nombre de <strong>{usuario.nombre}</strong> · RUT {usuario.rut} · {nombreRegion(usuario.region)}. Los datos salen de la nómina.
        </p>

        <Tarjeta className="p-5">
          <h2 className="text-lg font-semibold">1. Casa</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Campo etiqueta="Región">
              <select
                className={claseEntrada}
                value={region}
                onChange={(e) => {
                  setRegion(e.target.value)
                  setCasaId('')
                  setTurno('')
                }}
              >
                <option value="">Todas las regiones</option>
                {REGIONES.filter((r) => casas.some((c) => c.region === r.codigo)).map((r) => (
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
                onChange={(e) => {
                  setCasaId(e.target.value)
                  setTurno('')
                }}
              >
                <option value="">Elija una casa</option>
                {visibles.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} · hasta {c.capacidad} personas{region ? '' : ` · ${nombreRegion(c.region)}`}
                  </option>
                ))}
              </select>
            </Campo>
          </div>
          {err('casa')}
        </Tarjeta>

        <Tarjeta className="p-5">
          <h2 className="text-lg font-semibold">2. Turno</h2>
          <p className="mt-1 text-[13px] text-tinta-500">
            {nochesN} noches: llegada desde las {PARAMETROS.hora_ingreso} y salida hasta las {PARAMETROS.hora_salida}. Los turnos de esta casa parten el día que se indica. Se muestra cuántas personas ya postularon a cada turno.
          </p>
          {!casa ? (
            <p className="mt-3 text-[15px] text-tinta-500">Elija primero una casa.</p>
          ) : (
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4" role="radiogroup" aria-label="Turno">
              {turnos.map((t) => {
                const n = dem[`${casa.id}|${t.entrada}`] ?? 0
                const activo = turno === t.entrada
                return (
                  <button
                    key={t.entrada}
                    type="button"
                    role="radio"
                    aria-checked={activo}
                    onClick={() => setTurno(t.entrada)}
                    className={`rounded-lg p-3 text-left ring-inset ${activo ? 'bg-verde-50 ring-2 ring-verde-600' : 'bg-white ring-1 ring-borde hover:bg-stone-50'}`}
                  >
                    <span className="block text-[13px] text-tinta-500">
                      {codigoTurno(t)} · {nombreDia(t.entrada)} a {nombreDia(t.salida)}
                    </span>
                    <span className="block font-semibold">{rangoFechas(t.entrada, t.salida)}</span>
                    <span className={`block text-[13px] ${n ? 'text-alerta-700' : 'text-verde-700'}`}>{n ? plural(n, 'postulante', 'postulantes') : 'Sin postulantes'}</span>
                  </button>
                )
              })}
            </div>
          )}
          {err('turno')}
        </Tarjeta>

        <Tarjeta className="p-5">
          <h2 className="text-lg font-semibold">3. Personas y contacto</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-[140px_1fr]">
            <Campo etiqueta="Personas" ayuda={casa ? `Máximo ${casa.capacidad}, contando a quien postula` : 'Contando a quien postula'}>
              <input type="number" min="1" max={casa?.capacidad ?? 10} className={claseEntrada} value={personas} onChange={(e) => setPersonas(Number(e.target.value))} />
            </Campo>
            {!editarContacto && (
              <div className="text-[15px] sm:pt-7">
                El resultado se avisa a <strong>{correo}</strong>
                {telefono ? ` · ${telefono}` : ''}.{' '}
                <button type="button" className="font-medium text-verde-700 hover:underline" onClick={() => setEditarContacto(true)}>
                  Cambiar
                </button>
              </div>
            )}
          </div>
          {editarContacto && (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Campo etiqueta="Correo" ayuda="Aquí se avisa el resultado.">
                <input type="email" className={claseEntrada} value={correo} onChange={(e) => setCorreo(e.target.value)} autoComplete="email" />
              </Campo>
              <Campo etiqueta="Teléfono">
                <input type="tel" className={claseEntrada} value={telefono} onChange={(e) => setTelefono(e.target.value)} autoComplete="tel" />
              </Campo>
            </div>
          )}
          {err('personas')}
          {err('contacto')}
          <p className="mt-3 text-[13px] text-tinta-500">Si se adjudica el turno, los nombres de quienes viajan se registran antes de la llegada (Art. 14).</p>
        </Tarjeta>

        <Tarjeta className="p-5">
          <h2 className="text-lg font-semibold">4. Pago, si se adjudica</h2>
          <div className="mt-3 grid gap-3" role="radiogroup" aria-label="Forma de pago">
            {formas.includes('planilla') && (
              <Opcion
                activa={pago === 'planilla'}
                onClick={() => setPago('planilla')}
                titulo="Descuento por planilla"
                detalle={`En ${plural(cuotas, 'cuota', 'cuotas')}${desdeMes ? `, a partir de ${desdeMes}` : ''}.`}
              >
                {pago === 'planilla' && (
                  <div onClick={(e) => e.stopPropagation()}>
                    <label className="mt-3 flex cursor-pointer items-start gap-3 rounded-lg bg-white p-3 ring-1 ring-borde">
                      <input type="checkbox" className="mt-0.5 size-5 accent-verde-700" checked={autoriza} onChange={(e) => setAutoriza(e.target.checked)} />
                      <span className="text-[15px]">
                        {usuario.nombre} autorizó que, si se adjudica el turno, se le descuente por planilla el total de la estadía{casa ? ` (${pesos(total)})` : ''} en {plural(cuotas, 'cuota', 'cuotas')}
                        {desdeMes ? ` desde ${desdeMes}` : ''}.
                      </span>
                    </label>
                  </div>
                )}
              </Opcion>
            )}
            {formas.includes('transferencia') && (
              <Opcion
                activa={pago === 'transferencia'}
                onClick={() => setPago('transferencia')}
                titulo="Transferencia electrónica"
                detalle="Antes de llegar. Si se adjudica el turno, recibe por correo la cuenta de CONAF y la glosa con su código de reserva."
              />
            )}
          </div>
          {err('pago')}
        </Tarjeta>

        <Tarjeta className="p-5">
          <label className="flex cursor-pointer items-start gap-3">
            <input type="checkbox" className="mt-0.5 size-5 accent-verde-700" checked={acepta} onChange={(e) => setAcepta(e.target.checked)} />
            <span className="text-[15px]">
              Declaro que {usuario.nombre} me pidió esta postulación y que conoce y acepta el Reglamento General de Uso de Casas de Veraneo o Descanso: la casa es para la persona y su familia directa; si se adjudica el turno puede desistir sin costo hasta {PARAMETROS.aviso_desistimiento_dias_habiles} días hábiles antes de la llegada y después paga la estadía completa; y si desiste fuera de plazo o no se presenta, pierde la posibilidad en el sorteo de la temporada alta siguiente (Art. 10 d).
            </span>
          </label>
          {err('acepta')}
          {error && (
            <div className="mt-3">
              <Aviso tipo="error">{error}</Aviso>
            </div>
          )}
        </Tarjeta>

        <div className="flex justify-end">
          <Boton onClick={enviar}>
            <Ticket className="size-4" aria-hidden /> Registrar postulación
          </Boton>
        </div>
      </div>

      <aside className="lg:sticky lg:top-4 lg:self-start">
        <Tarjeta className="overflow-hidden">
          {casa ? <img src={rutaFoto(casa.fotos[0])} alt="" className="aspect-[16/9] w-full object-cover" /> : <div className="aspect-[16/9] w-full bg-stone-100" />}
          <div className="p-4">
            <p className="font-semibold">{casa ? casa.nombre : 'Postulación'}</p>
            {casa && <p className="text-[13px] text-tinta-500">{nombreRegion(casa.region)}</p>}
            <dl className="mt-3 space-y-2 text-[15px]">
              <div>
                <dt className="text-[13px] text-tinta-500">Turno</dt>
                <dd>{elegido ? `${codigoTurno(elegido)} · ${rangoFechas(elegido.entrada, elegido.salida)}` : '—'}</dd>
              </div>
              <div>
                <dt className="text-[13px] text-tinta-500">Personas</dt>
                <dd>{plural(personas, 'persona', 'personas')}</dd>
              </div>
              {casa && (
                <div className="flex justify-between border-t border-borde pt-2 text-[17px] font-bold">
                  <dt>Total si se adjudica</dt>
                  <dd>{pesos(total)}</dd>
                </div>
              )}
            </dl>
            {casa && (
              <p className="mt-1 text-[13px] text-tinta-500">
                {nochesN} noches × {pesos(tarifa)} · tarifa {usuario.grado ? TRAMOS[tramoDe(usuario)].toLowerCase() : TRAMOS.a.toLowerCase()}
              </p>
            )}
            <p className="mt-3 text-[13px] text-tinta-500">
              ¿Prefiere otra fecha fuera de temporada alta? <Link to="/gestion/reservar" className="font-medium text-verde-700 hover:underline">Registre una reserva</Link>.
            </p>
          </div>
        </Tarjeta>
      </aside>
    </div>
  )
}

function Opcion({ activa, onClick, titulo, detalle, children }) {
  return (
    <div
      role="radio"
      aria-checked={activa}
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && e.target === e.currentTarget && (e.preventDefault(), onClick())}
      className={`cursor-pointer rounded-lg p-4 ring-inset ${activa ? 'bg-verde-50 ring-2 ring-verde-600' : 'bg-white ring-1 ring-borde hover:bg-stone-50'}`}
    >
      <span className="flex items-center gap-3">
        <span className={`grid size-5 shrink-0 place-items-center rounded-full ring-2 ${activa ? 'ring-verde-700' : 'ring-stone-300'}`}>
          {activa && <span className="size-2.5 rounded-full bg-verde-700" />}
        </span>
        <span>
          <span className="block font-semibold">{titulo}</span>
          <span className="block text-sm text-tinta-500">{detalle}</span>
        </span>
      </span>
      {children}
    </div>
  )
}

/** Turnos que quedaron sin adjudicar: se reservan directo (Art. 6 c). */
function Vacantes() {
  const lista = turnosVacantes()
  if (!lista.length) return null
  const porCasa = Object.values(
    lista.reduce((m, v) => {
      ;(m[v.casa.id] ??= { casa: v.casa, turnos: [] }).turnos.push(v)
      return m
    }, {}),
  )
  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold">Turnos vacantes después del sorteo</h2>
      <p className="mt-1 text-[15px] text-tinta-500">Quedaron sin postulantes: se registran como cualquier reserva, con «Registrar reserva», mientras sigan libres.</p>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {porCasa.map(({ casa, turnos }) => (
          <li key={casa.id} className="rounded-xl border border-borde bg-white p-4">
            <p className="font-semibold">{casa.nombre}</p>
            <p className="text-[13px] text-tinta-500">{nombreRegion(casa.region)}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {turnos.map((t) => (
                <span key={t.entrada} className="rounded-md bg-verde-50 px-2 py-1 text-[13px] font-medium text-verde-800">
                  {rangoFechas(t.entrada, t.salida)}
                </span>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

const ESTADO_TEMPORADA = {
  programada: 'Postulación aún no habilitada',
  postulacion: 'Postulación abierta',
  por_sortear: 'Postulación cerrada, por sortear',
  sorteada: 'Sorteo realizado',
}

/** Temporadas altas de verano e invierno que define el encargado nacional (Art. 6). Las que tienen sorteo se pueden abrir. */
function ListaTemporadas({ actual }) {
  const lista = listarTemporadas().filter((t) => estadoTemporada(t) !== 'terminada')
  if (!lista.length) return null
  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      {lista.map((t) => {
        const e = estadoTemporada(t)
        const s = sorteoDe(t.id)
        const elegida = t.id === actual
        const contenido = (
          <>
            <p className="text-[13px] font-semibold uppercase tracking-wide text-tinta-500">{t.tipo === 'invierno' ? 'Invierno' : 'Verano'}</p>
            <p className="mt-0.5 font-semibold text-tinta-900">{t.nombre}</p>
            <p className="text-[15px] text-tinta-700">{rangoFechas(inicioTemporada(t), t.hasta)}</p>
            <p className={`mt-1 text-[13px] ${e === 'postulacion' ? 'font-semibold text-verde-800' : 'text-tinta-500'}`}>
              {ESTADO_TEMPORADA[e]}
              {e === 'postulacion' && ` hasta el ${fechaCorta(s.postulacion.hasta, true)}`}
            </p>
          </>
        )
        const clase = `rounded-xl border bg-white p-4 text-left ${elegida ? 'border-verde-600 ring-1 ring-verde-600' : 'border-borde'}`
        return s ? (
          <button key={t.id} type="button" aria-pressed={elegida} onClick={() => elegirSorteo(t.id)} className={`${clase} hover:border-verde-600`}>
            {contenido}
          </button>
        ) : (
          <div key={t.id} className={clase}>
            {contenido}
          </div>
        )
      })}
    </div>
  )
}
