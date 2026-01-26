import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const config = {
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'postgres',
  ssl: {
    rejectUnauthorized: false
  }
};

async function runMigration() {
  const client = new Client(config);
  
  try {
    await client.connect();
    console.log('Connected to database');
    
    // Read migration file
    const migrationPath = path.join(__dirname, 'migrations', '001_add_discovered_by.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('Running migration: 001_add_discovered_by.sql');
    await client.query(sql);
    
    console.log('Migration completed successfully!');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
