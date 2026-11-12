import { Tarjeta } from '../../componentes/ui.jsx'

const PUNTOS = [
  'Usuarios con ingreso: encargadas regionales y encargado nacional, con la región de cada encargada.',
  'Carga de las nóminas de afiliados/as y de personal (calidad, grado y correo de cada persona).',
  'Parámetros del reglamento (anticipación, noches, plazos de desistimiento y cuotas), con auditoría de cambios.',
  'Estado del sistema: envíos de correo, respaldos y registro de actividad.',
]

/**
 * Administración del sistema. Hasta el 12-11-2026 era el perfil
 * «Mantenimiento UIA»; por decisión de Bienestar, todas sus funciones pasan
 * al encargado nacional. En la maqueta muestra lo que tendrá.
 */
export function Administracion() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold">Administración</h1>
      <Tarjeta className="mt-4 p-6">
        <p className="text-[13px] font-semibold uppercase tracking-wide text-verde-700">En construcción</p>
        <p className="mt-2 text-[15px] text-tinta-700">Desde aquí el encargado nacional administrará el sistema:</p>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[15px] text-tinta-700">
          {PUNTOS.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
        <p className="mt-4 text-[13px] text-tinta-500">Antes estaba en el perfil Mantenimiento UIA, que ya no existe: sus funciones pasaron al encargado nacional.</p>
      </Tarjeta>
    </div>
  )
}
