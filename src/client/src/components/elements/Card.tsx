import React from "react";

function Card({
  onClick,
  children,
  className,
}: {
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  children?: any;
  className?: string;
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-secondary rounded-xl shadow-md shadow-slate-400 dark:shadow-black border-t border-gray-300 dark:border-gray-500 overflow-y-auto ${
        className || ""
      }`}
    >
      {children}
    </div>
  );
}

export default Card;
