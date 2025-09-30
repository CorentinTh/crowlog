import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['./src/index.ts'],
  clean: true,
  exports: true, // auto update the package.json exports, main, module and types fields
});
