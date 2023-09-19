import React from "react";
import { log, logWarn, logError } from "../utils/log";
import { getAPIResponse } from "../utils/api";
import { useSQLQuery } from "./hooks/useSQLQuery";

// Schema of return data from API
type Data = {
  userId: number;
  id: number;
  title: string;
  body: string;
};

const App = () => {
  // useQuery syntax
  //  data      = Return data from query
  //  isLoading = true if still loading. Allows us to render conditionally
  //  isError   = true if an error occurred during the query
  //  queryKey  = used for caching
  //  queryFn   = function used to actually query some API and return to useQuery
  const { data, isLoading, isError } = useSQLQuery(["data"], async () => {
    logWarn("Getting data from API");
    // Sample JSON endpoint. Switch with a real API endpoint
    const url = "https://jsonplaceholder.typicode.com/posts/1";
    log("URL", url);
    const { data } = await getAPIResponse({
      method: "GET",
      url,
    });
    log("Got data", data);
    // Casting the data to our known schema before returning, for maximum type-safety
    logWarn("Getting data from API - COMPLETE");
    return data as Data;
  });

  return (
    <div className="h-screen bg-blue-500 flex flex-col justify-center items-center space-y-4 text-white font-bold">
      <h1>Welcome to React App that's built using Webpack and Babel</h1>

      <p>Version 2!</p>

      {/* Conditionally rendering a loading state when the data
          hasn't been returned yet */}
      {isLoading ? (
        <div>Loading data from API...</div>
      ) : (
        <div>{JSON.stringify(data)}</div>
      )}
    </div>
  );
};

export default App;
