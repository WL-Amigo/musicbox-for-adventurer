import { UnsubscribeHandler } from '../utils/Event';

export type AuthStateChangedHandler = (state: AuthState) => void;

export interface IAuthService {
  subscribeStateChanged(listener: AuthStateChangedHandler): UnsubscribeHandler;
  loginWithGoogle(): void;
}

export type AuthState =
  | {
      signedInWith: null;
    }
  | {
      signedInWith: 'google';
      accessToken: string;
      client: any;
    };
