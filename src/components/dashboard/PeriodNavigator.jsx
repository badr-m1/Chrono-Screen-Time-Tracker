import {getShortFormDate} from "../../background/utils.js";

function PeriodNavigator({disabled, isSingleDay, startDate, endDate, onPrevious, canGoBack, onNext, canGoForward}) {
  if(disabled) return null
  const startYear = new Date(startDate).getFullYear();
  const endYear = new Date(endDate).getFullYear();

  let label;

  if (isSingleDay) {
    label = `${getShortFormDate(endDate)}, ${endYear}`;
  } else if (startYear === endYear) {
    label = `${getShortFormDate(startDate)} - ${getShortFormDate(endDate)}, ${endYear}`;
  } else {
    label = `${getShortFormDate(startDate)}, ${startYear} - ${getShortFormDate(endDate)}, ${endYear}`;
  }

  return (
    <div className="w-full flex justify-center rounded-sm border border-base-content/8 bg-surface px-1 py-1 my-1 text-md">
      <button
        onClick={onPrevious}
        disabled={!canGoBack}
        hidden={!canGoBack}
        className="btn btn-ghost btn-sm"
      >
        {"<"}
      </button>

      <div className="flex-1 text-center font-medium">
        {label}
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