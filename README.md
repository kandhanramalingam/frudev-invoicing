## New Tables

```sql
CREATE TABLE wld_vehicle_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE wld_vehicle_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE wld_invoice_config (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(255) NOT NULL,
    value LONGTEXT NOT NULL,
    UNIQUE KEY wld_invoice_config_type_unique (type)
);
```
