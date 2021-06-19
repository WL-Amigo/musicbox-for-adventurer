import { UnsubscribeHandler } from '../utils/Event';
import { IAsyncInitService } from './IAsyncInitService';
import { AuthState, IAuthService } from './IAuthService';
import { AppConfig } from '../Config';
import { Logger } from '../Logger';
import { createNanoEvents } from 'nanoevents';

const GoogleAPIScopes = ['https://www.googleapis.com/auth/drive.appdata', 'https://www.googleapis.com/auth/drive.file'];
const GoogleAPIDiscoveryDocs = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];

type AuthServiceEvents = {
  stateChanged: (state: AuthState) => void;
};

export class AuthService implements IAuthService, IAsyncInitService {
  public readonly isAsyncInitService = true;
  private readonly events = createNanoEvents<AuthServiceEvents>();
  private currentState: AuthState = { signedInWith: null };

  public async ensureInitialized(): Promise<void> {
    await this.initGoogle();
  }

  private async initGoogle(): Promise<void> {
    const apiKey = AppConfig.GAPIKey;
    const oAuthClientId = AppConfig.GoogleOAuthClientId;
    if (apiKey === undefined || oAuthClientId === undefined) {
      Logger.error('Google API の初期化に必要なデータが揃っていません');
      return;
    }

    await Promise.all([
      new Promise((res) => gapi.load('client:auth2', res)),
      new Promise((res) => gapi.load('picker', res)),
    ]);

    try {
      await gapi.client.init({
        apiKey,
        clientId: oAuthClientId,
        scope: GoogleAPIScopes.join(' '),
        discoveryDocs: GoogleAPIDiscoveryDocs,
      });
    } catch (error) {
      Logger.error(error);
      return;
    }

    const onSignedIn = (isSignedIn: boolean) => {
      if (isSignedIn) {
        this.onAuthStateChanged({
          signedInWith: 'google',
          accessToken: gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token,
          client: gapi.client,
        });
      }
    };
    gapi.auth2.getAuthInstance().isSignedIn.listen(onSignedIn);
    onSignedIn(gapi.auth2.getAuthInstance().isSignedIn.get());
  }

  public async loginWithGoogle(): Promise<void> {
    gapi.auth2.getAuthInstance().signIn();
  }

  public subscribeStateChanged(listener: (state: AuthState) => void): UnsubscribeHandler {
    listener(this.currentState);
    return this.events.on('stateChanged', listener);
  }

  private onAuthStateChanged(newState: AuthState): void {
    this.currentState = newState;
    this.events.emit('stateChanged', newState);
  }
}
