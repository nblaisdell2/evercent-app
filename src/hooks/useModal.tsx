import React, { Dispatch, SetStateAction, useState } from "react";

export type ModalProps = {
  isOpen: boolean;
  showModal: () => void;
  closeModal: () => void;
  modalIsSaving: boolean;
  setModalIsSaving: Dispatch<SetStateAction<boolean>>;
  changesMade: boolean;
  setChangesMade: Dispatch<SetStateAction<boolean>>;
  onSaveFn: (() => Promise<void>) | undefined;
  setOnSaveFn: Dispatch<SetStateAction<(() => void) | undefined>>;
  loadingText: string;
  savedText: string;
};

function useModal(loadingText?: string, savedText?: string) {
  const [isOpen, setIsOpen] = useState(false);
  const [changesMade, setChangesMade] = useState(false);
  const [modalIsSaving, setModalIsSaving] = useState(false);
  const [onSaveFn, setOnSaveFn] = useState<(() => Promise<void>) | undefined>(
    undefined
  );

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
    modalIsSaving,
    setModalIsSaving,
    loadingText: loadingText || "Saving...",
    savedText: savedText || "Saved!",
  } as ModalProps;
}

export default useModal;
