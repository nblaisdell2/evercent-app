import { CheckIcon, MinusIcon } from "@heroicons/react/24/outline";
import React from "react";

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
        isLocked ? "bg-gray-400" : "bg-blue-900"
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
        <MinusIcon className={`h-4 w-4 text-white stroke-2`} />
      ) : (
        <CheckIcon className={`h-4 w-4 text-white stroke-2`} />
      )}
    </div>
  );
}

export default MyCheckbox;
