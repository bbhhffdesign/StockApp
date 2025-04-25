import React from "react";
import { createPortal } from 'react-dom';
// import "../css/Modal.css"; // Agregamos un archivo CSS para estilos

const Modal = ({ children, isOpen, onClose }) => {
  const modalRoot = document.getElementById('modal-root');
  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        {children}
      </div>
    </div>,
    modalRoot
  );
};

export default Modal;
