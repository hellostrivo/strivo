// src/lumia/__tests__/victorias.test.js
// Victorias: se escriben por la mañana, se deciden por la noche
// (RN-VM-02, RN-VN-03 · §5.4, criterios 1, 2 y 3).

import { beforeEach, describe, expect, it } from 'vitest'

import { lumia } from '@/lib/db'
import { UID, resetLocalDB } from '../../lib/db/__tests__/helpers.js'
import { desdeRegistros, filasIniciales, LIMITES } from '../filas.js'
import {
  alternarLograda,
  cargar,
  contarLogradas,
  dejarIr,
  deducirIdentidad,
  guardarFilas,
  pasarAManana,
  vieneDeOtroDia,
  visiblesDeNoche,
} from '../victorias.js'

const HOY = '2026-08-10'
const MANANA = '2026-08-11'

const fila = (texto, id = null) => ({ id, texto })

async function conVictorias(...textos) {
  return guardarFilas(UID, HOY, textos.map((texto) => fila(texto)))
}

describe('victorias', () => {
  beforeEach(resetLocalDB)

  it('guarda las filas escritas y descarta las vacías', async () => {
    const victorias = await guardarFilas(UID, HOY, [
      fila('terminar la propuesta'),
      fila('  '),
      fila('llamar a mi hermana'),
    ])
    expect(victorias.map((victoria) => victoria.text)).toEqual([
      'terminar la propuesta',
      'llamar a mi hermana',
    ])
    expect(victorias.every((victoria) => victoria.state === 'pendiente')).toBe(true)
  })

  it('las devuelve en el mismo orden en que se escribieron', async () => {
    await conVictorias('uno', 'dos', 'tres')
    const leidas = await cargar(UID, HOY)
    expect(leidas.map((victoria) => victoria.text)).toEqual(['uno', 'dos', 'tres'])
  })

  it('vuelve a guardar sin duplicar: la fila ya tiene id', async () => {
    const primeras = await conVictorias('correr')
    const filas = filasIniciales(desdeRegistros(primeras), LIMITES.victorias)
    const segundas = await guardarFilas(UID, HOY, filas)
    expect(segundas).toHaveLength(1)
  })

  // Escribir en la victoria 2 saca el foco de la victoria 1, y eso dispara un
  // guardado. Si el segundo guardado parte de la lista que tenía la pantalla
  // antes del primero, la victoria 1 se crea dos veces.
  it('no duplica cuando dos guardados se pisan', async () => {
    const primeras = await conVictorias('salir a correr')
    const conId = filasIniciales(desdeRegistros(primeras), LIMITES.victorias)
    conId[1] = { id: null, texto: 'llamar a mi hermana' }

    const victorias = await guardarFilas(UID, HOY, conId)
    expect(victorias.map((victoria) => victoria.text)).toEqual([
      'salir a correr',
      'llamar a mi hermana',
    ])
  })

  it('editar el texto de una victoria no crea otra', async () => {
    const [victoria] = await conVictorias('correr')
    const victorias = await guardarFilas(UID, HOY, [{ id: victoria.id, texto: 'salir a correr' }])
    expect(victorias).toHaveLength(1)
    expect(victorias[0].text).toBe('salir a correr')
  })

  it('vaciar una fila borra la victoria, no la archiva', async () => {
    const victorias = await conVictorias('un error de dedo')
    const filas = [{ id: victorias[0].id, texto: '' }]
    expect(await guardarFilas(UID, HOY, filas)).toHaveLength(0)
  })

  it('deduce el vínculo con una identidad del texto, y solo si es claro', async () => {
    expect(deducirIdentidad('salir a correr')).toBe('salud')
    expect(deducirIdentidad('llamar a un cliente')).toBeNull() // dos señales: no hay señal
    expect(deducirIdentidad('resolver lo de siempre')).toBeNull()

    const [victoria] = await conVictorias('salir a correr')
    expect(victoria.identityRef).toBe('salud')
  })

  it('no exige identidad: una victoria sin señal se guarda igual', async () => {
    const [victoria] = await conVictorias('un día tranquilo')
    expect(victoria.identityRef).toBeUndefined()
  })

  it('marcar como lograda es un toque, y es reversible', async () => {
    const [victoria] = await conVictorias('caminar')
    const logradas = await alternarLograda(UID, victoria)
    expect(logradas[0].state).toBe('lograda')
    expect(contarLogradas(logradas)).toBe(1)

    const devueltas = await alternarLograda(UID, logradas[0])
    expect(devueltas[0].state).toBe('pendiente')
  })

  it('"pasarla a mañana" la crea en el día siguiente con marca de origen', async () => {
    const [victoria] = await conVictorias('llamar a mi hermana')
    const deHoy = await pasarAManana(UID, victoria)

    expect(deHoy[0].state).toBe('no_se_dio')

    const deManana = await cargar(UID, MANANA)
    expect(deManana).toHaveLength(1)
    expect(deManana[0].text).toBe('llamar a mi hermana')
    expect(deManana[0].state).toBe('pendiente')
    expect(deManana[0].originId).toBe(victoria.id)
    expect(vieneDeOtroDia(deManana[0])).toBe(true)
  })

  it('una victoria que se mueve dos veces conserva el origen de la cadena', async () => {
    const [victoria] = await conVictorias('la propuesta')
    await pasarAManana(UID, victoria)
    const [enManana] = await cargar(UID, MANANA)
    await pasarAManana(UID, enManana)

    const [pasadoManana] = await cargar(UID, '2026-08-12')
    expect(pasadoManana.originId).toBe(victoria.id)
  })

  it('"dejarla ir" la archiva sin borrarla y la retira de la noche', async () => {
    const [victoria] = await conVictorias('ir al gimnasio')
    const victorias = await dejarIr(UID, victoria)

    expect(victorias[0].state).toBe('soltada')
    expect(await lumia.getVictory(UID, victoria.id)).not.toBeNull()
    expect(visiblesDeNoche(victorias)).toHaveLength(0)
  })

  it('las de la mañana aparecen en la noche del mismo día', async () => {
    await conVictorias('uno', 'dos')
    const deLaNoche = visiblesDeNoche(await cargar(UID, HOY))
    expect(deLaNoche.map((victoria) => victoria.text)).toEqual(['uno', 'dos'])
  })

  it('lo escrito de noche sin victorias previas nace logrado', async () => {
    const victorias = await guardarFilas(
      UID,
      HOY,
      [fila('sostuve una conversación difícil')],
      'lograda',
    )
    expect(victorias[0].state).toBe('lograda')
  })
})
