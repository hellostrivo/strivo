// src/lib/suscripcion/planes.js
// Qué tarjetas enseña el muro y con qué precios (SPEC_25). Puro.
//
// **Todo precio es el de la tienda**: `priceString` a la vista, y en voz el
// mismo importe con el nombre de su moneda.

import { copy, interpolate } from '@copy'

const t = copy.suscripcion.paywall

/** El importe de la tienda dicho con su moneda; si no se puede, tal cual. */
export function precioEnVoz(producto, locale = 'es-MX') {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: producto.currencyCode,
      currencyDisplay: 'name',
    }).format(producto.price)
  } catch {
    return producto.priceString
  }
}

const FORMA = Object.freeze({
  anual: { titulo: t.anual, detalle: t.anualDetalle },
  mensual: { titulo: t.mensual, detalle: t.mensualDetalle },
  fundador: { titulo: t.fundadorTitulo, detalle: t.fundadorDetalle, texto: t.fundadorTexto },
})

/**
 * Las tarjetas, en su orden. Lo que la tienda no trae no se pinta.
 *
 * @param {?object} planes - lo que devuelve `compras.planes()`.
 * @param {{conFundador: boolean}} opciones
 */
export function tarjetasDe(planes, { conFundador = false } = {}) {
  const ids = conFundador ? ['anual', 'mensual', 'fundador'] : ['anual', 'mensual']
  return ids
    .filter((id) => planes?.[id]?.product?.priceString)
    .map((id) => {
      const paquete = planes[id]
      const { titulo, detalle, texto = null } = FORMA[id]
      return {
        id,
        paquete,
        titulo,
        texto,
        detalle: interpolate(detalle, { precio: paquete.product.priceString }),
        enVoz: `${titulo}. ${interpolate(detalle, { precio: precioEnVoz(paquete.product) })}`,
      }
    })
}

/** La preseleccionada: el Anual; si no llegó, la primera que haya. */
export function preseleccionada(tarjetas) {
  return tarjetas[0]?.id ?? null
}
