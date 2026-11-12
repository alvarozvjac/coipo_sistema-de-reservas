import { KeyRound, ShieldCheck } from 'lucide-react'
import { aprobadoresPorRegion, usuariosConAcceso } from '../../../datos/configuracion.js'
import { REGIONES } from '../../../datos/casas.js'
import { CLIENT_ID } from '../../../datos/iam.js'
import { Tarjeta } from '../../../componentes/ui.jsx'

const nombreRegion = (c) => REGIONES.find((r) => r.codigo === c)?.nombre ?? '—'
const PERFIL = { encargada: 'Encargada regional', central: 'Encargado nacional' }

/**
 * Usuarios y encargadas (decisión 12-11-2026): quién entra, con qué rol y
 * región, y quién aprueba en cada región. Los roles se dan y se quitan en el
 * COIPO IAM; aquí solo se ven.
 */
export function Usuarios() {
  const usuarios = usuariosConAcceso()
  const regiones = aprobadoresPorRegion()
  const sinEncargada = regiones.filter((r) => r.aprueba === 'nacional')
  return (
    <div className="space-y-8">
      <section aria-labelledby="t-usuarios">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="t-usuarios" className="text-lg font-semibold">
              Usuarios con acceso
            </h2>
            <p className="mt-1 max-w-3xl text-[15px] text-tinta-500">
              El acceso, el rol y la región los asigna el COIPO IAM para la aplicación <code className="rounded bg-stone-100 px-1 text-[13px]">{CLIENT_ID}</code>. Para dar acceso a una nueva encargada o quitarlo, se pide en el IAM.
            </p>
          </div>
          <p className="inline-flex items-center gap-2 rounded-lg bg-stone-100 px-3 py-2 text-[13px] text-tinta-700">
            <KeyRound className="size-4" aria-hidden /> Se gestiona en el COIPO IAM (en la maqueta, simulado)
          </p>
        </div>
        <Tarjeta className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-[15px]">
            <thead className="border-b border-borde text-[13px] text-tinta-500">
              <tr>
                <th className="px-4 py-3 font-medium">Usuario</th>
                <th className="px-4 py-3 font-medium">Correo</th>
                <th className="px-4 py-3 font-medium">Rol en el IAM</th>
                <th className="px-4 py-3 font-medium">Perfil aquí</th>
                <th className="px-4 py-3 font-medium">Región</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borde">
              {usuarios.map((u) => (
                <tr key={u.sub}>
                  <td className="px-4 py-3 font-medium">{u.username}</td>
                  <td className="px-4 py-3 text-tinta-700">{u.email}</td>
                  <td className="px-4 py-3">
                    <code className="text-[13px]">{u.role ?? 'sin rol'}</code>
                  </td>
                  <td className="px-4 py-3">{u.perfil ? PERFIL[u.perfil] : <span className="text-tinta-500">No entra</span>}</td>
                  <td className="px-4 py-3">{u.region_id ? nombreRegion(u.region_id) : u.perfil === 'central' ? 'Todo el país' : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Tarjeta>
        <p className="mt-2 text-[13px] text-tinta-500">Cuentas de prueba de la maqueta. En producción esta lista la entrega el IAM.</p>
      </section>

      <section aria-labelledby="t-aprueban">
        <h2 id="t-aprueban" className="text-lg font-semibold">
          Quién aprueba en cada región
        </h2>
        <p className="mt-1 max-w-3xl text-[15px] text-tinta-500">
          Lo que registra el encargado nacional lo aprueba la encargada de la región de la casa. Si la región no tiene encargada con rol en el IAM, lo aprueba el encargado nacional.
          {sinEncargada.length > 0 && ` Hoy hay ${sinEncargada.length} regiones sin encargada.`}
        </p>
        <Tarjeta className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-[15px]">
            <thead className="border-b border-borde text-[13px] text-tinta-500">
              <tr>
                <th className="px-4 py-3 font-medium">Región</th>
                <th className="px-4 py-3 text-right font-medium">Casas</th>
                <th className="px-4 py-3 font-medium">Encargada en el IAM</th>
                <th className="px-4 py-3 font-medium">Aprueba</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borde">
              {regiones.map((r) => (
                <tr key={r.region.codigo}>
                  <td className="px-4 py-2.5">{r.region.nombre}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{r.casas}</td>
                  <td className="px-4 py-2.5">{r.encargada ? r.encargada.username : <span className="text-alerta-700">Sin encargada</span>}</td>
                  <td className="px-4 py-2.5">
                    <span className="inline-flex items-center gap-1.5">
                      <ShieldCheck className={`size-4 ${r.aprueba === 'encargada' ? 'text-verde-700' : 'text-tinta-400'}`} aria-hidden />
                      {r.aprueba === 'encargada' ? 'La encargada de la región' : 'El encargado nacional'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Tarjeta>
      </section>
    </div>
  )
}
