const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config({ path: 'server/.env' });

console.log('GROQ_API_KEY present:', Boolean(process.env.GROQ_API_KEY));
console.log('MAHI_ENGINE_API_KEY present:', Boolean(process.env.MAHI_ENGINE_API_KEY));
console.log('OPENROUTER_API_KEY present:', Boolean(process.env.OPENROUTER_API_KEY));
