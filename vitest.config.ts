import { defineConfig } from 'vitest/config'

export default defineConfig({

  test: {
    reporters: ['verbose'],
    projects: ['packages/*'],
    coverage: {
      include: ['packages/*/src'],
    },
    env: {
        TZ: 'UTC',
    }
  },
})