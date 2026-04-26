import { createPortal } from "react-dom";
import { Button } from "@/shared/ui/button";
import "./Modal.scss";

interface ModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

const Modal = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Подтвердить",
  cancelText = "Отмена",
}: ModalProps) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal__title">{title}</h3>
        <p className="modal__message">{message}</p>
        <div className="modal__actions">
          <Button text={cancelText} variant="secondary" onClick={onCancel} />
          <Button text={confirmText} variant="primary" onClick={onConfirm} />
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
