const Pagination = ({ page, totalPages, total, onPage }) => {
    let start = Math.max(1, page - 2);
    let end   = Math.min(totalPages, start + 4);
    if (end - start < 4) start = Math.max(1, end - 4);
    const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);
  
    return (
      <div className="fixed bottom-0 left-0 right-0 flex items-center justify-center gap-2 py-6 bg-white border-t border-zinc-200 z-50">
        <button
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
          className="px-4 py-2 text-sm border border-zinc-200 rounded-lg bg-white hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>
  
        {pages.map(p => (
          <button
            key={p}
            onClick={() => onPage(p)}
            className={`px-3.5 py-2 text-sm rounded-lg border transition-colors
              ${p === page
                ? 'bg-zinc-900 text-white border-zinc-900'
                : 'bg-white border-zinc-200 hover:bg-zinc-50'
              }`}
          >
            {p}
          </button>
        ))}
  
        <button
          onClick={() => onPage(page + 1)}
          disabled={page >= totalPages}
          className="px-4 py-2 text-sm border border-zinc-200 rounded-lg bg-white hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
  
        <span className="text-sm text-zinc-400 ml-2">
          Total: {total?.toLocaleString()} items
        </span>
      </div>
    );
  };
  
  export default Pagination;