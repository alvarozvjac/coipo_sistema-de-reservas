import { useSearchParams } from 'react-router-dom'
import { useDatos } from '../../datos/servicio.js'
import { Bloqueos, Casas, Tarifas } from './Casas.jsx'
import { Usuarios } from './config/Usuarios.jsx'
import { Parametros } from './config/Parametros.jsx'
import { Plantillas } from './config/Plantillas.jsx'
import { Actividad } from './config/Actividad.jsx'

const PESTANAS = [
  ['casas', 'Casas', Casas],
  ['tarifas', 'Tarifas', Tarifas],
  ['bloqueos', 'Bloqueos de fechas', Bloqueos],
  ['usuarios', 'Usuarios y encargadas', Usuarios],
  ['parametros', 'Parámetros', Parametros],
  ['plantillas', 'Plantillas de correo', Plantillas],
  ['actividad', 'Actividad', Actividad],
]

/**
 * Configuración del encargado nacional (decisión 12-11-2026): casas, tarifas y
 * bloqueos; usuarios y encargadas (del IAM); parámetros del reglamento con
 * vigencia; plantillas de correo; y registro de actividad. Reemplaza a la
 * pestaña «Administración (en construcción)». La pestaña va en la dirección.
 */
export function Configuracion() {
  useDatos()
  const [params, setParams] = useSearchParams()
  const pestana = PESTANAS.some(([k]) => k === params.get('pestana')) ? params.get('pestana') : 'casas'
  const Contenido = PESTANAS.find(([k]) => k === pestana)[2]
  return (
    <>
      <h1 className="text-2xl font-bold">Configuración</h1>
      <div className="mt-4 flex gap-1 overflow-x-auto overflow-y-hidden border-b border-borde" role="tablist" aria-label="Secciones de configuración">
        {PESTANAS.map(([k, t]) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={pestana === k}
            onClick={() => setParams({ pestana: k }, { replace: true })}
            className={`-mb-px shrink-0 border-b-2 px-3 py-2.5 text-[15px] font-medium pointer-coarse:min-h-11 ${pestana === k ? 'border-verde-700 text-verde-800' : 'border-transparent text-tinta-500 hover:text-tinta-900'}`}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="mt-5" role="tabpanel">
        <Contenido />
      </div>
    </>
  )
}
