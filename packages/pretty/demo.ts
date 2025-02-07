import { createLogger } from '@crowlog/logger';

const logger = createLogger({ namespace: 'demo' });

logger.info({ port: 1221 }, 'Server started');
logger.info({ requestId: 'qsd54az7', path: '/api/user/me', userId: 123 }, 'Request received');
logger.error({ user: { name: 'John', id: 123 }, requiredPermissions: ['read:user'] }, 'Authentication error: invalid permissions');
logger.warn({ cpuUsage: 0.8, loadAvg: 0.5, memoryUsage: 246234 }, 'CPU usage is high');
logger.debug({ validationToken: '2sdfq54f4jumldq9', dryRun: true, userId: 123 }, 'Account validation email sent');
