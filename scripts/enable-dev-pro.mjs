#!/usr/bin/env node
/**
 * Activa el modo Pro local sin Lemon Squeezy.
 *
 * Uso:
 *   npm run dev:pro
 *   npm run tauri:dev:pro
 *
 * También desde la app (solo DEV): Perfil → "Activar Pro (dev)".
 * Código VIP canjeable en UI: EXCELLENCE-VIP
 */
console.log(`
Excellence Absolue — Pro local (DEV)

  Web:    npm run dev:pro
  Tauri:  npm run tauri:dev:pro

Esto define VITE_DEV_PRO=true solo en el proceso de Vite.
En \`npm run build\` / producción el flag no aplica (import.meta.env.DEV = false).

Atajo en UI (Perfil, sección Dev):
  • Activar Pro (dev)
  • Desactivar Pro (dev)

Código VIP existente: EXCELLENCE-VIP
`);
