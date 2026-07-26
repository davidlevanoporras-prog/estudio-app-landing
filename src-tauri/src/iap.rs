//! Puente In-App Purchase (StoreKit) — paquete no consumible de temas visuales.
//!
//! Producto: `com.excellenceabsolue.desktop.themes_pack`
//!
//! PRE-LAUNCH: StoreKit 2 aún no está cableado a App Store Connect.
//! `IAP_PRELAUNCH_BYPASS` concede el entitlement local sin hablar con Apple,
//! para que builds release (`.dmg` de prueba) no fallen ni colapsen la UI.
//!
//! TODO(StoreKit2): poner `IAP_PRELAUNCH_BYPASS = false` y sustituir
//! `storekit_purchase` / `storekit_restore` por StoreKit 2 real antes del
//! envío a revisión / distribución de pago.

use std::fs;
use std::path::PathBuf;

use tauri::{AppHandle, Manager};

const ENTITLEMENT_FILE: &str = "iap_themes_pack.owned";

/// Bypass temporal de pre-launch: sin conexión a Apple; concede/restaura local.
const IAP_PRELAUNCH_BYPASS: bool = true;

fn entitlement_path(app: &AppHandle) -> Result<PathBuf, String> {
  app
    .path()
    .app_data_dir()
    .map(|dir| dir.join(ENTITLEMENT_FILE))
    .map_err(|e| format!("app_data_dir: {e}"))
}

fn read_owned(app: &AppHandle) -> bool {
  match entitlement_path(app) {
    Ok(path) => path.exists(),
    Err(_) => false,
  }
}

fn write_owned(app: &AppHandle, owned: bool) -> Result<(), String> {
  let path = entitlement_path(app)?;
  if let Some(parent) = path.parent() {
    fs::create_dir_all(parent).map_err(|e| format!("mkdir: {e}"))?;
  }
  if owned {
    fs::write(&path, b"1").map_err(|e| format!("write entitlement: {e}"))?;
  } else if path.exists() {
    fs::remove_file(&path).map_err(|e| format!("remove entitlement: {e}"))?;
  }
  Ok(())
}

/// Compra del producto no consumible (mock pre-launch o StoreKit futuro).
fn storekit_purchase(_product_id: &str) -> Result<bool, String> {
  if IAP_PRELAUNCH_BYPASS {
    // Mock release-safe: no IPC a Apple; la UI recibe Ok(true).
    return Ok(true);
  }

  // TODO(StoreKit2): hoja nativa + verificación de transacción firmada.
  Err(
    "StoreKit pendiente de configuración en App Store Connect. \
     Desactiva IAP_PRELAUNCH_BYPASS solo cuando StoreKit 2 esté listo."
      .into(),
  )
}

/// Restaura transacciones (mock pre-launch o StoreKit futuro).
fn storekit_restore(_product_id: &str) -> Result<bool, String> {
  if IAP_PRELAUNCH_BYPASS {
    // Sin historial Apple: no inventamos ownership; purchase concede el flag.
    return Ok(false);
  }

  // TODO(StoreKit2): AppStore.sync() / Transaction.currentEntitlements.
  Err(
    "StoreKit pendiente de configuración. \
     Desactiva IAP_PRELAUNCH_BYPASS solo cuando StoreKit 2 esté listo."
      .into(),
  )
}

#[tauri::command]
pub fn purchase_themes_pack(app: AppHandle, product_id: String) -> Result<bool, String> {
  if read_owned(&app) {
    return Ok(true);
  }
  let granted = storekit_purchase(&product_id)?;
  if granted {
    write_owned(&app, true)?;
  }
  Ok(granted)
}

#[tauri::command]
pub fn restore_theme_purchases(app: AppHandle, product_id: String) -> Result<bool, String> {
  if read_owned(&app) {
    return Ok(true);
  }
  let restored = storekit_restore(&product_id)?;
  if restored {
    write_owned(&app, true)?;
  }
  Ok(restored)
}
