/* eslint-disable @typescript-eslint/no-unsafe-return */
export type Constructor<T = any> = new (...args: any[]) => T;

export function toFactory<C extends Constructor>(ctor: C) {
  return (...args: ConstructorParameters<C>): InstanceType<C> =>
    new ctor(...args);
}
