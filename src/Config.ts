interface ApplicationConfig {
  readonly GAPIKey: string | undefined;
  readonly GoogleOAuthClientId: string | undefined;
}

const GAPIKey = import.meta.env.VITE_APP_GAPI_KEY;
const GoogleOAuthClientId = import.meta.env.VITE_APP_GAPI_OAUTH_CLIENT_ID;

export const AppConfig: ApplicationConfig = {
  GAPIKey: typeof GAPIKey === 'string' ? GAPIKey : undefined,
  GoogleOAuthClientId: typeof GoogleOAuthClientId === 'string' ? GoogleOAuthClientId : undefined,
};
