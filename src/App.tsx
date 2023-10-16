import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { log } from "./utils/log";

import MainContent from "./components/MainContent";
import LoadingScreen from "./components/other/LoadingScreen";
import Header from "./components/Header";

function App() {
  log("RENDERING [App.tsx]");

  // This is the code returned from Auth0 when logging in.
  // This will force a reload, and flash the page beforehand, so checking
  // for this URL param will allow me to continue showing the loading screen
  // until the user is fully logged in
  const stillLoading = new URLSearchParams(window.location.search).has("code");

  const { isLoading } = useAuth0();
  if (isLoading || stillLoading) return <LoadingScreen />;

  return (
    <div className={`flex flex-col h-screen bg-primary text-color-primary`}>
      <Header />
      <MainContent />
    </div>
  );
}

export default App;
