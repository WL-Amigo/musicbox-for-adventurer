export interface IKeyValueStore<ValueType> {
  get(key: string): Promise<ValueType | null>;
  set(key: string, value: ValueType): Promise<void>;
  getAll(): Promise<ValueType[]>;
}

export interface IKeyValueStoreFactory {
  create<ValueType>(storeName: string): IKeyValueStore<ValueType>;
}
