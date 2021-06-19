import { registerEventHandler, UnsubscribeHandler } from '../utils/Event';
import { IAppDataSyncService, SyncFinishedEventHandler } from './IAppDataSyncService';
import { AuthState, IAuthService } from './IAuthService';
import { ILoopInfoDatabase } from './ILoopInfoDatabase';
import { GoogleAppDataSync } from './private/AppDataSyncService/GoogleAppDataSync';
import { IAppDataSyncStrategy } from './private/AppDataSyncService/IAppDataSyncStrategy';

export class AppDataSyncService implements IAppDataSyncService {
  private readonly syncFinishedEventHandlers: SyncFinishedEventHandler[] = [];
  private currentStrategy: IAppDataSyncStrategy | null = null;

  public constructor(authService: IAuthService, private readonly loopInfoDatabase: ILoopInfoDatabase) {
    authService.subscribeStateChanged((state) => this.onAuthStateChanged(state));
    loopInfoDatabase.subscribeLoopInfoUpdated(() => this.onLoopInfoDatabaseUpdated());
  }

  private async onAuthStateChanged(state: AuthState): Promise<void> {
    if (state.signedInWith === null) {
      this.currentStrategy = null;
      return;
    }

    switch (state.signedInWith) {
      case 'google':
        this.currentStrategy = new GoogleAppDataSync(state.accessToken, this.loopInfoDatabase);
    }
    await this.pullAppData();
    await this.pushAppData();
    this.onSyncFinished();
  }

  private async onLoopInfoDatabaseUpdated(): Promise<void> {
    await this.pushAppData();
    this.onSyncFinished();
  }

  private async pullAppData() {
    if (this.currentStrategy === null) {
      return;
    }

    await this.currentStrategy.pullLoopInfoDatabase();
  }

  private async pushAppData() {
    if (this.currentStrategy === null) {
      return;
    }

    await this.currentStrategy.pushLoopInfoDatabase();
  }

  public subscribeSyncFinished(handler: SyncFinishedEventHandler): UnsubscribeHandler {
    return registerEventHandler(this.syncFinishedEventHandlers, handler);
  }

  private onSyncFinished(): void {
    this.syncFinishedEventHandlers.forEach((handler) => handler());
  }
}
