process.env.NODE_ENV ??= 'test';
process.env.PORT ??= '4000';
process.env.DATABASE_URL ??=
  'postgresql://devagentshub:devagentshub_password@localhost:5432/dev_agents_hub_test';
process.env.JWT_SECRET ??= 'test_jwt_secret_for_vitest_only';
process.env.CORS_ORIGIN ??= 'http://localhost:3000';
