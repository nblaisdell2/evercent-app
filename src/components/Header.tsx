import React from "react";
import MainHeader from "./MainHeader";
import YNABConnection from "./YNABConnection";
import UserDetails from "./UserDetails";

function Header() {
  return (
    <div className="sticky top-0 left-0 z-10">
      <MainHeader />

      <div className="bg-secondary flex justify-between px-10 py-1 border-b border-black">
        <YNABConnection />
        <UserDetails />
      </div>
    </div>
  );
}

export default Header;
