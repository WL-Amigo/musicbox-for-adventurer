import { Ref, ref } from 'vue';

interface LoadingComposition {
  isLoading: Readonly<Ref<boolean>>;
  load: <T>(promise: Promise<T>) => Promise<T>;
}

export const useLoadingState = (): LoadingComposition => {
  const isLoading = ref(false);
  const load = async <T>(promise: Promise<T>): Promise<T> => {
    isLoading.value = true;
    try {
      return await promise;
    } finally {
      isLoading.value = false;
    }
  };
  return {
    isLoading,
    load,
  };
};
