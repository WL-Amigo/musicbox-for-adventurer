interface ApplicationConfig {
  readonly GAPIKey: string | undefined;
  readonly GoogleOAuthClientId: string | undefined;
}

const unwrapEnvString = (value: string | boolean | undefined): string | undefined =>
  typeof value === 'string' ? value : undefined;

export const AppConfig: ApplicationConfig = {
  GAPIKey: unwrapEnvString(import.meta.env.VITE_APP_GAPI_KEY),
  GoogleOAuthClientId: unwrapEnvString(import.meta.env.VITE_APP_GAPI_OAUTH_CLIENT_ID),
};
