import { Link } from 'react-router-dom'
import { ClipboardList, FlameKindling, Undo2, Wallet } from 'lucide-react'
import { REGIONES } from '../../datos/casas.js'
import { inventarioDe, listarCasas, pagosPorRegistrar, todasLasReservas, useDatos } from '../../datos/servicio.js'
import { fechaCorta, hoyISO, sumarDias } from '../../lib/fechas.js'
import { plural } from '../../lib/formato.js'
import { estadoReserva } from '../../lib/reglas.js'
import { Tarjeta } from '../../componentes/ui.jsx'
import { ETAPAS, etapaVigente } from '../../datos/etapa.js'
import { AccionesRegistro, Indicador, Movimientos, ocupacion } from '../../componentes/Panel.jsx'

const nombreRegion = (c) => REGIONES.find((r) => r.codigo === c)?.nombre ?? ''

/**
 * Panel de control del encargado nacional (decisión 12-11-2026, reemplaza al
 * inicio): lo que pide acción hoy en el país. La tabla «Regiones · próximos 30 días»
 * se quitó el 18-11-2026 a pedido de Bienestar.
 */
export function InicioCentral() {
  useDatos()
  const hoy = hoyISO()
  const casas = listarCasas({ incluirInactivas: true })
  const reservas = todasLasReservas()

  // Alertas operativas
  const pagosUrgentes = pagosPorRegistrar().filter((r) => !r.cargo && r.forma_pago.anticipado && r.entrada <= sumarDias(hoy, 7))
  const sinInventario = casas.filter((c) => c.activa && !inventarioDe(c.id))
  const extintores = casas
    .map((c) => ({ casa: c, vence: inventarioDe(c.id)?.seguridad?.extintor_vence }))
    .filter((x) => x.vence && x.vence <= sumarDias(hoy, 30))
  const devoluciones = reservas.filter((r) => r.devolucion_pendiente)

  const regiones = new Set(casas.filter((c) => c.activa).map((c) => c.region)).size

  const llegadas = reservas.filter((r) => estadoReserva(r) === 'confirmada' && (r.entrada === hoy || r.entrada === sumarDias(hoy, 1)))

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Panel nacional</h1>
          <p className="mt-1 text-[15px] text-tinta-500">
            {plural(casas.filter((c) => c.activa).length, 'casa activa', 'casas activas')} en {regiones} regiones · {fechaCorta(hoy, true)} ·{' '}
            <Link to="/central/configuracion?pestana=etapa" className="font-medium text-verde-700 underline-offset-2 hover:underline">
              {ETAPAS[etapaVigente()].corto}: {ETAPAS[etapaVigente()].nombre.toLowerCase()}
            </Link>
          </p>
        </div>
        <AccionesRegistro reservas="/central/reservas" />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Indicador cifra={pagosPorRegistrar().length} texto="transferencias por registrar" tono="alerta" a="/central/cobros?pestana=pagos" />
        <Indicador cifra={reservas.filter((r) => r.estado === 'confirmada' && r.creada_en.slice(0, 10) >= sumarDias(hoy, -7)).length} texto="reservas registradas en los últimos 7 días" a="/central/reservas" />
        <Indicador cifra={llegadas.length} texto="llegadas hoy y mañana" />
        <Indicador cifra={`${Math.round(ocupacion(casas.filter((c) => c.activa), reservas, hoy) * 100)}%`} texto="ocupación nacional, próximos 30 días" a="/central/reservas" />
      </div>

      <section className="mt-8" aria-labelledby="t-alertas">
        <h2 id="t-alertas" className="text-lg font-semibold">
          Requiere atención
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Alerta icono={Wallet} cifra={pagosUrgentes.length} texto="pagos anticipados sin registrar, con llegada en 7 días" a="/central/cobros" />
          <Alerta icono={FlameKindling} cifra={extintores.length} texto="extintores vencidos o por vencer en 30 días" detalle={extintores.map((x) => x.casa.nombre).join(', ')} />
          <Alerta icono={ClipboardList} cifra={sinInventario.length} texto="casas sin inventario: su ficha de reserva va sin inventario" detalle={sinInventario.slice(0, 4).map((c) => c.nombre).join(', ') + (sinInventario.length > 4 ? '…' : '')} />
          <Alerta icono={Undo2} cifra={devoluciones.length} texto="devoluciones pendientes por anulaciones de Bienestar" a="/central/cobros" />
        </div>
      </section>

      <Movimientos reservas={reservas} hoy={hoy} conRegion={nombreRegion} />
    </>
  )
}

function Alerta({ icono: Icono, cifra, texto, detalle, a }) {
  const activa = cifra > 0
  const cuerpo = (
    <Tarjeta className={`h-full min-w-0 p-4 ${activa ? '' : 'opacity-70'}`}>
      <div className="flex items-start gap-3">
        <Icono className={`mt-1 size-5 shrink-0 ${activa ? 'text-alerta-700' : 'text-tinta-400'}`} aria-hidden />
        <div className="min-w-0">
          <p className="text-2xl font-bold tabular-nums">{cifra}</p>
          <p className="text-sm text-tinta-700">{texto}</p>
          {activa && detalle && <p className="mt-1 truncate text-[13px] text-tinta-500" title={detalle}>{detalle}</p>}
        </div>
      </div>
    </Tarjeta>
  )
  return a && activa ? (
    <Link to={a} className="block min-w-0 rounded-xl hover:shadow-sm">
      {cuerpo}
    </Link>
  ) : (
    cuerpo
  )
}
