#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    // "Bóveda de Titanio" (Misión 1): habilita `Store.load(...)` /
    // `store.get/set/save` desde el frontend (ver `src/lib/appStore.ts`).
    // Sin este registro, cualquier llamada JS al plugin falla en runtime
    // aunque la dependencia de Rust y el paquete npm estén instalados.
    .plugin(tauri_plugin_store::Builder::default().build())
    // Diálogos nativos del SO (picker de archivos Mac) — ver
    // `src/lib/nativeFiles.ts` (flashcards / Fuentes).
    .plugin(tauri_plugin_dialog::init())
    // File System oficial (Tauri v2): lectura/escritura en `$APPDATA` /
    // `$APPCONFIG` (capabilities) y bytes de rutas elegidas vía diálogo.
    // Ver `capabilities/default.json` — sin este `.plugin(...)`, APIs como
    // `readTextFile` / `writeTextFile` / `exists` fallan en runtime.
    .plugin(tauri_plugin_fs::init())
    // Abre URLs en el navegador del SO (checkout Pro, etc.) —
    // ver `src/lib/openExternal.ts`.
    .plugin(tauri_plugin_opener::init())
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
