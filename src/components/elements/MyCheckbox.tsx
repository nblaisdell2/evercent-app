import React from "react";
import MyIcon from "./MyIcon";

function MyCheckbox({
  selected,
  parentIsHovered,
  isDet,
  isAll,
  isLocked,
}: {
  selected: boolean;
  parentIsHovered: boolean;
  isDet: boolean;
  isAll: boolean;
  isLocked: boolean;
}) {
  return (
    <div
      className={`flex justify-center items-center ${
        isLocked
          ? "bg-gray-400"
          : selected || isDet
          ? "color-accent"
          : "bg-transparent"
      } h-4 w-4 border border-gray-400 rounded-[4px] mr-1 ${
        selected || isDet
          ? "bg-opacity-100 text-white"
          : parentIsHovered
          ? "bg-opacity-50"
          : "bg-opacity-0"
      } ${
        selected ? "group-hover:bg-opacity-100" : "group-hover:bg-opacity-50"
      }`}
    >
      {isDet && !isAll && !parentIsHovered ? (
        <MyIcon
          iconType={"MinusIcon"}
          className={`h-4 w-4 text-white stroke-2`}
        />
      ) : (
        <>
          <div className="block dark:hidden">
            <MyIcon
              iconType={"CheckMark"}
              className={`h-4 w-4 ${
                selected || parentIsHovered
                  ? "dark:text-[#373737]"
                  : "text-[#F6F9FA]"
              } stroke-2`}
            />
          </div>
          <div className="hidden dark:block">
            <MyIcon
              iconType={"CheckMark"}
              className={`h-4 w-4 ${
                selected || parentIsHovered
                  ? "text-[#F6F9FA]"
                  : "dark:text-[#373737]"
              } stroke-2`}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default MyCheckbox;
