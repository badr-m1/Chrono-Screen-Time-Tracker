function StaticBar({ value }) {
  const width = Math.min((value / 1) * 100, 100);

  return (
    <div className="w-full h-px bg-base-content/10">
      <div className="bg-accent h-full" style={{ width: `${width}%` }} />
    </div>
  );
}

export default StaticBar

  