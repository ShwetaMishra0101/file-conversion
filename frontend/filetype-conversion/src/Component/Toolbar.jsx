const Toolbar = ({ filters, setFilters, ipp, setIpp }) => {
    return (
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <input
          type="text"
          placeholder="Filter by name"
          value={filters.name}
          onChange={e => setFilters(f => ({ ...f, name: e.target.value }))}
          className="px-3 py-2 border border-zinc-200 rounded-[8px] text-[12px] md:text-[14px] w-44 bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
        />
  
        <label className="md:text-[14px] text-[12px] !font-[400] text-zinc-500">From:</label>
        <input
          type="date"
          value={filters.from}
          onChange={e => setFilters(f => ({ ...f, from: e.target.value }))}
          className="px-3 py-2 border border-zinc-200 rounded-[8px] text-[12px] md:text-[14px] bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
        />
  
        <label className="text-[12px] md:text-[14px] text-zinc-500">To:</label>
        <input
          type="date"
          value={filters.to}
          onChange={e => setFilters(f => ({ ...f, to: e.target.value }))}
          className="px-3 py-2 border border-zinc-200 rounded-[8px] text-[12px] md:text-[14px] bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
        />
  
        <button
          onClick={() => setFilters({ name: '', from: '', to: '' })}
          className="text-[12px] md:text-[14px] text-zinc-500 hover:text-zinc-800 px-2 py-1"
        >
          Clear
        </button>
  
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[12px] md:text-[14px] text-zinc-500">Items per page:</span>
          <select
            value={ipp}
            onChange={e => setIpp(Number(e.target.value))}
            className="px-3 py-2 border border-zinc-200 rounded-[8px] text-[12px] md:text-[14px] bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            {[10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>
    );
  };
  
  export default Toolbar;