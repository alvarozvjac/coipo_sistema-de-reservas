import { KeyRound } from 'lucide-react'
import { usuariosConAcceso } from '../../../datos/configuracion.js'
import { REGIONES } from '../../../datos/casas.js'
import { CALIDADES_TRABAJADOR, CLIENT_ID } from '../../../datos/iam.js'
import { porId } from '../../../datos/usuarios.js'
import { etapaAbierta } from '../../../datos/etapa.js'
import { Tarjeta } from '../../../componentes/ui.jsx'

const nombreRegion = (c) => REGIONES.find((r) => r.codigo === c)?.nombre ?? '—'
const PERFIL = { encargada: 'Encargada regional', central: 'Encargado nacional', trabajador: 'Trabajador/a' }

/**
 * Usuarios y encargadas (decisión 12-11-2026): quién entra, con qué rol y
 * región. Los roles se dan y se quitan en el COIPO IAM; aquí solo se ven.
 */
export function Usuarios() {
  const abierta = etapaAbierta()
  // Etapa 2 (18-11-2026): sin rol, entra como trabajador/a quien lo es según la nómina.
  const usuarios = usuariosConAcceso().map((u) => (!u.perfil && CALIDADES_TRABAJADOR.includes(porId(u.nomina)?.calidad) ? { ...u, trabajador: true } : u))
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
                  <td className="px-4 py-3">
                    {u.perfil ? (
                      PERFIL[u.perfil]
                    ) : u.trabajador ? (
                      abierta ? (
                        PERFIL.trabajador
                      ) : (
                        <span className="text-tinta-500">Trabajador/a, entra en la etapa 2</span>
                      )
                    ) : (
                      <span className="text-tinta-500">No entra</span>
                    )}
                  </td>
                  <td className="px-4 py-3">{u.region_id ? nombreRegion(u.region_id) : u.perfil === 'central' ? 'Todo el país' : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Tarjeta>
        <p className="mt-2 text-[13px] text-tinta-500">Cuentas de prueba de la maqueta. En producción esta lista la entrega el IAM.</p>
      </section>

    </div>
  )
}
