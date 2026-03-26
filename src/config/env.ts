import dotenv from 'dotenv';

dotenv.config();

function getEnv(name: string, defaultValue?: string): string {
  const value = process.env[name] ?? defaultValue;

  if (value === undefined) {
    throw new Error(`Missing required env variable: ${name}`);
  }

  return value;
}

export const env = {
  port: Number(getEnv('PORT', '3000')),
  nodeEnv: getEnv('NODE_ENV', 'development'),
  dbHost: getEnv('DB_HOST'),
  dbPort: Number(getEnv('DB_PORT', '5432')),
  dbName: getEnv('DB_NAME'),
  dbUser: getEnv('DB_USER'),
  dbPassword: getEnv('DB_PASSWORD'),

  jwtSecret: getEnv('JWT_SECRET'),
  jwtExpiresIn: getEnv('JWT_EXPIRES_IN', '1d'),

};