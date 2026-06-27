import {getShortFormDate} from "../../../public/utils.js";

function PeriodNavigator({isSingleDay, startDate, endDate, onPrevious, onNext, canGoForward,}) {
  return (
    <div className="mx-2 my-3 flex items-center rounded-md bg-base-200 px-3 py-2">
      <button
        onClick={onPrevious}
        disabled={!canGoForward}
        className="btn btn-ghost btn-sm"
      >
        ◀
      </button>

      <div className="flex-1 text-center font-medium">
        {isSingleDay ? (
          getShortFormDate(endDate)
        ) : (
          <>
            {getShortFormDate(startDate)}
            <span className="mx-2 text-base-content/60">–</span>
            {getShortFormDate(endDate)}
          </>
        )}
      </div>
      <button
        onClick={onNext}
        className="btn btn-ghost btn-sm"
      >
        ▶
      </button>
    </div>
  );
}

export default PeriodNavigator