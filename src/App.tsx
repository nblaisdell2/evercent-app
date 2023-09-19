import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useSQLQuery } from "./hooks/useSQLQuery";
import { useSQLMutation } from "./hooks/useSQLMutation";
import { UserData, getAllEvercentData } from "./model/userData";
import { Budget, FAKE_BUDGET_ID, connectToYNAB } from "./model/budget";
import { CategoryGroup, ExcludedCategory } from "./model/category";
import { AutoRun } from "./model/autoRun";
import { log } from "./utils/log";

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
    <div className="h-screen bg-blue-500 flex flex-col justify-center items-center space-y-4 text-white font-bold">
      <h1>Welcome to Evercent!</h1>

      {!isAuthenticated && !isLoading ? (
        <button onClick={() => loginWithRedirect()}>Sign In</button>
      ) : (
        <button onClick={() => logout()}>Sign Out</button>
      )}

      {emailReady &&
        (queryLoading ? (
          <div>Loading data from API...</div>
        ) : evercentData ? (
          <>
            <div>{JSON.stringify(evercentData.userData)}</div>

            {evercentData.userData?.budgetID == FAKE_BUDGET_ID && (
              <button onClick={() => connect()}>Connect to YNAB</button>
            )}
          </>
        ) : (
          <div>API not working!!</div>
        ))}
    </div>
  );
};

export default App;
