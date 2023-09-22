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
      className={`px-4 py-2 rounded-md shadow-slate-400 shadow-sm text-color-primary color-accent-secondary ${
        disabled ? "hover:cursor-not-allowed" : "color-accent-hover"
      } ${className || ""}`}
    >
      <div className="flex justify-center items-center">
        {icon}
        <div className="font-semibold text-lg">{buttonText}</div>
      </div>
    </button>
  );
}

export default MyButton;
