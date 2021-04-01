import { defineAsyncComponent, defineComponent } from 'vue';
import { constructDependencies, provideDependencies } from './services/SetupDependencies';

export const Bootstrap = defineAsyncComponent({
  loader: async () => {
    const deps = await constructDependencies();

    return defineComponent({
      setup(_, ctx) {
        provideDependencies(deps);

        return () => ctx.slots.default?.();
      },
    });
  },
});
