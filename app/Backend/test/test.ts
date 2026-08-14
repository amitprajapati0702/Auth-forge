import { passwordService } from "../src/services/password/index.js";

const password = 'TestPassword123!';

const hash = await passwordService.hash(password);

console.log(hash);

const valid = await passwordService.compare(
  password,
  hash,
);

console.log(valid);