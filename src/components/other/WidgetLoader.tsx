import React from "react";
import ReactLoading from "react-loading";

function WidgetLoader() {
  return (
    <>
      <div className="flex dark:hidden h-full justify-center items-center">
        <ReactLoading
          type={"bars"}
          color={"#1E3A8A"}
          height={200}
          width={200}
        />
      </div>
      <div className="hidden dark:flex h-full justify-center items-center">
        <ReactLoading
          type={"bars"}
          color={"#6B21A8"}
          height={200}
          width={200}
        />
      </div>
    </>
  );
}

export default WidgetLoader;
