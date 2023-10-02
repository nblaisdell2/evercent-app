import React, { Dispatch, SetStateAction, useState } from "react";

export type ModalProps = {
  isOpen: boolean;
  showModal: () => void;
  closeModal: () => void;
  changesMade: boolean;
  setChangesMade: Dispatch<SetStateAction<boolean>>;
  onSaveFn: (() => void) | undefined;
  setOnSaveFn: Dispatch<SetStateAction<(() => void) | undefined>>;
};

function useModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [changesMade, setChangesMade] = useState(false);
  const [onSaveFn, setOnSaveFn] = useState<(() => void) | undefined>(undefined);

  const showModal = () => {
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  return {
    isOpen,
    showModal,
    closeModal,
    changesMade,
    setChangesMade,
    onSaveFn,
    setOnSaveFn,
  } as ModalProps;
}

export default useModal;
