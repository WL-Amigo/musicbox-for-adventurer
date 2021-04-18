import { defineComponent, h } from 'vue';
import { defineBooleanProp } from '../../utils/vue/Props';
import CommonLoading from './private/Loading.vue';

const LoadingProps = {
  message: String,
  open: defineBooleanProp(false),
} as const;

export const LoadingOverlay = defineComponent({
  props: LoadingProps,
  setup(props) {
    return () =>
      h(CommonLoading, {
        message: props.message,
        open: props.open,
        class: 'absolute inset-0 bg-black bg-opacity-25 w-full h-full',
      });
  },
});

export const LoadingFixedSize = defineComponent({
  props: LoadingProps,
  setup(props) {
    return () =>
      h(CommonLoading, {
        message: props.message,
        open: props.open,
        class: 'w-auto min-w-32 px-2 h-32 bg-black bg-opacity-25 rounded',
      });
  },
});
