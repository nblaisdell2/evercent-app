const getDateString = () => {
  const currDate = new Date();
  return (
    "[" +
    currDate.getFullYear() +
    "-" +
    (currDate.getMonth() + 1).toString().padStart(2, "0") +
    "-" +
    currDate.getDate().toString().padStart(2, "0") +
    " " +
    currDate.getHours().toString().padStart(2, "0") +
    ":" +
    currDate.getMinutes().toString().padStart(2, "0") +
    ":" +
    currDate.getSeconds().toString().padStart(2, "0") +
    "]"
  );
};

export const logError = console.error.bind(console, getDateString(), "//");
export const logWarn = console.warn.bind(console, getDateString(), "//");
export const log = console.log.bind(console, getDateString(), "//");
