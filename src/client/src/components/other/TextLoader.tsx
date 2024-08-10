import React from "react";
import SkeletonLoader from "tiny-skeleton-loader-react";

function TextLoader() {
  return (
    <>
      <div className="hidden dark:block mt-1">
        <SkeletonLoader
          width={"90px"}
          height={"20px"}
          background={"#737373"}
          block={true}
          circle={false}
          radius={"4px"}
        />
      </div>
      <div className="block dark:hidden mt-1">
        <SkeletonLoader
          width={"90px"}
          height={"20px"}
          background={"#C3C3C3"}
          block={true}
          circle={false}
          radius={"4px"}
        />
      </div>
    </>
  );
}

export default TextLoader;
