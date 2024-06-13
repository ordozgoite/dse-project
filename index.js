const express = require('express')
const mongoose = require('mongoose');
require('dotenv').config();

const app = express()
const port = process.env.PORT || 3000

// connect to mongodb atlas
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB Atlas');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB Atlas:', error.message);
  });

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})