import { CheckIcon, MinusCircleIcon } from "@heroicons/react/24/outline";
import { differenceInHours, format, parseISO } from "date-fns";
import React, { useEffect, useState } from "react";
import useModal from "../../../hooks/useModal";
import LabelAndValue from "../../elements/LabelAndValue";
import ModalContent from "../../modals/ModalContent";
import AutomationScheduleModal from "../../modals/AutomationScheduleModal";
import { BudgetAutomationState } from "../../../hooks/useBudgetAutomation";
import { formatTimeAMPM } from "../../../utils/util";
import MyButton from "../../elements/MyButton";
import MyIcon from "../../elements/MyIcon";
import CancelAutomationModal from "../../modals/CancelAutomationModal";

function AutomationSchedule({ baProps }: { baProps: BudgetAutomationState }) {
  const modalProps = useModal({});
  const modalPropsCancel = useModal({});

  const dtNextRunTime = parseISO(
    baProps.nextAutoRun?.runTime || new Date().toISOString()
  );
  const hourDifference = differenceInHours(dtNextRunTime, new Date()) + 1;
  const [first, setFirst] = useState(false);

  // When opening the Budget Automation widget, if a schedule has yet to be set,
  // the user will be presented with the "Set Schedule" modal automatically
  useEffect(() => {
    if (!baProps.autoRuns[0]) {
      modalProps.showModal();
    }
    setFirst(true);
  }, []);

  // When the "Set Schedule" modal is closed, if they didn't pick a new time,
  // the Budget Automation widget will automatically be closed, since they
  // aren't able to interact with that widget until they set a scheduled time
  useEffect(() => {
    if (!modalProps.isOpen && !baProps.nextAutoRun?.runTime && first) {
      baProps.closeWidget();
      setFirst(false);
    }
  }, [modalProps.isOpen]);

  return (
    <>
      {baProps.nextAutoRun && (
        <div className="flex flex-col h-auto sm:h-full mt-2 sm:mt-0 border-b sm:border-none border-gray-400 justify-around">
          <div className="flex w-full items-center justify-center mb-1 sm:mb-0">
            <div className="flex font-mplus text-2xl sm:text-3xl font-extrabold">
              Schedule
            </div>
            {!baProps.nextAutoRun.isLocked && (
              <MyIcon
                iconType={"EditIcon"}
                className="h-8 w-8 stroke-2 ml-1 hover:cursor-pointer"
                onClick={modalProps.showModal}
              />
            )}
          </div>

          <div className="flex justify-around">
            <div className="w-[50%]">
              <LabelAndValue
                label={"Next Auto Run"}
                value={format(
                  parseISO(baProps.nextAutoRun.runTime),
                  "MM/dd/yyyy"
                )}
                classNameValue={"font-mplus text-lg"}
              />
            </div>
            <div className="w-[50%]">
              <LabelAndValue
                label={"Run Time"}
                value={formatTimeAMPM(parseISO(baProps.nextAutoRun.runTime))}
                classNameValue={"font-mplus text-lg"}
              />
            </div>
            <div className="w-[50%] text-center">
              <LabelAndValue
                label={"Time Left"}
                value={
                  <div>
                    <div className="-mb-2">
                      {Math.floor(hourDifference / 24) + " days"}
                    </div>
                    <div>{(hourDifference % 24) + " hours"}</div>
                  </div>
                }
                classNameValue={"font-mplus text-lg"}
              />
            </div>
          </div>

          <div className="flex justify-center space-x-4 px-6">
            <MyButton
              onClick={baProps.saveAutoRunDetails}
              icon={
                <CheckIcon className="h-10 w-10 text-green-600 stroke-2 mr-1" />
              }
              buttonText={"Save & Exit"}
              className="w-[50%]"
            />
            <MyButton
              onClick={modalPropsCancel.showModal}
              icon={
                <MinusCircleIcon className="h-10 w-10 text-red-600 stroke-2 mr-1" />
              }
              buttonText={"Cancel Automation"}
              className="w-[50%]"
            />
          </div>
        </div>
      )}

      <ModalContent
        fullScreen={false}
        modalTitle={"Set Automation Schedule"}
        modalProps={modalProps}
        closeOnSave={false}
      >
        <AutomationScheduleModal
          payFrequency={baProps.payFrequency}
          nextPaydate={baProps.nextPaydate}
          onNewTime={baProps.setNewAutomationSchedule}
          closeModal={modalProps.closeModal}
        />
      </ModalContent>

      <ModalContent
        fullScreen={false}
        modalTitle={"Cancel Automation?"}
        modalProps={modalPropsCancel}
        closeOnSave={false}
      >
        <CancelAutomationModal
          cancelAutomation={baProps.cancelAutomation}
          closeModal={modalPropsCancel.closeModal}
        />
      </ModalContent>
    </>
  );
}

export default AutomationSchedule;
