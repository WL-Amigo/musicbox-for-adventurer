import { defineAsyncComponent, defineComponent, h } from 'vue';
import { constructDependencies, provideDependencies } from './services/SetupDependencies';
import { LoadingFixedSize } from './components/Loading';

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
  loadingComponent: defineComponent({
    setup() {
      return () => h(LoadingFixedSize, { open: true, message: '冒険者のための音楽箱' });
    },
  }),
});
