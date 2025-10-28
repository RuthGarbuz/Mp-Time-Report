import React from "react";

interface ConfirmModalProps {
  message: string;
  onOk: () => void;
  onCancel: () => void;
  okText?: string;
  cancelText?: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  message,
  onOk,
  onCancel,
  okText = "אישור",
  cancelText = "ביטול",
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-80">
        <h2 className="text-xl font-bold text-gray-800 mb-4">אישור פעולה</h2>
        <p className="text-gray-700 mb-6">{message}</p>

        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded-lg bg-gray-300 text-gray-800 hover:bg-gray-400"
            onClick={onCancel}
          >
            {cancelText}
          </button>

          <button
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
            onClick={onOk}
          >
            {okText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;