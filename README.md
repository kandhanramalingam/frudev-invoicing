# frudev-invoicing (Tauri + Angular)

This app now uses a MySQL server via the Tauri SQL plugin instead of a local SQLite file. Database migrations and data seeding have been removed; the app assumes the MySQL database schema already exists.

## Configure MySQL Connection

- Provide a MySQL DSN (connection string) in the format:
  - mysql://user:password@host:3306/database_name
- The DSN is now read by the Tauri backend from the environment for better security. Set one of the following environment variables before running the app:
  - MYSQL_DSN
  - or DATABASE_URL
- Example (PowerShell):
  - `$env:MYSQL_DSN = 'mysql://user:pass@127.0.0.1:3306/frudev_invoicing'`
  - `npm run tauri dev`
- The frontend no longer contains or requires the connection string; it requests it from the backend at runtime.

## Notes

- Migrations: Previously defined SQLite migrations are no longer executed. Ensure your MySQL schema is created and managed externally.
- Seeding: Automatic sample data seeding has been removed.
- SQL Compatibility: Ensure your queries are compatible with MySQL.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer) + [Angular Language Service](https://marketplace.visualstudio.com/items?itemName=Angular.ng-template).
