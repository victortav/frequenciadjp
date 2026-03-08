-- Create churches table
CREATE TABLE IF NOT EXISTS churches (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

-- Drop old attendances table and recreate with new schema
DROP TABLE IF EXISTS attendances;

CREATE TABLE attendances (
  id SERIAL PRIMARY KEY,
  igreja_id INTEGER NOT NULL,
  adultos INTEGER NOT NULL,
  criancas INTEGER NOT NULL,
  convidados INTEGER NOT NULL,
  veiculos INTEGER NOT NULL,
  data DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert the 10 churches
INSERT INTO churches (name) VALUES
('Anglicana da Videira'),
('Anglicana da Ressurreição'),
('Anglicana do Libertador'),
('Anglicana da Comunhão'),
('Anglicana da Esperança'),
('Anglicana da Paz'),
('Anglicana do Repouso'),
('Anglicana do Amanhecer'),
('Anglicana da Graça'),
('Anglicana da Redenção')
ON CONFLICT (name) DO NOTHING;
