import { registerEventHandler, UnsubscribeHandler } from '../utils/Event';
import { IAsyncInitService } from './IAsyncInitService';
import { AuthState, IAuthService } from './IAuthService';
import { AppConfig } from '../Config';

export class AuthService implements IAuthService, IAsyncInitService {
  public readonly isAsyncInitService = true;
  private readonly stateChangedListeners: ((state: AuthState) => void)[] = [];
  private currentState: AuthState = { signedInWith: null };

  public async ensureInitialized(): Promise<void> {
    await this.initGoogle();
  }

  private async initGoogle(): Promise<void> {
    const apiKey = AppConfig.GAPIKey;
    const oAuthClientId = AppConfig.GoogleOAuthClientId;
    if (apiKey === undefined || oAuthClientId === undefined) {
      console.error('Google API の初期化に必要なデータが揃っていません');
      return;
    }

    await Promise.all([
      new Promise((res) => gapi.load('client:auth2', res)),
      new Promise((res) => gapi.load('picker', res)),
    ]);

    await gapi.client.init({
      apiKey,
      clientId: oAuthClientId,
      scope: ['https://www.googleapis.com/auth/drive.appdata', 'https://www.googleapis.com/auth/drive.file'].join(' '),
      discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
    });
    gapi.auth2.getAuthInstance().isSignedIn.listen((isSignedIn: boolean) => {
      if (isSignedIn) {
        this.onAuthStateChanged({
          signedInWith: 'google',
          accessToken: gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token,
          client: gapi.client,
        });
      }
    });
    if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
      this.onAuthStateChanged({
        signedInWith: 'google',
        accessToken: gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token,
        client: gapi.client,
      });
    }
  }

  public async loginWithGoogle(): Promise<void> {
    gapi.auth2.getAuthInstance().signIn();
  }

  public subscribeStateChanged(listener: (state: AuthState) => void): UnsubscribeHandler {
    return registerEventHandler(this.stateChangedListeners, listener, this.currentState);
  }

  private onAuthStateChanged(newState: AuthState): void {
    this.currentState = newState;
    this.stateChangedListeners.forEach((listener) => listener(newState));
  }
}
