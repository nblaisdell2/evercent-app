import { useEffect, useState } from "react";
import { log } from "../utils/log";

/*
=============================
Add the following script under the root element in the HTML that's served to the user
for this site, in addition to the use of this React hook, so that the value is defaulted appropriately
=============================

// <!-- Script that runs before all other, which checks to see if
// the user wants to use dark mode or not, and sets the
// localStorage value if it doesn't exist yet. -->
// <script>
//   let useDarkMode = localStorage.getItem("useDarkMode");
//   if (useDarkMode && useDarkMode == "1"){
//     document.getElementsByTagName("html").item(0).className = "dark";
//   }
// </script>
*/

const DARK_MODE = "useDarkMode";
const USE_DARK_MODE = "1";
const DO_NOT_USE_DARK_MODE = "0";

export function useDarkMode() {
  // Grab the value set in localStorage for this key (maybe null, but always a string)
  const [useDarkMode, setUseDarkMode] = useState(false);
  const [darkMode, setDarkMode] = useState(localStorage.getItem(DARK_MODE));

  // // Then, let's return a boolean value, for ease of use, rather than working with a string or number
  // // If the value is null, the default is still set, so return false for using light mode.
  // // If the value is "0", we'll still be using light mode.
  // // Otherwise, if the value is "1", we'll set "useDarkMode = true"
  // if (darkMode && darkMode == USE_DARK_MODE) {
  //   setUseDarkMode(true);
  // }

  // Create a toggle function which updates our local state accordingly
  //   ** This will also trigger the useEffect below
  const toggle = () => {
    const newDarkMode = useDarkMode ? DO_NOT_USE_DARK_MODE : USE_DARK_MODE;
    setDarkMode(newDarkMode);

    const htmlEl = document.getElementsByTagName("html")?.item(0);
    if (htmlEl) {
      htmlEl.className = newDarkMode == USE_DARK_MODE ? "dark" : "";
    }
  };

  // Whenever the "darkMode" value updates, when the toggle is run, the value
  // in localStorage will be updated
  useEffect(() => {
    if (darkMode) localStorage.setItem(DARK_MODE, darkMode);
    setUseDarkMode(darkMode != null && darkMode == USE_DARK_MODE);
  }, [darkMode]);

  // Simply return a true/false for using dark mode, and a function which allows us to
  // toggle between light and dark mode
  return { darkMode: useDarkMode, toggle };
}
