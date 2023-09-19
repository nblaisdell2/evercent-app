import { useAuth0 } from "@auth0/auth0-react";
import React from "react";
import { log } from "../utils/log";
import { useSQLQuery } from "./hooks/useSQLQuery";
import { getAPIResponse } from "../utils/api";

const App = () => {
  log("In App.tsx");

  const { loginWithRedirect, logout, user, isAuthenticated, isLoading } =
    useAuth0();

  const { data, isLoading: queryLoading } = useSQLQuery(["data"], async () => {
    const { data, error, headers } = await getAPIResponse({
      method: "GET",
      url: "/",
    });

    if (error) throw new Error(error);
    return data.status;
  });

  log({ data, user });

  return (
    <div className="h-screen bg-blue-500 flex flex-col justify-center items-center space-y-4 text-white font-bold">
      <h1>Welcome to Evercent!</h1>

      {!isAuthenticated && !isLoading ? (
        <button onClick={() => loginWithRedirect()}>Sign In</button>
      ) : (
        <button onClick={() => logout()}>Sign Out</button>
      )}

      {queryLoading ? (
        <div>Loading data from API...</div>
      ) : data ? (
        <div>{data}</div>
      ) : (
        <div>API not working!!</div>
      )}
    </div>
  );
};

export default App;
