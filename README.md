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

CREATE TABLE wld_species_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

ALTER TABLE wld_species ADD COLUMN category_id INT(11) DEFAULT NULL AFTER status;

CREATE TABLE wld_quote_validity (
    id INT AUTO_INCREMENT PRIMARY KEY,
    days INT(11) NOT NULL
);

CREATE TABLE wld_quote_terrain (
   id INT AUTO_INCREMENT PRIMARY KEY,
   name VARCHAR(255) NOT NULL,
   value INT(11) NOT NULL,
   animal_per_day INT(11) NOT NULL
);

CREATE TABLE wld_generated_invoices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    auction_id INT NOT NULL,
    buyer_id VARCHAR(50) NOT NULL,
    lot_numbers TEXT NOT NULL,
    total_amount DOUBLE NOT NULL,
    invoice_file LONGTEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) DEFAULT 'application/pdf',
    status ENUM('Pending', 'Paid', 'Cancelled') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```
