import dotenv from 'dotenv';
dotenv.config();
console.log('TEST SCRIPT RUNNING');
console.log('CWD:', process.cwd());
console.log('DATABASE_URL:', process.env.DATABASE_URL);
import fs from 'fs';
console.log('Files in backend:', fs.readdirSync('.')); 