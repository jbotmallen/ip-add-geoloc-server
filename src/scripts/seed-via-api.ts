import dotenv from 'dotenv';
dotenv.config();

const seedUrl = process.env.NODE_ENV === 'production' 
  ? `${process.env.PRODUCTION_URL}/api/admin/seed`
  : 'http://localhost:8000/api/admin/seed';

const seedToken = process.env.SEED_TOKEN;

if (!seedToken) {
  console.error('SEED_TOKEN not found in environment variables');
  process.exit(1);
}

fetch(seedUrl, {
  method: 'POST',
  headers: {
    'x-seed-token': seedToken
  }
})
.then(r => r.json())
.then(console.log)
.catch(console.error);