import Modal from "./Modal.jsx";

const NewFileModel = ({ isOpen, onClose, onSubmit }) => {
  const handleDiscard = () => {
    onSubmit();
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2>You Have Unsaved Changes</h2>
      <button type="button" onClick={handleDiscard}>
        Discard Changes
      </button>
      <button type="button" onClick={onClose}>
        Cancel
      </button>
    </Modal>
  );
};

export default NewFileModel;
