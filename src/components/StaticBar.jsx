function StaticBar({ value, color}){
    const width = Math.min((value / 1) * 100, 100);

    return (
      <div style={{ width: '100%', height: '10px', borderRadius: '4px' }}>
        <div
          style={{
            width: `${width}%`,
            height: '100%',
            backgroundColor: color,
            borderRadius: '10%',
          }}
        />
      </div>
    );
}
export default StaticBar

  