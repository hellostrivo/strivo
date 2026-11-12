# STRIVO · Íconos v1 (12/10/2026)

Misma composición que el avatar aprobado (D-26, D-27): la «S» con sus dos puntos en color original (carbón #2B282F, puntos gris malva #776F79) sobre papel #FBF8F4. Los trazos salen de `Strivo_Logo_Oficial.svg` sin cambios. El símbolo ocupa el 60 % de lo visible en todas las plataformas, para que se vea igual en iOS, Android y la web.

## Dónde va cada archivo en el repo

| Carpeta del paquete | Destino en el repo | Para qué |
|---|---|---|
| `web/public/` | `public/` (crear la carpeta en la raíz) | `index.html` y `vite.config.js` ya piden `favicon.ico`, `apple-touch-icon.png`, `icon-192.png` e `icon-512.png`; hoy dan 404 porque la carpeta no existe |
| `app/assets/` | `assets/` (raíz del repo) | Fuente para `npx @capacitor/assets generate` cuando exista Capacitor (SPEC_21 iOS, SPEC_26 Android). Genera el AppIcon de iOS y el ícono adaptativo de Android |
| `tiendas/` | `docs/marca/iconos-v1/` | `google-play_512.png` se sube a mano en Play Console. `app-store_1024.png` es de referencia: App Store toma el ícono del propio build |

**Pantalla de arranque de iOS (SPEC_21.1, D-21.11).** Es el papel #FBF8F4 del storyboard con la «S» en color original centrada encima, a 97 × 123 pt en todos los iPhone y sin variante oscura: el modo oscuro no cambia el arranque. La «S» es `ios/App/App/Assets.xcassets/SimboloArranque.imageset`: tres PNG transparentes (97 × 123, 194 × 246 y 291 × 369 px) que escribe directamente `scripts/componer-arranque.js` (`npm run ios:arranque`) desde `docs/marca/logotipo-v1/STRIVO_simbolo_original.svg`, sin tocar trazos ni color y sin pasar por `@capacitor/assets`. **Las fuentes de 2732 × 2732 (`assets/splash.png` y `splash-dark.png`) salieron el 12 nov 2026**: decodificadas pasaban del límite de memoria de iOS para una pantalla de arranque y la ventana se abría en negro. `npx @capacitor/assets@3.0.5 generate --ios` (`npm run ios:recursos`), fijado y fuera de `package.json`, queda **solo para el ícono**: en `assets/` no puede haber un `splash.png`, `logo.png` ni `icon.png`, o volvería a escribir un arranque de 2732.

## Archivos

- **iOS:** `icon-only.png` 1024 × 1024, opaco, sin esquinas redondeadas (iOS aplica la máscara).
- **Android adaptativo:** `icon-foreground.png` (símbolo con fondo transparente, dentro de la zona segura de 66/108) + `icon-background.png` (papel liso), ambos de 1024 × 1024.
- **Web:** `favicon.ico` (16, 32 y 48 px), `apple-touch-icon.png` 180, `icon-192.png`, `icon-512.png` e `icon-512-maskable.png`.
- El ícono maskable es opcional: para usarlo hay que añadir al manifiesto de `vite.config.js` la entrada `{ src: 'icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }`.

## Límites conocidos

- **Favicon de 16 px:** los puntos casi desaparecen. Se resuelve con el símbolo redibujado (D-15), que puede traer una versión simplificada para tamaños pequeños.
- **1024 px:** el borde se revisó ampliado y no muestra escalones, pero el redibujo daría curvas más limpias para impresos o tamaños mayores.
