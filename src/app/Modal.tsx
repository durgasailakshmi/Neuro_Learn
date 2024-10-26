// components/Modal.tsx
import React from 'react';
import './styles.css';
type ModalProps = {
  title: string;
  message: string;
  onClose: () => void;
};

const Modal: React.FC<ModalProps> = ({ title, message, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h2 className="modal-title">{title}</h2>
        <p className="modal-message">{message}</p>
        <button onClick={onClose} className="modal-button">OK</button>
      </div>
    </div>
  );
};

export default Modal;
