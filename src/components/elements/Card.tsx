import React from "react";

function Card({ children, className }: { children?: any; className?: string }) {
  return (
    <div
      className={`bg-secondary rounded-xl shadow-md shadow-slate-400 dark:shadow-black overflow-y-auto ${
        className || ""
      }`}
    >
      {children}
    </div>
  );
}

export default Card;
