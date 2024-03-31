import { createNanoEvents } from 'nanoevents';
import { IKeyValueStore, IKeyValueStoreFactory } from './IKeyValueStore';
import { IPlayerSettingsService } from './IPlayerSettingsService';
import { IAsyncInitService } from './IAsyncInitService';
import { UnsubscribeHandler } from '../utils/Event';

interface PlayerSettingsData {
  readonly masterVolume: number;
}
const createInitPlayerSettings = (): PlayerSettingsData => ({
  masterVolume: 0.6,
});
const PlayerSettingsKey = 'settings';

type PlayerSettingsServiceEvents = {
  masterVolumeChanged: (linearGain: number) => void;
};

export class PlayerSettingsService implements IPlayerSettingsService, IAsyncInitService {
  public readonly isAsyncInitService = true;
  private readonly store: IKeyValueStore<PlayerSettingsData>;
  private readonly events = createNanoEvents<PlayerSettingsServiceEvents>();
  private currentPlayerSettings: PlayerSettingsData = createInitPlayerSettings();

  public constructor(kvsFactory: IKeyValueStoreFactory) {
    this.store = kvsFactory.create('PlayerSettings');
  }

  public async ensureInitialized(): Promise<void> {
    this.currentPlayerSettings = (await this.store.get(PlayerSettingsKey)) ?? createInitPlayerSettings();
  }

  public getMasterVolume(): number {
    return this.currentPlayerSettings.masterVolume;
  }

  public getMasterVolumeCurveApplied(): number {
    return Math.pow(this.currentPlayerSettings.masterVolume, 3);
  }

  public async setMasterVolume(linearGain: number): Promise<void> {
    this.currentPlayerSettings = {
      ...this.currentPlayerSettings,
      masterVolume: Math.max(0, Math.min(1, linearGain)),
    };
    this.notifyMasterVolumeChanged();
    await this.saveSettings();
  }

  private async saveSettings(): Promise<void> {
    await this.store.set(PlayerSettingsKey, this.currentPlayerSettings);
  }

  public listenMasterVolumeChanged(
    handler: PlayerSettingsServiceEvents['masterVolumeChanged'],
    applyCurve = false,
  ): UnsubscribeHandler {
    return this.events.on('masterVolumeChanged', (linearGain) => {
      if (applyCurve) {
        handler(Math.pow(linearGain, 3));
      } else {
        handler(linearGain);
      }
    });
  }

  private notifyMasterVolumeChanged(): void {
    this.events.emit('masterVolumeChanged', this.currentPlayerSettings.masterVolume);
  }
}
