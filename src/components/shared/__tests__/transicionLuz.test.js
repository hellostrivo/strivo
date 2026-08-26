// src/components/shared/__tests__/transicionLuz.test.js
// La transición de entrada (§C7.5).
//
// El riesgo de esta spec es de diseño, no de código: cada cosa que se añada a
// la transición la acerca al wizard del Anexo E. Por eso la mitad de estas
// pruebas no comprueban qué hace la pieza, sino qué **no** hace y qué no se le
// ha añadido.
//
// **Revisión del paso 8 del plan de separación técnica (25 ago 2026).** El
// umbral ya no distingue destino: se cruza una vez al abrir la app y otra vez
// —la misma— al aparecer la sección Mañana. Con eso se deroga el bloque que
// custodiaba la entrada al segundo producto, y el "uno por espacio" pasa a ser
// "uno por sesión", que es lo que la regla decía de verdad (RN-LU-MAN-02).
//
// **El video de apertura (25 ago 2026, mismo día, decisión posterior).** Al
// abrir la app, dentro del velo va el video de marca en lugar de la frase. Es un
// cambio de contenido, no de estructura, y por eso este archivo se amplía en vez
// de partirse: **el umbral sigue siendo uno solo**, con su temporizador, su
// superficie que lo salta entera y su nada que decidir.
//
// Lo que NO cambia, y conviene decirlo porque es lo que más fácil se pierde de
// vista al añadir un fotograma: la frase sigue viva. Es el umbral de la mañana
// (`Hoy.jsx`), que es el otro montaje de esta misma pieza, así que el repertorio
// de §C7.5 conserva su consumidor y las pruebas de repertorio y de voz siguen
// midiendo algo que se ve.

import { readFileSync, readdirSync } from 'fs'
import { beforeEach, describe, expect, it } from 'vitest'

import { copy } from '@copy'
import { FRASES, TEMAS, fraseDeApertura, olvidarUltima } from '@/content/frases-apertura'

const COMPONENTE = 'src/components/shared/TransicionLuz.jsx'
const REPERTORIO = 'src/content/frases-apertura.js'
const APP = 'src/App.jsx'
const HOY = 'src/pages/diario/Hoy.jsx'
// El tercer sitio que lo monta, desde F-1B: el onboarding abre con el mismo
// umbral que cualquier otra apertura de la app. No es una variante suya —no
// existe tal cosa—, es esta misma pieza montada antes de que haya secciones.
const ONBOARDING = 'src/components/onboarding/Onboarding.jsx'
const MONTAN = [APP, HOY, ONBOARDING]

function codigoDe(ruta) {
  return readFileSync(ruta, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
}

beforeEach(() => {
  olvidarUltima()
})

describe('el repertorio (criterio 7)', () => {
  it('vive en content/, no dentro del componente', () => {
    expect(FRASES.length).toBeGreaterThan(90)
    const componente = codigoDe(COMPONENTE)
    expect(componente).toMatch(/from '@\/content\/frases-apertura'/)
    // Ni una frase escrita a mano dentro del componente.
    FRASES.slice(0, 10).forEach((frase) => expect(componente).not.toContain(frase.texto))
  })

  it('son cien de gratitud y amabilidad', () => {
    expect(FRASES).toHaveLength(100)
    FRASES.forEach((frase) => expect(TEMAS).toContain(frase.tema))
    TEMAS.forEach((tema) => {
      expect(FRASES.filter((frase) => frase.tema === tema).length).toBeGreaterThan(30)
    })
  })

  it('no hay dos frases repetidas', () => {
    expect(new Set(FRASES.map((frase) => frase.texto)).size).toBe(FRASES.length)
  })

  it('ninguna repite una frase del día: son dos repertorios distintos', async () => {
    const { FRASES: DEL_DIA } = await import('@/content/frases-del-dia')
    const deApertura = new Set(FRASES.map((frase) => frase.texto))
    DEL_DIA.forEach((frase) => expect(deApertura.has(frase.texto)).toBe(false))
  })
})

describe('la voz del repertorio (§3.6)', () => {
  it('sin exclamaciones', () => {
    FRASES.forEach((frase) => expect(frase.texto).not.toMatch(/[¡!]/))
  })

  it('sin léxico prohibido ni vocabulario de hábitos', () => {
    const prohibido =
      /fallaste|incumpliste|abandonaste|deber[íi]as?|tendr[íi]as?|\btareas?\b|h[áa]bito|racha|constancia|debilidad/i
    FRASES.forEach((frase) => expect(frase.texto).not.toMatch(prohibido))
  })

  it('sin promesas de beneficio ni lenguaje de coach', () => {
    // La transición es un umbral de cinco segundos, no un consejo. Una frase
    // que promete o que da instrucciones convierte el umbral en la primera
    // pantalla de un wizard.
    const prohibido =
      /te vas a sentir|ser[áa]s más|conseguir[áa]s|lograr[áa]s|tu mejor versión|vamos a por/i
    FRASES.forEach((frase) => expect(frase.texto).not.toMatch(prohibido))
  })

  it('son breves: se leen en cinco segundos', () => {
    FRASES.forEach((frase) => expect(frase.texto.length).toBeLessThanOrEqual(72))
  })
})

describe('la elección (criterio 6)', () => {
  it('nunca devuelve la misma dos veces seguidas', () => {
    let anterior = null
    for (let i = 0; i < 300; i += 1) {
      const frase = fraseDeApertura()
      expect(frase.texto).not.toBe(anterior)
      anterior = frase.texto
    }
  })

  it('es al azar: en cien tiradas salen muchas distintas', () => {
    const vistas = new Set()
    for (let i = 0; i < 100; i += 1) vistas.add(fraseDeApertura().texto)
    expect(vistas.size).toBeGreaterThan(30)
  })

  it('con un azar fijo, la segunda no es la primera', () => {
    // El caso que romperia el criterio 6: una fuente de azar que siempre
    // devuelve lo mismo. La frase anterior sale del bombo, así que la segunda
    // tirada cae en otra.
    const primera = fraseDeApertura({ azar: () => 0 })
    const segunda = fraseDeApertura({ azar: () => 0 })
    expect(segunda.texto).not.toBe(primera.texto)
  })

  it('no persiste cuál tocó: no hay modelo de datos (§5)', () => {
    const codigo = codigoDe(REPERTORIO)
    expect(codigo).not.toMatch(/localStorage|indexedDB|lib\/db/)
  })
})

describe('es un umbral, no una secuencia (RN-LU-MAN-02, criterios 2 y 3)', () => {
  const componente = codigoDe(COMPONENTE)

  it('no tiene botón de continuar ni ningún paso', () => {
    expect(componente).not.toMatch(/continuar|siguiente|\bpaso\b/i)
    // Sin la `i`: se busca el componente `<Button>`, no el elemento nativo.
    expect(componente).not.toMatch(/<Button/)
    // Un solo elemento interactivo: la propia superficie, que la salta.
    expect(componente.match(/<button/g) ?? []).toHaveLength(1)
  })

  it('no hace ninguna pregunta ni pide ningún dato', () => {
    expect(componente).not.toMatch(/\?|input|textarea|onChange/i)
  })

  it('se salta con un toque en cualquier sitio', () => {
    expect(componente).toMatch(/onClick=\{terminar\}/)
    expect(componente).toMatch(/fixed inset-0/)
  })

  it('se va sola sin que nadie la toque', () => {
    expect(componente).toMatch(/setTimeout\(terminar, DURACION\)/)
  })

  it('no reconstruye R2: no hay saludo, ni fecha, ni nada dinámico', () => {
    // R2 —la bienvenida dinámica— se suprimió de raíz y no se reubica en
    // ningún producto (Anexo E, E.0). Lo que sobrevive es el encabezado del
    // héroe, que ya estaba desde SPEC_06 y no pasa por aquí.
    expect(componente).not.toMatch(/saludo|nombre|fecha|Buenos d[íi]as/i)
  })
})

describe('no dispara la respiración (RN-LU-MAN-03, criterio 4)', () => {
  it('la transición no sabe que la respiración existe', () => {
    expect(codigoDe(COMPONENTE)).not.toMatch(/respiraci[óo]n|Respiracion/i)
  })

  it('mostrar la mañana no arranca ningún ejercicio', () => {
    // El umbral se cruza al mostrarse la sección, ahora que el Diario se
    // escribe en Hoy y ya no hay botón que lleve a él. Lo que no cambia es que
    // ese camino no toca la respiración: se entra a ella por su enlace.
    const hoy = codigoDe(HOY)
    const efecto =
      hoy.match(/useEffect\(\(\) => \{[\s\S]*?umbralPendiente[\s\S]*?\n {2}\}/)?.[0] ?? ''
    expect(efecto).toMatch(/umbral/i)
    expect(efecto).not.toMatch(/respiracion/i)
  })
})

describe('la misma pieza en los tres sitios (RN-LU-MAN-01, criterio 1)', () => {
  it('la app, la mañana y el onboarding importan el mismo componente', () => {
    // El alias da igual —`@/components` y `@components` resuelven al mismo
    // sitio—; lo que importa es que los tres importen el mismo módulo.
    const mismoModulo = /import TransicionLuz.*from '@\/?components\/shared\/TransicionLuz'/
    MONTAN.forEach((ruta) => expect(codigoDe(ruta)).toMatch(mismoModulo))
  })

  it('no hay una segunda variante en ningún sitio', () => {
    // Si aparece una copia específica de Mañana, el wizard ha empezado a volver.
    const sospechosos = ['Transicion', 'Umbral', 'Splash'].flatMap((nombre) =>
      [
        `src/components/diario/${nombre}Manana.jsx`,
        `src/components/diario/${nombre}.jsx`,
        `src/components/shared/${nombre}Manana.jsx`,
      ].filter((ruta) => {
        try {
          readFileSync(ruta)
          return true
        } catch {
          return false
        }
      }),
    )
    expect(sospechosos).toEqual([])
  })

  it('el componente es compartido de verdad: no conoce la sección que lo monta', () => {
    // Pierde una de sus tres mitades por el mismo motivo que la de
    // `Respiracion.jsx`: solo queda un producto al que no puede alcanzar.
    const imports = codigoDe(COMPONENTE).match(/^\s*import[\s\S]*?from\s+'[^']+'/gm) ?? []
    imports.forEach((linea) => expect(linea).not.toMatch(/diario|lib\/db/i))
  })
})

describe('un solo umbral por sesión (nota de producto, 19 ago · revisada 25 ago)', () => {
  const UMBRAL = 'src/lib/umbralSesion.js'

  it('el contador vive fuera de las dos pantallas que lo consultan', () => {
    MONTAN.forEach((ruta) => {
      expect(codigoDe(ruta)).toMatch(/from '@lib\/umbralSesion'/)
      // Ninguna de las dos guarda su propia cuenta: si lo hicieran, abrir la app
      // y ver la mañana encadenaría dos umbrales seguidos.
      expect(codigoDe(ruta)).not.toMatch(/let umbralCruzado/)
    })
  })

  it('las dos lo consultan con la misma clave, o no se gastarían el mismo', () => {
    // **Deroga** "uno por espacio": ya no hay un segundo espacio con su propio
    // umbral. Lo que queda es lo que la regla protegía —abrir y ver la mañana
    // enseguida no encadena dos umbrales (RN-LU-MAN-02)— y eso solo se cumple
    // si los dos usos nombran la misma clave.
    //
    // **Son seis desde F-1B: tres sitios que preguntan y gastan el mismo
    // contador.** El del onboarding es el que más se nota, porque es el que
    // evita el encadenamiento: si el video se ve al empezar el recorrido, al
    // terminarlo las secciones se montan con el contador ya gastado y no lo
    // repiten. Sin regla nueva y sin nada que `App` tenga que dar por hecho.
    const claves = MONTAN.flatMap(
      (ruta) => codigoDe(ruta).match(/(?:umbralPendiente|cruzarUmbral)\('(\w+)'\)/g) ?? [],
    )
    expect(claves.length).toBe(6)
    expect(new Set(claves.map((c) => c.match(/'(\w+)'/)[1])).size).toBe(1)
  })

  it('abrir la app lo consume, y la mañana ya no lo repite', async () => {
    const { cruzarUmbral, olvidarUmbrales, umbralPendiente } = await import('@lib/umbralSesion')
    olvidarUmbrales()
    expect(umbralPendiente('diario')).toBe(true)
    cruzarUmbral('diario')
    expect(umbralPendiente('diario')).toBe(false)
    olvidarUmbrales()
  })

  it('no se persiste: cerrar la app y volver mañana lo devuelve (§5)', () => {
    expect(codigoDe(UMBRAL)).not.toMatch(/localStorage|indexedDB|lib\/db/)
  })
})

// **Se elimina el bloque de la entrada al segundo producto.** Custodiaba un
// placeholder —la misma pieza sin frase, con otra paleta— y la regla que
// vigilaba era que la frase de apertura pertenece a este producto y no se
// presta. Sin un segundo destino, no hay a quién no prestársela.
//
// Lo que sí queda vivo de allí es el velo, que sigue teniendo que teñirse solo:
// el componente es compartido y no puede nombrar una paleta.
describe('el velo lo pone el tema, no el componente (SPEC_10)', () => {
  const css = readFileSync('src/styles/globals.css', 'utf8')

  it('el componente no nombra ni un color', () => {
    expect(codigoDe(COMPONENTE)).not.toMatch(/#[0-9a-f]{3,8}/i)
    expect(codigoDe(COMPONENTE)).toMatch(/velo-transicion/)
  })

  it('la variante nocturna existe y sale de la paleta del momento', () => {
    const bloque = css.match(/\[data-moment='noche'\] \{[^}]*--transicion-velo[\s\S]*?\n\}/)?.[0]
    expect(bloque).toBeTruthy()
    expect(bloque).toMatch(/var\(--color-night\)/)
  })
})

describe('con reducir movimiento es inmediata (criterio 5)', () => {
  it('los dos usos consultan la preferencia antes de montarla', () => {
    // Cada uno la escribe en el sentido que le pide su guarda —`App` sale si la
    // preferencia está puesta, `Hoy` entra si no lo está— y lo que se comprueba
    // es que ninguno de los dos monta el umbral sin haber preguntado.
    MONTAN.forEach((ruta) => expect(codigoDe(ruta)).toMatch(/prefiereMenosMovimiento\(\)/))
  })

  it('el componente expone la consulta en un solo sitio', () => {
    expect(codigoDe(COMPONENTE)).toMatch(/prefers-reduced-motion: reduce/)
  })

  // **Sigue en pie con el video, y esa fue la decisión (25 ago).** Se valoró que
  // con la preferencia puesta el umbral se montara igual, con el logo quieto en
  // lugar del video. Se descartó: RN-VIS-05 dice que con movimiento reducido el
  // umbral **no se muestra**, y cambiarlo habría metido cinco segundos de velo a
  // quien pidió justo lo contrario. Entrar sigue siendo inmediato.
  it('con la preferencia puesta no se monta ningún umbral, tampoco el del video', () => {
    const app = codigoDe(APP)
    // **La guarda es el propio valor inicial del estado** (26 ago): el umbral
    // nace decidido y no hay forma de encenderlo sin haber preguntado. Antes la
    // guarda vivía en un efecto, que corre después del primer pintado — un
    // fotograma en el que la pantalla de detrás asomaba antes del video.
    expect(app).toMatch(/function hayUmbral\(\)[\s\S]*?prefiereMenosMovimiento\(\)/)
    expect(app).toMatch(/useState\(hayUmbral\)/)
    expect(app).not.toMatch(/setEntrando\(true\)/)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// El video de apertura (25 de agosto de 2026).
//
// **Lo que sustituye:** la frase, y solo al abrir la app. No sustituye el
// umbral, ni el temporizador, ni la superficie que lo salta — esos tres siguen
// siendo los mismos y sus pruebas siguen arriba, sin tocar.
//
// La mitad de este bloque comprueba autoplay en iOS, que es donde esto se rompe
// de verdad: un `<video>` sin `muted` no arranca en Safari y el umbral se queda
// quieto delante de alguien. La otra mitad comprueba que sigue sin poder
// bloquear a nadie.
describe('el video de apertura: se reproduce una vez y se va', () => {
  const componente = codigoDe(COMPONENTE)
  const video = componente.match(/<video[\s\S]*?\/>/)[0]

  it('hay uno, y uno solo', () => {
    expect(componente.match(/<video/g)).toHaveLength(1)
  })

  it('el archivo está en disco y el componente lo importa', () => {
    expect(componente).toMatch(/from '@\/assets\/marca\/strivo_apertura\.mp4'/)
    expect(() => readFileSync('src/assets/marca/strivo_apertura.mp4')).not.toThrow()
  })

  // **Por qué el archivo se renombró al integrarlo.** Llegó como
  // `Strivo_Apertura_Respiración.mp4`, y la ruta del `import` habría metido la
  // palabra "Respiración" dentro de este componente, que tiene prohibido
  // nombrarla (RN-LU-MAN-03, la prueba de más arriba). Lo habría roto por el
  // nombre de un archivo, que es el motivo equivocado. La tilde, además, viaja
  // percent-encoded desde el hospedaje y es una fuente conocida de 404.
  it('su nombre no nombra lo que este componente no puede nombrar', () => {
    expect(readdirSync('src/assets/marca')).not.toContain('Strivo_Apertura_Respiración.mp4')
    expect(readdirSync('src/assets/marca').join(' ')).not.toMatch(/[^\x00-\x7F]/)
  })

  it('se reproduce una sola vez: no lleva `loop`', () => {
    expect(video).not.toMatch(/\bloop\b/)
  })

  it('lleva los tres atributos que el autoplay de iOS exige', () => {
    // Sin cualquiera de los tres, Safari en iPhone —y la PWA instalada— rechaza
    // la reproducción y espera un toque que aquí no va a llegar.
    expect(video).toMatch(/\bautoPlay\b/)
    expect(video).toMatch(/\bmuted\b/)
    expect(video).toMatch(/\bplaysInline\b/)
  })

  it('el silencio se repite sobre el nodo, porque React no siempre lo escribe', () => {
    // Es el defecto clásico: el atributo `muted` de React no llega al DOM y el
    // navegador bloquea el autoplay de un video que en el JSX parece mudo.
    expect(componente).toMatch(/\.muted = true/)
    expect(componente).toMatch(/\.play\(\)/)
  })

  it('no pide sonido ni ofrece controles: la app es muda por defecto (RN-RE-11)', () => {
    expect(video).not.toMatch(/\bcontrols\b/)
    expect(componente).not.toMatch(/volume|unmute|audio/i)
  })

  it('al terminar el video termina el umbral', () => {
    expect(video).toMatch(/onEnded=\{terminar\}/)
  })

  it('si el video falla, el umbral se va igual y sin decir nada (RN-EST-05)', () => {
    // Un error de reproducción no es un error visible: no hay mensaje, no hay
    // código, no hay reintento. Se sale, que es lo que se iba a hacer.
    expect(video).toMatch(/onError=\{terminar\}/)
    expect(componente).not.toMatch(/setError|role="alert"/)
  })

  it('el temporizador sigue armado como red de seguridad', () => {
    // Si el autoplay se bloquea, `onPlaying` no llega, el temporizador no se
    // desarma y el umbral se cierra a los cinco segundos de siempre. Nadie se
    // queda delante de un velo esperando un fotograma que no va a venir.
    expect(componente).toMatch(/setTimeout\(terminar, DURACION\)/)
    expect(video).toMatch(/onPlaying=\{sostener\}/)
    expect(componente).toMatch(/const sostener = \(\) => \{\s*clearTimeout/)
  })

  it('y por eso el temporizador no tiene que saber cuánto dura el video', () => {
    // La duración del `.mp4` no está escrita en ningún sitio del código: si el
    // diseñador entrega otro más largo, el umbral se sigue portando bien.
    expect(componente).not.toMatch(/4000|DURACION_VIDEO/)
  })

  // **Escrito después de verlo en el navegador (25 ago).** El video se integró
  // con `object-cover` dando por hecho un teléfono, y `cover` amplía hasta tapar
  // el hueco: en una ventana de 1440×900 el fotograma de 1080×1920 se pintaba a
  // 1440×2560 —casi el triple de alto que la pantalla— con 1660 px recortados y
  // todo lo de dentro enorme. En un iPad se perdían 278 px.
  //
  // No lo cazó ninguna prueba porque ninguna miraba el encaje, solo el
  // comportamiento. Esta mira el encaje.
  it('el fotograma entero cabe en la pantalla, sea cual sea', () => {
    expect(video).toMatch(/object-contain/)
    expect(video).not.toMatch(/object-cover/)
  })

  it('y va centrado, sin salirse por ninguna orilla', () => {
    // `inset-0` con `contain` deja el fotograma centrado por defecto y el velo
    // rellena lo que sobra a los lados. No hay nada que recolocar a mano.
    expect(video).toMatch(/absolute inset-0 h-full w-full/)
    expect(componente).toMatch(/overflow-hidden/)
  })

  it('ni el video ni el logo se miden en píxeles de un dispositivo concreto', () => {
    // La lección del `object-cover`: aquí no se sabe en qué se abre esto. Lo que
    // se escriba en píxeles fijos será el tamaño equivocado en algún sitio.
    expect(componente).toMatch(/ALTO_LOGO = 'min\([^']*v[hw][^']*\)'/)
    expect(video).not.toMatch(/\d{3,}px|w-\[|h-\[/)
  })

  it('se salta con un toque, igual que la frase', () => {
    // El video no se come el toque: la superficie que lo salta es la de siempre.
    expect(video).toMatch(/pointer-events-none/)
    expect(componente).toMatch(/onClick=\{terminar\}/)
  })

  it('el velo tapa desde el primer fotograma: lo que entra despacio es el video', () => {
    // La curva se aplicaba al velo entero, así que durante sus 480 ms el velo
    // era semitransparente y dejaba ver justo lo que el umbral viene a tapar.
    // Ahora va sobre el `<video>`; el velo es opaco por `.velo-transicion` y no
    // lleva animación ninguna. Un umbral que enseña lo que tapa no tapa nada.
    expect(video).toMatch(/transicion-entrada-video/)
    const asignacion = componente.match(/if \(videoEnMarcha\) velo = '([^']*)'/)
    expect(asignacion[1]).toBe('')
    const css = readFileSync('src/styles/globals.css', 'utf8')
    expect(css).toMatch(/\.transicion-entrada-video \{\s*animation: transicion-entrada-video/)
  })

  it('el velo del video entra y se queda: no se desvanece a mitad de fotograma', () => {
    // Con la curva de la frase —que baja a opacidad 0 al 78 % de cinco
    // segundos— el video se vería apagarse antes de acabar. Quien decide cuándo
    // se va es `onEnded`, no el reloj del CSS.
    const css = readFileSync('src/styles/globals.css', 'utf8')
    const marco = css.match(/@keyframes transicion-entrada-video \{[^}]*\}[^}]*\}/)[0]
    expect(marco).toMatch(/100%\s*\{\s*opacity: 1/)
    expect(componente).toMatch(/transicion-entrada-video/)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// La despedida del video (26 de agosto de 2026).
//
// Lo que se corrige es un corte: `onEnded` desmontaba el umbral entero, así que
// la pantalla de detrás aparecía de golpe en el mismo fotograma en el que el
// video dejaba de pintarse. Lo que **no** cambia es que esto siga sin ser una
// secuencia, y de eso va la mitad de este bloque.
describe('la salida del video se cuenta en dos tiempos, no en un corte', () => {
  const componente = codigoDe(COMPONENTE)
  const css = readFileSync('src/styles/globals.css', 'utf8')

  it('primero se va el fotograma, y detrás de él se retira el velo', () => {
    expect(componente).toMatch(/transicion-salida-logo/)
    expect(componente).toMatch(/if \(fase === FASES\.salida\) velo = 'transicion-salida-velo'/)
    expect(css).toMatch(/@keyframes transicion-salida-logo/)
    expect(css).toMatch(/@keyframes transicion-salida-velo/)
  })

  it('entre los dos hay un instante de velo liso y nada más', () => {
    // La pausa va dentro de la curva del fotograma —su tramo final ya está a
    // cero— y no en un segundo temporizador: es la misma espera, y dos relojes
    // para un mismo gesto se desincronizan en cuanto alguien toca uno.
    const marco = css.match(/@keyframes transicion-salida-logo \{[\s\S]*?\n\}/)[0]
    expect(marco).toMatch(/75%\s*\{\s*opacity: 0/)
    expect(marco).toMatch(/100%\s*\{\s*opacity: 0/)
  })

  it('lo que se fue no vuelve mientras el velo se está yendo', () => {
    // Sin `forwards` —y sin mantener la clase puesta en el último tiempo— el
    // fotograma reaparecería entero justo debajo del velo que se retira.
    const utilidades = css.match(/\.transicion-salida-(?:logo|velo) \{[^}]*\}/g)
    expect(utilidades).toHaveLength(2)
    utilidades.forEach((regla) => expect(regla).toMatch(/forwards/))
    expect(componente).toMatch(/fase !== FASES\.video && 'transicion-salida-logo'/)
  })

  it('el reloj del componente y la curva del CSS dicen lo mismo', () => {
    // Las dos cifras viven en dos archivos porque el encadenado es de JavaScript
    // y la curva es de CSS. Si alguien cambia una y no la otra, el velo se
    // retira antes o después de que la animación termine.
    const deJs = (nombre) =>
      Number(componente.match(new RegExp(`export const ${nombre} = (\\d+)`))[1])
    const deCss = (clase) =>
      Number(css.match(new RegExp(`\\.${clase} \\{\\s*animation: ${clase} (\\d+)ms`))[1])

    expect(deJs('DESPEDIDA')).toBe(deCss('transicion-salida-logo'))
    expect(deJs('RETIRADA')).toBe(deCss('transicion-salida-velo'))
  })

  it('las dos duran lo que el proyecto permite durar', () => {
    // Entre 120 ms y 900 ms (manual §7): más lento de lo habitual, sin llegar a
    // hacer esperar a nadie.
    const cifras = [...componente.matchAll(/export const (?:DESPEDIDA|RETIRADA) = (\d+)/g)]
    expect(cifras).toHaveLength(2)
    cifras.forEach(([, valor]) => {
      expect(Number(valor)).toBeGreaterThanOrEqual(120)
      expect(Number(valor)).toBeLessThanOrEqual(900)
    })
  })

  it('solo se despide el video que llegó a su final por su cuenta', () => {
    // Un toque es alguien diciendo que ya, y a un video que no llegó a verse
    // —autoplay bloqueado, error de reproducción— no hay nada que despedirle.
    // Quién sabe cuál de los dos casos es: el propio nodo.
    expect(componente).toMatch(/nodo && nodo\.ended && fase === FASES\.video/)
    expect(componente).toMatch(/setTimeout\(terminar, DURACION\)/)
    expect(componente).toMatch(/onError=\{terminar\}/)
  })

  it('sigue sin haber nada que tocar y nada que decidir (RN-LU-MAN-02)', () => {
    // Tres tiempos no son tres pasos: nadie los avanza, ninguno pregunta nada y
    // la superficie que lo salta entero sigue siendo una sola.
    expect(componente.match(/<button/g) ?? []).toHaveLength(1)
    expect(componente).toMatch(/onClick=\{terminar\}/)
    expect(componente).not.toMatch(/<Button/)
  })
})

describe('el video es la apertura de la app, y la frase sigue siendo la mañana', () => {
  it('abrir la app monta el umbral con video', () => {
    expect(codigoDe(APP)).toMatch(/<TransicionLuz conVideo/)
    expect(codigoDe(APP)).not.toMatch(/conFrase/)
  })

  it('la primera apertura de todas también, aunque lleve al onboarding', () => {
    // Abrir la app por primera vez sigue siendo abrir la app: lo que cambia
    // detrás del velo es qué hay montado, no qué se ve mientras dura.
    expect(codigoDe(ONBOARDING)).toMatch(/<TransicionLuz conVideo/)
    expect(codigoDe(ONBOARDING)).not.toMatch(/conFrase/)
  })

  it('la mañana lo monta con frase, que es el valor por defecto', () => {
    // `Hoy` no pasa ninguno de los dos, y `conFrase` vale `true` por defecto.
    // Es lo que mantiene vivo el repertorio de §C7.5.
    const hoy = codigoDe(HOY)
    expect(hoy).toMatch(/<TransicionLuz onTerminar/)
    expect(hoy).not.toMatch(/conVideo/)
    expect(codigoDe(COMPONENTE)).toMatch(/conFrase = true/)
  })

  it('no se sacan las dos cosas a la vez: con video no se gasta una frase', () => {
    // Gastar una frase sin enseñarla dejaría un hueco en el repertorio, que es
    // la misma razón por la que ya no se elegía cuando `conFrase` era falso.
    expect(codigoDe(COMPONENTE)).toMatch(/if \(conFrase && !conVideo\) return fraseDeApertura\(\)/)
  })

  it('con reducir movimiento, donde iba el video va el logo quieto', () => {
    // La rama existe aunque `App` no la monte (RN-VIS-05): la pieza no depende
    // de que quien la use se acuerde de preguntar.
    const componente = codigoDe(COMPONENTE)
    expect(componente).toMatch(/const videoEnMarcha = conVideo && !quieto/)
    expect(componente).toMatch(/<Simbolo marca="strivo"/)
  })
})

describe('el copy del umbral (§8)', () => {
  it('vive en el namespace compartido y tiene una sola cadena', () => {
    expect(typeof copy.shared.transicion.saltar).toBe('string')
    expect(Object.keys(copy.shared.transicion)).toEqual(['saltar'])
  })

  it('no promete nada ni manda hacer nada', () => {
    expect(copy.shared.transicion.saltar).not.toMatch(/[¡!]|debes|tienes que/i)
  })
})
