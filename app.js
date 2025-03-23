// app.js
require("./utils/instrument.js");
const Sentry = require("@sentry/node");
const express = require('express');
const app = express();
require('dotenv').config();
const routes = require('./routes/index'); // Import the combined routes
const mongoose = require('mongoose');
const cors = require('cors');


// Connect to the MongoDB database
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(console.log("MongoDB is Successfully connected")).catch((err)=>console.log(err));

app.use('/uploads', express.static('uploads'));



const corsOptions = {
  origin: '*',
  credentials: true,
}

// add middleware for printing the request body
app.use((req, res, next) => {
  // 1. token
  const token = req.headers.authorization;
  console.log("--------------------------------");
  console.log(`Token: ${token}`);
  // 2. route
  console.log(`Route: ${req.originalUrl}`);
  // 3. request body
  console.log(`Request Body: ${JSON.stringify(req.body)}`);
  console.log("-------------------------------- \n");
  next();
});

app.use(express.json());
app.use(cors(corsOptions));


// Use the combined routes under the '/api' path
app.use('/api', routes);


Sentry.setupExpressErrorHandler(app);


const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
