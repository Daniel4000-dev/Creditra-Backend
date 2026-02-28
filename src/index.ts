import express from 'express';
import cors from 'cors';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import yaml from 'yaml';
import swaggerUi from 'swagger-ui-express';

import { creditRouter } from './routes/credit.js';
import { riskRouter } from './routes/risk.js';
import { healthRouter } from './routes/health.js';
import { errorHandler } from './middleware/errorHandler.js';

import { ok } from './utils/response.js';
import { auditRouter } from './routes/audit.js';
import { Container } from './container/Container.js';
import { AuditAction } from './models/AuditLog.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const openapiSpec = yaml.parse(
  readFileSync(join(__dirname, 'openapi.yaml'), 'utf8')
);

export const app = express();
const port = process.env.PORT ?? 3000;

app.use(cors());
app.use(express.json());

app.use('/health', healthRouter);
// ── Docs ────────────────────────────────────────────────────────────────────
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));
app.get('/docs.json', (_req, res) => res.json(openapiSpec));

app.use('/api/credit', async (req, _res, next) => {
  if (req.method !== 'GET') {
    const container = Container.getInstance();
    // Path looks like /lines/123 or /lines/123/suspend
    const pathParts = req.path.split('/');
    const id = pathParts[2] || 'unknown';
    
    let action: AuditAction = 'CREDIT_LINE_UPDATED';
    if (req.method === 'POST' && req.path === '/lines') action = 'CREDIT_LINE_CREATED';
    if (req.method === 'DELETE') action = 'CREDIT_LINE_DELETED';

    await container.auditLogService.createAuditLog(
      action,
      req.headers['x-user'] as string ?? 'anonymous',
      'credit_line',
      id,
      { method: req.method, path: req.path }
    );
  }
  next();
});

app.use('/api/risk', async (req, _res, next) => {
  if (req.method === 'POST') {
    const container = Container.getInstance();
    await container.auditLogService.createAuditLog(
      'RISK_EVALUATED',
      req.headers['x-user'] as string ?? 'anonymous',
      'risk',
      req.body?.walletAddress ?? 'unknown',
      { method: req.method, path: req.path }
    );
  }
  next();
});

app.use('/api/credit', creditRouter);
app.use('/api/risk', riskRouter);
app.use('/api/audit', auditRouter);

// Global error handler — must be registered after routes
app.use(errorHandler);

export { app };

// Only start the server if not imported by tests setup
if (import.meta.url === `file://${process.argv[1]}`) {
  /* istanbul ignore next */
  if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => {
      console.log(`Creditra API listening on http://localhost:${port}`);
      console.log(`Swagger UI available at  http://localhost:${port}/docs`);
    });
  }
}

export default app;
