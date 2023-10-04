import React from "react";
import MyButton from "../elements/MyButton";

type Props = {
  cancelAutomation: () => Promise<void>;
  closeModal: () => void;
};

function CancelAutomationModal({ cancelAutomation, closeModal }: Props) {
  return (
    <div className="flex flex-col font-mplus h-full p-4">
      <div className="overflow-y-auto h-0 flex-grow">
        <div className="mb-8 text-sm sm:text-base">
          If you need to <span className="font-bold">turn off</span> the budget
          automation temporarily, you can do so below. This will cancel any
          upcoming runs so that you can manually interact with your budget
          without the automation interfering.
          <br />
          <br />
          You can always re-schedule the automation at a later time to turn it
          back on.
        </div>
        <div className="font-bold underline text-xl">
          Special Note about Locked Runs
        </div>
        <div className="mb-4 text-sm sm:text-base">
          One hour before an automation run starts, the amount saved in the{" "}
          <span className="font-cinzel text-xl">Budget Helper</span> section
          will be locked, so any changes to the{" "}
          <span className="font-cinzel text-xl">Budget Helper</span> section
          won’t affect what gets posted until after the locked automation has
          completed.
          <br />
          <br />
          As a result, if the automation is cancelled when locked, it will still
          be stopped, but another cannot be scheduled until at least 2 hours
          after the current time. If cancelled at 1:30pm, the next automation
          cannot be scheduled until at least 3:00pm (so any changes can be
          locked at 2:00pm first).
        </div>
      </div>

      <div className="flex justify-center py-5 text-lg font-bold">
        <button
          onClick={cancelAutomation}
          className="mx-2 p-2 h-12 w-[40%] bg-red-600 hover:bg-red-400 text-white rounded-md shadow-md shadow-slate-400"
        >
          Yes, Cancel
        </button>
        <MyButton
          buttonText={"Go Back"}
          onClick={closeModal}
          className="mx-2 p-2 h-12 w-[40%] bg-gray-300 rounded-md shadow-md shadow-slate-400 hover:bg-blue-400 hover:text-white"
        />
      </div>
    </div>
  );
}

export default CancelAutomationModal;
