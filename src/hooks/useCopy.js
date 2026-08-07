// src/hooks/useCopy.js
// Acceso al copy desde los componentes (§2.4).
//
//   const t = useCopy()
//   t('onboarding.p4.prefix')                        → string
//   t('onboarding.p3.options')                       → objeto/lista ya resuelto
//   t('onboarding.p11.nextTemplate', { hora: '6:45' }) → interpolado
//
// Ningún componente lee `copy[...]` directamente cuando el string tiene
// variantes de género, ni implementa su propia lógica: el modo vive en
// @lib/genderStore y este hook se suscribe a él, así que cambiarlo desde
// Ajustes reescribe lo que está en pantalla sin recargar la app.

import { useCallback, useSyncExternalStore } from 'react'
import { copy, interpolate } from '@copy'
import { resolveCopy } from '@copy/resolve'
import { getGenderMode, subscribeGenderMode } from '@lib/genderStore'

export function useGenderMode() {
  return useSyncExternalStore(subscribeGenderMode, getGenderMode, getGenderMode)
}

function entryAt(path) {
  return path.split('.').reduce((node, key) => node?.[key], copy)
}

export default function useCopy() {
  const genderMode = useGenderMode()

  return useCallback(
    (path, vars) => {
      const resolved = resolveCopy(entryAt(path), genderMode)
      if (vars && typeof resolved === 'string') return interpolate(resolved, vars)
      return resolved
    },
    [genderMode]
  )
}
