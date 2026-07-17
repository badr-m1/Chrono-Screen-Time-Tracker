function Stat({ label, value }) {
  return (
    <div className="flex flex-col gap-1 py-1">
      <span className="text-[14px] font-semibold text-base-content leading-none">
        {value}
      </span>
      <span className="text-[11px] text-base-content-muted">
        {label}
      </span>
    </div>
  );
}

export default Stat;

