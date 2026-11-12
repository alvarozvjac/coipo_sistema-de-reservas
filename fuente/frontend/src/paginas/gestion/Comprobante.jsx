import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { CheckCircle2, Clock, FileDown, Hourglass, Printer } from 'lucide-react'
import { REGIONES } from '../../datos/casas.js'
import { desistirReserva, obtenerReserva, puedeAprobar, useDatos } from '../../datos/servicio.js'
import { BotonesAprobacion } from '../../componentes/Aprobacion.jsx'
import { INICIO, useSesion } from '../../componentes/Perfil.jsx'
import { correoEncargada } from '../../datos/usuarios.js'
import { CATEGORIAS_INVENTARIO } from '../../datos/inventarios.js'
import { fechaCorta, fechaLarga, nombreMes } from '../../lib/fechas.js'
import { pesos, plural } from '../../lib/formato.js'
import { PARAMETROS, cargoDesistimiento, estadoReserva, glosaTransferencia, limiteDesistimiento, noches } from '../../lib/reglas.js'
import { PERFIL_ETIQUETA } from '../../componentes/Perfil.jsx'
import { Dialogo } from '../encargada/comun.jsx'
import { Aviso, Boton, Estado, Tarjeta } from '../../componentes/ui.jsx'
import { enVisor } from '../../lib/guardar.js'
import { DatosCuenta } from '../../componentes/Transferencia.jsx'

const PAGO = {
  planilla: (f) => `Descuento por planilla en ${plural(f.cuotas, 'cuota', 'cuotas')}${f.desde_mes ? ` desde ${nombreMes(f.desde_mes + '-01')}` : ''}`,
  transferencia: () => 'Transferencia, antes de llegar',
}

/**
 * Comprobante de una reserva, visto por el encargado que la registró o que la
 * gestiona. Desde el 12-11-2026 aquí se registra también el desistimiento que
 * la persona comunica a Bienestar, y la encargada de la región aprueba lo que
 * registró el encargado nacional. Lo que se envía a la persona es la ficha de
 * la reserva (PDF), que reemplaza al comprobante y al acta de entrega.
 */
export function Comprobante() {
  useDatos()
  const [desistir, setDesistir] = useState(false)
  const { codigo } = useParams()
  const [p] = useSearchParams()
  const r = obtenerReserva(codigo)
  if (!r) return <p>No encontramos la reserva {codigo}.</p>

  const estado = estadoReserva(r)
  const nueva = p.get('nueva') === '1'
  const n = noches(r.entrada, r.salida)
  const region = REGIONES.find((x) => x.codigo === r.casa.region)?.nombre
  const { usuario } = useSesion()
  const reservas = usuario.perfil === 'central' ? '/central/reservas' : '/encargada/reservas'
  const puedeDesistir = ['confirmada', 'por_confirmar'].includes(estado)
  const ficha = r.fichas?.at(-1)

  return (
    <div className="mx-auto max-w-2xl">
      {nueva && estado === 'por_aprobar' && (
        <div className="mb-6 text-center">
          <Hourglass className="mx-auto size-12 text-alerta-700" aria-hidden />
          <h1 className="mt-3 text-2xl font-bold">Reserva registrada a nombre de {r.titular.nombre}, por aprobar</h1>
          <p className="mx-auto mt-1 max-w-md text-[15px] text-tinta-500">
            Las fechas quedan apartadas. {puedeAprobar(usuario, r) ? 'Esta región no tiene encargada con rol en el sistema: apruébela usted más abajo.' : `La aprueba la encargada regional de ${region}.`} Recién al aprobarla se envía a {r.contacto?.correo} la ficha de la reserva.
          </p>
        </div>
      )}
      {nueva && estado === 'por_confirmar' && (
        <div className="mb-6 text-center">
          <Clock className="mx-auto size-12 text-alerta-700" aria-hidden />
          <h1 className="mt-3 text-2xl font-bold">Reserva por confirmar a nombre de {r.titular.nombre}</h1>
          <p className="mx-auto mt-1 max-w-md text-[15px] text-tinta-500">
            Se enviaron a {r.contacto?.correo} los datos para transferir. Las fechas quedan apartadas: cuando Bienestar compruebe el pago, la reserva queda confirmada y se envía la ficha de la reserva.
          </p>
        </div>
      )}
      {nueva && !['por_confirmar', 'por_aprobar'].includes(estado) && (
        <div className="mb-6 text-center">
          <CheckCircle2 className="mx-auto size-12 text-verde-600" aria-hidden />
          <h1 className="mt-3 text-2xl font-bold">Reserva confirmada a nombre de {r.titular.nombre}</h1>
          <p className="mx-auto mt-1 max-w-md text-[15px] text-tinta-500">
            Se envió a {r.contacto?.correo} la ficha de la reserva, con quienes viajan, las direcciones de la casa y el inventario.
          </p>
        </div>
      )}

      <Tarjeta className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-borde pb-4">
          <div>
            <p className="text-[13px] text-tinta-500">Código de reserva</p>
            <p className="text-2xl font-bold tracking-wide tabular-nums">{r.codigo}</p>
          </div>
          <Estado estado={estado} />
        </div>

        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <Dato t="Casa" v={r.casa.nombre} d={`${r.casa.localidad}, ${region}`} />
          <Dato t="Dirección" v={r.casa.direccion} />
          {r.casa.otras_direcciones?.map((d) => (
            <Dato key={d.tipo + d.direccion} t={d.tipo} v={d.direccion} d={d.indicacion} />
          ))}
          <Dato t="Llegada" v={fechaLarga(r.entrada)} d={`Desde las ${PARAMETROS.hora_ingreso}`} />
          <Dato t="Salida" v={fechaLarga(r.salida)} d={`Hasta las ${PARAMETROS.hora_salida}`} />
          {r.ocupantes.length > 0 && <Dato t="Personas" v={plural(r.ocupantes.length, 'persona', 'personas')} d={r.ocupantes.map((o) => o.nombre).join(', ')} />}
          {r.registrada_por && <Dato t="Registrada por" v={r.registrada_por.nombre} d={`${PERFIL_ETIQUETA[r.registrada_por.perfil] ?? 'Encargado/a'}, a pedido de ${r.titular.nombre}, que conoce y acepta el reglamento`} />}
          {r.aprobada_por && r.registrada_por && <Dato t="Aprobada por" v={r.aprobada_por} d={r.aprobada_en ? fechaCorta(r.aprobada_en.slice(0, 10), true) : undefined} />}
          {r.titular_viaja === false && <Dato t="A cargo en la casa" v={r.a_cargo} d={`${r.titular.nombre} no viaja y sigue siendo el usuario/a responsable`} />}
          {r.perro_asistencia && <Dato t="Perro de asistencia" v="Sí (Ley 20.422)" d={r.perro_asistencia.credencial ? 'Credencial y certificado sanitario adjuntos' : undefined} />}
          <Dato
            t="Pago"
            v={`${pesos(r.total)} · ${plural(n, 'noche', 'noches')}`}
            d={PAGO[r.forma_pago.tipo](r.forma_pago)}
          />
        </dl>

        {r.forma_pago.tipo === 'transferencia' && ['por_confirmar', 'en_curso'].includes(estado) && !r.pago && (
          <div className="mt-5 border-t border-borde pt-4">
            <h2 className="font-semibold">Datos para la transferencia</h2>
            <p className="mb-3 mt-1 text-[13px] text-tinta-500">
              Transfiera antes de llegar y escriba la glosa tal como aparece. La reserva queda confirmada cuando Bienestar compruebe el pago.
            </p>
            <DatosCuenta monto={r.total} glosa={r.forma_pago.glosa ?? glosaTransferencia(r.casa, r.codigo)} />
          </div>
        )}

        {estado === 'por_aprobar' && (
          <div className="no-imprimir mt-5 border-t border-borde pt-4">
            <h2 className="font-semibold">Por aprobar</h2>
            {puedeAprobar(usuario, r) ? (
              <>
                <p className="mb-3 mt-1 text-[15px] text-tinta-700">
                  La registró {r.registrada_por?.nombre}. Las fechas están apartadas hasta que usted la apruebe o no.
                  {usuario.perfil === 'central' ? ' Esta región no tiene encargada con rol en el sistema, por eso le toca a usted.' : ''}
                </p>
                <BotonesAprobacion reserva={r} gestor={usuario} />
              </>
            ) : (
              <p className="mt-1 text-[15px] text-tinta-700">La aprueba la encargada regional de {region}. Las fechas están apartadas mientras tanto; a la persona no se le ha enviado nada todavía.</p>
            )}
          </div>
        )}

        {estado === 'rechazada' && r.rechazo && (
          <div className="mt-4 rounded-lg bg-error-50 px-4 py-3 text-[15px] text-error-700">
            <p className="font-semibold">
              No aprobada por {r.rechazo.por} el {fechaCorta(r.rechazo.en.slice(0, 10), true)}
            </p>
            <p className="mt-1">{r.rechazo.motivo}</p>
            <p className="mt-1">Las fechas se liberaron y se avisó a la persona.</p>
          </div>
        )}

        {estado === 'anulada' && r.motivo_anulacion && (
          <div className="mt-4 rounded-lg bg-error-50 px-4 py-3 text-[15px] text-error-700">
            <p className="font-semibold">Bienestar anuló esta reserva</p>
            <p className="mt-1">{r.motivo_anulacion}</p>
          </div>
        )}

        {estado === 'desistida' && r.cargo_desistimiento !== undefined && (
          <p className="mt-4 rounded-lg bg-stone-50 px-4 py-3 text-[15px]">
            Desistida el {fechaLarga(r.desistida_en)}{r.desistimiento_registrado_por ? `, registrado por ${r.desistimiento_registrado_por}` : ''}. Cargo: {r.cargo_desistimiento ? pesos(r.cargo_desistimiento) : 'sin costo'}.
          </p>
        )}
      </Tarjeta>

      {['confirmada', 'en_curso'].includes(estado) && ficha && (
        <>
          <Tarjeta className="no-imprimir mt-6 flex flex-wrap items-center justify-between gap-3 p-4">
            <p className="text-[15px]">
              Se envió la <strong>ficha de la reserva</strong> ({ficha.numero}) a {ficha.enviada_a}: quienes viajan, las direcciones de la casa, el inventario y el acta para el ingreso y la salida.
            </p>
            <Boton
              variante="secundario"
              onClick={async () => {
                const { descargarFicha } = await import('../../lib/ficha.js')
                descargarFicha(r, ficha)
              }}
            >
              <FileDown className="size-4" aria-hidden /> Descargar ficha (PDF)
            </Boton>
          </Tarjeta>
          {ficha.inventario && <InventarioCasa inv={ficha.inventario} correo={correoEncargada(r.casa.region)} />}
        </>
      )}

      <div className="no-imprimir mt-6 flex flex-wrap justify-center gap-3">
        {!enVisor() && (
          <Boton variante="secundario" onClick={() => window.print()}>
            <Printer className="size-4" aria-hidden /> Imprimir o guardar PDF
          </Boton>
        )}
        {puedeDesistir && (
          <Boton variante="secundario" onClick={() => setDesistir(true)}>
            Registrar desistimiento
          </Boton>
        )}
        <Boton a={reservas}>Ver reservas</Boton>
      </div>
      <p className="no-imprimir mt-4 text-center text-sm">
        <Link to="/gestion/reservar" className="font-medium text-verde-700 hover:underline">
          Registrar otra reserva
        </Link>
        {' · '}
        <Link to={INICIO[usuario.perfil]} className="font-medium text-verde-700 hover:underline">
          Volver al inicio
        </Link>
      </p>

      {desistir && <DialogoDesistir reserva={r} gestor={usuario} onCerrar={() => setDesistir(false)} />}
    </div>
  )
}

/** El encargado registra el desistimiento que la persona comunicó (Memo 6188/2026: 10 días hábiles). */
function DialogoDesistir({ reserva: r, gestor, onCerrar }) {
  const cargo = cargoDesistimiento(r)
  const limite = limiteDesistimiento(r.entrada)
  return (
    <Dialogo titulo="¿Registrar el desistimiento?" onCerrar={onCerrar}>
      <p className="mt-2 text-[15px] text-tinta-700">
        {r.titular.nombre} desiste de {r.casa.nombre}, {fechaCorta(r.entrada)} al {fechaCorta(r.salida, true)}.
      </p>
      <div className="mt-3">
        <Aviso tipo={cargo ? 'alerta' : 'info'}>
          {cargo
            ? `El plazo para desistir sin costo venció el ${fechaCorta(limite, true)} (${PARAMETROS.aviso_desistimiento_dias_habiles} días hábiles antes de la llegada): se cobrará la estadía completa (${pesos(cargo)}). Si es por fuerza mayor acreditada, la persona debe enviar el respaldo a Bienestar.`
            : `Avisa dentro del plazo (hasta el ${fechaCorta(limite, true)}, ${PARAMETROS.aviso_desistimiento_dias_habiles} días hábiles antes de la llegada): no tiene costo.`}
        </Aviso>
      </div>
      <p className="mt-3 text-[13px] text-tinta-500">Queda registrado que usted lo registró. Se avisa a la persona por correo{r.origen === 'sorteo' ? ' y el turno se ofrece a la lista de espera' : ''}.</p>
      <div className="mt-6 flex justify-end gap-3">
        <Boton variante="secundario" onClick={onCerrar}>
          Volver
        </Boton>
        <Boton
          variante="peligro"
          onClick={() => {
            desistirReserva(r.codigo, gestor)
            onCerrar()
          }}
        >
          Sí, registrar
        </Boton>
      </div>
    </Dialogo>
  )
}

function Dato({ t, v, d }) {
  return (
    <div>
      <dt className="text-[13px] text-tinta-500">{t}</dt>
      <dd className="font-medium first-letter:uppercase">{v}</dd>
      {d && <dd className="text-sm text-tinta-500">{d}</dd>}
    </div>
  )
}

const ESTADO_ITEM = { regular: 'bg-alerta-50 text-alerta-700', malo: 'bg-error-50 text-error-700' }

/** Inventario que la encargada envió con la reserva (Art. 13, Anexo B). */
function InventarioCasa({ inv, correo }) {
  const s = inv.seguridad
  return (
    <Tarjeta className="mt-6 p-6">
      <h2 className="text-lg font-semibold">Inventario de la casa</h2>
      <p className="mt-1 text-[15px] text-tinta-700">
        Revíselo al llegar. Tiene <strong>{PARAMETROS.plazo_observaciones_horas} horas</strong> desde el ingreso para informar cualquier daño o faltante; después se entiende recibida conforme (Art. 13).
      </p>
      <ol className="mt-3 list-decimal space-y-1 rounded-lg bg-stone-50 py-3 pl-9 pr-4 text-[15px] text-tinta-700">
        <li>
          <strong>Al llegar:</strong> complete la sección 6 de la ficha y envíela a{' '}
          <a href={`mailto:${correo}`} className="font-medium text-verde-700 underline">
            {correo}
          </a>{' '}
          dentro de las {PARAMETROS.plazo_observaciones_horas} horas.
        </li>
        <li>
          <strong>Al salir:</strong> envíe la ficha firmada al mismo correo.
        </li>
      </ol>
      <p className="mt-1 text-[13px] text-tinta-500">Actualizado el {fechaCorta(inv.actualizado_en.slice(0, 10), true)} por {inv.actualizado_por}.</p>
      <div className="mt-4 grid gap-5 sm:grid-cols-2">
        {CATEGORIAS_INVENTARIO.map((cat) => {
          const items = inv.items.filter((x) => x.categoria === cat)
          if (!items.length) return null
          return (
            <section key={cat}>
              <h3 className="text-[13px] font-semibold uppercase tracking-wide text-tinta-500">{cat}</h3>
              <ul className="mt-1.5 space-y-1 text-[15px]">
                {items.map((x) => (
                  <li key={x.id}>
                    <span className="tabular-nums text-tinta-500">{x.cantidad} ×</span> {x.nombre}
                    {x.estado !== 'bueno' && <span className={`ml-1.5 rounded px-1.5 py-0.5 text-xs font-semibold ${ESTADO_ITEM[x.estado]}`}>{x.estado === 'malo' ? 'Malo' : 'Regular'}</span>}
                    {x.observacion && <span className="block text-sm text-tinta-500">{x.observacion}</span>}
                  </li>
                ))}
              </ul>
            </section>
          )
        })}
      </div>
      {(s.llaves || s.controles || s.gas || s.observaciones) && (
        <dl className="mt-5 grid gap-3 border-t border-borde pt-4 text-[15px] sm:grid-cols-2">
          {s.llaves && <Dato t="Llaves" v={s.llaves} />}
          {s.controles && <Dato t="Controles" v={s.controles} />}
          {s.gas && <Dato t="Gas" v={s.gas} d="Cierre la llave de paso al salir (Art. 16)." />}
          {s.observaciones && <Dato t="Indicaciones" v={s.observaciones} />}
        </dl>
      )}
    </Tarjeta>
  )
}
