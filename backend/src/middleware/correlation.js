import crypto from 'crypto';

export function correlationMiddleware(req, res, next) {
  const requestId = req.headers['x-request-id'] || `req_${crypto.randomBytes(6).toString('hex')}`;
  req.requestId = requestId;
  res.setHeader('X-Request-Id', requestId);

  const start = process.hrtime();

  res.on('finish', () => {
    const diff = process.hrtime(start);
    const durationMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);
    res.setHeader('X-Process-Time', `${durationMs}ms`);
  });

  next();
}
