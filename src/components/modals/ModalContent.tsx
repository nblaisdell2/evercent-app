import React, { ReactNode } from "react";
import Card from "../elements/Card";
import MyIcon from "../elements/MyIcon";
import useModal from "../../hooks/useModal";
import UnsavedChangesModal from "./UnsavedChangesModal";
import { log } from "../../utils/log";

function ModalContent({
  modalTitle,
  fullScreen,
  onClose,
  children,
}: {
  modalTitle: string;
  fullScreen: boolean;
  onClose: () => void;
  children?: ReactNode;
}) {
  return (
    <>
      <div
        onClick={onClose}
        className={`fixed top-12 bottom-0 left-0 right-0 opacity-70 bg-black ${
          !fullScreen || "dark:bg-transparent"
        } z-20`}
      />
      <Card
        className={`fixed z-20 flex flex-col ${
          fullScreen
            ? "top-0 sm:top-12 left-0 sm:left-5 sm:right-5 right-0 bottom-0 sm:bottom-5 rounded-none sm:rounded-md"
            : "top-24 left-2 right-2 bottom-24 sm:top-40 sm:left-[35%] sm:right-[35%]"
        }`}
      >
        <div className="p-1 flex justify-between" onClick={onClose}>
          <div className="w-12" />
          <p className=" font-cinzel font-light text-center text-3xl">
            {modalTitle}
          </p>
          <MyIcon
            iconType={"CloseIcon"}
            className="h-8 w-8 hover:cursor-pointer dark:text-red-600 hover:text-red-600"
          />
        </div>
        <div id="modalContent" className="flex-grow">
          {children}
        </div>
      </Card>
    </>
  );
}

export default ModalContent;
