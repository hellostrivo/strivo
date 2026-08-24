// src/pages/Home.jsx
// El Home de Strivo: por donde se entra a la app (revisión de §C0.2, 19 ago).
//
// **Strivo pasa a ser un destino, y es un cambio consciente.** §C0.2 dice que
// la marca madre no se usa directamente y §C7.3 que la barra de dos pestañas es
// el único cruce entre espacios. Lo decidió el propietario del producto: cada
// apertura aterriza aquí y para cambiar de espacio se vuelve a pasar por este
// vestíbulo. Lo que no cambia es RN-DB4-01 — esta pantalla no lee datos de
// ninguno de los dos, solo abre sus puertas.
//
// **La bienvenida no lleva texto.** Es el símbolo, su luz y nada más. Ni frase,
// ni saludo, ni fecha: la frase de apertura es del umbral de Lumia y se dispara
// al elegirlo, un segundo después. Dos textos seguidos serían dos voces antes
// de haber hecho nada, y el saludo dinámico es R2, suprimido de raíz (Anexo E).
//
// **Vive por encima de los dos espacios**, como `ArranqueProvisional`, y por eso
// es de los pocos sitios autorizados a nombrarlos a la vez. No cruza datos: solo
// enruta.
//
// El cromo es el neutro conector de Strivo (manual §4.2): sin `data-space`, el
// tema deja los `--strivo-*`, que no cambian con el momento del día (§4.1).
//
// **El Home vuelve a tener dos accesos y solo dos (24 ago).** SPEC_16 le añadió
// un tercero, subordinado, para Respiración; ahora esa herramienta es una
// sección de Lumia y se entra por su pestaña. Con ello se retiran
// `AccesoRespiracion.jsx` y `copy.respiracion.home`, y quedan derogadas
// RN-RE-NAV-01 a 08c —toda la jerarquía de tres niveles de este vestíbulo—.
// Lo decidió el propietario del producto.
//
// Lo que no cambia es el argumento de fondo de SPEC_16: **Respiración no es un
// espacio.** Antes se sostenía haciéndola subordinada aquí; ahora se sostiene
// dándole el sitio que le corresponde —una sección dentro del espacio que la
// usa— en vez de una categoría propia junto a las dos marcas.

import { Link } from 'react-router-dom'
import { clsx } from 'clsx'
import Simbolo from '@components/shared/Simbolo'
import { copy } from '@copy'

const textos = copy.shared.home

export default function Home({ rutaDe }) {
  const espacios = [
    { id: 'lumia', ...textos.lumia },
    { id: 'formia', ...textos.formia },
  ]

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-12 px-6 py-12">
      <div className="relative flex items-center justify-center">
        {/* La luz que acompaña al símbolo. Decorativa: no dice nada que el
            símbolo no diga ya. */}
        <span
          aria-hidden="true"
          className="bienvenida-luz pointer-events-none absolute h-64 w-64 rounded-full"
        />
        <span className="bienvenida-simbolo relative">
          <Simbolo marca="strivo" alto={72} titulo={textos.simbolo} />
        </span>
      </div>

      <nav aria-label={textos.espaciosLabel} className="flex w-full max-w-sm flex-col gap-3">
        <ul className="flex flex-col gap-3">
          {espacios.map((espacio) => (
            <li key={espacio.id}>
              <Link
                to={rutaDe(espacio.id)}
                className={clsx(
                  'flex flex-col gap-1 rounded-lg border border-espacio px-5 py-4',
                  'min-h-touch bg-raised',
                  'transition-colors duration-260 ease-smooth motion-reduce:transition-none',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30',
                )}
              >
                <span className="flex items-center gap-2 font-display text-md text-on-surface">
                  <Simbolo marca={espacio.id} alto={20} />
                  {espacio.titulo}
                </span>
                <span className="text-sm text-on-surface-soft">{espacio.pregunta}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
