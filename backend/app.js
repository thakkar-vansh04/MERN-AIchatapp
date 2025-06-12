import connect from './db/db.js';

connect(); // connect to MongoDB

import express from 'express';
import morgan from 'morgan';
import userRoutes from './routes/user.routes.js';
import projectRoutes from './routes/project.routes.js';
import aiRoutes from './routes/ai.routes.js'
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();

app.use(cors()); // enable CORS for all routes
app.use(morgan('dev')); // logging middleware for development 
app.use(express.json()); // to parse JSON bodies
app.use(express.urlencoded({ extended: true })); // to parse URL-encoded bodies
app.use(cookieParser()); // to parse cookies
app.use('/users', userRoutes); // user routes
app.use('/projects', projectRoutes); // project routes
app.use('/ai',aiRoutes);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

export default app;
