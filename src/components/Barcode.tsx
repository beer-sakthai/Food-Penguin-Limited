import React from 'react';

export function Barcode({ value, isLight }: { value: string; isLight: boolean }) {
  const bars = React.useMemo(() => {
    let pattern: number[] = [];
    pattern.push(1, 0, 1);
    for (let i = 0; i < value.length; i++) {
      const num = parseInt(value[i], 10) || 0;
      const codes = [
        [0,0,0,1,1,0,1], [0,0,1,1,0,0,1], [0,0,1,0,0,1,1], [0,1,1,1,1,0,1],
        [0,1,0,0,0,1,1], [0,1,1,0,0,0,1], [0,1,0,1,1,1,1], [0,1,1,1,0,1,1],
        [0,1,1,0,1,1,1], [0,0,0,1,0,1,1]
      ];
      pattern.push(...codes[num]);
      if (i === 6) pattern.push(0, 1, 0, 1, 0);
    }
    pattern.push(1, 0, 1);
    return pattern;
  }, [value]);

  return (
    <div className={`p-2 rounded-xl flex flex-col justify-center items-center transition-colors duration-200 mt-2 ${
      isLight ? 'bg-zinc-100 text-zinc-800 border border-zinc-200' : 'bg-[#18181b] border border-zinc-800 text-white'
    }`}>
      <div className="flex h-10 w-full items-stretch justify-center max-w-[200px] overflow-hidden bg-white px-2 py-1 rounded" style={{ gap: '0.1px' }}>
        {bars.map((bit, idx) => (
          <div key={idx} className={`flex-1 ${bit === 1 ? 'bg-black' : 'bg-transparent'}`} style={{ minWidth: '1px' }} />
        ))}
      </div>
      <span className="text-xs font-mono tracking-[2px] mt-2 font-bold leading-none select-all">{value}</span>
    </div>
  );
}
