import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import MainHeader from "./header/MainHeader";
import YNABConnection from "./header/YNABConnection";
import UserDetails from "./header/UserDetails";

function Header() {
  const { isAuthenticated } = useAuth0();

  return (
    <div className="sticky top-0 left-0 z-10">
      <MainHeader />

      {isAuthenticated && (
        <div className="bg-secondary flex justify-between px-10 py-1 border-b border-black">
          <YNABConnection />
          <UserDetails />
        </div>
      )}
    </div>
  );
}

export default Header;
