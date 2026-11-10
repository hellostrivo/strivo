// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import ArranqueAlmacen from './components/ArranqueAlmacen'
import { momentoDe } from './lib/timeSlot'
import { fijarBase, textoDeBarra } from './lib/barraEstado'
import { retirarPantallaDeArranque } from './lib/pantallaArranque'
import './styles/globals.css'

// Lo primero, antes que nada que pueda lanzar: la pantalla de arranque de iOS
// no se quita sola, y si esta línea no llega, la app se queda en la «S». Solo
// programa la retirada —tras el primer pintado y su espera—, así que ir antes
// del render no la adelanta. En web no hace nada.
retirarPantallaDeArranque()

// En la app de iPhone, la hora y la batería sobre el velo de los dos instantes
// de arranque, que se pintan antes de que monte ninguna pantalla (SPEC_21.1).
// En web no hace nada.
fijarBase(textoDeBarra({ capa: 'pantalla', momento: momentoDe() }))

// En la app nativa, el almacén se prepara antes de montar la app —abrir
// SQLite, migrar si toca y recuperar el uid— con el velo de siempre delante
// (SPEC_17B). En la web, la app se monta en el primer render, como siempre.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ArranqueAlmacen>
      <App />
    </ArranqueAlmacen>
  </React.StrictMode>,
)
