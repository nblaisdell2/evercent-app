import React from "react";
import { AppState, Auth0Provider, User } from "@auth0/auth0-react";

export const Auth0ProviderWithNavigate = ({ children }: any) => {
  const domain = process.env.CLIENT_AUTH0_DOMAIN;
  const clientId = process.env.CLIENT_AUTH0_CLIENT_ID;
  const redirectUri = process.env.CLIENT_AUTH0_REDIRECT_URI;

  const onRedirectCallback = (
    appState: AppState | undefined,
    user: User | undefined
  ) => {
    const newLoc = appState?.returnTo || window.location.pathname;
    window.location.href = newLoc;
  };

  if (!(domain && clientId && redirectUri)) {
    return null;
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: redirectUri,
      }}
      onRedirectCallback={onRedirectCallback}
    >
      {children}
    </Auth0Provider>
  );
};
