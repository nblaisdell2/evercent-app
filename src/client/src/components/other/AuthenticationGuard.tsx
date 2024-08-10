import { withAuthenticationRequired } from "@auth0/auth0-react";
import React from "react";
import LoadingScreen from "./LoadingScreen";

export const AuthenticationGuard = ({ component }: { component: any }) => {
  const Component = withAuthenticationRequired(component, {
    onRedirecting: () => <LoadingScreen />,
  });

  return <Component />;
};
