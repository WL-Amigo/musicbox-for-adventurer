export type UnsubscribeHandler = () => void;

export const registerEventHandler = <HandlerType extends (...payload: never[]) => void>(
  handlerArray: HandlerType[],
  listener: HandlerType,
  ...payload: Parameters<HandlerType>
): UnsubscribeHandler => {
  handlerArray.push(listener);
  listener(...payload);
  return () => handlerArray.splice(handlerArray.indexOf(listener), 1);
};
