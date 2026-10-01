-- Settings table for system configuration
CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Insert default settings
INSERT INTO settings (key, value, description) 
VALUES 
  ('default_borrowing_days', '14', 'Default number of days a book can be borrowed'),
  ('fine_per_day', '5', 'Fine amount per day for overdue books');

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);
