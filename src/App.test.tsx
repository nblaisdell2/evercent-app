import { render, screen } from "@testing-library/react";
import App from "./App";
import React from "react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

describe("App Page Tests", () => {
  it("should contain default welcome message on the screen", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    );

    const myDiv = screen.getByText(
      "Welcome to React App that's built using Webpack and Babel"
    );
    expect(myDiv).toBeInTheDocument();
  });
});
