import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { notFoundMiddleware } from './middlewares/notFound.middleware';
import { errorMiddleware } from './middlewares/error.middleware';

const app = express();

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//import routes


//define routes


//404 handler
app.use(notFoundMiddleware);

//Global error handler
app.use(errorMiddleware);

export default app;
