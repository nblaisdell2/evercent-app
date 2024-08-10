import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { ModalProps } from "./useModal";
import { UseTRPCMutationResult } from "@trpc/react-query/dist/shared";
import { log } from "../utils/log";

function useSaveModal<T>(
  modalProps: ModalProps,
  data: UseTRPCMutationResult<any, any, T, unknown>,
  inputs: T
) {
  // log("Data in saveModal");
  // log(data);

  const runMutation = async () => {
    modalProps.setModalIsSaving(true);
    data.mutate(inputs);
  };

  useEffect(() => {
    if (data.data) {
      modalProps.setModalIsSaving(false);
    }
  }, [data.data]);

  useEffect(() => {
    modalProps.setOnSaveFn(() => runMutation);
  }, []);

  return runMutation;
}

export default useSaveModal;
