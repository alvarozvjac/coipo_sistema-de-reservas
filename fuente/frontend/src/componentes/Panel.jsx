import { Link } from 'react-router-dom'
import { LogIn, LogOut, Phone, Plus } from 'lucide-react'
import { diasEntre, fechaCorta, sumarDias } from '../lib/fechas.js'
import { plural } from '../lib/formato.js'
import { estadoReserva } from '../lib/reglas.js'
import { Boton, Tarjeta } from './ui.jsx'

/**
 * Piezas del panel de control (decisión 12-11-2026): el inicio deja de explicar
 * y muestra solo lo que pide acción hoy, con un enlace a donde se resuelve.
 */

/** Botones para registrar lo que una persona pidió, en la cabecera del panel. */
export function AccionesRegistro({ reservas }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Boton a={`${reservas}?nueva=1`}>
        <Plus className="size-4" aria-hidden /> Nueva solicitud
      </Boton>
    </div>
  )
}

/** Una cifra que lleva a donde se atiende. Si es cero, queda tenue y sin enlace. */
export function Indicador({ cifra, texto, a, tono, detalle }) {
  const activa = typeof cifra === 'string' || cifra > 0
  const cuerpo = (
    <Tarjeta className={`h-full p-4 ${activa && tono === 'alerta' ? 'ring-2 ring-inset ring-alerta-700' : ''}`}>
      <p className={`text-3xl font-bold tabular-nums ${activa ? (tono === 'alerta' ? 'text-alerta-700' : 'text-tinta-900') : 'text-tinta-400'}`}>{cifra}</p>
      <p className="mt-1 text-[15px] text-tinta-700">{texto}</p>
      {detalle && <p className="mt-1 truncate text-[13px] text-tinta-500" title={detalle}>{detalle}</p>}
    </Tarjeta>
  )
  return a && activa ? (
    <Link to={a} className="block rounded-xl hover:shadow-md">
      {cuerpo}
    </Link>
  ) : (
    cuerpo
  )
}

/** Fracción de noches ocupadas en los próximos `dias` días. */
export function ocupacion(casas, reservas, hoy, dias = 30) {
  if (!casas.length) return 0
  const fin = sumarDias(hoy, dias)
  const ids = new Set(casas.map((c) => c.id))
  const noches = reservas
    .filter((r) => ids.has(r.casa_id) && ['confirmada', 'en_curso'].includes(estadoReserva(r)))
    .reduce((s, r) => s + Math.max(0, diasEntre(r.entrada > hoy ? r.entrada : hoy, r.salida < fin ? r.salida : fin)), 0)
  return noches / (casas.length * dias)
}

/** Llegadas y salidas de hoy y mañana, con el teléfono a mano. */
export function Movimientos({ reservas, hoy, conRegion }) {
  const manana = sumarDias(hoy, 1)
  const activas = reservas.filter((r) => ['confirmada', 'en_curso'].includes(estadoReserva(r)) || (r.estado === 'confirmada' && r.salida === hoy))
  const dias = [hoy, manana].map((dia) => ({ dia, items: [...activas.filter((r) => r.entrada === dia).map((r) => ['llega', r]), ...activas.filter((r) => r.salida === dia).map((r) => ['sale', r])] }))
  return (
    <section className="mt-8" aria-labelledby="t-mov">
      <h2 id="t-mov" className="text-lg font-semibold">
        Llegadas y salidas
      </h2>
      <div className="mt-3 grid gap-4 md:grid-cols-2">
        {dias.map((m) => (
          <Tarjeta key={m.dia} className="p-4">
            <p className="font-semibold">
              {m.dia === hoy ? 'Hoy' : 'Mañana'}, {fechaCorta(m.dia)} <span className="font-normal text-tinta-500">· {plural(m.items.length, 'movimiento', 'movimientos')}</span>
            </p>
            {m.items.length === 0 ? (
              <p className="mt-2 text-[15px] text-tinta-500">Sin movimientos.</p>
            ) : (
              <ul className="mt-2 max-h-80 divide-y divide-borde overflow-y-auto">
                {m.items.map(([tipo, r]) => (
                  <li key={tipo + r.codigo} className="flex items-start gap-3 py-2.5">
                    {tipo === 'llega' ? <LogIn className="mt-0.5 size-5 text-verde-600" aria-label="Llegada" /> : <LogOut className="mt-0.5 size-5 text-tinta-500" aria-label="Salida" />}
                    <div className="min-w-0 text-[15px]">
                      <p className="font-medium">
                        {tipo === 'llega' ? 'Llega' : 'Sale'} a {r.casa.nombre}
                        <span className="font-normal text-tinta-500">
                          {' '}
                          · {tipo === 'llega' ? 'desde las 15:00' : 'hasta las 12:00'}
                          {conRegion ? ` · ${conRegion(r.casa.region)}` : ''}
                        </span>
                      </p>
                      <p className="text-tinta-700">
                        {r.titular.nombre} · {plural(r.ocupantes.length, 'persona', 'personas')}
                      </p>
                      {r.contacto?.telefono && (
                        <a href={`tel:${r.contacto.telefono.replace(/\s/g, '')}`} className="inline-flex min-h-8 items-center gap-1 text-sm text-verde-700 hover:underline">
                          <Phone className="size-3.5" aria-hidden /> {r.contacto.telefono}
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Tarjeta>
        ))}
      </div>
    </section>
  )
}
