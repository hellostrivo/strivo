// src/copy/diagnostico.js
// Los textos del build de diagnóstico de SPEC_17B (DP-17B.7).
//
// **No viven en `copy/index.js` a propósito**, y sigue siendo `src/copy/`
// (RN-VOZ-01): `index.js` va en el bundle principal, así que cualquier texto
// suyo estaría en el código servido aunque nadie lo pintara. Este archivo solo
// lo importa `components/perfil/DiagnosticoAlmacen.jsx`, que solo se carga con
// `VITE_DIAG_ALMACEN=1`. Sin la bandera, ninguna de estas frases llega a
// `dist/`, y una prueba lo comprueba construyendo.
//
// Son para las pruebas manuales de la fundadora, no para quien usa la app: por
// eso nombran SQLite e IndexedDB. Aun así pasan `lint:copy`: «por subir» y no
// la palabra que el léxico prohíbe.
//
// El conteo va como «registros: 42» y no «42 registros»: así no hay que
// decidir entre singular y plural, y «1 registros» no aparece nunca.
//
// Aprobados tal cual en el §9 de la instrucción.

export const DIAGNOSTICO = Object.freeze({
  almacen: 'Almacén: {cual}',
  cuales: Object.freeze({ sqlite: 'SQLite', indexeddb: 'IndexedDB' }),
  migracion: Object.freeze({
    correcta: 'Migración: correcta, {fecha}',
    nadaQueMigrar: 'Migración: nada que migrar',
    noTermino: 'Migración: no terminó ({motivo})',
    motivos: Object.freeze({
      sinAbrir: 'SQLite no abrió',
      copia: 'la copia se interrumpió',
      noCoincide: 'lo copiado no coincide',
      noJson: 'hay un valor que no es JSON',
      techo: 'tardó más de 10 s',
    }),
  }),
  conteo: '{almacen} · registros: {registros} · por subir: {porSubir}',
  simular: 'Simular que iOS limpió el almacén',
})

// SPEC_22 (DP-22.12) — Los avisos, con `VITE_DIAG_AVISOS=1`. Exportación
// aparte y bandera propia: cada diagnóstico se enciende solo, y una prueba
// comprueba que cada bandera no arrastra los textos de la otra. Lo importa
// solo `components/perfil/DiagnosticoAvisos.jsx`. Aprobados en el §9.
export const DIAGNOSTICO_AVISOS = Object.freeze({
  permiso: 'Permiso del teléfono: {estado}',
  permisos: Object.freeze({
    concedido: 'concedido',
    denegado: 'denegado',
    sin_pedir: 'sin pedir',
  }),
  programados: 'Avisos programados: {n}',
  proximaManana: 'Próximo de la mañana: {cuando}',
  proximaNoche: 'Próximo de la noche: {cuando}',
  ninguno: 'ninguno',
  // «mié 11 nov, 07:00»: las piezas las da el teléfono en es-MX; el orden, esto.
  cuando: '{semana} {dia} {mes}, {hora}:{minuto}',
  zona: 'Zona horaria: {zona}',
})
