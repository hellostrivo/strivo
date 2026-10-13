// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { momentoDe } from './lib/timeSlot'
import { fijarBase, textoDeBarra } from './lib/barraEstado'
import { retirarPantallaDeArranque } from './lib/pantallaArranque'
import './styles/globals.css'

// En la app de iPhone, la hora y la batería sobre el velo de los dos instantes
// de arranque, que se pintan antes de que monte ninguna pantalla (SPEC_21.1).
// En web, ninguna de las dos líneas hace nada.
fijarBase(textoDeBarra({ capa: 'pantalla', momento: momentoDe() }))

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

retirarPantallaDeArranque()
