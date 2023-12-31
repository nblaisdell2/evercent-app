import * as React from "react";
import type { AriaSelectProps } from "@react-types/select";
import { useSelectState } from "react-stately";
import {
  useSelect,
  HiddenSelect,
  useButton,
  mergeProps,
  useFocusRing,
  AriaSelectOptions,
} from "react-aria";
import { ChevronDownIcon } from "@heroicons/react/24/solid";

import { ListBox } from "./ListBox";
import { Popover } from "./Popover";
import { log } from "../../../utils/log";

export function Select<T extends object>(props: AriaSelectProps<T>) {
  // Create state based on the incoming props
  let state = useSelectState(props);

  // Get props for child elements from useSelect
  let ref = React.useRef(null);
  let { labelProps, triggerProps, valueProps, menuProps } = useSelect(
    {} as AriaSelectOptions<unknown>,
    state,
    ref
  );

  // Get props for the button based on the trigger props from useSelect
  let { buttonProps } = useButton(triggerProps, ref);

  let { focusProps, isFocusVisible } = useFocusRing();

  return (
    <div {...labelProps} className="inline-flex flex-col relative w-28">
      <div className="block text-sm font-medium text-gray-700 text-left cursor-default">
        {props.label}
      </div>
      <HiddenSelect
        state={state}
        triggerRef={ref}
        label={props.label}
        name={props.name}
      />
      <button
        {...mergeProps(buttonProps, focusProps)}
        ref={ref}
        className={`p-1 pl-3 relative inline-flex flex-row items-center justify-between rounded-md overflow-hidden cursor-pointer shadow-sm border-2 dark:border bg-white dark:bg-[#161616] outline-none ${
          isFocusVisible || (state.isOpen && !props.isDisabled)
            ? "border-color-accent"
            : "border-gray-300"
        } ${props.isDisabled ? "bg-gray-200 hover:cursor-not-allowed" : ""}`}
      >
        <span
          {...valueProps}
          className={`text-md ${
            state.selectedItem
              ? props.isDisabled
                ? "text-[#919090]"
                : "text-color-primary"
              : "text-gray-500"
          } ${props.isDisabled && "hover:cursor-not-allowed"}`}
        >
          {state.selectedItem
            ? state.selectedItem.rendered
            : "Select an option"}
        </span>
        <ChevronDownIcon
          className={`w-5 h-5 ${
            isFocusVisible ? "text-color-accent" : "text-gray-500"
          }`}
        />
      </button>
      {state.isOpen && !props.isDisabled && (
        <Popover
          state={state}
          triggerRef={ref}
          placement="bottom start"
          className="w-28"
        >
          <ListBox {...menuProps} state={state} />
        </Popover>
      )}
    </div>
  );
}
