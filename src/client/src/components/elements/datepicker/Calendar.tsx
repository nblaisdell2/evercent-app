import React, { useRef, useState } from "react";
import { useCalendarState } from "@react-stately/calendar";
import { useCalendar } from "@react-aria/calendar";
import { useLocale } from "@react-aria/i18n";
import { createCalendar, CalendarDate } from "@internationalized/date";
import { CalendarButton } from "./Button";
import { CalendarGrid } from "./CalendarGrid";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import MyButton from "../MyButton";

export function Calendar(props: any) {
  let { locale } = useLocale();
  let state = useCalendarState({
    ...props,
    locale,
    createCalendar,
  });

  let ref = useRef(null);
  let { calendarProps, prevButtonProps, nextButtonProps, title } = useCalendar(
    props,
    state
  );

  const [calendarMode, setCalendarMode] = useState("DatePicker"); // "DatePicker", "MonthPicker"

  const monthButton = (text: string, num: number) => {
    const isDisabled =
      state.minValue &&
      (state.focusedDate.year < state.minValue.year ||
        (state.focusedDate.year == state.minValue.year &&
          state.focusedDate.month > num));
    return (
      <div
        onClick={() => {
          if (isDisabled) return;

          state.setFocusedDate(
            state.focusedDate.set({
              year: state.focusedDate.year,
              month: num,
              day: state.focusedDate.day,
            })
          );
          setCalendarMode("DatePicker");
        }}
        className={`p-1 w-16 uppercase ${
          title.substring(0, 3) == text &&
          parseInt(title.substring(title.indexOf(" ") + 1)) ==
            state.value.year &&
          "color-accent font-bold text-white rounded-md"
        } ${
          !isDisabled &&
          "hover:bg-blue-300 dark:hover:bg-purple-300 dark:hover:text-black hover:font-bold hover:cursor-pointer hover:rounded-md"
        } ${isDisabled && "text-gray-400 hover:cursor-default"}`}
      >
        {text}
      </div>
    );
  };

  return (
    <div
      {...calendarProps}
      ref={ref}
      className="text-color-primary w-full  h-full"
    >
      <div className="flex flex-col items-center text-center pb-4  h-full">
        <div className="flex justify-around space-x-4 items-center ">
          <CalendarButton
            {...prevButtonProps}
            onClick={() => {
              if (calendarMode == "MonthPicker") {
                const newDate = state.focusedDate;
                let myNewDate = newDate.set({
                  year:
                    newDate.month + 1 == 13 ? newDate.year : newDate.year - 1,
                  month: newDate.month + 1 == 13 ? 1 : newDate.month + 1,
                  day: newDate.day,
                });

                state.setFocusedDate(myNewDate);
              }
            }}
          >
            <ChevronLeftIcon className="h-6 w-6" />
          </CalendarButton>
          <h2
            className={`flex-1 font-bold text-xl mb-2 w-[175px] whitespace-nowrap ${
              calendarMode == "DatePicker" &&
              "hover:underline hover:cursor-pointer"
            }`}
            onClick={() => {
              if (calendarMode == "DatePicker") {
                setCalendarMode("MonthPicker");
              }
            }}
          >
            {(calendarMode == "DatePicker" && title) ||
              (calendarMode == "MonthPicker" &&
                title.substring(title.indexOf(" ") + 1))}
          </h2>
          <CalendarButton
            {...nextButtonProps}
            onClick={() => {
              if (calendarMode == "MonthPicker") {
                const newDate = state.focusedDate;
                let myNewDate = newDate.set({
                  year:
                    newDate.month - 1 == 0 ? newDate.year : newDate.year + 1,
                  month: newDate.month - 1 == 0 ? 12 : newDate.month - 1,
                  day: newDate.day,
                });

                state.setFocusedDate(myNewDate);
              }
            }}
          >
            <ChevronRightIcon className="h-6 w-6" />
          </CalendarButton>
        </div>
        {(calendarMode == "DatePicker" && (
          <CalendarGrid state={state} props={{}} />
        )) ||
          (calendarMode == "MonthPicker" && (
            <div className=" flex flex-col flex-grow">
              <div className="flex flex-col">
                <div className="flex">
                  {monthButton("Jan", 1)}
                  {monthButton("Feb", 2)}
                  {monthButton("Mar", 3)}
                  {monthButton("Apr", 4)}
                </div>
                <div className="flex">
                  {monthButton("May", 5)}
                  {monthButton("Jun", 6)}
                  {monthButton("Jul", 7)}
                  {monthButton("Aug", 8)}
                </div>
                <div className="flex">
                  {monthButton("Sep", 9)}
                  {monthButton("Oct", 10)}
                  {monthButton("Nov", 11)}
                  {monthButton("Dec", 12)}
                </div>
              </div>
              <div className="h-full flex justify-center items-center">
                <MyButton
                  buttonText={"Go Back"}
                  icon={
                    <ArrowLeftIcon className="h-6 w-6 mr-1 text-black dark:text-white stroke-2 group-hover:text-black" />
                  }
                  className="mt-4 w-full group"
                  onClick={async () => {
                    state.setFocusedDate(state.value);
                    setCalendarMode("DatePicker");
                  }}
                />
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
