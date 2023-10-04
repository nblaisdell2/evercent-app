import React, { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { log } from "./utils/log";

import MainContent from "./components/MainContent";
import LoadingScreen from "./components/other/LoadingScreen";
import Header from "./components/Header";

function App() {
  log("RENDERING [App.tsx]");

  const { isLoading } = useAuth0();
  if (isLoading) return <LoadingScreen />;

  return (
    <div className={`flex flex-col h-screen bg-primary text-color-primary`}>
      <Header />
      <MainContent />
    </div>
  );
}

export default App;