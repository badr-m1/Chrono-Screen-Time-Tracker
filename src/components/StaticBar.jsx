function StaticBar({ value, color}){
    const width = Math.min((value / 1) * 100, 100);

    return (
      <div style={{ width: '100%', height: '0.3rem' }}>
        <div
          style={{
            width: `${width}%`,
            height: '100%',
            backgroundColor: color,
            borderRadius: '0.5rem',
          }}
        />
      </div>
    );
}
export default StaticBar

  