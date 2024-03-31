import { UnsubscribeHandler } from "../utils/Event";

export interface IPlayerSettingsService {
  getMasterVolume(): number;
  getMasterVolumeCurveApplied(): number;
  setMasterVolume(linearGain: number): Promise<void>;
  listenMasterVolumeChanged(handler: (gain: number) => void, applyCurve?: boolean): UnsubscribeHandler;
}