const jwt = require('jsonwebtoken');
require('dotenv').config();
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbjEyMzRAZ21haWwuY29tIiwiaXNBZG1pbiI6dHJ1ZSwiaWF0IjoxNzU4NDQ1MjkzLCJleHAiOjE3NTg0NDg4OTN9.Q9mSK6VIpJm5-JJqKPaT7wdIoRtD6HC66FjIp9GYIa0';
console.log('env secret:', process.env.JWT_SECRET);
try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  console.log('verified payload:', decoded);
} catch (err) {
  console.error('verify failed:', err);
}
