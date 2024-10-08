require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

connectDB();

app.listen(3000, () => {
  console.log('Server running. Use our API on port: 3000');
});
