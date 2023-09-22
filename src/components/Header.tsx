import React from "react";
import MainHeader from "./header/MainHeader";
import YNABConnection from "./header/YNABConnection";
import UserDetails from "./header/UserDetails";
import { UserData } from "../model/userData";
import { Budget } from "../model/budget";

function Header({
  userData,
  budget,
}: {
  userData: UserData | undefined;
  budget: Budget | null | undefined;
}) {
  return (
    <div className="sticky top-0 left-0 z-10">
      <MainHeader />

      {userData && (
        <div className="bg-secondary flex justify-between px-10 py-1 border-b border-black">
          <YNABConnection userID={userData.userID} budget={budget} />
          <UserDetails />
        </div>
      )}
    </div>
  );
}

export default Header;
