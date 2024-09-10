require('dotenv').config();
const express = require('express');
const logger = require('morgan');
const cors = require('cors');
const path = require('path');
const contactsRouter = require('./routes/api/contacts');
const usersRouter = require('./routes/api/users');
const emailRoutes = require('./routes/api/emails');

const app = express();

const formatsLogger = app.get('env') === 'development' ? 'dev' : 'short';

app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());
app.use('/api/emails', emailRoutes); 

app.use('/avatars', express.static(path.join(__dirname, 'public', 'avatars')));
app.use('/api/contacts', contactsRouter);
app.use('/api/users', usersRouter); 

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

const { sendEmail } = require('./email');

app.listen(3000, () => {
  console.log('Server running on port 3000');
});

module.exports = app;
