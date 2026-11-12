import { useState } from 'react'
import { Mail, RotateCcw } from 'lucide-react'
import { VARIABLES, correoDe, guardarPlantilla, plantillas, reservaEjemplo, restaurarPlantilla, variablesDesconocidas } from '../../../datos/configuracion.js'
import { useDatos } from '../../../datos/servicio.js'
import { useSesion } from '../../../componentes/Perfil.jsx'
import { fechaCorta } from '../../../lib/fechas.js'
import { Aviso, Boton, Campo, Tarjeta, claseEntrada } from '../../../componentes/ui.jsx'

/**
 * Plantillas de los correos que recibe la persona (decisión 12-11-2026). Se
 * editan con variables entre llaves y se ven con una reserva de ejemplo. En la
 * maqueta no se envía ningún correo: el historial de cada reserva muestra cómo
 * habría salido.
 */
export function Plantillas() {
  useDatos()
  const { usuario } = useSesion()
  const todas = plantillas()
  const [clave, setClave] = useState('ficha')
  const p = todas[clave]
  const [borrador, setBorrador] = useState({ asunto: p.asunto, cuerpo: p.cuerpo })
  const [hecho, setHecho] = useState(null)
  const elegir = (k) => {
    setClave(k)
    setBorrador({ asunto: todas[k].asunto, cuerpo: todas[k].cuerpo })
    setHecho(null)
  }
  const ejemplo = reservaEjemplo()
  const vista = correoDe(clave, ejemplo, borrador)
  const desconocidas = [...new Set([...variablesDesconocidas(borrador.asunto), ...variablesDesconocidas(borrador.cuerpo)])]
  const cambiada = borrador.asunto !== p.asunto || borrador.cuerpo !== p.cuerpo
  const editada = p.asunto !== p.base.asunto || p.cuerpo !== p.base.cuerpo

  return (
    <div className="grid gap-6 lg:grid-cols-[16rem_1fr]">
      <nav aria-label="Plantillas">
        <ul className="space-y-1">
          {Object.entries(todas).map(([k, t]) => (
            <li key={k}>
              <button type="button" onClick={() => elegir(k)} aria-current={k === clave || undefined} className={`w-full rounded-lg px-3 py-2 text-left text-[15px] pointer-coarse:min-h-11 ${k === clave ? 'bg-verde-50 font-semibold text-verde-800' : 'text-tinta-700 hover:bg-stone-100'}`}>
                {t.nombre}
                <span className="block text-[12px] font-normal text-tinta-500">{t.cuando}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="min-w-0 space-y-4">
        {hecho && <Aviso tipo="info">{hecho}</Aviso>}
        <Tarjeta className="p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-lg font-semibold">{p.nombre}</h2>
            {p.por && <span className="text-[13px] text-tinta-500">Editada por {p.por}, {fechaCorta(p.en.slice(0, 10), true)}</span>}
          </div>
          <Campo etiqueta="Asunto" className="mt-3">
            <input className={claseEntrada} value={borrador.asunto} onChange={(e) => setBorrador((b) => ({ ...b, asunto: e.target.value }))} />
          </Campo>
          <Campo etiqueta="Cuerpo" className="mt-3">
            <textarea className={`${claseEntrada} min-h-56 py-2 font-[inherit]`} value={borrador.cuerpo} onChange={(e) => setBorrador((b) => ({ ...b, cuerpo: e.target.value }))} />
          </Campo>
          <details className="mt-3 rounded-lg bg-stone-50 px-4 py-3">
            <summary className="cursor-pointer text-[15px] font-medium text-verde-800">Variables disponibles</summary>
            <ul className="mt-2 grid gap-1 text-[14px] sm:grid-cols-2">
              {Object.entries(VARIABLES).map(([k, t]) => (
                <li key={k}>
                  <code className="rounded bg-white px-1 text-[13px]">{`{${k}}`}</code> {t}
                </li>
              ))}
            </ul>
          </details>
          {desconocidas.length > 0 && (
            <div className="mt-3">
              <Aviso tipo="error">No existe la variable {desconocidas.map((v) => `{${v}}`).join(', ')}. Revise cómo está escrita.</Aviso>
            </div>
          )}
          <div className="mt-4 flex flex-wrap justify-end gap-3">
            {editada && (
              <Boton
                variante="secundario"
                onClick={() => {
                  restaurarPlantilla(clave, usuario)
                  setBorrador({ asunto: p.base.asunto, cuerpo: p.base.cuerpo })
                  setHecho(`Se restauró el texto original de «${p.nombre}».`)
                }}
              >
                <RotateCcw className="size-4" aria-hidden /> Restaurar original
              </Boton>
            )}
            <Boton
              disabled={!cambiada || desconocidas.length > 0 || !borrador.asunto.trim() || !borrador.cuerpo.trim()}
              onClick={() => {
                guardarPlantilla(clave, borrador, usuario)
                setHecho(`Se guardó «${p.nombre}». Rige para los correos que se envíen desde ahora.`)
              }}
            >
              Guardar plantilla
            </Boton>
          </div>
        </Tarjeta>

        <Tarjeta className="p-5">
          <h3 className="flex items-center gap-2 font-semibold">
            <Mail className="size-5 text-tinta-500" aria-hidden /> Vista previa con {ejemplo.codigo}
          </h3>
          <dl className="mt-3 space-y-1 text-[15px]">
            <div className="flex gap-2">
              <dt className="w-16 shrink-0 text-tinta-500">Para</dt>
              <dd className="break-all">{vista.para}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-16 shrink-0 text-tinta-500">Asunto</dt>
              <dd className="font-semibold">{vista.asunto}</dd>
            </div>
          </dl>
          <p className="mt-3 whitespace-pre-line rounded-lg border border-borde bg-fondo p-4 text-[15px] leading-relaxed">{vista.cuerpo}</p>
        </Tarjeta>
      </div>
    </div>
  )
}
