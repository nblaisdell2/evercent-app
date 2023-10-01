import React, { useRef } from "react";
import { useButton } from "@react-aria/button";
import { useFocusRing } from "@react-aria/focus";
import { mergeProps } from "@react-aria/utils";
import { log } from "../../../utils/log";

export function CalendarButton(props: any) {
  let ref = useRef(null);
  let { buttonProps } = useButton(props, ref);
  let { focusProps, isFocusVisible } = useFocusRing();
  return (
    <button
      {...mergeProps(buttonProps, focusProps)}
      ref={ref}
      className={`p-2 rounded-full ${
        props.isDisabled ? "text-gray-400 hover:cursor-not-allowed" : ""
      } ${
        !props.isDisabled
          ? "hover:bg-blue-100 dark:hover:bg-purple-300 dark:hover:text-black active:bg-blue-200 dark:active:bg-purple-400"
          : ""
      } outline-none ${
        isFocusVisible ? "ring-2 ring-offset-2 ring-purple-600" : ""
      }`}
    >
      {props.children}
    </button>
  );
}

export function FieldButton(props: any) {
  let ref = useRef(null);
  let { buttonProps, isPressed } = useButton(props, ref);
  return (
    <button
      {...buttonProps}
      ref={ref}
      className={`px-6 -ml-px border border-gray-400 transition-colors rounded-r-md dark:bg-black group-focus-within:border-blue-900 group-focus-within:group-hover:border-blue-900 dark:group-focus-within:border-purple-800 dark:group-focus-within:group-hover:border-purple-800 outline-none ${
        isPressed || props.isPressed ? "bg-gray-200" : "bg-gray-50"
      } ${props.isDisabled && "hover:cursor-not-allowed"}`}
    >
      {props.children}
    </button>
  );
}

export default { CalendarButton, FieldButton };
