import banner from '../assets/banner-conaf-uia.jpg'
import corto from '../assets/banner-conaf-uia-corto.jpg'

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
 *   ancho PINTADO de la imagen, no del contenedor. Solo se muestra desde 1024 px,
 *   donde la zona visible da para el texto.
 * - UI-5: nada de texto sobre el remate verde claro.
 */
export function Banner() {
  return (
    <div className="overflow-hidden bg-banner leading-none">
      <div className="relative inline-block align-top">
        <picture>
          <source media="(max-width: 559.98px)" srcSet={corto} width={875} height={177} />
          <img src={banner} alt="CONAF · Unidad de Información y Análisis" width={3032} height={177} className="block h-[max(68px,calc(100vw/17.1299))] w-auto max-w-none" />
        </picture>
        <div className="absolute inset-y-0 left-[28.86%] hidden max-w-[60%] flex-col justify-center pl-6 text-sobre-banner lg:flex">
          <span className="text-[clamp(17px,1.25vw,24px)] font-bold leading-tight">Casas de Veraneo</span>
          <span className="text-[clamp(12px,0.75vw,14px)] leading-tight">Servicio de Bienestar · CONAF</span>
        </div>
      </div>
    </div>
  )
}
