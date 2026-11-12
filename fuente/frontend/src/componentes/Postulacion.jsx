import { useState } from 'react'
import { Clock } from 'lucide-react'
import { listarCasas, responderOferta, retirarPostulacion } from '../datos/servicio.js'
import { fechaCorta, rangoFechas, sumarDias } from '../lib/fechas.js'
import { plural } from '../lib/formato.js'
import { PARAMETROS } from '../lib/reglas.js'
import { ESTADOS_POSTULACION, HORAS_OFERTA, calendariosDe, nochesTurno } from '../lib/sorteo.js'
import { rutaFoto } from './fotos.js'
import { Boton } from './ui.jsx'

/** Salida del turno de una postulación (las nuevas la guardan; las antiguas se calculan). */
export const salidaTurno = (p) => p.salida ?? sumarDias(p.turno, PARAMETROS.noches_turno_temporada_alta)

/** Turnos de la temporada en una frase por calendario (Memo 6188/2026: general y cabañas de Puyehue). */
export function ResumenCalendarios({ temporada }) {
  const cal = calendariosDe(temporada, listarCasas())
  const libres = (n) => (n === 1 ? '1 noche libre' : `${n} noches libres`)
  return (
    <span>
      Turnos de {nochesTurno(temporada)} noches.{' '}
      {cal.map((c) =>
        c.turnos.length ? (
          <span key={c.clave}>
            {c.clave === 'general' ? (cal.length > 1 ? 'Casas en general' : 'Todas las casas') : c.casas.map((x) => x.nombre).join(' y ')}: {plural(c.turnos.length, 'turno', 'turnos')} del {fechaCorta(c.turnos[0].entrada)} al{' '}
            {fechaCorta(c.turnos[c.turnos.length - 1].salida, true)}, con {libres(c.libres)} entre turnos.{' '}
          </span>
        ) : null,
      )}
    </span>
  )
}

export function EstadoPostulacion({ estado }) {
  const e = ESTADOS_POSTULACION[estado]
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[13px] font-semibold ${e.clase}`}>{e.etiqueta}</span>
}

const fechaHora = (iso) => {
  const [d, h] = iso.split('T')
  return `${Number(d.slice(8, 10))}/${d.slice(5, 7)} a las ${h.slice(0, 5)}`
}

/**
 * Estado de una postulación, visto por el encargado que la registró: desde
 * aquí registra el retiro o la respuesta de la persona a un cupo ofrecido
 * (desde el 12-11-2026 la persona no ingresa al sistema).
 */
export function TarjetaPostulacion({ postulacion: p, sorteo, onReserva }) {
  const [confirmarRetiro, setConfirmarRetiro] = useState(false)
  const salida = salidaTurno(p)

  const texto = {
    postulada: `El sorteo se realiza al cierre de la postulación. El resultado se avisa por correo a ${p.contacto.correo}.`,
    adjudicada: `Se adjudicó el turno. La reserva ${p.reserva} quedó registrada y se envió el comprobante por correo.`,
    espera: `No se adjudicó el turno. Quedó en el lugar ${p.posicion} de la lista de espera: si alguien desiste, se le ofrece el cupo por correo y tiene ${HORAS_OFERTA} horas para responder.`,
    ofertada: 'Se liberó el turno al que postuló y se le ofreció por correo. Cuando la persona responda, registre su respuesta; si no responde dentro del plazo, el cupo pasa a la siguiente de la lista.',
    excluida: p.motivo,
    sin_cupo: p.motivo,
  }[p.estado]

  return (
    <div className={`rounded-xl border bg-white p-4 ${p.estado === 'ofertada' ? 'border-alerta-700/40 ring-2 ring-alerta-50' : 'border-borde'}`}>
      <div className="flex flex-col gap-4 sm:flex-row">
        <img src={rutaFoto(p.casa.fotos[0])} alt="" className="h-32 w-full rounded-lg object-cover sm:h-20 sm:w-28" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold">{p.casa.nombre}</p>
            <EstadoPostulacion estado={p.estado} />
          </div>
          <p className="mt-0.5 text-[15px] text-tinta-700">
            {sorteo.nombre} · {rangoFechas(p.turno, salida)} · {plural(p.personas, 'persona', 'personas')}
          </p>
          <p className="text-sm text-tinta-500">
            Postulación {p.codigo}
            {p.prioridad ? ' · con prioridad (Art. 6 a)' : ''}
          </p>
          {texto && <p className="mt-2 text-[15px] text-tinta-700">{texto}</p>}
          {p.estado === 'ofertada' && (
            <p className="mt-2 inline-flex items-center gap-1.5 text-[15px] font-semibold text-alerta-700">
              <Clock className="size-4" aria-hidden /> Plazo para responder: {fechaHora(p.oferta.vence_en)}
            </p>
          )}
        </div>
      </div>

      {p.estado === 'ofertada' && (
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <Boton variante="secundario" onClick={() => responderOferta(p.codigo, false)}>
            Registrar que no acepta
          </Boton>
          <Boton
            onClick={() => {
              const codigo = responderOferta(p.codigo, true)
              if (codigo) onReserva?.(codigo)
            }}
          >
            Registrar que acepta el turno
          </Boton>
        </div>
      )}
      {p.estado === 'adjudicada' && p.reserva && (
        <div className="mt-4 flex justify-end">
          <Boton variante="secundario" a={`/gestion/reserva/${p.reserva}`}>
            Ver reserva
          </Boton>
        </div>
      )}
      {p.estado === 'postulada' && (
        <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
          {confirmarRetiro ? (
            <>
              <span className="text-[15px] text-tinta-700">¿Retirar la postulación a pedido de la persona? Puede volver a postular mientras siga abierta.</span>
              <Boton variante="secundario" onClick={() => setConfirmarRetiro(false)}>
                Volver
              </Boton>
              <Boton variante="peligro" onClick={() => retirarPostulacion(p.codigo)}>
                Sí, retirar
              </Boton>
            </>
          ) : (
            <Boton variante="textoPeligro" onClick={() => setConfirmarRetiro(true)}>
              Retirar postulación
            </Boton>
          )}
        </div>
      )}
    </div>
  )
}
