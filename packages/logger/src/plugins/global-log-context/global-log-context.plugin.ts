import type { LoggerPlugin } from '../../logger.types';

export function createGlobalLogContextPlugin<GlobalContext extends Record<string, unknown> = Record<string, unknown>>() {
  let globalContext: GlobalContext | null = null;

  return {
    setGlobalLogContext: (context: GlobalContext) => {
      globalContext = context;
    },
    getGlobalLogContext: () => globalContext,
    addToGlobalLogContext: (context: Partial<GlobalContext>) => {
      globalContext = {
        ...globalContext,
        ...context,
      } as GlobalContext;
    },
    globalContextPlugin: {
      name: 'global-context',
      transformLogContext: ({ context }) => {
        return {
          context: {
            ...context,
            data: {
              ...globalContext,
              ...context.data,
            },
          },
        };
      },
    } as LoggerPlugin,
  };
}
