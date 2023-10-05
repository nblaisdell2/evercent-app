import React from "react";
import MyButton from "../elements/MyButton";

function ResetExpensesProgress({
  closeModal,
  startResetProgress,
}: {
  closeModal: () => void;
  startResetProgress: () => void;
}) {
  return (
    <div className="flex flex-col space-y-6 font-mplus h-full p-4 ">
      <div className="">
        <div className="mb-8">
          By resetting the “Regular Expenses” progress, you will temporarily
          take all of the money available in your budget currently, and move it
          back into the “Ready to Assign” section, allowing you to re-choose
          where that money should be budgeted, based on the rules for the{" "}
          <span className="font-cinzel">Budget Automation</span>. This should be
          done in order to prioritize achieving 6-months ahead on all of the
          Regular Expenses.
          <br />
          <br />
          <b>Note:</b> Nothing is updated or removed from the actual budget
          until the very end of this process, when the “Post Amounts to Budget”
          button is pressed.
        </div>
      </div>

      <div className="flex flex-grow justify-center items-end text-2xl font-bold ">
        <MyButton
          buttonText={"Continue"}
          onClick={() => {
            startResetProgress();
            closeModal();
          }}
          className="mx-2 p-2 h-12 w-[40%] color-accent text-color-primary"
        />
        <MyButton
          buttonText={"Go Back"}
          onClick={closeModal}
          className="mx-2 p-2 h-12 w-[40%] color-accent text-color-primary"
        />
      </div>
    </div>
  );
}

export default ResetExpensesProgress;
