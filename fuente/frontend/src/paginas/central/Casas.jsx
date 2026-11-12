import { useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AlertTriangle, CheckCircle2, Download, FileSpreadsheet, Keyboard, Lock, RotateCcw, Trash2, Upload } from 'lucide-react'
import { REGIONES } from '../../datos/casas.js'
import {
  actualizarTarifasDiferenciadas,
  actualizarTarifasMasivo,
  crearBloqueo,
  estadiaEnCursoDe,
  eliminarBloqueo,
  historialTarifas,
  inventarioDe,
  listarBloqueos,
  listarCasas,
  obtenerCasa,
  reincorporarCasa,
  reservasAfectadas,
  reservasFuturasDe,
  retirarCasa,
  tarifasDiferenciadas,
  ultimoRetiro,
  useDatos,
} from '../../datos/servicio.js'
import { fechaCorta, hoyISO, rangoFechas, sumarDias } from '../../lib/fechas.js'
import { pesos, plural } from '../../lib/formato.js'
import { TRAMOS, tarifaTramo } from '../../lib/reglas.js'
import { COLUMNAS, TARIFA_MAX, TARIFA_MIN, descargarFormatoCSV, descargarFormatoExcel, leerArchivo, validarPlanilla } from '../../lib/planillaTarifas.js'
import { Aviso, Boton, Campo, Tarjeta, claseEntrada, claseFiltro } from '../../componentes/ui.jsx'
import { useSesion } from '../../componentes/Perfil.jsx'
import { Dialogo, nombreRegion } from '../encargada/comun.jsx'
import { DialogoDirecciones } from './DireccionesCasa.jsx'
import { Administracion } from './Administracion.jsx'

const PESTANAS = [
  ['casas', 'Casas'],
  ['tarifas', 'Tarifas'],
  ['bloqueos', 'Bloqueos de fechas'],
  ['administracion', 'Administración'],
]

/** Configuración del encargado nacional (decisión 12-11-2026): casas, tarifas, bloqueos y administración. */
export function CasasTarifas() {
  useDatos()
  const [params] = useSearchParams()
  const [pestana, setPestana] = useState(PESTANAS.some(([k]) => k === params.get('pestana')) ? params.get('pestana') : 'casas')
  return (
    <>
      <h1 className="text-2xl font-bold">Configuración</h1>
      <div className="mt-4 flex gap-1 overflow-x-auto border-b border-borde" role="tablist">
        {PESTANAS.map(([k, t]) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={pestana === k}
            onClick={() => setPestana(k)}
            className={`-mb-px shrink-0 border-b-2 px-3 py-2.5 text-[15px] font-medium ${pestana === k ? 'border-verde-700 text-verde-800' : 'border-transparent text-tinta-500 hover:text-tinta-900'}`}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="mt-5">
        {pestana === 'casas' && <Casas />}
        {pestana === 'tarifas' && <Tarifas />}
        {pestana === 'bloqueos' && <Bloqueos />}
        {pestana === 'administracion' && <Administracion />}
      </div>
    </>
  )
}

/* ---------- Casas: en servicio o retiradas ---------- */

function Casas() {
  const [region, setRegion] = useState('')
  const [retirar, setRetirar] = useState(null)
  const [reincorporar, setReincorporar] = useState(null)
  const [direcciones, setDirecciones] = useState(null)
  const [hecho, setHecho] = useState(null)
  const { usuario } = useSesion()
  const todas = listarCasas({ incluirInactivas: true })
  const casas = todas.filter((c) => !region || c.region === region)
  const retiradas = todas.filter((c) => !c.activa).length

  return (
    <>
      <div className="grid gap-3 md:grid-cols-2">
        <Aviso tipo="info">
          <strong>Retirar del sistema</strong> es para una casa que deja de ofrecerse sin fecha de término: venta o entrega del inmueble, término de convenio o daño mayor. Deja de aparecer al buscar y en el sorteo, y sus reservas futuras se anulan con aviso.
        </Aviso>
        <Aviso tipo="info">
          Para cerrar <strong>fechas concretas</strong> de una casa que sigue en servicio (mantención, fumigación, fuerza mayor), use la pestaña <strong>Bloqueos de fechas</strong>: la casa sigue apareciendo y solo esas noches quedan cerradas.
        </Aviso>
      </div>
      {hecho && (
        <div className="mt-3">
          <Aviso>{hecho}</Aviso>
        </div>
      )}
      <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-lg font-semibold">
          {plural(todas.length - retiradas, 'casa en servicio', 'casas en servicio')}
          {retiradas > 0 && <span className="font-normal text-tinta-500"> · {plural(retiradas, 'retirada', 'retiradas')}</span>}
        </h2>
        <FiltroRegion valor={region} onCambio={setRegion} />
      </div>
      <Tarjeta className="relative mt-3 overflow-x-auto">
        <table className="w-full min-w-[1000px] text-left text-[15px]">
          <thead className="border-b border-borde text-[13px] text-tinta-500">
            <tr>
              <th className="px-4 py-3 font-medium">Casa</th>
              <th className="px-4 py-3 text-right font-medium">Capacidad</th>
              <th className="px-4 py-3 text-right font-medium">Tarifa / noche (grados 04–14 · 15–19)</th>
              <th className="px-4 py-3 font-medium">Inventario</th>
              <th className="px-4 py-3 font-medium">Otras direcciones</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">
                <span className="sr-only">Acción</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-borde">
            {casas.map((c) => {
              const inv = inventarioDe(c.id)
              const retiro = !c.activa ? ultimoRetiro(c.id) : null
              return (
                <tr key={c.id} className={c.activa ? '' : 'bg-stone-50'}>
                  <td className="px-4 py-2.5">
                    <span className={`font-medium ${c.activa ? '' : 'text-tinta-500'}`}>{c.nombre}</span>
                    <span className="block text-[13px] text-tinta-500">
                      {c.localidad}, {nombreRegion(c.region)}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{c.capacidad}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">
                    {pesos(c.tarifa_noche)} · {pesos(c.tarifa_noche_15_19)}
                  </td>
                  <td className="px-4 py-2.5 text-sm">
                    {inv ? (
                      <span className="inline-flex items-center gap-1 text-tinta-700">
                        <CheckCircle2 className="size-4 text-verde-600" aria-hidden /> Versión {inv.version}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-alerta-700">
                        <AlertTriangle className="size-4" aria-hidden /> Pendiente
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-sm">
                    <button type="button" onClick={() => setDirecciones(c)} className="min-h-11 rounded px-1 text-left font-medium text-verde-700 hover:underline" aria-label={`Editar las direcciones de ${c.nombre}`}>
                      {c.otras_direcciones?.length ? c.otras_direcciones.map((d) => d.tipo).join(', ') : 'Agregar'}
                    </button>
                  </td>
                  <td className="px-4 py-2.5 text-sm">
                    {c.activa ? (
                      <span className="inline-flex rounded-full bg-verde-100 px-2.5 py-0.5 text-[13px] font-semibold text-verde-800">En servicio</span>
                    ) : (
                      <>
                        <span className="inline-flex rounded-full bg-stone-200 px-2.5 py-0.5 text-[13px] font-semibold text-tinta-700">Retirada</span>
                        {retiro?.motivo && (
                          <span className="mt-1 block max-w-56 text-[13px] text-tinta-500">
                            {retiro.motivo} · {fechaCorta(retiro.en.slice(0, 10), true)}
                          </span>
                        )}
                      </>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {c.activa ? (
                      <Boton variante="textoPeligro" onClick={() => setRetirar(c)}>
                        Retirar del sistema
                      </Boton>
                    ) : (
                      <Boton variante="secundario" onClick={() => setReincorporar(c)}>
                        <RotateCcw className="size-4" aria-hidden /> Reincorporar
                      </Boton>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Tarjeta>
      {retirar && <DialogoRetiro casa={retirar} onCerrar={() => setRetirar(null)} onListo={setHecho} />}
      {direcciones && <DialogoDirecciones casa={direcciones} actor={usuario} onCerrar={() => setDirecciones(null)} onListo={setHecho} />}
      {reincorporar && <DialogoReincorporar casa={reincorporar} onCerrar={() => setReincorporar(null)} onListo={setHecho} />}
    </>
  )
}

const MOTIVOS_RETIRO = ['Venta o entrega del inmueble', 'Término del convenio o arriendo', 'Daño mayor sin fecha de reparación', 'Otro motivo']

function DialogoRetiro({ casa, onCerrar, onListo }) {
  const { usuario } = useSesion()
  const [motivo, setMotivo] = useState('')
  const [detalle, setDetalle] = useState('')
  const afectadas = reservasFuturasDe(casa.id)
  const enCurso = estadiaEnCursoDe(casa.id)
  const texto = motivo === 'Otro motivo' ? detalle.trim() : motivo + (detalle.trim() ? ` (${detalle.trim()})` : '')
  const valido = motivo && (motivo !== 'Otro motivo' || detalle.trim().length >= 5)
  return (
    <Dialogo titulo={`Retirar ${casa.nombre} del sistema`} onCerrar={onCerrar}>
      <p className="mt-2 text-[15px] text-tinta-700">La casa dejará de aparecer al buscar y en el sorteo, sin fecha de término, hasta que la reincorpore. Si solo necesita cerrar algunas fechas, use un bloqueo.</p>
      <div className="mt-4 space-y-3">
        <Campo etiqueta="Motivo">
          <select className={claseEntrada} value={motivo} onChange={(e) => setMotivo(e.target.value)}>
            <option value="">Elija el motivo</option>
            {MOTIVOS_RETIRO.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </Campo>
        <Campo etiqueta={motivo === 'Otro motivo' ? 'Detalle del motivo' : 'Detalle (opcional)'} ayuda="Se informa a las personas con reservas.">
          <input className={claseEntrada} value={detalle} onChange={(e) => setDetalle(e.target.value)} />
        </Campo>
      </div>
      {enCurso && (
        <p className="mt-4 text-[15px] text-tinta-700">
          La estadía en curso de {enCurso.titular.nombre} ({rangoFechas(enCurso.entrada, enCurso.salida)}) no se anula: termina en su fecha.
        </p>
      )}
      {afectadas.length > 0 ? (
        <div className="mt-4">
          <Aviso>
            Tiene {plural(afectadas.length, 'reserva futura', 'reservas futuras')}: se anularán, se avisará a cada persona con el motivo y se marcará la devolución si pagó (Art. 11).
          </Aviso>
          <ul className="mt-2 list-disc pl-5 text-[15px] text-tinta-700">
            {afectadas.map((r) => (
              <li key={r.codigo}>
                {r.titular.nombre} · {rangoFechas(r.entrada, r.salida)}
                {r.pago ? ' (pagado: se devolverá)' : ''}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-4 text-[15px] text-tinta-700">No tiene reservas futuras.</p>
      )}
      <div className="mt-6 flex justify-end gap-3">
        <Boton variante="secundario" onClick={onCerrar}>
          Volver
        </Boton>
        <Boton
          variante="peligro"
          disabled={!valido}
          onClick={() => {
            const n = retirarCasa(casa.id, texto, usuario)
            onListo(`${casa.nombre} quedó retirada del sistema.${n ? ` Se anularon ${plural(n, 'reserva', 'reservas')} y se avisó a las personas.` : ''}`)
            onCerrar()
          }}
        >
          {afectadas.length ? 'Retirar y anular reservas' : 'Retirar del sistema'}
        </Boton>
      </div>
    </Dialogo>
  )
}

function DialogoReincorporar({ casa, onCerrar, onListo }) {
  const { usuario } = useSesion()
  const inv = inventarioDe(casa.id)
  return (
    <Dialogo titulo={`Reincorporar ${casa.nombre}`} onCerrar={onCerrar}>
      <p className="mt-2 text-[15px] text-tinta-700">
        Volverá a aparecer en el buscador desde ahora, con sus tarifas de {pesos(casa.tarifa_noche)} (grados 04 a 14) y {pesos(casa.tarifa_noche_15_19)} (grados 15 a 19) por noche. Revise que la encargada regional tenga el inventario al día.
      </p>
      {!inv && (
        <div className="mt-3">
          <Aviso>Esta casa no tiene inventario registrado.</Aviso>
        </div>
      )}
      <div className="mt-6 flex justify-end gap-3">
        <Boton variante="secundario" onClick={onCerrar}>
          Volver
        </Boton>
        <Boton
          onClick={() => {
            reincorporarCasa(casa.id, usuario)
            onListo(`${casa.nombre} volvió a estar en servicio.`)
            onCerrar()
          }}
        >
          Reincorporar
        </Boton>
      </div>
    </Dialogo>
  )
}

function FiltroRegion({ valor, onCambio }) {
  return (
    <select className={claseFiltro} value={valor} onChange={(e) => onCambio(e.target.value)} aria-label="Región">
      <option value="">Todas las regiones</option>
      {REGIONES.filter((r) => listarCasas({ incluirInactivas: true }).some((c) => c.region === r.codigo)).map((r) => (
        <option key={r.codigo} value={r.codigo}>
          {r.nombre}
        </option>
      ))}
    </select>
  )
}

/* ---------- Tarifas: digitar o cargar planilla ---------- */

function Tarifas() {
  const [modo, setModo] = useState('digitar')
  const [hecho, setHecho] = useState(null)
  return (
    <>
      <p className="max-w-3xl text-[15px] text-tinta-500">
        Tarifas por noche y por familia de cada casa, en dos tramos según el grado del trabajador/a: 04 a 14 y 15 a 19 (Memo 6188/2026). Jubilados/as y otros servicios pagan el tramo 04 a 14 [pendiente de confirmar]. Los cambios rigen para las reservas nuevas; las reservas ya hechas mantienen su tarifa.
      </p>
      {hecho && (
        <div className="mt-3">
          <Aviso tipo="info">{hecho}</Aviso>
        </div>
      )}
      <Tarjeta className="mt-4 p-5">
        <h2 className="font-semibold">Tarifas por noche según grado</h2>
        <p className="mt-1 text-sm text-tinta-500">¿Cómo quiere actualizarla?</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Forma de actualizar las tarifas">
          {[
            ['digitar', Keyboard, 'Digitar en pantalla', 'Para cambiar una o varias casas a mano.'],
            ['planilla', FileSpreadsheet, 'Cargar planilla Excel o CSV', 'Para actualizar muchas casas a la vez con el formato tipo.'],
          ].map(([k, Icono, t, d]) => (
            <button
              key={k}
              type="button"
              role="radio"
              aria-checked={modo === k}
              onClick={() => {
                setModo(k)
                setHecho(null)
              }}
              className={`flex items-start gap-3 rounded-lg p-3 text-left ring-inset ${modo === k ? 'bg-verde-50 ring-2 ring-verde-600' : 'bg-white ring-1 ring-borde hover:bg-stone-50'}`}
            >
              <Icono className="mt-0.5 size-5 shrink-0 text-verde-700" aria-hidden />
              <span>
                <span className="block font-semibold">{t}</span>
                <span className="block text-sm text-tinta-500">{d}</span>
              </span>
            </button>
          ))}
        </div>
        <div className="mt-5">{modo === 'digitar' ? <Digitar onListo={setHecho} /> : <CargaPlanilla onListo={setHecho} />}</div>
      </Tarjeta>

      <TarifasDiferenciadas />
      <Historial />
    </>
  )
}

function Digitar({ onListo }) {
  const { usuario } = useSesion()
  const [region, setRegion] = useState('')
  const [valores, setValores] = useState({})
  const [revisar, setRevisar] = useState(false)
  const casas = listarCasas({ incluirInactivas: true })
  const visibles = casas.filter((c) => !region || c.region === region)
  const clave = (id, tramo) => `${id}|${tramo}`
  const cambios = casas.flatMap((c) =>
    ['a', 'b']
      .filter((tr) => {
        const v = valores[clave(c.id, tr)]
        return v !== undefined && v !== '' && Number(v) !== tarifaTramo(c, tr)
      })
      .map((tr) => ({ casa_id: c.id, casa: c.nombre, tramo: tr, antes: tarifaTramo(c, tr), nueva: Number(valores[clave(c.id, tr)]) })),
  )
  const fuera = cambios.filter((c) => !Number.isInteger(c.nueva) || c.nueva < TARIFA_MIN || c.nueva > TARIFA_MAX)

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-tinta-500">Escriba la nueva tarifa en los tramos que cambian y guarde todo junto.</p>
        <FiltroRegion valor={region} onCambio={setRegion} />
      </div>
      <div className="mt-3 overflow-x-auto rounded-lg border border-borde">
        <table className="w-full min-w-[640px] text-left text-[15px]">
          <thead className="border-b border-borde bg-stone-50 text-[13px] text-tinta-500">
            <tr>
              <th className="px-4 py-2.5 font-medium">Casa</th>
              <th className="px-4 py-2.5 font-medium">Grados 04 a 14</th>
              <th className="px-4 py-2.5 font-medium">Grados 15 a 19</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-borde">
            {visibles.map((c) => {
              const cambia = cambios.some((x) => x.casa_id === c.id)
              return (
                <tr key={c.id} className={cambia ? 'bg-alerta-50/60' : ''}>
                  <td className="px-4 py-2">
                    <span className="font-medium">{c.nombre}</span>
                    <span className="block text-[13px] text-tinta-500">{nombreRegion(c.region)}</span>
                  </td>
                  {['a', 'b'].map((tr) => (
                    <td key={tr} className="px-4 py-2">
                      <span className="block text-[13px] tabular-nums text-tinta-500">Vigente {pesos(tarifaTramo(c, tr))}</span>
                      <div className="mt-1 w-36">
                        <EntradaPesos
                          value={valores[clave(c.id, tr)] ?? ''}
                          onChange={(x) => setValores({ ...valores, [clave(c.id, tr)]: x })}
                          etiqueta={`Nueva tarifa de ${c.nombre}, ${TRAMOS[tr].toLowerCase()}`}
                        />
                      </div>
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {fuera.length > 0 && (
        <div className="mt-3">
          <Aviso tipo="error">
            {[...new Set(fuera.map((c) => c.casa))].join(', ')}: la tarifa debe ser un monto entero entre {pesos(TARIFA_MIN)} y {pesos(TARIFA_MAX)}.
          </Aviso>
        </div>
      )}
      <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
        <span className="text-sm text-tinta-500">{plural(cambios.length, 'tarifa con cambio', 'tarifas con cambio')}</span>
        <Boton variante="secundario" disabled={!cambios.length} onClick={() => setValores({})}>
          Descartar
        </Boton>
        <Boton disabled={!cambios.length || fuera.length > 0} onClick={() => setRevisar(true)}>
          Revisar y guardar
        </Boton>
      </div>
      {revisar && (
        <Dialogo titulo="Confirmar nuevas tarifas" onCerrar={() => setRevisar(false)}>
          <TablaCambios cambios={cambios} />
          <div className="mt-6 flex justify-end gap-3">
            <Boton variante="secundario" onClick={() => setRevisar(false)}>
              Volver
            </Boton>
            <Boton
              onClick={() => {
                const n = actualizarTarifasMasivo(cambios, { metodo: 'pantalla' }, usuario)
                setValores({})
                setRevisar(false)
                onListo(`Se ${n === 1 ? 'actualizó 1 tarifa' : `actualizaron ${n} tarifas`}. Rige para las reservas nuevas.`)
              }}
            >
              Guardar {plural(cambios.length, 'tarifa', 'tarifas')}
            </Boton>
          </div>
        </Dialogo>
      )}
    </>
  )
}

function CargaPlanilla({ onListo }) {
  const { usuario } = useSesion()
  const entrada = useRef(null)
  const [archivo, setArchivo] = useState(null)
  const [resultado, setResultado] = useState(null)
  const [error, setError] = useState(null)
  const [leyendo, setLeyendo] = useState(false)
  const casas = listarCasas({ incluirInactivas: true })

  async function cargar(f) {
    setError(null)
    setResultado(null)
    setArchivo(f)
    if (!f) return
    setLeyendo(true)
    try {
      const filas = await leerArchivo(f)
      setResultado(validarPlanilla(filas, casas))
    } catch (e) {
      setError(e.message)
    } finally {
      setLeyendo(false)
    }
  }

  function reiniciar() {
    setArchivo(null)
    setResultado(null)
    setError(null)
    if (entrada.current) entrada.current.value = ''
  }

  return (
    <ol className="space-y-5">
      <Paso n="1" titulo="Descargue el formato tipo">
        <p className="text-sm text-tinta-500">Trae las {casas.length} casas con su ID y sus dos tarifas vigentes. Complete solo las columnas «Nueva grados 04-14» y «Nueva grados 15-19»; la hoja «Instrucciones» explica cada campo.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Boton variante="secundario" onClick={() => descargarFormatoExcel(casas, nombreRegion)}>
            <Download className="size-4" aria-hidden /> Formato Excel (.xlsx)
          </Boton>
          <Boton variante="secundario" onClick={() => descargarFormatoCSV(casas, nombreRegion)}>
            <Download className="size-4" aria-hidden /> Formato CSV
          </Boton>
        </div>
        <details className="mt-3 rounded-lg bg-stone-50 px-4 py-3">
          <summary className="cursor-pointer text-[15px] font-medium text-verde-800">Campos que debe contener la planilla</summary>
          <table className="mt-2 w-full text-left text-[13px]">
            <thead className="text-tinta-500">
              <tr>
                <th className="py-1 pr-3 font-medium">Columna (en este orden)</th>
                <th className="py-1 pr-3 font-medium">Uso</th>
                <th className="py-1 font-medium">Formato</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borde text-tinta-700">
              <tr><td className="py-1.5 pr-3 font-medium">{COLUMNAS[0]}</td><td className="py-1.5 pr-3">Obligatoria: identifica la casa</td><td className="py-1.5">Número, sin cambiar</td></tr>
              <tr><td className="py-1.5 pr-3 font-medium">{COLUMNAS[1]}</td><td className="py-1.5 pr-3">Referencia</td><td className="py-1.5">Texto</td></tr>
              <tr><td className="py-1.5 pr-3 font-medium">{COLUMNAS[2]}</td><td className="py-1.5 pr-3">Referencia</td><td className="py-1.5">Texto</td></tr>
              {[3, 4].map((i) => (
                <tr key={i}><td className="py-1.5 pr-3 font-medium">{COLUMNAS[i]}</td><td className="py-1.5 pr-3">Referencia</td><td className="py-1.5">Pesos</td></tr>
              ))}
              {[5, 6].map((i) => (
                <tr key={i}><td className="py-1.5 pr-3 font-medium">{COLUMNAS[i]}</td><td className="py-1.5 pr-3">La que se aplica; en blanco = sin cambio</td><td className="py-1.5">Pesos sin decimales, entre {pesos(TARIFA_MIN)} y {pesos(TARIFA_MAX)}</td></tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-[13px] text-tinta-500">Excel (.xlsx) con la hoja «Tarifas», o CSV con separador punto y coma o coma. Máximo 2 MB.</p>
        </details>
      </Paso>

      <Paso n="2" titulo="Suba la planilla completada">
        <label className="relative mt-1 flex cursor-pointer flex-col items-center gap-1 rounded-lg border border-dashed border-borde bg-white px-4 py-6 text-center hover:border-verde-600">
          <Upload className="size-6 text-verde-700" aria-hidden />
          <span className="text-[15px] font-medium">{archivo ? archivo.name : 'Seleccionar archivo .xlsx o .csv'}</span>
          <span className="text-[13px] text-tinta-500">{leyendo ? 'Revisando la planilla…' : 'El sistema la revisa antes de aplicar cualquier cambio.'}</span>
          <input ref={entrada} type="file" accept=".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv" className="sr-only" onChange={(e) => cargar(e.target.files?.[0] ?? null)} />
        </label>
        {error && (
          <div className="mt-3">
            <Aviso tipo="error">{error}</Aviso>
          </div>
        )}
      </Paso>

      {resultado && (
        <Paso n="3" titulo="Revise y aplique">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Cifra etiqueta="Tarifas nuevas" valor={resultado.cambios.length} />
            <Cifra etiqueta="Sin cambio" valor={resultado.sinCambio} />
            <Cifra etiqueta="Errores" valor={resultado.errores.length} tono={resultado.errores.length ? 'error' : null} />
            <Cifra etiqueta="Advertencias" valor={resultado.advertencias.length} tono={resultado.advertencias.length ? 'alerta' : null} />
          </div>
          {resultado.errores.length > 0 && (
            <div className="mt-3">
              <Aviso tipo="error">
                <p className="font-semibold">La planilla no es válida. Corrija estos puntos y vuelva a subirla; no se aplicó ningún cambio.</p>
                <ul className="mt-1 list-disc pl-5">
                  {resultado.errores.map((e, i) => (
                    <li key={i}>
                      {e.fila ? `Fila ${e.fila}: ` : ''}
                      {e.mensaje}
                    </li>
                  ))}
                </ul>
              </Aviso>
            </div>
          )}
          {resultado.advertencias.length > 0 && (
            <div className="mt-3">
              <Aviso>
                <ul className="list-disc pl-5">
                  {resultado.advertencias.map((e, i) => (
                    <li key={i}>
                      Fila {e.fila}: {e.mensaje}
                    </li>
                  ))}
                </ul>
              </Aviso>
            </div>
          )}
          {resultado.cambios.length > 0 && <TablaCambios cambios={resultado.cambios} />}
          <div className="mt-4 flex flex-wrap justify-end gap-3">
            <Boton variante="secundario" onClick={reiniciar}>
              Cargar otra planilla
            </Boton>
            <Boton
              disabled={!resultado.valido}
              onClick={() => {
                const n = actualizarTarifasMasivo(resultado.cambios, { metodo: 'planilla', archivo: archivo.name }, usuario)
                reiniciar()
                onListo(`Planilla aplicada: se ${n === 1 ? 'actualizó 1 tarifa' : `actualizaron ${n} tarifas`}. Rige para las reservas nuevas.`)
              }}
            >
              Aplicar {plural(resultado.cambios.length, 'tarifa', 'tarifas')}
            </Boton>
          </div>
        </Paso>
      )}
    </ol>
  )
}

function Paso({ n, titulo, children }) {
  return (
    <li className="grid grid-cols-[28px_1fr] gap-3">
      <span className="grid size-7 place-items-center rounded-full bg-verde-700 text-sm font-semibold text-white">{n}</span>
      <div className="min-w-0">
        <h3 className="font-semibold">{titulo}</h3>
        <div className="mt-1">{children}</div>
      </div>
    </li>
  )
}

function Cifra({ etiqueta, valor, tono }) {
  const c = tono === 'error' ? 'text-error-700' : tono === 'alerta' ? 'text-alerta-700' : 'text-tinta-900'
  return (
    <div className="rounded-lg bg-stone-50 px-3 py-2">
      <p className="text-[13px] text-tinta-500">{etiqueta}</p>
      <p className={`text-xl font-bold tabular-nums ${c}`}>{valor}</p>
    </div>
  )
}

function TablaCambios({ cambios }) {
  return (
    <div className="mt-3 max-h-80 overflow-auto rounded-lg border border-borde">
      <table className="w-full text-left text-[15px]">
        <thead className="sticky top-0 border-b border-borde bg-stone-50 text-[13px] text-tinta-500">
          <tr>
            <th className="px-3 py-2 font-medium">Casa</th>
            <th className="px-3 py-2 font-medium">Tramo</th>
            <th className="px-3 py-2 text-right font-medium">Vigente</th>
            <th className="px-3 py-2 text-right font-medium">Nueva</th>
            <th className="px-3 py-2 text-right font-medium">Variación</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-borde">
          {cambios.map((c) => {
            const v = (c.nueva - c.antes) / c.antes
            return (
              <tr key={`${c.casa_id}|${c.tramo}`}>
                <td className="px-3 py-1.5">{c.casa}</td>
                <td className="px-3 py-1.5 text-[13px] text-tinta-500">{TRAMOS[c.tramo ?? 'a']}</td>
                <td className="px-3 py-1.5 text-right tabular-nums">{pesos(c.antes)}</td>
                <td className="px-3 py-1.5 text-right font-semibold tabular-nums">{pesos(c.nueva)}</td>
                <td className={`px-3 py-1.5 text-right tabular-nums ${Math.abs(v) > 0.3 ? 'text-alerta-700' : 'text-tinta-500'}`}>
                  {v > 0 ? '+' : ''}
                  {(v * 100).toLocaleString('es-CL', { maximumFractionDigits: 1 })}%
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function Historial() {
  const lista = historialTarifas()
  if (!lista.length) return null
  return (
    <Tarjeta className="mt-5 p-5">
      <h2 className="font-semibold">Historial de actualizaciones</h2>
      <ul className="mt-3 divide-y divide-borde">
        {lista.map((h, i) => (
          <li key={i} className="py-2">
            <details>
              <summary className="cursor-pointer text-[15px]">
                {fechaCorta(h.en.slice(0, 10), true)}, {h.en.slice(11, 16)} · {h.por} · {h.metodo === 'planilla' ? `planilla ${h.archivo}` : 'digitada en pantalla'} · {plural(h.cambios.length, 'tarifa', 'tarifas')}
              </summary>
              <ul className="mt-2 space-y-0.5 pl-5 text-[13px] text-tinta-700">
                {h.cambios.map((c) => (
                  <li key={`${c.casa_id}|${c.tramo}`}>
                    {obtenerCasa(c.casa_id)?.nombre} ({TRAMOS[c.tramo ?? 'a'].toLowerCase()}): {pesos(c.antes)} → {pesos(c.despues)}
                  </li>
                ))}
              </ul>
            </details>
          </li>
        ))}
      </ul>
    </Tarjeta>
  )
}

function TarifasDiferenciadas() {
  const actual = tarifasDiferenciadas()
  const [v, setV] = useState({ no_afiliado: actual.no_afiliado, otro_servicio: actual.otro_servicio })
  const [ok, setOk] = useState(false)
  const cambiado = Number(v.no_afiliado) !== actual.no_afiliado || Number(v.otro_servicio) !== actual.otro_servicio
  return (
    <Tarjeta className="mt-5 p-5">
      <h2 className="font-semibold">Tarifa diferenciada</h2>
      <p className="mt-1 text-sm text-tinta-500">Adicional por noche sobre la tarifa del tramo que corresponda. Afiliados activos y jubilados pagan la tarifa del tramo, sin adicional.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <Campo etiqueta="Trabajador/a CONAF no afiliado/a">
          <EntradaPesos value={v.no_afiliado} onChange={(x) => (setV({ ...v, no_afiliado: x }), setOk(false))} />
        </Campo>
        <Campo etiqueta="Funcionario/a de otro servicio público (Art. 9)">
          <EntradaPesos value={v.otro_servicio} onChange={(x) => (setV({ ...v, otro_servicio: x }), setOk(false))} />
        </Campo>
        <Boton
          disabled={!cambiado}
          onClick={() => {
            actualizarTarifasDiferenciadas(v)
            setOk(true)
          }}
        >
          Guardar
        </Boton>
      </div>
      {ok && <p className="mt-2 text-sm text-verde-700">Tarifa diferenciada actualizada.</p>}
    </Tarjeta>
  )
}

function EntradaPesos({ value, onChange, etiqueta }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-tinta-400">$</span>
      <input className={`${claseEntrada} pl-7 tabular-nums`} type="number" min="0" step="1000" value={value} onChange={(e) => onChange(e.target.value)} aria-label={etiqueta} />
    </div>
  )
}

function Bloqueos() {
  const { usuario } = useSesion()
  const hoy = hoyISO()
  const casas = listarCasas({ incluirInactivas: true })
  const [f, setF] = useState({ casa_id: '', entrada: '', salida: '', motivo: '' })
  const [revisar, setRevisar] = useState(false)
  const [hecho, setHecho] = useState(null)
  const bloqueos = listarBloqueos().filter((b) => b.salida >= hoy)
  const valido = f.casa_id && f.entrada && f.salida > f.entrada && f.entrada > hoy && f.motivo.trim().length >= 5
  const afectadas = valido ? reservasAfectadas(Number(f.casa_id), f.entrada, f.salida) : []

  return (
    <section aria-labelledby="t-bloq">
      <h2 id="t-bloq" className="text-lg font-semibold">
        Bloqueos de fechas por mantención o fuerza mayor
      </h2>
      <p className="mt-1 max-w-3xl text-sm text-tinta-500">
        Cierra noches concretas de una casa que sigue en servicio. Las fechas bloqueadas no se pueden reservar; si ya había reservas, se anulan, se avisa a cada persona con el motivo y se registra la devolución de lo pagado (Art. 11). Para sacar una casa sin fecha de término, use «Retirar del sistema» en la pestaña Casas.
      </p>
      {hecho && (
        <div className="mt-3">
          <Aviso tipo="info">{hecho}</Aviso>
        </div>
      )}

      <div className="mt-4 grid gap-5 lg:grid-cols-[1fr_380px]">
        <Tarjeta className="overflow-hidden">
          {bloqueos.length === 0 ? (
            <p className="p-6 text-center text-tinta-500">No hay bloqueos vigentes.</p>
          ) : (
            <ul className="divide-y divide-borde">
              {bloqueos.map((b) => (
                <li key={b.id} className="flex items-start justify-between gap-3 px-4 py-3">
                  <div className="flex items-start gap-3">
                    <Lock className="mt-0.5 size-4 shrink-0 text-tinta-400" aria-hidden />
                    <div className="text-[15px]">
                      <p className="font-medium">
                        {obtenerCasa(b.casa_id).nombre} · {rangoFechas(b.entrada, b.salida)}
                      </p>
                      <p className="text-tinta-700">{b.motivo}</p>
                      <p className="text-[13px] text-tinta-500">Por {b.creado_por}</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => eliminarBloqueo(b.id)} className="grid size-10 shrink-0 place-items-center rounded-lg text-tinta-400 hover:bg-error-50 hover:text-error-700" aria-label="Quitar bloqueo">
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Tarjeta>

        <Tarjeta className="p-5">
          <h3 className="font-semibold">Nuevo bloqueo</h3>
          <div className="mt-3 space-y-3">
            <Campo etiqueta="Casa">
              <select className={claseEntrada} value={f.casa_id} onChange={(e) => setF({ ...f, casa_id: e.target.value })}>
                <option value="">Elija una casa</option>
                {casas.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} ({nombreRegion(c.region)})
                  </option>
                ))}
              </select>
            </Campo>
            <div className="grid grid-cols-2 gap-3">
              <Campo etiqueta="Desde">
                <input type="date" className={claseEntrada} min={sumarDias(hoy, 1)} value={f.entrada} onChange={(e) => setF({ ...f, entrada: e.target.value })} />
              </Campo>
              <Campo etiqueta="Hasta (sin incluir)">
                <input type="date" className={claseEntrada} min={f.entrada || sumarDias(hoy, 2)} value={f.salida} onChange={(e) => setF({ ...f, salida: e.target.value })} />
              </Campo>
            </div>
            <Campo etiqueta="Motivo" ayuda="Se informa a las personas afectadas.">
              <input className={claseEntrada} value={f.motivo} onChange={(e) => setF({ ...f, motivo: e.target.value })} placeholder="Ej.: reparación del sistema eléctrico" />
            </Campo>
            {valido && afectadas.length > 0 && (
              <Aviso>
                {plural(afectadas.length, 'reserva se anulará', 'reservas se anularán')}: {afectadas.map((r) => r.titular.nombre).join(', ')}.
              </Aviso>
            )}
            <Boton className="w-full" disabled={!valido} onClick={() => setRevisar(true)}>
              Bloquear fechas
            </Boton>
          </div>
        </Tarjeta>
      </div>

      {revisar && (
        <Dialogo titulo="Confirmar bloqueo" onCerrar={() => setRevisar(false)}>
          <p className="mt-2 text-[15px] text-tinta-700">
            {obtenerCasa(Number(f.casa_id)).nombre} · {rangoFechas(f.entrada, f.salida)} · {f.motivo}
          </p>
          {afectadas.length > 0 ? (
            <>
              <p className="mt-4 text-[15px] font-medium">Se anularán y se avisará a:</p>
              <ul className="mt-1 list-disc pl-5 text-[15px] text-tinta-700">
                {afectadas.map((r) => (
                  <li key={r.codigo}>
                    {r.titular.nombre} · {rangoFechas(r.entrada, r.salida)} · {pesos(r.total)}
                    {r.pago ? ' (pagado: se devolverá)' : ''}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="mt-4 text-[15px] text-tinta-700">No hay reservas en esas fechas.</p>
          )}
          <div className="mt-6 flex justify-end gap-3">
            <Boton variante="secundario" onClick={() => setRevisar(false)}>
              Volver
            </Boton>
            <Boton
              variante={afectadas.length ? 'peligro' : 'primario'}
              onClick={() => {
                const n = crearBloqueo({ ...f, casa_id: Number(f.casa_id), motivo: f.motivo.trim() }, usuario)
                setHecho(`Fechas bloqueadas.${n ? ` Se anularon ${plural(n, 'reserva', 'reservas')} y se avisó a las personas.` : ''}`)
                setF({ casa_id: '', entrada: '', salida: '', motivo: '' })
                setRevisar(false)
              }}
            >
              {afectadas.length ? 'Bloquear y anular reservas' : 'Bloquear'}
            </Boton>
          </div>
        </Dialogo>
      )}
    </section>
  )
}
