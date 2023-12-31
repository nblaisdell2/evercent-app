import React, { useRef } from "react";
import { FocusScope } from "@react-aria/focus";
import { useDialog } from "@react-aria/dialog";
import {
  useOverlay,
  useModal,
  DismissButton,
  ModalProvider,
} from "@react-aria/overlays";
import { mergeProps } from "@react-aria/utils";

export function Popover(props: any) {
  let ref = useRef();
  let { popoverRef = ref, isOpen, onClose, children, ...otherProps } = props;

  // Handle events that should cause the popup to close,
  // e.g. blur, clicking outside, or pressing the escape key.
  let { overlayProps } = useOverlay(
    {
      isOpen,
      onClose,
      shouldCloseOnBlur: true,
      isDismissable: true,
    },
    popoverRef
  );

  let { modalProps } = useModal();
  let { dialogProps } = useDialog(otherProps, popoverRef);

  // Add a hidden <DismissButton> component at the end of the popover
  // to allow screen reader users to dismiss the popup easily.
  return (
    <ModalProvider>
      <FocusScope contain restoreFocus>
        <div
          {...mergeProps(overlayProps, modalProps, dialogProps)}
          ref={popoverRef}
          className={`absolute ${props?.classNamePosition} bg-[#F6F9FA] dark:bg-[#161616] border border-gray-300 dark:border-gray-500 rounded-md shadow-lg mt-0 p-4 z-10 w-[300px] h-[315px]`}
        >
          {children}
          <DismissButton onDismiss={onClose} />
        </div>
      </FocusScope>
    </ModalProvider>
  );
}
