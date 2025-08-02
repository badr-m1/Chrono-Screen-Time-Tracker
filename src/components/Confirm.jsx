
function Confirm({text, onClose, onConfirm}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="bg-background rounded-lg border-border border-3 popup-fade max-w-full max-h-full overflow-auto p-5">
            {text}
          <div className="flex justify-between">
            <button
            className="w-20 rounded-md bg-background text-primary px-2 py-2 border-1 hover:bg-warning hover:text-accent-text m-1"
            onClick={() => {onConfirm(); onClose();}}
            >Confirm</button>
            <button
            className="w-20 rounded-md bg-background text-primary px-2 py-2 border-1 m-1"
            onClick={onClose}
            >Cancel</button>
          </div>
        </div>
    </div>
  );
}

export default Confirm;