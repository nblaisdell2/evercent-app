import React, { useRef } from "react";
import {
  useDatePickerState,
  DatePickerStateOptions,
} from "@react-stately/datepicker";
import { useDatePicker, DateValue } from "@react-aria/datepicker";
import { OverlayProvider } from "@react-aria/overlays";
import { CalendarDate, parseDate } from "@internationalized/date";

import { FieldButton } from "./datepicker/Button";
import { Calendar } from "./datepicker/Calendar";
import { DateField } from "./datepicker/DateField";
import { Popover } from "./datepicker/Popover";
import {
  CalendarIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { log } from "../../utils/log";

type MyDatePickerProps = Pick<
  DatePickerStateOptions<DateValue>,
  "value" | "minValue" | "maxValue" | "onChange" | "isDisabled"
> & {
  label?: string;
  classNamePosition: string;
};

export type DatePickerProps = {
  value: string;
  onChange: (newDate: string) => void;
  classNamePosition: string;
  minValue?: string;
  maxValue?: string;
  isDisabled?: boolean;
};

export default function MyDatePicker(props: DatePickerProps) {
  const getISODate = (newDate: CalendarDate | DateValue) => {
    return new Date(newDate.year, newDate.month - 1, newDate.day).toISOString();
  };

  const dpProps: MyDatePickerProps = {
    value: parseDate(props.value.substring(0, 10)),
    label: "DatePickerLabel",
    isDisabled: props.isDisabled,
    minValue: props.minValue
      ? parseDate(props.minValue.substring(0, 10))
      : undefined,
    maxValue: props.maxValue
      ? parseDate(props.maxValue.substring(0, 10))
      : undefined,
    onChange: (value: DateValue) => {
      props.onChange(getISODate(value));
    },
    classNamePosition: props.classNamePosition,
  };

  let state = useDatePickerState(dpProps);
  let ref = useRef(null);
  let {
    groupProps,
    labelProps,
    fieldProps,
    buttonProps,
    dialogProps,
    calendarProps,
  } = useDatePicker(dpProps, state, ref);
  // log("button props", { buttonProps, state, calendarProps });

  return (
    <OverlayProvider>
      <div className={`inline-flex flex-col text-left`}>
        <div
          {...groupProps}
          ref={ref}
          className={`flex group ${
            props?.isDisabled && "hover:cursor-not-allowed"
          }`}
        >
          <div className="bg-white dark:bg-black border border-gray-400 group-hover:border-gray-400 transition-colors rounded-l-md pr-10 group-focus-within:border-blue-900 group-focus-within:group-hover:border-blue-900 dark:group-focus-within:border-purple-800 dark:group-focus-within:group-hover:border-purple-800 p-1 relative flex items-center">
            <DateField {...fieldProps} isDisabled={props.isDisabled} />
            {state.validationState === "invalid" && (
              <ExclamationCircleIcon className="w-6 h-6 text-red-500 absolute right-1" />
            )}
          </div>
          <FieldButton
            {...buttonProps}
            isPressed={state.isOpen}
            isDisabled={props.isDisabled}
          >
            <CalendarIcon className="w-5 h-5 text-gray-700 dark:text-gray-400 group-focus-within:text-blue-900 dark:group-focus-within:text-purple-800" />
          </FieldButton>
        </div>
        {state.isOpen &&
          (props?.isDisabled == undefined || !props.isDisabled) && (
            <Popover
              {...dialogProps}
              isOpen={state.isOpen}
              onClose={() => state.setOpen(false)}
              classNamePosition={props?.classNamePosition || ""}
            >
              <Calendar {...calendarProps} />
            </Popover>
          )}
      </div>
    </OverlayProvider>
  );
}
