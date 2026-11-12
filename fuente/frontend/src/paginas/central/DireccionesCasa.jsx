import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { actualizarDirecciones } from '../../datos/servicio.js'
import { Boton, Campo, claseEntrada } from '../../componentes/ui.jsx'
import { Dialogo } from '../encargada/comun.jsx'

const TIPOS = ['Estacionamiento', 'Retiro de llaves', 'Acceso vehicular', 'Bodega', 'Otra']
const VACIA = { tipo: 'Estacionamiento', direccion: '', indicacion: '' }

/**
 * Otras direcciones de una casa además de la principal (decisión 12-11-2026):
 * por ejemplo, el estacionamiento del departamento de Viña del Mar está en otro
 * edificio. Salen en el comprobante y en la ficha que recibe la persona. Las
 * edita el encargado nacional; rigen para las fichas que se emitan desde ahora.
 */
export function DialogoDirecciones({ casa, actor, onCerrar, onListo }) {
  const [lista, setLista] = useState(() => (casa.otras_direcciones?.length ? casa.otras_direcciones.map((d) => ({ ...d })) : []))
  const [intento, setIntento] = useState(false)
  const fijar = (i, k, v) => setLista((l) => l.map((d, j) => (j === i ? { ...d, [k]: v } : d)))
  const incompleta = lista.some((d) => !d.direccion.trim() || !d.tipo.trim())

  return (
    <Dialogo titulo={`Direcciones de ${casa.nombre}`} onCerrar={onCerrar}>
      <p className="mt-2 text-[15px] text-tinta-700">
        Dirección principal: <strong>{casa.direccion}</strong>. Agregue las otras direcciones que la persona necesita conocer. Salen en la ficha de la reserva.
      </p>
      <ul className="mt-4 space-y-4">
        {lista.map((d, i) => (
          <li key={i} className="rounded-lg border border-borde p-3">
            <div className="grid gap-3 sm:grid-cols-[12rem_1fr]">
              <Campo etiqueta="Tipo">
                <select className={claseEntrada} value={TIPOS.includes(d.tipo) ? d.tipo : 'Otra'} onChange={(e) => fijar(i, 'tipo', e.target.value)}>
                  {TIPOS.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </Campo>
              <Campo etiqueta="Dirección" error={intento && !d.direccion.trim() ? 'Escriba la dirección o quite esta fila.' : null}>
                <input className={claseEntrada} value={d.direccion} onChange={(e) => fijar(i, 'direccion', e.target.value)} />
              </Campo>
            </div>
            <Campo etiqueta="Indicación (opcional)" className="mt-3">
              <input className={claseEntrada} value={d.indicacion} onChange={(e) => fijar(i, 'indicacion', e.target.value)} placeholder="Por ejemplo: subterráneo, estacionamiento N° 12" />
            </Campo>
            <Boton variante="textoPeligro" className="mt-2" onClick={() => setLista((l) => l.filter((_, j) => j !== i))}>
              <Trash2 className="size-4" aria-hidden /> Quitar
            </Boton>
          </li>
        ))}
      </ul>
      <Boton variante="secundario" className="mt-3" onClick={() => setLista((l) => [...l, { ...VACIA }])}>
        <Plus className="size-4" aria-hidden /> Agregar dirección
      </Boton>
      <div className="mt-6 flex justify-end gap-3">
        <Boton variante="secundario" onClick={onCerrar}>
          Cancelar
        </Boton>
        <Boton
          onClick={() => {
            setIntento(true)
            if (incompleta) return
            actualizarDirecciones(casa.id, lista, actor)
            onListo(`Se guardaron las direcciones de ${casa.nombre}. Rigen para las fichas que se emitan desde ahora.`)
            onCerrar()
          }}
        >
          Guardar direcciones
        </Boton>
      </div>
    </Dialogo>
  )
}
