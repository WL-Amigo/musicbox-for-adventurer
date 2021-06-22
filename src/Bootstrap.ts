import { defineAsyncComponent, defineComponent, h } from 'vue';
import { constructDependencies, provideDependencies } from './services/SetupDependencies';
import { LoadingFixedSize } from './components/Loading';
import { Logger } from './Logger';

export const Bootstrap = defineAsyncComponent({
  loader: async () => {
    try {
      const deps = await constructDependencies();
      return defineComponent({
        setup(_, ctx) {
          provideDependencies(deps);

          return () => ctx.slots.default?.();
        },
      });
    } catch (error) {
      Logger.error(error);
    }

    return defineComponent(() => () => h('div', { class: 'text-white' }, ['初期化に失敗しました']));
  },
  loadingComponent: defineComponent({
    setup() {
      return () =>
        h('div', { class: 'w-full h-full flex justify-center items-center' }, [
          h(LoadingFixedSize, { open: true, message: '冒険者のための音楽箱' }),
        ]);
    },
  }),
});
