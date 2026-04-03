import express from 'express';
import cors from 'cors';
import { config } from './config/env';
import authRoutes from './routes/auth.routes';
import roleRoutes from './routes/role.routes';
import userRoutes from './routes/user.routes';
import { swaggerSpec, swaggerUi } from './config/swagger';
import { checkDatabaseConnection } from './config/prisma';

async function startServer(): Promise<void> {
  await checkDatabaseConnection();

  const app: express.Application = express();

  app.use(
    cors({
      origin: config.clientUrl,
      credentials: true,
    })
  );

  app.use(express.json());

  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/roles', roleRoutes);
  app.use('/api/v1/users', userRoutes);

  app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
  });
}

startServer();

export default express();