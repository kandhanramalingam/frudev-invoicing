## Build 
- npm run tauri build
## New Tables

```sql
CREATE TABLE wld_invoice_config (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(255) NOT NULL,
    value LONGTEXT NOT NULL,
    UNIQUE KEY wld_invoice_config_type_unique (type)
);

CREATE TABLE wld_vehicle_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE wld_vehicle_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE wld_vehicle_compartments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE wld_vehicles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      make VARCHAR(255) NOT NULL,
      year INT,
      description TEXT,
      registrationNumber VARCHAR(100),
      licenceCode VARCHAR(50),
      rate FLOAT,
      type VARCHAR(100),
      code VARCHAR(100),
      active TINYINT(1) DEFAULT 1
);

CREATE TABLE wld_vehicle_compartment_details (
     id INT AUTO_INCREMENT PRIMARY KEY,
     vehicle_id INT NOT NULL,
     compartment_id INT NOT NULL,
     quantity INT DEFAULT 0,
     FOREIGN KEY (vehicle_id) REFERENCES wld_vehicles(id),
     FOREIGN KEY (compartment_id) REFERENCES wld_vehicle_compartments(id)
);
```
