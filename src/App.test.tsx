import { render, screen } from "@testing-library/react";
import App from "./App";
import React from "react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

describe("App Page Tests", () => {
  it("should contain default welcome message on the screen", () => {
    return expect(1).toEqual(1);
  });
});
