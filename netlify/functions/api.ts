import serverless from 'serverless-http';
import { createApiApp } from '../../src/serverApp';

const app = createApiApp();

export const handler = serverless(app);
