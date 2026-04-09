import { createApp } from './app/create-app';
import { env } from './config/env';

const app = createApp();

app.listen(env.port, () => {
  console.log(`DevAgentsHub API listening on http://localhost:${env.port}`);
});

