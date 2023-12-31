import React, { useRef } from "react";
import { useLocale } from "@react-aria/i18n";
import { useDateFieldState } from "@react-stately/datepicker";
import { useDateField, useDateSegment } from "@react-aria/datepicker";
import { createCalendar } from "@internationalized/date";

export function DateField(props: any) {
  let { locale } = useLocale();
  let state = useDateFieldState({
    ...props,
    locale,
    createCalendar,
  });

  let ref = useRef(null);
  let { fieldProps } = useDateField(props, state, ref);

  return (
    <div {...fieldProps} ref={ref} className="flex">
      {state.segments.map((segment, i) => (
        <DateSegment
          key={i}
          idx={i}
          segment={segment}
          state={state}
          isDisabled={props.isDisabled}
        />
      ))}
    </div>
  );
}

function DateSegment({
  idx,
  segment,
  state,
  isDisabled,
}: {
  idx: number;
  segment: any;
  state: any;
  isDisabled: boolean;
}) {
  let ref = useRef(null);
  let { segmentProps } = useDateSegment(segment, state, ref);

  return (
    <div
      {...segmentProps}
      ref={ref}
      style={{
        ...segmentProps.style,
        minWidth: String(segment?.maxValue).length,
      }}
      className={`px-0.5 box-content tabular-nums text-right outline-none rounded-sm focus:bg-blue-900 dark:focus:bg-purple-800 focus:text-white group ${
        !segment.isEditable ? "text-gray-500" : "text-gray-800"
      }`}
    >
      {/* Always reserve space for the placeholder, to prevent layout shift when editing. */}
      <span
        aria-hidden="true"
        className="block w-full text-center italic text-gray-500 group-focus:text-white"
        style={{
          visibility: segment.isPlaceholder ? "visible" : "hidden",
          height: segment.isPlaceholder ? "" : 0,
          pointerEvents: "none",
        }}
      >
        {segment.placeholder}
      </span>
      <div
        className={`${
          !isDisabled && segment.text != "/" && "hover:cursor-pointer"
        } dark:text-white`}
      >
        {segment.isPlaceholder
          ? ""
          : idx % 2 == 0
          ? (segment.text as string).padStart(2, "0")
          : segment.text}
      </div>
    </div>
  );
}
