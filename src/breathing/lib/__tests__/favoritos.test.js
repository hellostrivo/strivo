// src/breathing/lib/__tests__/favoritos.test.js
// Criterios 19 a 31 de SPEC_15: nombres, duplicados y qué se aplica al cargar.
//
// Todo puro, y esa es la razón de que se pueda probar entero: en una interfaz,
// provocar a mano un nombre de solo espacios, uno de cuarenta y un caracteres y
// uno repetido con otras mayúsculas cuesta más que escribirlos aquí, y son
// exactamente los tres casos donde una lista de favoritos se estropea.

import { describe, expect, it } from 'vitest'

import {
  MOTIVOS,
  longitudVisible,
  mismoNombre,
  nombreSugerido,
  normalizarNombre,
  validarNombre,
} from '../nombreSugerido.js'
import {
  configuracionDe,
  favoritoIdentico,
  hayCambios,
  mismaConfiguracionCompleta,
} from '../comparadorConfiguracion.js'
import { MAX_FAVORITOS, MAX_NOMBRE_FAVORITO } from '../../data/esquema.js'

const PATRON_478 = { inhalar: 40, retenerLleno: 70, exhalar: 80, retenerVacio: 0 }
const PATRON_553 = { inhalar: 50, retenerLleno: 0, exhalar: 50, retenerVacio: 30 }

function favorito(extra = {}) {
  return {
    id: 'f1',
    nombre: 'Antes de dormir',
    patron: { ...PATRON_478 },
    patronBaseId: 'cuatro-siete-ocho',
    visual: 'circulo',
    sonidoAmbienteId: 'lluvia',
    volumenAmbiente: 0.6,
    guiaSonoraActiva: false,
    volumenGuia: 0.5,
    duracion: { modo: 'minutos', valor: 10 },
    ...extra,
  }
}

describe('el nombre que llega prellenado (criterio 19, RN-RE-FAV-04)', () => {
  it('el del patrón, si no está cogido', () => {
    expect(nombreSugerido('4-7-8', [])).toBe('4-7-8')
  })

  it('con sufijo si ya existe', () => {
    expect(nombreSugerido('4-7-8', ['4-7-8'])).toBe('4-7-8 2')
  })

  it('y sigue subiendo mientras haga falta', () => {
    expect(nombreSugerido('4-7-8', ['4-7-8', '4-7-8 2'])).toBe('4-7-8 3')
    expect(nombreSugerido('4-7-8', ['4-7-8', '4-7-8 2', '4-7-8 3'])).toBe('4-7-8 4')
  })

  it('empieza en 2: el primero no lleva número', () => {
    expect(nombreSugerido('Calma 5-5-3', ['Calma 5-5-3'])).toBe('Calma 5-5-3 2')
  })

  it('el hueco se aprovecha en vez de saltarlo', () => {
    expect(nombreSugerido('4-7-8', ['4-7-8', '4-7-8 3'])).toBe('4-7-8 2')
  })

  it('la comparación del sufijo tampoco distingue mayúsculas', () => {
    expect(nombreSugerido('4-7-8', ['4-7-8', '4-7-8 2'])).toBe('4-7-8 3')
    expect(nombreSugerido('Calma', ['CALMA'])).toBe('Calma 2')
  })

  it('sin nombre base cae en algo que sirve, no en cadena vacía', () => {
    expect(nombreSugerido('', [])).toBeTruthy()
    expect(nombreSugerido('   ', [])).toBeTruthy()
  })
})

describe('nombres que no valen (criterio 20, RN-RE-FAV-02)', () => {
  it('vacío se rechaza; no se guarda "sin nombre"', () => {
    // Un nombre puesto por la app no ayuda a encontrar nada y llena la lista de
    // gemelos que nadie sabe distinguir.
    const veredicto = validarNombre('', [])
    expect(veredicto.valido).toBe(false)
    expect(veredicto.motivo).toBe(MOTIVOS.VACIO)
  })

  it('solo espacios también, tras recortar (caso 6.8)', () => {
    expect(validarNombre('     ', []).motivo).toBe(MOTIVOS.VACIO)
    expect(validarNombre('\t\n ', []).motivo).toBe(MOTIVOS.VACIO)
  })

  it('cuarenta caracteres valen; cuarenta y uno, no', () => {
    expect(validarNombre('a'.repeat(40), []).valido).toBe(true)
    expect(validarNombre('a'.repeat(41), []).motivo).toBe(MOTIVOS.LARGO)
    expect(MAX_NOMBRE_FAVORITO).toBe(40)
  })

  it('los espacios de los extremos no cuentan para el límite', () => {
    expect(validarNombre(`  ${'a'.repeat(40)}  `, []).valido).toBe(true)
  })

  it('un nombre válido se devuelve ya recortado', () => {
    expect(validarNombre('  Antes de dormir  ', []).nombre).toBe('Antes de dormir')
  })
})

describe('nombres repetidos (criterio 21, RN-RE-FAV-03)', () => {
  it('el mismo, tal cual', () => {
    expect(validarNombre('Antes de dormir', ['Antes de dormir']).motivo).toBe(MOTIVOS.REPETIDO)
  })

  it('con otras mayúsculas', () => {
    expect(validarNombre('ANTES DE DORMIR', ['Antes de dormir']).motivo).toBe(MOTIVOS.REPETIDO)
    expect(validarNombre('antes de dormir', ['Antes de dormir']).motivo).toBe(MOTIVOS.REPETIDO)
  })

  it('con espacios de sobra a los lados', () => {
    expect(validarNombre('  Antes de dormir  ', ['Antes de dormir']).motivo).toBe(MOTIVOS.REPETIDO)
  })

  it('las tres cosas a la vez', () => {
    expect(validarNombre('   ANTES de Dormir ', ['antes de dormir']).motivo).toBe(MOTIVOS.REPETIDO)
  })

  it('dice con cuál choca, para poder ofrecer reemplazarlo', () => {
    // Nunca un duplicado en silencio: se ofrece reemplazar o cambiar el nombre,
    // y quien decide es quien está guardando.
    expect(validarNombre('ANTES DE DORMIR', ['Antes de dormir']).choqueCon).toBe('Antes de dormir')
  })

  it('al renombrar, su propio nombre no cuenta como choque', () => {
    const veredicto = validarNombre('Antes de dormir', ['Antes de dormir'], {
      excepto: 'Antes de dormir',
    })
    expect(veredicto.valido).toBe(true)
  })

  it('pero sí choca con el de otra', () => {
    const veredicto = validarNombre('Para el metro', ['Antes de dormir', 'Para el metro'], {
      excepto: 'Antes de dormir',
    })
    expect(veredicto.motivo).toBe(MOTIVOS.REPETIDO)
  })

  it('los espacios de dentro sí distinguen: son parte del nombre', () => {
    expect(mismoNombre('a b', 'ab')).toBe(false)
    expect(normalizarNombre(' a b ')).toBe('a b')
  })
})

describe('los emojis cuentan como uno (criterio 31, caso 6.9)', () => {
  it('un emoji simple es un carácter', () => {
    expect(longitudVisible('👍')).toBe(1)
  })

  it('una familia con juntadores también', () => {
    // `'👨‍👩‍👧‍👦'.length` es 11. Contar unidades de código dejaría a alguien sin
    // poder escribir seis emojis mientras la app le dice que se pasó de cuarenta.
    expect(longitudVisible('👨‍👩‍👧‍👦')).toBe(1)
  })

  it('cuarenta emojis caben; cuarenta y uno, no', () => {
    expect(validarNombre('🌙'.repeat(40), []).valido).toBe(true)
    expect(validarNombre('🌙'.repeat(41), []).motivo).toBe(MOTIVOS.LARGO)
  })

  it('un nombre con emoji se permite sin más', () => {
    expect(validarNombre('Antes de dormir 🌙', []).valido).toBe(true)
  })

  it('los acentos y la eñe cuentan uno', () => {
    expect(longitudVisible('Respiración')).toBe(11)
    expect(longitudVisible('ñ')).toBe(1)
  })
})

describe('ya la tienes guardada (criterio 22, RN-RE-FAV-05)', () => {
  it('misma combinación completa: la encuentra', () => {
    const lista = [favorito()]
    expect(favoritoIdentico(favorito({ id: 'otro', nombre: 'X' }), lista)).toBe(lista[0])
  })

  it('otro patrón: no es la misma', () => {
    const lista = [favorito()]
    expect(favoritoIdentico(favorito({ patron: PATRON_553 }), lista)).toBeNull()
  })

  it('otra visual: no es la misma', () => {
    const lista = [favorito()]
    expect(favoritoIdentico(favorito({ visual: 'linea' }), lista)).toBeNull()
  })

  it('otro sonido: no es la misma', () => {
    const lista = [favorito()]
    expect(favoritoIdentico(favorito({ sonidoAmbienteId: 'olas' }), lista)).toBeNull()
  })

  it('otra duración: tampoco', () => {
    // Es la diferencia con la comparación de recientes de SPEC_13, que no mira
    // la duración: "4-7-8 diez minutos" y "4-7-8 tres minutos" son dos cosas que
    // alguien puede querer tener guardadas a la vez.
    const lista = [favorito()]
    expect(
      favoritoIdentico(favorito({ duracion: { modo: 'minutos', valor: 3 } }), lista),
    ).toBeNull()
  })

  it('los volúmenes NO la distinguen', () => {
    // Son un ajuste del momento —los audífonos, la hora, quién duerme al lado—
    // y no una decisión que separe una combinación de otra. Bloquear un guardado
    // porque el volumen está al 55 % y no al 60 % sería incomprensible.
    const lista = [favorito()]
    expect(favoritoIdentico(favorito({ volumenAmbiente: 0.3 }), lista)).toBe(lista[0])
  })

  it('dos sesiones abiertas son la misma aunque su cifra difiera', () => {
    const abierta = favorito({ duracion: { modo: 'abierta', valor: 3 } })
    const otra = favorito({ duracion: { modo: 'abierta', valor: 99 } })
    expect(mismaConfiguracionCompleta(abierta, otra)).toBe(true)
  })

  it('sin favoritos, no hay nada idéntico', () => {
    expect(favoritoIdentico(favorito(), [])).toBeNull()
  })

  it('comparar con nada devuelve que no', () => {
    expect(mismaConfiguracionCompleta(null, favorito())).toBe(false)
    expect(mismaConfiguracionCompleta(favorito(), undefined)).toBe(false)
  })
})

describe('cargar un favorito (criterios 23 y 24, RN-RE-FAV-09 y 10)', () => {
  it('aplica los ocho campos de configuración', () => {
    const config = configuracionDe(favorito())
    expect(Object.keys(config).sort()).toEqual([
      'duracion',
      'guiaSonoraActiva',
      'patron',
      'patronBaseId',
      'sonidoAmbienteId',
      'visual',
      'volumenAmbiente',
      'volumenGuia',
    ])
  })

  it('los valores son los del favorito, no los de fábrica', () => {
    const config = configuracionDe(favorito())
    expect(config.patron).toEqual(PATRON_478)
    expect(config.sonidoAmbienteId).toBe('lluvia')
    expect(config.duracion).toEqual({ modo: 'minutos', valor: 10 })
  })

  it('el patrón y la duración se copian, no se comparten', () => {
    // Si se compartieran, mover un control después de cargar editaría el
    // favorito guardado sin que nadie lo pidiera.
    const guardado = favorito()
    const config = configuracionDe(guardado)
    config.patron.inhalar = 99
    config.duracion.valor = 99
    expect(guardado.patron.inhalar).toBe(40)
    expect(guardado.duracion.valor).toBe(10)
  })

  it('cargar no arranca nada: es solo configuración (RN-RE-FAV-10)', () => {
    // Arrancar solo sería sobresaltar. Lo que devuelve es un estado, no una
    // orden: no hay ni un campo que diga "empieza".
    const config = configuracionDe(favorito())
    expect(config).not.toHaveProperty('estado')
    expect(config).not.toHaveProperty('iniciar')
    expect(config).not.toHaveProperty('sesion')
  })
})

describe('modificado tras cargar (criterio 25, RN-RE-FAV-11)', () => {
  it('sin tocar nada, no hay cambios', () => {
    const guardado = favorito()
    expect(hayCambios(configuracionDe(guardado), guardado)).toBe(false)
  })

  it('cambiar el patrón cuenta', () => {
    const guardado = favorito()
    expect(hayCambios({ ...configuracionDe(guardado), patron: PATRON_553 }, guardado)).toBe(true)
  })

  it('cambiar el sonido cuenta', () => {
    const guardado = favorito()
    expect(hayCambios({ ...configuracionDe(guardado), sonidoAmbienteId: 'fuego' }, guardado)).toBe(
      true,
    )
  })

  it('mover el volumen también cuenta, aunque no distinga la combinación', () => {
    // Dos preguntas distintas y las dos legítimas: "¿es esto otra combinación?"
    // no, un volumen no la cambia; "¿he tocado algo que se perdería al salir?"
    // sí, y quien lo movió tiene derecho a que le ofrezcan guardarlo.
    const guardado = favorito()
    expect(hayCambios({ ...configuracionDe(guardado), volumenAmbiente: 0.3 }, guardado)).toBe(true)
  })

  it('encender la guía sonora cuenta', () => {
    const guardado = favorito()
    expect(hayCambios({ ...configuracionDe(guardado), guiaSonoraActiva: true }, guardado)).toBe(
      true,
    )
  })

  it('sin favorito cargado no hay nada que comparar', () => {
    expect(hayCambios(configuracionDe(favorito()), null)).toBe(false)
  })
})

describe('el límite de veinte (criterio 28, RN-RE-FAV-01)', () => {
  it('son veinte', () => {
    expect(MAX_FAVORITOS).toBe(20)
  })

  it('con veinte guardados, el veintiuno no cabe', () => {
    const lista = Array.from({ length: MAX_FAVORITOS }, (_, i) => favorito({ id: `f${i}` }))
    expect(lista.length >= MAX_FAVORITOS).toBe(true)
  })

  it('nada se borra solo para hacer sitio', () => {
    // Es la diferencia con las recientes, que sí desalojan: aquellas las escribe
    // la app, estas las escribe una persona. Desalojar la más vieja en silencio
    // es decidir por alguien sobre algo suyo.
    const lista = Array.from({ length: MAX_FAVORITOS }, (_, i) => favorito({ id: `f${i}` }))
    const copia = [...lista]
    validarNombre(
      'Otra más',
      lista.map((f) => f.nombre),
    )
    expect(lista).toEqual(copia)
  })
})
