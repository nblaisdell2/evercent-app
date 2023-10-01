import { NoSymbolIcon } from "@heroicons/react/24/solid";
import React from "react";

function MyButton({
  disabled,
  icon,
  buttonText,
  onClick,
  className,
}: {
  disabled?: boolean;
  onClick?: () => void;
  icon?: JSX.Element;
  buttonText: JSX.Element | string;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 rounded-md shadow-slate-400 shadow-sm  ${
        disabled
          ? "hover:cursor-not-allowed bg-gray-300 text-black"
          : "color-accent-secondary color-accent-hover"
      } ${className || ""}`}
    >
      <div className="flex justify-center items-center">
        {disabled ? (
          <div>
            <NoSymbolIcon className="h-6 w-6 text-red-600 stroke-2 mr-1" />
          </div>
        ) : (
          <div>{icon}</div>
        )}
        <div className={`font-semibold text-lg ${disabled && "text-gray-500"}`}>
          {buttonText}
        </div>
      </div>
    </button>
  );
}

export default MyButton;
