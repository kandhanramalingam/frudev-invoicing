#[tauri::command]
fn get_mysql_dsn() -> Result<String, String> {
    Ok("mysql://admin:admin@123@82.29.161.34:3306/wildlifeauctions_live".to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_sql::Builder::new()
                .build(),
        )
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![get_mysql_dsn])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
