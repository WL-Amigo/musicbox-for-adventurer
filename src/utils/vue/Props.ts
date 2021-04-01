import { PropType } from 'vue';

type RequiredProp<T> = {
  type: PropType<T>;
  required: true;
};

export const makeRequiredCustomTypeProp = <T>(): RequiredProp<T> => ({
  type: Object as PropType<T>,
  required: true,
});

export const makeRequiredNumberProp = (): RequiredProp<number> => ({
  type: Number,
  required: true,
});

export const makeRequiredBooleanProp = (): RequiredProp<boolean> => ({
  type: Boolean,
  required: true,
});
