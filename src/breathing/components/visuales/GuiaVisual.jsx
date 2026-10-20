// src/breathing/components/visuales/GuiaVisual.jsx
// Elige qué visual pinta el ritmo. Delgado a propósito.
//
// Lo único que decide es quién dibuja. No toca el motor, así que cambiar de
// círculo a línea a mitad de sesión no interrumpe nada (RN-RE-VIS-29): el ritmo
// sigue corriendo donde siempre, y lo que cambia es quién lo está mirando. El
// cruce de 300 ms lo hace el CSS.
//
// **La referencia (`ref`) no es una prop más.** RN-RE-VIS-01 fija las props de
// una visual en cuatro y esa lista se respeta. Lo que viaja por la referencia
// es el camino imperativo de `pintar()`, que existe precisamente para que el
// estado por frame **no** pase por props y no dispare un render (RN-RE-VIS-33).

import { forwardRef } from 'react'
import { ESTADOS } from '@lib/respiracion/maquinaSesion'
import VisualCirculo from './VisualCirculo'
import VisualLinea from './VisualLinea'

export const VISUALES = Object.freeze(['circulo', 'linea'])
export const VISUAL_POR_DEFECTO = 'circulo'

const GuiaVisual = forwardRef(function GuiaVisual(
  {
    visual = VISUAL_POR_DEFECTO,
    estado,
    patron,
    estadoSesion = ESTADOS.INACTIVO,
    movimientoReducido = false,
  },
  ref,
) {
  const Elegida = visual === 'linea' ? VisualLinea : VisualCirculo

  return (
    <Elegida
      ref={ref}
      estado={estado}
      patron={patron}
      estadoSesion={estadoSesion}
      movimientoReducido={movimientoReducido}
    />
  )
})

export default GuiaVisual
