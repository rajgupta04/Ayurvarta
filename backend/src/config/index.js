import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '8000', 10),
  environment: process.env.ENVIRONMENT || 'development',
  allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://127.0.0.1:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),

  // Auth
  jwtSecret: process.env.JWT_SECRET || 'dev_jwt_secret_must_be_over_32_characters_long',
  jwtExpiresIn: process.env.ACCESS_TOKEN_EXPIRE_MINUTES ? `${process.env.ACCESS_TOKEN_EXPIRE_MINUTES}m` : '30m',
  jwtRefreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRE_DAYS ? `${process.env.REFRESH_TOKEN_EXPIRE_DAYS}d` : '7d',

  // Persistence
  mongoUri: process.env.MONGODB_URI || 'mongodb://ayur_admin:ayur_secure_password@localhost:27017/ayurvarta?authSource=admin',
  redisUrl: process.env.REDIS_URL || 'redis://:ayur_redis_password@localhost:6379/0',

  // ML Service
  mlServiceUrl: process.env.ML_SERVICE_URL || 'http://localhost:8001',
  internalServiceKey: process.env.INTERNAL_SERVICE_KEY || 'dev_internal_secret_key_123',

  // Agora Telehealth
  agoraAppId: process.env.AGORA_APP_ID || 'mock_agora_id',
  agoraAppCertificate: process.env.AGORA_APP_CERTIFICATE || 'mock_agora_cert',
};
