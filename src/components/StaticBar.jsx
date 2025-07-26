function StaticBar({value}){
    const width = Math.min((value / 1) * 100, 100);

    return (
      <div className="w-full h-1.5 m-0.5">
        <div className="bg-accent rounded-md h-full" style={{ width: `${width}%` }}/>

      </div>
    );
}
export default StaticBar

  