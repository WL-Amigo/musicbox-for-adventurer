import { defineComponent, readonly, ref, Ref, Fragment, h, InjectionKey, provide, inject } from 'vue';
import { UnexpectedStateError } from '../errors/FatalError';

type FileInputComposition = {
  inputRef: Readonly<Ref<HTMLInputElement | undefined>>;
  openFileDialog: (fileListHandler: FileListHandler) => void;
};
const FileInputInjectionKey: InjectionKey<FileInputComposition> = Symbol('FileInputInjectionKey');

export const FileInputProvider = defineComponent({
  name: 'FileInputProvider',
  setup(_, ctx) {
    const inputRef = ref<HTMLInputElement>();
    const prevInputEventListenerRef = ref<EventListener>();

    const openFileDialog = (fileListHandler: FileListHandler): void => {
      const inputEl = inputRef.value;
      if (inputEl === undefined) {
        throw new UnexpectedStateError('input ref を取得できませんでした');
      }

      if (prevInputEventListenerRef.value !== undefined) {
        inputEl.removeEventListener('input', prevInputEventListenerRef.value);
      }
      const listener = createFileInputEventHandler(fileListHandler);
      inputEl.addEventListener('input', listener);
      prevInputEventListenerRef.value = listener;
      inputEl.click();
    };
    provide(FileInputInjectionKey, {
      inputRef,
      openFileDialog,
    });

    return () =>
      h(Fragment, null, [
        h('input', {
          type: 'file',
          class: 'hidden',
          id: '_fileInputProvider',
          name: '_fileInputProvider',
          ref: inputRef,
        }),
        ctx.slots.default?.(),
      ]);
  },
});

type FileListHandler = (fileList: readonly File[]) => void;

type OpenFileDialogComposition = {
  openFileDialog: (fileListHandler: FileListHandler) => void;
};
export const useOpenFileDialog = (): OpenFileDialogComposition => {
  const inputFileComp = inject(FileInputInjectionKey);

  const openFileDialog = (fileListHandler: FileListHandler): void => {
    if (inputFileComp === undefined) {
      throw new UnexpectedStateError('FileInputComposition が取得できませんでした');
    }

    inputFileComp.openFileDialog(fileListHandler);
  };

  return { openFileDialog };
};

export const createFileInputEventHandler = (fileListHandler: (fileList: readonly File[]) => void): EventListener => {
  return (e: Event) => {
    if (e.target instanceof HTMLInputElement && e.target.files !== null && e.target.files.length > 0) {
      fileListHandler(Array.from(e.target.files));
    }
  };
};

type DragAndDropFileInputComposition = {
  onDragEnterOrOver: (e: Event) => void;
  onDragLeave: (e: Event) => void;
  onDrop: (e: DragEvent) => void;
  isDragOvered: Readonly<Ref<boolean>>;
};
export const useDragAndDropFileInput = (
  fileListHandler: (fileList: readonly File[]) => void,
): DragAndDropFileInputComposition => {
  const isDragOvered = ref(false);
  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isDragOvered.value = false;

    if (e.dataTransfer?.files === undefined || e.dataTransfer.files.length === 0) {
      return;
    }
    fileListHandler(Array.from(e.dataTransfer.files));
  };
  const onDragEnterOrOver = (e: Event) => {
    e.preventDefault();
    isDragOvered.value = true;
  };
  const onDragLeave = (e: Event) => {
    e.preventDefault();
    isDragOvered.value = false;
  };

  return {
    onDragEnterOrOver,
    onDragLeave,
    onDrop,
    isDragOvered: readonly(isDragOvered),
  };
};
