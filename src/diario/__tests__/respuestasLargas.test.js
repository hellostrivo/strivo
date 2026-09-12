// src/diario/__tests__/respuestasLargas.test.js
// Las respuestas largas de las dos listas del día y la salida de la noche
// (12 sep 2026).
//
// Tres cosas cambiaron y las tres se vigilan aquí: cada respuesta de la
// gratitud y del reconocimiento cabe en cuatrocientas palabras y se escribe
// en una tarjeta que crece con el texto; lo guardado vuelve numerado, entero y
// con sus párrafos en la consulta y en el Historial; y "Buenas noches" se va
// sola, cinco segundos y medio de desvanecido, sin dejar que "Listo" espere a
// la base de datos ni que un segundo toque cierre la noche dos veces.
//
// Como en el resto del diario, lo que más se comprueba es lo que **no** hay:
// ni tope de caracteres, ni recorte a la vista, ni `disabled`, ni una cuenta
// atrás que no sea la de este archivo.

import { readFileSync } from 'fs'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { copy, interpolate } from '@copy'
import ListaNumerada from '@components/diario/ListaNumerada'
import { SALIDA, DESPEDIDA_VISIBLE } from '@components/diario/noche/CierreDeLaNoche'
import {
  LIMITES,
  MAX_PALABRAS_POR_RESPUESTA,
  PALABRAS_DE_AVISO,
  desdeTextos,
  escribirEn,
  palabrasRestantes,
  textosDe,
} from '@/diario/filas'
import { PREGUNTAS as MANANA, resumenDeManana } from '@/diario/manana'
import { PREGUNTAS as NOCHE, resumenDeNoche } from '@/diario/noche'
import { contarPalabras, recortarAPalabras } from '@/diario/palabras'

const codigoDe = (ruta) =>
  readFileSync(ruta, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')

const FILAS = codigoDe('src/components/diario/FilasDinamicas.jsx')
const CAMPO = codigoDe('src/components/shared/Campo.jsx')
const LISTA = codigoDe('src/components/diario/ListaNumerada.jsx')
const CIERRE = codigoDe('src/components/diario/noche/CierreDeLaNoche.jsx')
const CONTENEDOR = codigoDe('src/components/diario/DiarioNoche.jsx')
const CSS = readFileSync('src/styles/globals.css', 'utf8')

const palabras = (cuantas, palabra = 'gracias') => Array(cuantas).fill(palabra).join(' ')

// ─── Contar palabras ──────────────────────────────────────────────────────────

describe('contar palabras en español', () => {
  it('cuenta palabras con acento y con sus signos pegados', () => {
    expect(contarPalabras('Agradezco la conversación que tuve con mi mamá.')).toBe(8)
    expect(contarPalabras('¿Qué noté en mí? Calma, y un poco de sueño…')).toBe(10)
    expect(contarPalabras('niño, año, señal —así, sin más—')).toBe(6)
  })

  it('un signo suelto no es una palabra, y el espacio de más tampoco', () => {
    expect(contarPalabras('uno — dos ... tres')).toBe(3)
    expect(contarPalabras('   ')).toBe(0)
    expect(contarPalabras('')).toBe(0)
    expect(contarPalabras(null)).toBe(0)
    expect(contarPalabras('  hola  \n\n  mundo  ')).toBe(2)
  })

  it('los saltos de línea separan palabras como los espacios', () => {
    expect(contarPalabras('primer párrafo\n\nsegundo párrafo\ntercera línea')).toBe(6)
  })

  it('recortar deja las primeras palabras y todo lo que hay entre ellas', () => {
    expect(recortarAPalabras('uno dos\ntres cuatro cinco', 3)).toBe('uno dos\ntres')
    expect(recortarAPalabras('uno, dos — tres', 2)).toBe('uno, dos')
    expect(recortarAPalabras('uno dos', 0)).toBe('')
  })

  it('lo que ya cabe vuelve idéntico, con su misma referencia', () => {
    const texto = 'uno dos '
    expect(recortarAPalabras(texto, 3)).toBe(texto)
    expect(recortarAPalabras(texto, 2)).toBe(texto)
  })
})

// ─── El tope por respuesta ────────────────────────────────────────────────────

describe('cada respuesta cabe en cuatrocientas palabras', () => {
  it('el tope es uno, vive con los límites y lo comparten las dos listas', () => {
    expect(MAX_PALABRAS_POR_RESPUESTA).toBe(400)
    expect(LIMITES.gratitudManana.palabras).toBe(400)
    expect(LIMITES.reconocimiento.palabras).toBe(400)
  })

  it('es por respuesta y no por lista: tres respuestas son tres veces el tope', () => {
    let filas = [
      { id: null, texto: '' },
      { id: null, texto: '' },
      { id: null, texto: '' },
    ]
    filas = escribirEn(filas, 0, palabras(400), LIMITES.gratitudManana)
    filas = escribirEn(filas, 1, palabras(400), LIMITES.gratitudManana)
    filas = escribirEn(filas, 2, palabras(400), LIMITES.gratitudManana)
    expect(filas.map((fila) => contarPalabras(fila.texto))).toEqual([400, 400, 400])
    expect(filas).toHaveLength(3)
  })

  it('la palabra cuatrocientos uno no entra; las cuatrocientas se pueden cambiar', () => {
    const [al_tope] = escribirEn(
      [{ id: null, texto: '' }],
      0,
      palabras(400),
      LIMITES.reconocimiento,
    )
    expect(contarPalabras(al_tope.texto)).toBe(400)

    const [conUnaMas] = escribirEn([al_tope], 0, `${al_tope.texto} otra`, LIMITES.reconocimiento)
    expect(conUnaMas.texto).toBe(al_tope.texto)

    // Y al tope, teclear un espacio y una letra no pega la letra a la última
    // palabra: el espacio entra —sigue habiendo cuatrocientas—, la letra no.
    const [conEspacio] = escribirEn([al_tope], 0, `${al_tope.texto} `, LIMITES.reconocimiento)
    expect(conEspacio.texto).toBe(`${al_tope.texto} `)
    const [conLetra] = escribirEn([conEspacio], 0, `${conEspacio.texto}e`, LIMITES.reconocimiento)
    expect(conLetra.texto).toBe(conEspacio.texto)
    expect(conLetra.texto).not.toMatch(/graciase/)

    // Cambiar una de las que ya están sigue siendo posible: mismo número de
    // palabras, otro texto.
    const cambiada = al_tope.texto.replace(/^gracias/, 'gracias,')
    const [editada] = escribirEn([al_tope], 0, cambiada, LIMITES.reconocimiento)
    expect(editada.texto).toBe(cambiada)

    // Y borrar también.
    const [borrada] = escribirEn([al_tope], 0, palabras(12), LIMITES.reconocimiento)
    expect(contarPalabras(borrada.texto)).toBe(12)
  })

  it('pegar más de lo que cabe se queda con las primeras cuatrocientas', () => {
    const [fila] = escribirEn([{ id: null, texto: '' }], 0, palabras(650), LIMITES.gratitudManana)
    expect(contarPalabras(fila.texto)).toBe(400)
  })

  it('no hay tope de caracteres en ningún sitio de la lista', () => {
    // Cuatrocientas palabras largas son muchos más caracteres que los 120 y
    // 160 que había: si quedara un `maxLength`, esto se cortaría.
    const larga = palabras(400, 'reconocimiento')
    const [fila] = escribirEn([{ id: null, texto: '' }], 0, larga, LIMITES.reconocimiento)
    expect(fila.texto).toBe(larga)
    expect(FILAS).not.toMatch(/maxLength/)
    expect(codigoDe('src/components/diario/CampoGratitud.jsx')).not.toMatch(/maxLength/)
  })

  it('sin `palabras` en los límites la mecánica no recorta nada', () => {
    const [fila] = escribirEn([{ id: null, texto: '' }], 0, palabras(500), {
      min: 1,
      max: 3,
      crecerSola: false,
    })
    expect(contarPalabras(fila.texto)).toBe(500)
  })

  it('hasta las trescientas no se dice nada; desde ahí, cuántas quedan', () => {
    expect(PALABRAS_DE_AVISO).toBe(100)
    expect(palabrasRestantes(palabras(0), LIMITES.gratitudManana)).toBe(null)
    expect(palabrasRestantes(palabras(299), LIMITES.gratitudManana)).toBe(null)
    expect(palabrasRestantes(palabras(300), LIMITES.gratitudManana)).toBe(100)
    expect(palabrasRestantes(palabras(356), LIMITES.reconocimiento)).toBe(44)
    expect(palabrasRestantes(palabras(399), LIMITES.reconocimiento)).toBe(1)
    expect(palabrasRestantes(palabras(400), LIMITES.reconocimiento)).toBe(0)
    // Sin tope no hay nada de lo que avisar.
    expect(palabrasRestantes(palabras(400), { min: 1, max: 3 })).toBe(null)
  })

  it('el aviso dice lo pedido, en singular cuando toca, y ya no hay contador', () => {
    const { quedanTemplate, quedaUna, limiteTemplate, contadorTemplate } = copy.diario.filas
    expect(interpolate(quedanTemplate, { n: 100 })).toBe('Te quedan 100 palabras')
    expect(interpolate(quedanTemplate, { n: 44 })).toBe('Te quedan 44 palabras')
    expect(quedaUna).toBe('Te queda 1 palabra')
    expect(interpolate(limiteTemplate, { max: 400 })).toBe('Llegaste al límite de 400 palabras')
    expect(contadorTemplate).toBeUndefined()
    expect(FILAS).not.toMatch(/contadorTemplate|contarPalabras/)
    // Lo decide la regla de las filas, no la pantalla: la pantalla solo elige
    // la frase.
    expect(FILAS).toMatch(/palabrasRestantes\(texto, limites\)/)
    expect(FILAS).toMatch(/restantes === 0/)
    expect(FILAS).toMatch(/restantes === 1/)
    // El campo sabe que ese aviso habla de él.
    expect(FILAS).toMatch(/aria-describedby=\{aviso \? `\$\{idAviso\}-\$\{indice\}` : undefined\}/)
  })
})

// ─── La tarjeta ───────────────────────────────────────────────────────────────

describe('cada respuesta es una tarjeta que crece con el texto', () => {
  it('las filas montan el párrafo que crece, no el campo de una línea', () => {
    expect(FILAS).toMatch(/import \{ CampoParrafo \} from '@components\/shared\/Campo'/)
    expect(FILAS).not.toMatch(/CampoLinea|<input/)
    expect(FILAS).toMatch(/<CampoParrafo/)
  })

  it('abre en una sola línea, a todo el ancho, y crece solo cuando lo escrito lo pide', () => {
    // Una tarjeta vacía es su línea y nada más: ni sitio reservado para
    // párrafos que aún no existen, ni cabecera. El párrafo se mide con lo que
    // hay, así que la segunda línea llega con la segunda línea.
    expect(FILAS).toMatch(/const LINEAS_DE_SALIDA = 1/)
    expect(FILAS).toMatch(/filas=\{LINEAS_DE_SALIDA\}/)
    expect(CAMPO).toMatch(/\{ filas = 1, value, desnudo = false/)
    expect(FILAS).toMatch(
      /w-full flex-col gap-1 rounded-md border border-on-surface bg-strivo-campo/,
    )
  })

  it('sin número mientras se escribe: la numeración es de la lectura', () => {
    // Lo visible de la tarjeta no lleva ordinal; el que queda es el de la
    // etiqueta accesible, para que el lector de pantalla distinga los campos.
    const visible = FILAS.replace(/aria-label=\{`[^`]*`\}/g, '')
    expect(visible).not.toMatch(/\{indice \+ 1\}/)
    expect(FILAS).not.toMatch(/Respuesta \d/)
    // El indicador del recorrido no es de aquí y no se toca.
    expect(codigoDe('src/components/diario/Pasos.jsx')).toMatch(/indicadorTemplate/)
  })

  it('el párrafo mide lo escrito y nunca se desplaza por dentro', () => {
    // `scrollHeight` es lo único que ve las líneas que envuelve el ancho;
    // contar saltos de línea, como hace `CampoTexto`, no las ve.
    const parrafo = CAMPO.slice(CAMPO.indexOf('export const CampoParrafo'))
    expect(parrafo).toMatch(/elemento\.style\.height = `\$\{elemento\.scrollHeight\}px`/)
    expect(parrafo).toMatch(/useLayoutEffect\(medir, \[value\]\)/)
    expect(parrafo).not.toMatch(/filasMax|overflow-y-auto|overflow-auto/)
    // Y vuelve a medir cuando el ancho cambia, que cambia cómo envuelve.
    expect(parrafo).toMatch(/addEventListener\('resize', medir\)/)
    expect(parrafo).toMatch(/removeEventListener\('resize', medir\)/)
  })

  it('nada recorta el texto a la vista: ni puntos suspensivos, ni una línea, ni un clamp', () => {
    ;[FILAS, CAMPO, LISTA].forEach((codigo) =>
      expect(codigo).not.toMatch(/line-clamp|truncate|text-ellipsis|whitespace-nowrap/),
    )
  })

  it('el pie —aviso y "Quitar"— existe solo con texto, va debajo y no mide más que su texto', () => {
    // Debajo y no encima: al escribir el primer carácter aparece bajo el
    // cursor, sin mover el campo que se está tocando. Y con texto está siempre,
    // tenga o no el foco, para que desenfocar no mueva lo que hay debajo.
    expect(FILAS).toMatch(/\{conTexto && \(/)
    expect(FILAS.indexOf('<CampoParrafo')).toBeLessThan(FILAS.indexOf('{conTexto && ('))
    expect(FILAS).toMatch(/items-center justify-end/)
    expect(FILAS).toMatch(/textos\.quitar\b/)
    expect(FILAS).toMatch(/textos\.quitarConfirmar/)
    // La fila no lleva altura mínima: los 44 px del objetivo táctil son del
    // botón y se los come con margen negativo, no de la fila.
    expect(FILAS).not.toMatch(/min-h-touch-sm items-center/)
    expect(FILAS).toMatch(/clsx\(ENLACE, '-my-3'\)/)
    expect(FILAS).toMatch(/'shrink-0 rounded-full px-3 py-2 min-h-touch-sm text-sm'/)
  })

  it('el foco es de la tarjeta entera, y ningún control lleva `disabled`', () => {
    expect(FILAS).toMatch(/focus-within:ring-2/)
    expect(FILAS).not.toMatch(/disabled|required|aria-invalid/)
  })

  it('volver a un paso anterior devuelve el texto exacto, con sus párrafos', () => {
    const escrito = 'Primer párrafo, con calma.\n\nSegundo párrafo,\ncon una línea más.'
    const [fila] = escribirEn([{ id: null, texto: '' }], 0, escrito, LIMITES.gratitudManana)
    expect(fila.texto).toBe(escrito)
    // Lo que se guarda y se relee conserva los saltos de dentro: solo se
    // quitan los espacios de los extremos.
    expect(desdeTextos(textosDe([fila]))).toEqual([{ id: null, texto: escrito }])
  })
})

// ─── La consulta y el Historial ───────────────────────────────────────────────

describe('lo guardado vuelve numerado, entero y con sus párrafos', () => {
  const gratitude = [
    'Agradezco haber tenido un momento tranquilo para mí esta mañana.',
    'Agradezco la conversación que tuve con mi mamá.\n\nY que durara.',
    'Agradezco que, aunque tuve mucho, pude avanzar a mi ritmo.',
  ]
  const recognized = [
    'Hoy me sentí feliz de haber compartido tiempo con alguien importante para mí.',
    'También quiero reconocer que hubo momentos difíciles que pude atravesar.',
  ]

  it('solo las dos listas van numeradas; lo demás escrito es una sola respuesta', () => {
    const manana = resumenDeManana({ gratitude, action: 'Salir', feelings: ['calma'] }, 'n')
    expect(manana.find((b) => b.id === MANANA.gratitud)).toMatchObject({
      numerado: true,
      lineas: gratitude,
    })
    manana.filter((b) => b.id !== MANANA.gratitud).forEach((b) => expect(b.numerado).toBe(false))

    const noche = resumenDeNoche(
      { recognized, reflection: 'Que puedo pedir ayuda', reflectionId: 'agradecer', release: 'x' },
      null,
      'n',
      '2026-09-12',
    )
    expect(noche.find((b) => b.id === NOCHE.reconocimiento)).toMatchObject({
      numerado: true,
      lineas: recognized,
    })
    noche
      .filter((b) => b.id !== NOCHE.reconocimiento)
      .forEach((b) => expect(b.numerado).toBe(false))
  })

  it('el orden es el de añadirlas y los párrafos siguen ahí', () => {
    const [bloque] = resumenDeManana({ gratitude }, 'n')
    expect(bloque.lineas).toEqual(gratitude)
    expect(bloque.lineas[1]).toContain('\n\n')
  })

  it('la lista se pinta una respuesta por elemento, con su número delante', () => {
    const html = renderToStaticMarkup(createElement(ListaNumerada, { lineas: gratitude }))
    expect(html).toMatch(/^<ol role="list"/)
    expect(html.match(/<li/g)).toHaveLength(3)
    expect(html).toMatch(/aria-hidden="true">1\.<\/span>/)
    expect(html).toMatch(/aria-hidden="true">3\.<\/span>/)
    // El párrafo se conserva y se pinta con `whitespace-pre-wrap`, no se une.
    expect(html).toMatch(/whitespace-pre-wrap">Agradezco la conversación[^<]*\n\nY que durara\./)
    expect(html).not.toMatch(/ · /)
  })

  it('las tres pantallas la montan: las dos consultas y la vista de día', () => {
    ;[
      'src/components/diario/manana/ResumenManana.jsx',
      'src/components/diario/noche/ResumenNoche.jsx',
      'src/components/diario/VistaDiaCompleto.jsx',
    ].forEach((ruta) =>
      expect(codigoDe(ruta)).toMatch(
        /import ListaNumerada from '@components\/diario\/ListaNumerada'/,
      ),
    )
    const dia = codigoDe('src/components/diario/VistaDiaCompleto.jsx')
    expect(dia).toMatch(/<ListaNumerada lineas=\{morning\.gratitude\} \/>/)
    expect(dia).toMatch(/<ListaNumerada lineas=\{night\.recognized\} \/>/)
    // La gratitud de las noches de la versión 1 se sigue leyendo, y con la
    // misma forma (RN-DB-04).
    expect(dia).toMatch(/<ListaNumerada lineas=\{night\.gratitude\} \/>/)
    expect(dia).not.toMatch(/function Lista\(/)
  })

  it('en las consultas, qué bloque es lista lo dicen los datos y no la pantalla', () => {
    ;['manana/ResumenManana', 'noche/ResumenNoche'].forEach((nombre) => {
      const codigo = codigoDe(`src/components/diario/${nombre}.jsx`)
      expect(codigo).toMatch(
        /if \(bloque\.numerado\) return <ListaNumerada lineas=\{bloque\.lineas\} \/>/,
      )
      expect(codigo).not.toMatch(/PREGUNTAS\.gratitud|PREGUNTAS\.reconocimiento/)
    })
  })

  it('las entradas ya guardadas se leen igual: el modelo no cambió', () => {
    // Lo que había en `recognized` y `gratitude` eran listas de texto y lo
    // siguen siendo. Una respuesta de una línea de agosto vuelve como "1." y
    // sin transformar.
    const html = renderToStaticMarkup(
      createElement(ListaNumerada, { lineas: ['llamé a mi madre'] }),
    )
    expect(html).toMatch(/1\.<\/span><p[^>]*>llamé a mi madre<\/p>/)
  })
})

// ─── La salida de la noche ────────────────────────────────────────────────────

describe('"Listo" responde en el acto y guarda detrás', () => {
  it('la ceremonia se pone delante antes de que la escritura empiece', () => {
    const terminar = CONTENEDOR.match(/const terminar = \(\) => \{[\s\S]*?\n {2}\}/)[0]
    expect(terminar).not.toMatch(/await/)
    expect(terminar.indexOf("setVista('cierre')")).toBeLessThan(terminar.indexOf('persistir()'))
  })

  it('un segundo toque no cierra la noche dos veces, y sin `disabled`', () => {
    expect(CONTENEDOR).toMatch(/if \(cerrando\.current\) return/)
    expect(CONTENEDOR).toMatch(/cerrando\.current = true/)
    expect(CIERRE).not.toMatch(/disabled|loading=/)
    // El botón de la ceremonia se va con el primer toque: no hay segundo.
    expect(CIERRE).toMatch(/\{!despidiendo && \(/)
  })

  it('lo pendiente se vuelca antes de la marca de cierre, en una sola escritura', () => {
    const persistir = CONTENEDOR.match(/const persistir = async \(\) => \{[\s\S]*?\n {2}\}/)[0]
    expect(persistir.indexOf('acciones.volcar()')).toBeLessThan(persistir.indexOf('completedAt'))
    expect(persistir.match(/await guardar\(/g)).toHaveLength(1)
    expect(persistir).toMatch(/setGuardado\(resultado \? 'listo' : 'fallo'\)/)
  })

  it('"Buenas noches" solo se dice con la noche guardada; si falló, se reintenta', () => {
    expect(CIERRE).toMatch(/despidiendo && guardado === 'listo' && \(/)
    expect(CIERRE).toMatch(/despidiendo && guardado === 'fallo' && \(/)
    expect(CIERRE).toMatch(/\{error\.body\}/)
    expect(CIERRE).toMatch(/onClick=\{onReintentar\}/)
    expect(CONTENEDOR).toMatch(/onReintentar=\{persistir\}/)
    // Sin rueda que gire mientras tanto (RN-EST-02).
    expect(CIERRE).not.toMatch(/Spinner|animate-spin/)
  })
})

describe('la despedida se va sola: cinco segundos y medio de desvanecido', () => {
  const regla = CSS.match(/\.salida-cierre \{[\s\S]*?\n {2}\}/)[0]

  it('dura lo que pide el encargo', () => {
    expect(DESPEDIDA_VISIBLE).toBe(5000)
    expect(SALIDA).toBe(500)
    expect(SALIDA).toBeGreaterThanOrEqual(400)
    expect(SALIDA).toBeLessThanOrEqual(600)
  })

  it('el desvanecido dura lo mismo en el componente y en la hoja', () => {
    const [, enLaHoja] = regla.match(/salida-cierre (\d+)ms/)
    expect(Number(enLaHoja)).toBe(SALIDA)
    const [, enElComponente] = CIERRE.match(/const SALIDA = (\d+)/)
    expect(Number(enElComponente)).toBe(SALIDA)
  })

  it('es solo opacidad, con la curva de los velos y sin volver a aparecer', () => {
    const fotogramas = CSS.match(/@keyframes salida-cierre \{[\s\S]*?\n\}/)[0]
    expect(fotogramas).toMatch(/from \{ opacity: 1; \}/)
    expect(fotogramas).toMatch(/to {3}\{ opacity: 0; \}/)
    expect(fotogramas).not.toMatch(/transform|background|color|filter/)
    expect(regla).toMatch(/cubic-bezier\(0\.4, 0, 0\.2, 1\) forwards/)
  })

  it('el reloj arranca con la despedida y vuelve a Hoy al acabar el desvanecido', () => {
    expect(CIERRE).toMatch(/if \(!despidiendo \|\| guardado !== 'listo'\) return undefined/)
    expect(CIERRE).toMatch(/setSaliendo\(true\)\), DESPEDIDA_VISIBLE\)/)
    expect(CIERRE).toMatch(/setTimeout\(terminar, DESPEDIDA_VISIBLE \+ SALIDA\)/)
    expect(CIERRE).toMatch(/saliendo && 'salida-cierre'/)
    expect(CONTENEDOR).toMatch(
      /onTerminar=\{\(\) => \{\s*cerrando\.current = false\s*setVista\('resumen'\)/,
    )
  })

  it('los relojes se limpian al desmontarse y terminar es una sola vez', () => {
    expect(CIERRE).toMatch(/return \(\) => relojes\.forEach\(clearTimeout\)/)
    expect(CIERRE).toMatch(/if \(terminado\.current\) return/)
    // La forma de volver se lee por referencia: que el padre vuelva a pintar
    // no reinicia la cuenta.
    expect(CIERRE).toMatch(/alTerminar\.current = onTerminar/)
    expect(CIERRE).toMatch(/\}, \[despidiendo, guardado\]\)/)
  })

  it('tocar la despedida sigue saltando la espera', () => {
    expect(CIERRE).toMatch(/onClick=\{terminar\}/)
  })

  it('con "reducir movimiento" no hay desvanecido: se vuelve a los cinco segundos', () => {
    expect(CIERRE).toMatch(
      /import \{ prefiereMenosMovimiento \} from '@components\/shared\/TransicionLuz'/,
    )
    expect(CIERRE).toMatch(/sinMovimiento \? terminar\(\) : setSaliendo\(true\)/)
    expect(CIERRE).toMatch(/if \(!sinMovimiento\) relojes\.push/)
  })

  it('la despedida dice lo de siempre, y nada más', () => {
    expect(copy.diario.noche.cierre.despedida).toBe('Buenas noches.')
    expect(copy.diario.noche.cierre.reabrir).toBe('Puedes volver y cambiar lo que quieras.')
  })
})
