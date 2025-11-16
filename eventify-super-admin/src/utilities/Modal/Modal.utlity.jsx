/**
 * Modal Component
 *
 * A reusable modal dialog rendered using React portals.
 * Supports customizable title, body content, footer buttons, and optional icons.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {boolean} props.isOpen - Controls whether the modal is visible.
 * @param {() => void} props.onClose - Function called when modal or overlay is closed.
 * @param {string} props.title - Title displayed in the modal header.
 * @param {React.ReactNode} props.children - Content to display inside the modal body.
 * @param {Array<Object>} [props.buttons=[]] - Array of button objects for the footer.
 * @param {string} [props.buttons[].label] - Text label of the button.
 * @param {string} [props.buttons[].className] - Additional CSS classes for the button.
 * @param {() => void} [props.buttons[].onClick] - Click handler for the button.
 * @param {boolean} [props.buttons[].loading=false] - If true, shows a loader instead of label.
 * @param {React.ReactNode} [props.icon] - Optional icon to render alongside modal title.
 *
 * @example
 * <Modal
 *   isOpen={true}
 *   onClose={() => setModalOpen(false)}
 *   title="Confirm Delete"
 *   buttons={[
 *     { label: "Cancel", onClick: handleCancel },
 *     { label: "Delete", onClick: handleDelete, className: "danger", loading: isDeleting }
 *   ]}
 * >
 *   <p>Are you sure you want to delete this item?</p>
 * </Modal>
 */

import ReactDOM from "react-dom";
import "../../styles/global.styles.css";
import "./Modal.utility.css";
import Loader from "../Loader/Loader.utility";

const Modal = ({ isOpen, onClose, title, children, buttons = [], icon }) => {
  return ReactDOM.createPortal(
    <section id="modal">
      <div
        className={`modal-overlay ${isOpen ? "show" : ""}`}
        onClick={onClose}
      >
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            {icon && <span className="modal-icon">{icon}</span>}
            <h3 className="modal-title">{title}</h3>
            <button
              className="modal-close-btn"
              onClick={onClose}
              aria-label="Close"
            >
              &times;
            </button>
          </div>
          <div className="modal-body">{children}</div>
          <div className="modal-footer">
            {buttons.map((btn, index) => (
              <button
                key={index}
                className={`modal-btn ${btn.className || ""}`}
                onClick={btn.onClick}
                disabled={btn.loading}
              >
                {btn.loading ? (
                  <Loader loading={btn.loading} size={20} color="#fff" />
                ) : (
                  btn.label
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>,
    document.body
  );
};

export default Modal;
