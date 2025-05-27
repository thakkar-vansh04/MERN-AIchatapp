import connect from './db/db.js';

connect(); // connect to MongoDB

import express from 'express';
import morgan from 'morgan';
import userRoutes from './routes/user.routes.js';
import cookieParser from 'cookie-parser';

const app = express();

app.use(morgan('dev')); // logging middleware for development 
app.use(express.json()); // to parse JSON bodies
app.use(express.urlencoded({ extended: true })); // to parse URL-encoded bodies
app.use(cookieParser()); // to parse cookies
app.use('/users', userRoutes); // user routes

app.get('/', (req, res) => {
  res.send('Hello World!');
});

export default app;
