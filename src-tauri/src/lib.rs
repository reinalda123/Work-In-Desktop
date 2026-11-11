use tauri::{webview::NewWindowResponse, Manager, Url, WebviewWindowBuilder};
use tauri_plugin_opener::OpenerExt;

fn is_allowed_app_url(url: &Url) -> bool {
    matches!(url.scheme(), "tauri" | "blob" | "data" | "about")
        || (matches!(url.scheme(), "http" | "https") && url.host_str() == Some("tauri.localhost"))
}

fn is_allowed_external_url(url: &Url) -> bool {
    matches!(url.scheme(), "https" | "http" | "mailto" | "whatsapp")
}

fn open_in_default_browser(app: &tauri::AppHandle, url: &Url) {
    if is_allowed_external_url(url) {
        let _ = app.opener().open_url(url.as_str(), None::<&str>);
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.unminimize();
                let _ = window.show();
                let _ = window.set_focus();
            }
        }))
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            let mut main_config = app
                .config()
                .app
                .windows
                .first()
                .cloned()
                .expect("missing main window configuration in tauri.conf.json");
            main_config.create = true;

            let nav_handle = app.handle().clone();
            let new_win_handle = app.handle().clone();

            WebviewWindowBuilder::from_config(app.handle(), &main_config)?
                .on_navigation(move |url| {
                    if is_allowed_app_url(url) {
                        return true;
                    }
                    open_in_default_browser(&nav_handle, url);
                    false
                })
                .on_new_window(move |url, _features| {
                    open_in_default_browser(&new_win_handle, &url);
                    NewWindowResponse::Deny
                })
                .build()?;

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running Work-in Tauri application");
}
