import { CheckIcon } from "@heroicons/react/24/outline";
import React from "react";
import useModal from "../../../hooks/useModal";
import MyButton from "../../elements/MyButton";
import { WidgetProps } from "../../MainContent";
import AmountMonths from "./AmountMonths";
import AutomationOverview from "./AutomationOverview";
import AutomationSchedule from "./AutomationSchedule";
import UpcomingPastList from "./UpcomingPastList";
import useBudgetAutomation from "../../../hooks/useBudgetAutomation";
import { log } from "../../../utils/log";

function BudgetAutomationFull({ widgetProps }: { widgetProps?: WidgetProps }) {
  log("RENDERING [BudgetAutomationFull.tsx]", { widgetProps });

  const baProps = useBudgetAutomation(widgetProps as WidgetProps);
  log("What are the baProps", baProps);

  const {
    isOpen: isOpenCancel,
    showModal: showModalCancel,
    closeModal: closeModalCancel,
  } = useModal();

  return (
    <>
      <div className="flex flex-col h-full w-full">
        <div className="flex h-[25%]">
          {/* Top Left - Upcoming/Past */}
          <div className="w-[65%] p-2">
            <UpcomingPastList
              baProps={baProps}
              // autoRunsList={baProps.autoRunsList}
              // pastRunsList={baProps.pastRunsList}
              // showUpcoming={baProps.showUpcoming}
              // toggleUpcoming={baProps.toggleUpcoming}
              // pastRunListIndex={baProps.selectedPastRunIndex}
              // selectPastRun={baProps.selectPastRun}
            />
          </div>

          {/* Top Right - Schedule */}
          <div className="w-[35%] p-2">
            <AutomationSchedule
              baProps={baProps}
              // nextAutoRun={baProps.autoRunsList.at(0)}
              // payFrequency={payFrequency}
              // nextPaydate={nextPaydate}
              // setNewAutomationSchedule={baProps.setNewAutomationSchedule}
              // getAutomationButtons={getAutomationButtons}
            />
          </div>
        </div>

        <div className="flex flex-grow space-x-2 p-2">
          {/* Bottom Left - Amounts Posted to Budget */}
          <div className="w-[50%]">
            <AmountMonths
              baProps={baProps}
              // autoRunsList={baProps.autoRunsList}
              // pastRunsList={baProps.pastRunsList}
              // pastRunListIndex={baProps.selectedPastRunIndex}
              // selectedPastRunCategory={baProps.selectedPastRunCategory}
              // selectPastRunCategory={baProps.selectPastRunCategory}
              // showUpcoming={baProps.showUpcoming}
              // updateToggledAutoRunCategories={
              //   baProps.updateToggledAutoRunCategories
              // }
            />
          </div>

          {/* Bottom Right - Overview Section */}
          <div className="w-[50%]">
            <AutomationOverview
              baProps={baProps}
              // runTime={
              //   baProps.pastRunsList[baProps.selectedPastRunIndex]?.runTime
              // }
              // months={months}
              // selectedPastRunCategory={baProps.selectedPastRunCategory}
              // selectPastRunCategory={baProps.selectPastRunCategory}
            />
          </div>
        </div>
      </div>

      {/* {isOpenCancel && (
        <ModalContent
          onClose={closeModalCancel}
          modalContentID={ModalType.CANCEL_AUTOMATION}
        >
          <CancelAutomationModal
            cancelAutomation={baProps.cancelAutomation}
            closeModal={closeModalCancel}
            closeModalFull={closeModal}
          />
        </ModalContent>
      )} */}
    </>
  );
}

export default BudgetAutomationFull;
