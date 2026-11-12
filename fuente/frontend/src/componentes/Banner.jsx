import banner from '../assets/banner-personas.jpg'
import corto from '../assets/banner-personas-corto.jpg'

/**
 * Banner institucional, como BannerInstitucional de la semilla de
 * coipo_master_produccion (identidad/ESTANDAR_UI.md):
 *
 * - Proporción natural con piso de altura: alto = max(68 px, ancho / 17,1299).
 *   Por debajo del ancho de cruce la imagen deja de encoger y se recorta por la
 *   DERECHA (el contenedor la come), nunca se deforma.
 * - En teléfono (max-width: 559.98px) se usa el asset corto: el largo deja de
 *   leerse.
 * - UI-1: el nombre del sistema va sin caja y dentro de la zona del título, que
 *   empieza en el píxel 875 del asset (28,86 % del ancho de la imagen) y termina
 *   40 px antes del remate (2704 de 3032). Por eso se posiciona respecto del
 *   ancho PINTADO de la imagen, no del contenedor. Desde 560 px va en una línea,
 *   blanco y seminegrita, como en la maqueta de Gestión de Flota; en teléfono pasa
 *   a su propia franja bajo el banner, con el verde exacto del campo.
 * - UI-5: nada de texto sobre el remate verde claro.
 */
/** Nombre del sistema (12-11-2026, Álvaro Zegers): mismo formato que la maqueta de Gestión de Flota. */
export const TITULO_SISTEMA = 'Sistema de Gestión de Reservas'

export function Banner() {
  return (
    <div className="overflow-hidden bg-banner leading-none">
      <div className="relative inline-block align-top">
        <picture>
          <source media="(max-width: 559.98px)" srcSet={corto} width={875} height={177} />
          <img src={banner} alt="CONAF · Unidad de Información y Análisis · Gerencia de desarrollo de las personas · Departamento de Bienestar" width={3032} height={177} className="block h-[max(68px,calc(100vw/17.1299))] w-auto max-w-none" />
        </picture>
        {/* Línea agregada bajo el rótulo oficial de la gerencia (12-11-2026, Álvaro Zegers): el banner
            5_banner_DESARROLLO_PERSONAS de identidad/ sólo trae «Gerencia de desarrollo de las personas».
            Se escribe en el mismo cuerpo y color que el rótulo, a la altura de una tercera línea (píxel 96
            de 177; empieza en el píxel 609). Pendiente para Luis: una variante oficial con el departamento. */}
        <span aria-hidden className="rotulo-depto absolute left-[69.6%] min-[560px]:left-[20.086%]">Departamento de Bienestar</span>
        <div aria-hidden className="absolute inset-y-0 left-[28.86%] right-[10.82%] hidden min-w-0 items-center pl-[clamp(12px,1.6vw,28px)] text-sobre-banner min-[560px]:flex">
          <span className="truncate text-[clamp(0.95rem,1.6vw,1.75rem)] font-semibold leading-[1.1] tracking-[0.01em]">{TITULO_SISTEMA}</span>
        </div>
      </div>
      <div aria-hidden className="bg-banner px-4 pt-2.5 pb-3 text-[16px] font-semibold leading-[1.25] text-sobre-banner min-[560px]:hidden">{TITULO_SISTEMA}</div>
    </div>
  )
}
