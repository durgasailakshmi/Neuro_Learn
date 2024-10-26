import React from 'react';
import './styles.css';

interface ModalProps {
  title: string;
  message: string;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ title, message, onClose }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-container" onClick={(e) => e.stopPropagation()}>
      <h2 className="modal-title">{title}</h2>
      <p className="modal-message">{message}</p>
      <button className="modal-button" onClick={onClose}>
        Close
      </button>
    </div>
  </div>
);

export default Modal;
