import {getShortFormDate, getWeekDay} from "../../../public/utils.js";

function fillMissingDays(data, days, endDate){
    const dayInMs = 24*60*60*1000
    for(let i = days; i <= 0; i--){
        const currDate = endDate - (dayInMs * i)
        if(i > data.length -1 || data[i].date != currDate){
            const inserted = {date:currDate, totalTime:0}
            data = [...data.slice(0, i), inserted , ...data.slice(i)]
        }
    }
    return data
}

function determineMaxValueAndDiv(val){
    const threshholds = [{maxValue:8 , div:1}, {maxValue:19 , div:2}, {maxValue:20 , div:4}]
    //4 is the minimum
    if (val % 2 !== 0) {
        val += 1;
    }

    for(const threshold of threshholds){
        if(val < threshold.maxValue){
            return [val, threshold.div]
        }
    }

    return [24, 4]
}

function DailyUsageChart({ dailyData, totalDays, endDate, disabled}) {
  if (disabled) return null;

  const svgWidth = 300;
  const svgHeight = 150;
  const padLeft = 28;
  const padBottom = 20;
  const padTop = 8;
  const chartW = svgWidth - padLeft;
  const chartH = svgHeight - padBottom - padTop;

  const sorted = Object.entries(dailyData).map(entry => entry[1]).sort((a, b) => a.date - b.date);
  const entries = fillMissingDays(sorted, totalDays, endDate);
  const values = entries.map(entry => entry.totalTime);
  const [maxValue, div] = determineMaxValueAndDiv(Math.ceil(Math.max(...values) / (60 * 60 * 1000)));
  const maxValueInMillis = maxValue * (60 * 60 * 1000);

  const n = (maxValue / div) + 1;
  const barSlotW = chartW / entries.length;
  const barGap = 2;

  const accent = getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim();
  const mutedColor = getComputedStyle(document.documentElement).getPropertyValue('--color-base-content-muted').trim();
  const gridColor = getComputedStyle(document.documentElement).getPropertyValue('--color-base-content').trim();

  const gridLines = Array.from({ length: n }, (_, idx) => {
    const y = padTop + Math.round((idx / (n - 1)) * chartH);
    return (
      <line
        key={`grid-${idx}`}
        x1={padLeft - 4} y1={y}
        x2={chartW + padLeft} y2={y}
        stroke={gridColor}
        strokeOpacity={0.06}
        strokeWidth={1}
      />
    );
  });

  const yAxisLabels = Array.from({ length: n }, (_, idx) => {
    const y = padTop + Math.round((idx / (n - 1)) * chartH);
    const label = `${(n - (idx + 1)) * div}h`;
    return (
      <text
        key={`yl-${idx}`}
        x={padLeft - 4}
        y={y}
        textAnchor="end"
        dominantBaseline="middle"
        fontSize={8}
        fill={mutedColor}
      >
        {label}
      </text>
    );
  });

  const bars = entries.map((entry, idx) => {
    const barH = Math.round((entry.totalTime / maxValueInMillis) * chartH);
    const barW = barSlotW - barGap;
    const x = padLeft + idx * barSlotW + barGap / 2;
    const y = padTop + chartH - barH;

    return (
      <g key={`bar-${idx}`}>
        <rect
          x={x} y={y}
          width={barW} height={barH}
          fill={accent}
          fillOpacity={0.15}
        />
        <line
          x1={x} y1={y}
          x2={x + barW} y2={y}
          stroke={accent}
          strokeWidth={1.5}
        />
      </g>
    );
  });

  const xAxisLabels = entries.map((entry, idx) => {
    let label = "";
    if (totalDays == 7) label = getWeekDay(entry.date);
    else if (idx % 7 == 0) label = getShortFormDate(entry.date);
    if (label === "") return null;

    const x = padLeft + idx * barSlotW + barSlotW / 2;
    const y = padTop + chartH + 6;

    return (
      <g key={`xl-${idx}`}>
        <line
          x1={x} y1={padTop + chartH}
          x2={x} y2={padTop + chartH + 4}
          stroke={mutedColor}
          strokeWidth={1}
        />
        <text
          x={x} y={y + 6}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={8}
          fill={mutedColor}
        >
          {label}
        </text>
      </g>
    );
  });

  return (
    <div className="w-full bg-surface border border-base-content/8 rounded-sm overflow-hidden mb-4">
      <svg width={svgWidth} height={svgHeight} className="block">
        {gridLines}
        {yAxisLabels}
        {bars}
        {xAxisLabels}
      </svg>
    </div>
  );
}

export default DailyUsageChart;