import React, { useEffect, useState } from "react";
import Label from "../elements/Label";
import RadioButtonGroup from "../elements/RadioButtonGroup";
import MyIcon from "../elements/MyIcon";
import MyInput from "../elements/MyInput";
import MyButton from "../elements/MyButton";
import MyDatePicker from "../elements/MyDatePicker";
import { log } from "../../utils/log";
import { startOfToday } from "date-fns";
import { UserData } from "../../model/userData";
import useEvercent from "../../hooks/useEvercent";
import { ModalProps } from "../../hooks/useModal";
import { sleep } from "../../utils/util";

function UpdateUserDetailsModal({
  userData,
  modalProps,
}: // modalPropsSaving,
{
  userData: UserData;
  modalProps: ModalProps;
  // modalPropsSaving: ModalProps;
}) {
  const { updateUserDetails } = useEvercent();

  const [newMonthlyIncome, setNewMonthlyIncome] = useState(
    userData.monthlyIncome
  );
  const [newPayFrequency, setNewPayFrequency] = useState<string>(
    userData.payFrequency
  );
  const [newNextPaydate, setNewNextPaydate] = useState(userData.nextPaydate);

  const update = async () => {
    modalProps.setModalIsSaving(true);

    await updateUserDetails({
      userData,
      monthlyIncome: newMonthlyIncome,
      payFrequency: newPayFrequency,
      nextPaydate: newNextPaydate,
    });

    modalProps.setModalIsSaving(false);
  };

  useEffect(() => {
    modalProps.setOnSaveFn(() => update);
  }, []);

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col space-y-20 mt-16 items-center">
        <div className="flex flex-col items-center">
          <Label label="Monthly Income" />
          <MyInput
            isMoneyString={true}
            value={newMonthlyIncome}
            onChange={setNewMonthlyIncome}
            className={"h-12 w-40 text-3xl font-bold text-green-500"}
          />
        </div>

        <div className="w-full text-center">
          <Label label="Pay Frequency" />
          <RadioButtonGroup
            buttons={["Weekly", "Every 2 Weeks", "Monthly"]}
            selectedButton={newPayFrequency}
            onSelect={setNewPayFrequency}
            className={"flex justify-around items-center mt-1"}
          />
        </div>

        <div className="w-full text-center">
          <Label label="Next Paydate" />
          <MyDatePicker
            value={newNextPaydate}
            minValue={startOfToday().toISOString()}
            onChange={setNewNextPaydate}
            classNamePosition={"bottom-0 left-20"}
          />
        </div>
      </div>

      <div className="flex-grow flex justify-center items-end mb-5">
        <MyButton
          buttonText={"Save"}
          icon={
            <MyIcon
              iconType={"CheckMark"}
              className="h-6 w-6 text-green-600 stroke-2"
            />
          }
          onClick={update}
        />
      </div>
    </div>
  );
}

export default UpdateUserDetailsModal;
