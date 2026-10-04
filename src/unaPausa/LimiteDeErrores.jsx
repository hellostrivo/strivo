// src/unaPausa/LimiteDeErrores.jsx
// Lo que pase dentro de Una pausa se queda dentro de Una pausa (SPEC_28.3
// §4.5, desvío 3).
//
// Envuelve la ruta de la sección en `App.jsx`. Un error de render dentro pinta
// el estado `error` de la propia sección —con «Reintentar», sin código y sin
// vibrar—, y la cabecera, la barra y las otras cinco pantallas no se enteran:
// están fuera de este límite.
//
// **Lo que un límite de errores no ve** son los errores de los manejadores de
// eventos y de las promesas. Por eso la lectura del canal y la caché no lanzan
// nunca, y `cargarSeccion` no rechaza: lo que fallara ahí no llegaría a este
// límite.
//
// Es la única clase del árbol, y no por gusto: React solo sabe capturar un
// error de render con `getDerivedStateFromError`, que no tiene equivalente en
// hooks. Al salir de la sección la ruta se desmonta y el límite con ella, así
// que volver empieza de cero.

import { Component } from 'react'
import Estado from './Estado.jsx'

export default class LimiteDeErrores extends Component {
  constructor(props) {
    super(props)
    this.state = { fallo: false, vuelta: 0 }
    this.reintentar = this.reintentar.bind(this)
  }

  static getDerivedStateFromError() {
    return { fallo: true }
  }

  /** Vuelve a montar la sección entera, con una `key` nueva. */
  reintentar() {
    this.setState(({ vuelta }) => ({ fallo: false, vuelta: vuelta + 1 }))
  }

  render() {
    if (this.state.fallo) return <Estado estado="error" onReintentar={this.reintentar} enfocar />
    return <div key={this.state.vuelta}>{this.props.children}</div>
  }
}
