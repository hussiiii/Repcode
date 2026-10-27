import { afterEach, jest as jestRunner } from '@jest/globals';
import '@testing-library/jest-dom';

afterEach(() => {
  jestRunner.restoreAllMocks();
});
