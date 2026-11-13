import { inventarioDe, listarCasas, reservasRegion, useDatos } from '../../datos/servicio.js'
import { fechaCorta, hoyISO, sumarDias } from '../../lib/fechas.js'
import { plural } from '../../lib/formato.js'
import { estadoReserva, pagoPendiente } from '../../lib/reglas.js'
import { useSesion } from '../../componentes/Perfil.jsx'
import { AccionesRegistro, Indicador, Movimientos, ocupacion } from '../../componentes/Panel.jsx'
import { nombreRegion } from './comun.jsx'

/**
 * Panel de control de la encargada regional (decisión 12-11-2026, reemplaza
 * al inicio): lo que pide acción hoy en su región. La ocupación y el registro
 * de reservas están en Reservas.
 */
export function InicioEncargada() {
  useDatos()
  const { usuario } = useSesion()
  const hoy = hoyISO()
  const casas = listarCasas().filter((c) => c.region === usuario.region)
  const reservas = reservasRegion(usuario.region)
  const estado = (e) => reservas.filter((r) => estadoReserva(r) === e)
  const llegadas = reservas.filter((r) => estadoReserva(r) === 'confirmada' && (r.entrada === hoy || r.entrada === sumarDias(hoy, 1)))
  const sinInventario = casas.filter((c) => !inventarioDe(c.id))
  const extintores = casas.filter((c) => {
    const v = inventarioDe(c.id)?.seguridad?.extintor_vence
    return v && v <= sumarDias(hoy, 30)
  })
  const inventario = [...new Set([...sinInventario, ...extintores])]
  const base = '/encargada/reservas'

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Panel · Región de {nombreRegion(usuario.region)}</h1>
          <p className="mt-1 text-[15px] text-tinta-500">
            {plural(casas.length, 'casa', 'casas')} a su cargo · {fechaCorta(hoy, true)}
          </p>
        </div>
        <AccionesRegistro reservas="/encargada/reservas" />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Indicador cifra={reservas.filter(pagoPendiente).length} texto="transferencias por registrar" tono="alerta" a="/encargada/cobros?pestana=pagos" />
        <Indicador cifra={estado('confirmada').length} texto="reservas confirmadas por venir" a={`${base}?estado=confirmada`} />
        <Indicador cifra={llegadas.length} texto="llegadas hoy y mañana" />
        <Indicador cifra={`${Math.round(ocupacion(casas, reservas, hoy) * 100)}%`} texto="ocupación de los próximos 30 días" a={base} />
      </div>

      <Movimientos reservas={reservas} hoy={hoy} />

      {inventario.length > 0 && (
        <section className="mt-8" aria-labelledby="t-inv">
          <h2 id="t-inv" className="text-lg font-semibold">
            Inventario
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {sinInventario.length > 0 && <Indicador cifra={sinInventario.length} texto="casas sin inventario: su ficha de reserva va sin él" detalle={sinInventario.map((c) => c.nombre).join(', ')} a="/encargada/inventario" tono="alerta" />}
            {extintores.length > 0 && <Indicador cifra={extintores.length} texto="extintores vencidos o por vencer en 30 días" detalle={extintores.map((c) => c.nombre).join(', ')} a="/encargada/inventario" tono="alerta" />}
          </div>
        </section>
      )}
    </>
  )
}
