import { CheckCircleIcon, ClockIcon } from "@heroicons/react/24/solid";
import React from "react";

function SavingScreen({
  isSaving,
  isSaved,
  loadingText,
  savedText,
}: {
  isSaving: boolean;
  isSaved: boolean;
  loadingText?: string;
  savedText?: string;
}) {
  return (
    <div className="h-full w-full flex flex-col justify-center items-center space-y-5">
      {isSaving && <ClockIcon className="h-32 w-32 text-yellow-500" />}
      {isSaved && <CheckCircleIcon className="h-32 w-32 text-green-600" />}
      <div className="text-3xl font-bold text-center">
        {isSaving ? loadingText : savedText}
      </div>
    </div>
  );
}

export default SavingScreen;
