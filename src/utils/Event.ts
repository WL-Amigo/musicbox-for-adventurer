export type UnsubscribeHandler = () => void;

export const registerEventHandler = <HandlerType extends (...payload: never[]) => void>(
  handlerArray: HandlerType[],
  listener: HandlerType,
): UnsubscribeHandler => {
  handlerArray.push(listener);
  return () => handlerArray.splice(handlerArray.indexOf(listener), 1);
};
