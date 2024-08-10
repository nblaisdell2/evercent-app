import React from "react";
import {
  ArrowLeftIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import MyButton from "../elements/MyButton";

function UnsavedChangesModal({
  onExit,
}: {
  onExit: (exitType: "back" | "discard" | "save") => Promise<void>;
}) {
  return (
    <div className="h-full flex flex-col items-center justify-around ">
      <div className="flex items-center ">
        <ExclamationTriangleIcon className="h-10 w-10 text-orange-400" />
        <div className="font-bold text-3xl -mt-1">Unsaved Changes!</div>
      </div>
      <div className="text-lg text-center ">
        Would you like to save the changes before exiting?
      </div>

      <div className="space-y-6 flex flex-col w-full px-2">
        <MyButton
          buttonText={"Go Back"}
          icon={
            <ArrowLeftIcon className="h-10 w-10 text-black stroke-2 mr-2" />
          }
          onClick={async () => await onExit("back")}
          className=""
        />
        <MyButton
          buttonText={"Discard Changes and Exit"}
          icon={<XMarkIcon className="h-10 w-10 text-red-600 stroke-2" />}
          onClick={async () => await onExit("discard")}
          className=""
        />
        <MyButton
          buttonText={"Save Changes and Exit"}
          icon={<CheckIcon className="h-10 w-10 text-green-600 stroke-2" />}
          onClick={async () => await onExit("save")}
          className=""
        />
      </div>
    </div>
  );
}

export default UnsavedChangesModal;
