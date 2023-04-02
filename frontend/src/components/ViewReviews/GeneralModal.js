import "./GeneralModal.css";
import React, { useEffect } from "react";
import ReactPortal from "./ReactPortal";

export default function ModalContainer({ children, isOpen, handleClose }) {
  useEffect(() => {
    const closeOnEscapeKey = (e) => (e.key === "Escape" ? handleClose() : null);
    document.body.addEventListener("keydown", closeOnEscapeKey);
    return () => {
      document.body.removeEventListener("keydown", closeOnEscapeKey);
    };
  }, [handleClose]);

  function checkClickOutsideModalContent(e) {
    // If the className is modal, you are clicking outside the modal content so close the modal
    if (e.target.className === "modal") {
      handleClose();
    }
  }

  if (!isOpen) return null;

  return (
    <ReactPortal wrapperId="react-portal-modal-container">
      <div className="modal" onClick={checkClickOutsideModalContent}>
        <div className="modal-content">{children}</div>
      </div>
    </ReactPortal>
  );
}
