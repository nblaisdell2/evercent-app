import { useAuth0 } from "@auth0/auth0-react";
import React from "react";
import MyToggle from "./elements/MyToggle";
import { SunIcon } from "@heroicons/react/24/outline";
import { MoonIcon } from "@heroicons/react/24/solid";
import { useDarkMode } from "../hooks/useDarkMode";

function MainHeader() {
  const { loginWithRedirect, logout, user, isAuthenticated } = useAuth0();
  const { darkMode, toggle } = useDarkMode();

  return (
    <div className="bg-blue-900 text-white text-xl font-cinzel py-1 flex justify-between items-center">
      <div className="flex items-center ml-5">
        <div className="h-10 w-10 relative">
          <img src="/evercent_logo.png" />
        </div>
        <div className="ml-1">EverCent</div>
      </div>

      <div className="text-center">
        {isAuthenticated ? "Welcome, " + user?.nickname : "Welcome"}
      </div>

      <MyToggle
        checked={darkMode}
        onToggle={toggle}
        checkedColor="#343434"
        uncheckedColor="#D4D4D4"
        checkedIcon={<MoonIcon className="h-7 w-7 text-yellow-300" />}
        uncheckedIcon={<SunIcon className="h-7 w-7 text-orange-400" />}
      />

      <div className="whitespace-nowrap mr-5">
        {isAuthenticated ? (
          <button className="hover:underline" onClick={() => logout()}>
            Log out
          </button>
        ) : (
          <button
            className="hover:underline"
            onClick={() => loginWithRedirect()}
          >
            Log in
          </button>
        )}
      </div>
    </div>
  );
}

export default MainHeader;
