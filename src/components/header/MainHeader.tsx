import { useAuth0 } from "@auth0/auth0-react";
import React from "react";
import MyToggle from "../elements/MyToggle";
import { useDarkMode } from "../../hooks/useDarkMode";
import { getIcon } from "../elements/MyIcon";

function MainHeader() {
  const { loginWithRedirect, logout, user, isAuthenticated } = useAuth0();
  const { darkMode, toggle } = useDarkMode();

  return (
    <div className="color-accent text-white text-xl font-cinzel py-1 flex justify-between items-center">
      <div className="flex items-center ml-5">
        <div className="h-10 w-10 relative">
          <img src="/evercent_logo.png" />
        </div>
        <div className="ml-1">EverCent</div>
      </div>

      <div className="text-center">
        {isAuthenticated ? "Welcome, " + user?.nickname : "Welcome"}
      </div>

      <div className="flex space-x-8 mr-5">
        <MyToggle
          checked={darkMode}
          onToggle={toggle}
          checkedColor="#343434"
          uncheckedColor="#D4D4D4"
          checkedIcon={getIcon(true, "DarkMode")}
          uncheckedIcon={getIcon(true, "LightMode")}
        />

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
