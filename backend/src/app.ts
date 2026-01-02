import express, { RequestHandler } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes';
import resourceRoutes from './routes/resourceRoutes';

const app = express();

// Middleware
app.use(cors() as any); 
app.use(helmet() as any);
app.use(morgan('dev') as any);
app.use(express.json() as any);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', resourceRoutes);

// Health Check
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

export default app;