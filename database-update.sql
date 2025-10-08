-- Add category_id column to wld_species table
ALTER TABLE wld_species ADD COLUMN category_id INT DEFAULT NULL AFTER status;

-- Add foreign key constraint (optional)
-- ALTER TABLE wld_species ADD FOREIGN KEY (category_id) REFERENCES wld_species_categories(id);