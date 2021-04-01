import { IKeyValueStore, IKeyValueStoreFactory } from './IKeyValueStore';
import LocalForage from 'localforage';

class LocalForageKeyValueStore<ValueType> implements IKeyValueStore<ValueType> {
  private readonly store: LocalForage;

  public constructor(storeName: string) {
    this.store = LocalForage.createInstance({ storeName });
  }

  public get(key: string): Promise<ValueType | null> {
    return this.store.getItem(key);
  }
  public async set(key: string, value: ValueType): Promise<void> {
    await this.store.setItem(key, value);
  }
}

export class LocalForageKeyValueStoreFactory implements IKeyValueStoreFactory {
  public constructor() {
    LocalForage.config({
      name: 'musicbox-for-adventurer',
    });
  }

  public create<ValueType>(storeName: string): IKeyValueStore<ValueType> {
    return new LocalForageKeyValueStore(storeName);
  }
}
