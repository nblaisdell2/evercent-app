import React from "react";
import MainHeader from "./header/MainHeader";
import YNABConnection from "./header/YNABConnection";
import UserDetails from "./header/UserDetails";
import { UserData } from "../model/userData";
import { Budget } from "../model/budget";
import { useAuth0 } from "@auth0/auth0-react";

function Header({
  isLoading,
  userData,
  budget,
}: {
  isLoading: boolean;
  userData: UserData | undefined;
  budget: Budget | null | undefined;
}) {
  const { isAuthenticated } = useAuth0();

  return (
    <div className="sticky top-0 left-0 z-10">
      <MainHeader />

      {isAuthenticated && (
        <div className="bg-secondary flex justify-between px-10 py-1 border-b border-black">
          <YNABConnection
            userID={userData?.userID as string}
            budget={budget}
            isLoading={isLoading}
          />
          <UserDetails isLoading={isLoading} />
        </div>
      )}
    </div>
  );
}

export default Header;
