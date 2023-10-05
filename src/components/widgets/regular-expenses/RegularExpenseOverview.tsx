import {
  CheckIcon,
  MinusCircleIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import React, { useState } from "react";
import Card from "../../elements/Card";
import LabelAndValue from "../../elements/LabelAndValue";
import MyButton from "../../elements/MyButton";
import RadioButtonGroup from "../../elements/RadioButtonGroup";
import {
  getAllCategories,
  getNumExpensesWithTargetMet,
} from "../../../model/category";
import { RegularExpensesState } from "../../../hooks/useRegularExpenses";
import { getPercentString } from "../../../utils/util";
import MyIcon from "../../elements/MyIcon";

function RegularExpenseOverview({
  reProps,
}: {
  reProps: RegularExpensesState;
}) {
  const [editingTarget, setEditingTarget] = useState(false);
  const [currentTarget, setCurrentTarget] = useState(reProps.monthsAhead);

  const getMonthsAheadComponent = () => {
    return !editingTarget ? (
      <div className="flex items-center">
        <div className="text-2xl sm:text-3xl">{reProps.monthsAhead}</div>
        <MyIcon
          iconType="EditIcon"
          className="h-8 w-8 ml-1 hover:cursor-pointer"
          onClick={() => setEditingTarget(true)}
        />
      </div>
    ) : (
      <div className="flex flex-col items-center">
        <RadioButtonGroup
          buttons={["3", "6", "12"]}
          selectedButton={currentTarget.toString()}
          onSelect={(button: string) => setCurrentTarget(parseInt(button))}
          className={"flex space-x-4 my-1"}
        />
        <div className="flex space-x-2">
          <MyButton
            buttonText={"Save"}
            icon={
              <CheckIcon className="h-6 w-6 text-green-600 stroke-2 mr-1" />
            }
            onClick={() => {
              reProps.updateMonthsAhead(currentTarget);
              setEditingTarget(false);
            }}
          />
          <MyButton
            buttonText={"Cancel"}
            icon={
              <MinusCircleIcon className="h-6 w-6 text-red-600 stroke-2 mr-1" />
            }
            onClick={() => {
              setCurrentTarget(reProps.monthsAhead);
              setEditingTarget(false);
            }}
          />
        </div>
      </div>
    );
  };

  const numExpenses = getAllCategories(reProps.regularExpenses, false).length;
  const numExpensesWithTargetMet = getNumExpensesWithTargetMet(
    reProps.regularExpenses,
    reProps.monthsAhead
  );

  return (
    <Card className="p-1">
      <div className="text-center font-bold text-2xl sm:text-3xl">Overview</div>
      <div className="flex justify-around">
        <LabelAndValue
          label={
            <div>
              Months Ahead
              <br />
              Target
            </div>
          }
          value={getMonthsAheadComponent()}
          classNameValue={"px-2"}
        />

        {/* Vertical Divider */}
        <div className="w-[1px] bg-gray-400" />

        <LabelAndValue
          label={
            <div>
              # of Regular
              <br />
              Expense Categories
            </div>
          }
          value={numExpenses}
          classNameLabel={"block"}
          classNameValue={"text-2xl sm:text-3xl"}
        />

        {/* Vertical Divider */}
        <div className="w-[1px] bg-gray-400" />

        <LabelAndValue
          label={
            <div>
              Regular Expenses
              <br />
              w/ Target Met
            </div>
          }
          value={
            <div className="flex items-center">
              <div className="text-2xl sm:text-3xl">
                {numExpensesWithTargetMet}
              </div>
              <div className="text-base sm:text-lg ml-1">
                {"(" +
                  getPercentString(numExpensesWithTargetMet / numExpenses) +
                  ")"}
              </div>
            </div>
          }
        />
      </div>
    </Card>
  );
}

export default RegularExpenseOverview;
