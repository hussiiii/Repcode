// next/jest loads .env. Replace external-service credentials before tests import app code.
// Unit tests use Jest mocks; these values cannot target production services.
process.env.DATABASE_URL = 'mysql://repcode_test:repcode_test@127.0.0.1:3306/repcode_test';
process.env.FIREBASE_PRIVATE_KEY = 'test-only-not-a-real-private-key';
process.env.OPENAI_API_KEY = 'test-only-not-a-real-api-key';
delete process.env.DELETE_USER_API_KEY;
delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
