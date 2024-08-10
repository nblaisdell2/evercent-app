import React, { useState } from "react";
import { getMoneyString } from "../../utils/util";
import { log } from "../../utils/log";

function MyInput({
  value,
  onChange,
  className,
  isMoneyString,
}: {
  value: string | number;
  onChange?: (newValue: number) => void;
  className?: string;
  isMoneyString?: boolean;
}) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <input
      type="text"
      inputMode="numeric"
      value={isMoneyString ? getMoneyString(value) : value}
      onChange={(e) => {
        if (onChange) {
          let newValue = e.target.value;
          if (isMoneyString) newValue = newValue.replace("$", "");
          onChange(parseInt(newValue) || 0);
        }
      }}
      className={`rounded-md border border-black dark:border-gray-400 outline-none focus:-outline-offset-2 focus:outline-blue-900 dark:focus:outline-purple-800 bg-white dark:bg-black text-center  ${
        className || ""
      }`}
      onFocus={(e) => {
        e.target.select();
      }}
    />
  );
}

export default MyInput;
