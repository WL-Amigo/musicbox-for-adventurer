import { Ref, ref } from 'vue';

interface MouseHoverStateComposition {
  isHover: Ref<boolean>;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}
export const useMouseHoverState = (): MouseHoverStateComposition => {
  const isHover = ref(false);
  const onMouseEnter = () => (isHover.value = true);
  const onMouseLeave = () => (isHover.value = false);

  return {
    isHover,
    onMouseEnter,
    onMouseLeave,
  };
};
