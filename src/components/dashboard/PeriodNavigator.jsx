import {getShortFormDate} from "../../../public/utils.js";

function PeriodNavigator({disabled, isSingleDay, startDate, endDate, onPrevious, canGoBack, onNext, canGoForward}) {
  if(disabled) return null
  
  return (
    <div className="w-full flex justify-center rounded-sm border border-base-content/8 bg-surface px-2 py-2 my-2 text-md">
      <button
        onClick={onPrevious}
        disabled={!canGoBack}
        hidden={!canGoBack}
        className="btn btn-ghost btn-sm"
      >
        {"<"}
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
        disabled={!canGoForward}
        hidden={!canGoForward}
        className="btn btn-ghost btn-sm"
      >
        {">"}
      </button>
    </div>
  );
}

export default PeriodNavigator