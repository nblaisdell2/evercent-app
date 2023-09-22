import React, { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useSQLQuery } from "./hooks/useSQLQuery";
import { log } from "./utils/log";

import { UserData, getAllEvercentData } from "./model/userData";
import { Budget } from "./model/budget";
import { CategoryGroup, ExcludedCategory } from "./model/category";
import { AutoRun } from "./model/autoRun";

import MainContent from "./components/MainContent";
import LoadingScreen from "./components/other/LoadingScreen";
import Header from "./components/Header";

export type EvercentData = {
  userData: UserData;
  budget: Budget | null;
  categoryGroups: CategoryGroup[];
  excludedCategories: ExcludedCategory[];
  autoRuns: AutoRun[];
  pastRuns: AutoRun[];
};

function App() {
  const { user, isAuthenticated, isLoading } = useAuth0();

  const emailReady = !!user?.email;
  log("emailReady", emailReady);

  const { data: evercentData, isLoading: queryLoading } = useSQLQuery(
    ["data"],
    getAllEvercentData(user?.email),
    emailReady
  );

  log({ evercentData, user });

  if (isLoading || (isAuthenticated && queryLoading)) return <LoadingScreen />;

  return (
    <div className={`flex flex-col h-screen bg-primary`}>
      <Header userData={evercentData?.userData} budget={evercentData?.budget} />

      <MainContent />
    </div>
  );
}

export default App;
