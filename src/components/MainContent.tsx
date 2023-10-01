import React, { Dispatch, SetStateAction, cloneElement, useState } from "react";
import Card from "./elements/Card";
import ModalContent from "./modals/ModalContent";
import useModal from "../hooks/useModal";
import { useAuth0 } from "@auth0/auth0-react";
import SignInMessage from "./other/SignInMessage";
import BudgetHelperWidget from "./widgets/budget-helper/BudgetHelperWidget";

import WidgetLoader from "./other/WidgetLoader";
import { FAKE_BUDGET_ID } from "../model/budget";
import { YNABConnectButton } from "./header/YNABConnection";
import BudgetHelperFull from "./widgets/budget-helper/BudgetHelperFull";
import { log } from "../utils/log";
import UnsavedChangesModal from "./modals/UnsavedChangesModal";
import useEvercent from "../hooks/useEvercent";
import BudgetAutomationWidget from "./widgets/budget-automation/BudgetAutomationWidget";
import RegularExpensesWidget from "./widgets/regular-expenses/RegularExpensesWidget";
import UpcomingExpensesWidget from "./widgets/upcoming-expenses/UpcomingExpensesWidget";

export type WidgetProps = {
  widgetMadeChanges: boolean;
  setWidgetMadeChanges: Dispatch<SetStateAction<boolean>>;
  setOnSaveFn: Dispatch<SetStateAction<(() => void) | undefined>>;
};

function MainContent() {
  const createWidget = (
    name: string,
    widgetComponent: JSX.Element,
    fullComponent: JSX.Element
  ) => {
    const [widgetMadeChanges, setWidgetMadeChanges] = useState(false);
    const [onSaveFn, setOnSaveFn] = useState<(() => void) | undefined>(
      undefined
    );

    const { isOpen, showModal, closeModal } = useModal();
    const {
      isOpen: isOpenWarning,
      showModal: showModalWarning,
      closeModal: closeModalWarning,
    } = useModal();

    const onExit = (exitType: "back" | "discard" | "save") => {
      switch (exitType) {
        case "back":
          closeModalWarning();
          break;

        case "discard":
          closeModalWarning();
          closeModal();
          break;

        case "save":
          if (onSaveFn) onSaveFn();

          closeModalWarning();
          closeModal();
          break;

        default:
          break;
      }
    };

    return (
      <>
        <Card
          onClick={showModal}
          className="flex flex-col p-4 hover:cursor-pointer"
        >
          <div className="font-cinzel text-center text-3xl  mb-2">{name}</div>

          {isLoading ? (
            <WidgetLoader />
          ) : (
            <div className="flex-grow">{widgetComponent}</div>
          )}
        </Card>

        {isOpen && (
          <ModalContent
            fullScreen={true}
            modalTitle={name}
            onClose={() => {
              if (widgetMadeChanges) {
                showModalWarning();
              } else {
                closeModal();
              }
            }}
          >
            {["Budget Helper", "Budget Automation"].includes(name)
              ? cloneElement(fullComponent, {
                  widgetProps: {
                    widgetMadeChanges,
                    setWidgetMadeChanges,
                    setOnSaveFn,
                  } as WidgetProps,
                })
              : fullComponent}
          </ModalContent>
        )}

        {isOpenWarning && (
          <ModalContent
            fullScreen={false}
            modalTitle="Unsaved Changes"
            onClose={closeModalWarning}
          >
            <UnsavedChangesModal onExit={onExit} />
          </ModalContent>
        )}
      </>
    );
  };

  log("RENDERING [MainContent.tsx]");

  const { isAuthenticated } = useAuth0();
  const { isLoading, userData } = useEvercent();

  // If the user isn't signed in, show them a message about how to sign in,
  // and a quick overview of how Evercent can be used
  if (!isAuthenticated) return <SignInMessage />;

  // If the user is logged in, but they haven't connected their YNAB budget to
  // Evercent yet, show them another message about connecting to YNAB, which allows
  // them to do so, as well
  if (userData?.budgetID == FAKE_BUDGET_ID) {
    return (
      <div className="h-full flex flex-col space-y-2 justify-center items-center">
        <div>Information about connecting to YNAB</div>
        <YNABConnectButton userID={userData.userID} />
      </div>
    );
  }

  // Finally, at this point, our user is logged in, and their budget is connected,
  // so we should be able to load their Evercent details with no issue

  return (
    <>
      <div className="h-full w-full flex justify-center">
        <div className="grid grid-cols-2 grid-rows-2 gap-4 p-2 w-[85%]">
          {createWidget(
            "Budget Helper",
            <BudgetHelperWidget />,
            <BudgetHelperFull />
          )}
          {createWidget(
            "Budget Automation",
            <BudgetAutomationWidget />,
            <div className="h-full flex justify-center items-center ">
              Budget Automation Full
            </div>
          )}
          {createWidget(
            "Regular Expenses",
            <RegularExpensesWidget />,
            <div className="h-full flex justify-center items-center ">
              Regular Expenses Full
            </div>
          )}
          {createWidget(
            "Upcoming Expenses",
            <UpcomingExpensesWidget />,
            <div className="h-full flex justify-center items-center ">
              Upcoming Expenses Full
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default MainContent;
