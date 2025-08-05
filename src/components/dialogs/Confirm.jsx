
function Confirm({text, onClose, onConfirm}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="bg-base-200 rounded-lg popup-fade max-w-full max-h-full overflow-auto p-5">
          <span>{text}</span>
          <div className="flex justify-between m-2">
            <button
            className="w-20 rounded-md px-2 py-2 m-1 bg-surface text-surface-content hover:bg-error hover:text-error-content "
            onClick={() => {onConfirm(); onClose();}}
            >Confirm</button>
            <button
            className="w-20 rounded-md px-2 py-2 m-1 bg-surface text-surface-content hover:bg-warning hover:text-warning-content"
            onClick={onClose}
            >Cancel</button>
          </div>
        </div>
    </div>
  );
}

export default Confirm;