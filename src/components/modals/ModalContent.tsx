import React, { ReactNode } from "react";
import Card from "../elements/Card";
import MyIcon from "../elements/MyIcon";
import useModal, { ModalProps } from "../../hooks/useModal";
import UnsavedChangesModal from "./UnsavedChangesModal";
import { log } from "../../utils/log";

function ModalContent({
  modalTitle,
  fullScreen,
  modalProps,
  children,
}: {
  modalTitle: string;
  fullScreen: boolean;
  modalProps: ModalProps;
  children?: ReactNode;
}) {
  const modalPropsWarning = useModal();

  const onExit = (exitType: "back" | "discard" | "save") => {
    switch (exitType) {
      case "back":
        modalPropsWarning.closeModal();
        break;

      case "discard":
        modalProps.setChangesMade(false);

        modalPropsWarning.closeModal();
        modalProps.closeModal();
        break;

      case "save":
        if (modalProps.onSaveFn) modalProps.onSaveFn();

        modalPropsWarning.closeModal();
        modalProps.closeModal();
        break;

      default:
        break;
    }
  };

  const close = () => {
    if (modalProps.changesMade) {
      modalPropsWarning.showModal();
    } else {
      modalProps.closeModal();
    }
  };

  if (!modalProps.isOpen) return <></>;

  return (
    <>
      <div
        onClick={close}
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
        <div className="p-1 flex justify-between" onClick={close}>
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

      <ModalContent
        fullScreen={false}
        modalTitle=""
        modalProps={modalPropsWarning}
      >
        <UnsavedChangesModal onExit={onExit} />
      </ModalContent>
    </>
  );
}

export default ModalContent;
