import React from "react";

type Props = {
  leftSideTrue: boolean;
  leftValue: string;
  rightValue: string;
  onToggle: (toggleValue: boolean) => void;
};

function MyToggleButton({
  leftSideTrue,
  leftValue,
  rightValue,
  onToggle,
}: Props) {
  return (
    <div className="flex border-2 border-color-accent rounded-md font-bold text-sm sm:text-base">
      <div
        className={`p-[3px] w-auto min-w-[80px] px-2 text-center whitespace-nowrap hover:cursor-pointer ${
          leftSideTrue
            ? "color-accent text-white font-bold hover:font-bold"
            : "hover:bg-blue-900 dark:hover:bg-purple-800  hover:opacity-70 hover:text-white hover:font-bold"
        }`}
        onClick={() => onToggle(true)}
      >
        {leftValue}
      </div>
      <div
        className={`p-[3px] w-auto whitespace-nowrap min-w-[80px] px-2 text-center hover:cursor-pointer ${
          !leftSideTrue
            ? "color-accent font-bold text-white hover:font-bold"
            : "hover:bg-blue-900 dark:hover:bg-purple-800 hover:opacity-70 hover:text-white hover:font-bold"
        }`}
        onClick={() => onToggle(false)}
      >
        {rightValue}
      </div>
    </div>
  );
}

export default MyToggleButton;
