import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  entries: [
    'src/index',
  ],
  clean: true,
  declaration: true,
  sourcemap: true,
  rollup: {
    emitCJS: true,
  },
  failOnWarn: false,
});
