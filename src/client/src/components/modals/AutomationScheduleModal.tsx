import { CheckIcon, MinusCircleIcon } from "@heroicons/react/24/outline";
import { addHours, parseISO, startOfDay, startOfHour } from "date-fns";
import React, { useState } from "react";
import Label from "../elements/Label";
import MySelect from "../elements/MySelect";
import RadioButtonGroup from "../elements/RadioButtonGroup";
import MyButton from "../elements/MyButton";
import { log } from "../../utils/log";
import { incrementDateByFrequency, PayFrequency } from "evercent/dist/user";

function AutomationScheduleModal({
  payFrequency,
  nextPaydate,
  onNewTime,
  closeModal,
}: {
  payFrequency: PayFrequency;
  nextPaydate: string;
  onNewTime: (newTime: string) => void;
  closeModal: () => void;
}) {
  const rightNow = new Date();
  let currHour = rightNow.getHours();

  const [hourOfDay, setHourOfDay] = useState(
    currHour <= 12 ? currHour : currHour - 12
  );
  const [timeOfDay, setTimeOfDay] = useState(currHour <= 12 ? "AM" : "PM");

  const setScheduledTime = () => {
    if (hourOfDay && timeOfDay) {
      let hoursToAdd =
        timeOfDay == "PM"
          ? hourOfDay == 12
            ? hourOfDay
            : hourOfDay + 12
          : hourOfDay == 12
          ? 0
          : hourOfDay;

      let dtNewPaydate = addHours(
        startOfDay(parseISO(nextPaydate)),
        hoursToAdd
      );

      // if (dtNewPaydate <= addHours(startOfHour(new Date()), 1)) {
      if (dtNewPaydate <= startOfHour(new Date())) {
        dtNewPaydate = incrementDateByFrequency(dtNewPaydate, payFrequency);
      }

      closeModal();
      onNewTime(dtNewPaydate.toISOString());
    }
  };

  return (
    <div className="w-full h-full flex flex-col text-center">
      <div className="flex flex-col justify-evenly flex-grow">
        <Label
          label={"What time on payday should the automation run?"}
          className={"text-xl whitespace-pre-wrap"}
        />
        <div className="flex items-center justify-center">
          <MySelect
            values={[
              "1",
              "2",
              "3",
              "4",
              "5",
              "6",
              "7",
              "8",
              "9",
              "10",
              "11",
              "12",
            ]}
            selectedValue={hourOfDay.toString()}
            onSelectionChange={(newSelectedValue: string) => {
              setHourOfDay(parseInt(newSelectedValue));
            }}
          />
          <RadioButtonGroup
            buttons={["AM", "PM"]}
            selectedButton={timeOfDay}
            onSelect={(newButton: string) => {
              setTimeOfDay(newButton);
            }}
            className="flex space-x-2 ml-2"
          />
        </div>
        <div className="flex px-2 space-x-2">
          <MyButton
            buttonText={"Set New Time & Review"}
            icon={
              <CheckIcon className="h-10 w-10 text-green-600 stroke-2 mr-1" />
            }
            onClick={setScheduledTime}
            className={`w-[50%]`}
          />
          <MyButton
            buttonText={"Go Back"}
            icon={
              <MinusCircleIcon className="h-10 w-10 text-red-600 stroke-2 mr-1" />
            }
            className={`w-[50%]`}
            onClick={closeModal}
          />
        </div>
      </div>
    </div>
  );
}

export default AutomationScheduleModal;
