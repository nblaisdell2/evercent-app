import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useSQLQuery } from "./hooks/useSQLQuery";
import { useSQLMutation } from "./hooks/useSQLMutation";
import { UserData, getAllEvercentData } from "./model/userData";
import { Budget, connectToYNAB } from "./model/budget";
import { CategoryGroup, ExcludedCategory } from "./model/category";
import { AutoRun } from "./model/autoRun";
import { log } from "./utils/log";
import Header from "./components/Header";
import MainContent from "./components/MainContent";

export type EvercentData = {
  userData: UserData | null;
  budget: Budget | null;
  categoryGroups: CategoryGroup[];
  excludedCategories: ExcludedCategory[];
  autoRuns: AutoRun[];
  pastRuns: AutoRun[];
};

const App = () => {
  const { loginWithRedirect, logout, user, isAuthenticated, isLoading } =
    useAuth0();

  const emailReady = !!user?.email;

  const { data: evercentData, isLoading: queryLoading } = useSQLQuery(
    ["data"],
    getAllEvercentData(user?.email),
    emailReady
  );

  const { mutate: connect, error: connectError } = useSQLMutation(
    ["connect-to-ynab"],
    connectToYNAB(evercentData?.userData?.userID as string)
  );

  log({ evercentData, user });

  return (
    <div className="flex flex-col h-screen bg-primary">
      <Header />

      <MainContent />
    </div>
  );
};

export default App;
