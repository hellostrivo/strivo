// src/components/diario/ListaNumerada.jsx
// Las respuestas de una lista, releídas una debajo de otra y con su número
// (12 sep 2026). La montan las dos pantallas de consulta y la vista de día del
// Historial: una forma de lista para las tres, no tres que se parezcan.
//
// Son las respuestas de las dos preguntas que admiten varias —la gratitud de la
// mañana y el reconocimiento de la noche— y cada una vuelve como se escribió:
// en el orden en que se añadió, con sus párrafos y sin recortar. El número es
// el mismo que llevaba su tarjeta al escribirla, para que lo que se relee se
// reconozca; no ordena por importancia y no cuenta nada.
//
// El `<ol>` da la cuenta al lector de pantalla por su cuenta, así que el número
// pintado va oculto para él: dicho dos veces sería un eco. `role="list"` es
// para Safari, que sin viñeta deja de anunciar la lista como tal.

export default function ListaNumerada({ lineas }) {
  return (
    <ol role="list" className="flex flex-col gap-3">
      {lineas.map((linea, indice) => (
        <li key={indice} className="flex items-baseline gap-3">
          <span
            className="shrink-0 min-w-[1.5ch] text-sm font-medium text-on-surface-soft tabular-nums"
            aria-hidden="true"
          >
            {indice + 1}.
          </span>
          <p className="min-w-0 text-base text-on-surface whitespace-pre-wrap">{linea}</p>
        </li>
      ))}
    </ol>
  )
}
