import React, { useRef } from "react";
import { useCalendarCell } from "@react-aria/calendar";
import { useLocale } from "@react-aria/i18n";
import { isSameDay, getDayOfWeek } from "@internationalized/date";
import { useFocusRing } from "@react-aria/focus";
import { mergeProps } from "@react-aria/utils";

export function CalendarCell({ state, date }: { state: any; date: any }) {
  let ref = useRef(null);
  let {
    cellProps,
    buttonProps,
    isSelected,
    isOutsideVisibleRange,
    isDisabled,
    formattedDate,
    isInvalid,
  } = useCalendarCell({ date }, state, ref);

  // The start and end date of the selected range will have
  // an emphasized appearance.
  let isSelectionStart = state.highlightedRange
    ? isSameDay(date, state.highlightedRange.start)
    : isSelected;
  let isSelectionEnd = state.highlightedRange
    ? isSameDay(date, state.highlightedRange.end)
    : isSelected;

  // We add rounded corners on the left for the first day of the month,
  // the first day of each week, and the start date of the selection.
  // We add rounded corners on the right for the last day of the month,
  // the last day of each week, and the end date of the selection.
  let { locale } = useLocale();
  let dayOfWeek = getDayOfWeek(date, locale);
  let isRoundedLeft =
    isSelected && (isSelectionStart || dayOfWeek === 0 || date.day === 1);
  let isRoundedRight =
    isSelected &&
    (isSelectionEnd ||
      dayOfWeek === 6 ||
      date.day === date.calendar.getDaysInMonth(date));

  let { focusProps, isFocusVisible } = useFocusRing();

  return (
    <td
      {...cellProps}
      className={`py-0.5 relative ${isFocusVisible ? "z-10" : "z-0"}`}
    >
      <div
        {...mergeProps(buttonProps, focusProps)}
        ref={ref}
        hidden={isOutsideVisibleRange}
        className={`w-8 h-8 outline-none group ${
          isRoundedLeft ? "rounded-l-full" : ""
        } ${isRoundedRight ? "rounded-r-full" : ""} ${
          isSelected
            ? isInvalid
              ? "bg-red-300"
              : "bg-blue-300 dark:bg-purple-500"
            : ""
        } ${isDisabled ? "disabled" : ""}`}
      >
        <div
          className={`w-full h-full rounded-full flex items-center justify-center ${
            isDisabled && !isInvalid
              ? "text-gray-400 dark:text-gray-600 hover:cursor-default"
              : ""
          } ${
            // Focus ring, visible while the cell has keyboard focus.
            isFocusVisible
              ? "ring-2 group-focus:z-2 ring-blue-600 ring-offset-2"
              : ""
          } ${
            // Darker selection background for the start and end.
            isSelectionStart || isSelectionEnd
              ? isInvalid
                ? "bg-red-600 text-white hover:bg-red-700"
                : "text-white color-accent"
              : ""
          } ${
            // Hover state for cells in the middle of the range.
            isSelected && !isDisabled && !(isSelectionStart || isSelectionEnd)
              ? isInvalid
                ? "hover:bg-red-400"
                : "hover:bg-blue-400 dark:hover:bg-purple-500"
              : ""
          } ${
            // Hover state for non-selected cells.
            !isSelected && !isDisabled
              ? "hover:bg-blue-100 dark:hover:bg-purple-300 dark:hover:text-black"
              : ""
          } ${isDisabled ? "hover:cursor-default" : "hover:cursor-pointer"}`}
        >
          {formattedDate}
        </div>
      </div>
    </td>
  );
}
