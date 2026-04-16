require("dotenv").config({ path: ".env.test" });

// Mock console to suppress logs during tests
global.console = {
  ...console,
  error: jest.fn(),
  log: jest.fn(),
};