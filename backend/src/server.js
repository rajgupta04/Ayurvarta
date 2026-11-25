import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/index.js';
import { correlationMiddleware } from './middleware/correlation.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Security & Core Middleware
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests or matching origins
    if (!origin || config.allowedOrigins.includes(origin) || config.environment === 'development') {
      return callback(null, true);
    }
    return callback(new Error('Blocked by CORS policy'));
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(correlationMiddleware);

// -------------------------------------------------------------
// Health & Readiness Probes (Per Vibe Rules Phase 2)
// -------------------------------------------------------------
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'core-backend-service',
    runtime: `node ${process.version}`,
    version: '1.0.0',
    environment: config.environment,
    timestamp: new Date().toISOString(),
  });
});

app.get('/ready', (req, res) => {
  // In production, check connection pools (MongoDB & Redis)
  res.status(200).json({
    status: 'ready',
    service: 'core-backend-service',
    dependencies: {
      mongodb: 'connected',
      redis: 'connected',
      mlService: config.mlServiceUrl,
    },
  });
});

// -------------------------------------------------------------
// Base API Status
// -------------------------------------------------------------
app.get('/api/v1/status', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      message: 'AyurVarta Node.js Core Backend & API Gateway is operational.',
    },
    meta: {
      requestId: req.requestId,
      timestamp: new Date().toISOString(),
    },
  });
});

// -------------------------------------------------------------
// Route Modules (Stubs for modular service expansion)
// -------------------------------------------------------------
// Auth Stub
app.post('/api/v1/auth/signup', (req, res) => {
  res.status(201).json({
    success: true,
    data: { message: 'Signup endpoint ready. Connect to MongoDB users collection.' },
    meta: { requestId: req.requestId },
  });
});

app.post('/api/v1/auth/login', (req, res) => {
  res.status(200).json({
    success: true,
    data: { token: 'mock_jwt_token', user: { email: req.body?.email || 'patient@example.com' } },
    meta: { requestId: req.requestId },
  });
});

// Assessments Stub
app.post('/api/v1/assessments', (req, res) => {
  res.status(200).json({
    success: true,
    data: { message: 'Assessment recorded', payload: req.body },
    meta: { requestId: req.requestId },
  });
});

// Diet Jobs Stub
app.post('/api/v1/diet-jobs/start', (req, res) => {
  const jobId = `job_${Date.now()}`;
  res.status(202).json({
    success: true,
    data: { jobId, status: 'PENDING' },
    meta: { requestId: req.requestId },
  });
});

app.get('/api/v1/diet-jobs/:jobId', (req, res) => {
  res.status(200).json({
    success: true,
    data: { jobId: req.params.jobId, status: 'PROCESSING', progressPercent: 50 },
    meta: { requestId: req.requestId },
  });
});

// Error handling middleware
app.use(errorHandler);

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(config.port, '0.0.0.0', () => {
    console.log(`[AyurVarta Backend] Running on http://0.0.0.0:${config.port} (${config.environment})`);
  });
}

export default app;
