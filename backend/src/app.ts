import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { router } from './routes';
import { errorHandler } from './shared/errors/error-handler';

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/v1', router);

app.use(errorHandler);

export { app };