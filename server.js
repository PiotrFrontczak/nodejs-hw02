const app = require('./app');
require('./server');

app.listen(3000, () => {
  console.log("Server running. Use our API on port: 3000");
});

const mongoose = require('mongoose');

const DB_HOST = 'mongodb+srv://piotrf2023:milenka12@cluster0.vxeuh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'; 

mongoose.connect(DB_HOST, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log("Database connection successful");
  })
  .catch(error => {
    console.error("Database connection error:", error.message);
    process.exit(1);
  });