const IconBtn = ({ title, onClick, children }) => (
  <button
    title={title}
    onClick={onClick}
    className="w-8 h-8 flex items-center justify-center rounded-lg border border-zinc-200 hover:bg-zinc-100 text-zinc-500 text-sm transition-colors"
  >
    {children}
  </button>
);

const PreviewModal = ({ file, fileUrl, imgSrc, isVideo, onClose, onCopy }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200">
          <p className="text-sm font-medium text-zinc-800 truncate pr-4" title={file.originalName}>
            {file.originalName}
          </p>
          <div className="flex items-center gap-1 shrink-0">
            <IconBtn title="Copy URL" onClick={onCopy}>
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="5" y="5" width="9" height="9" rx="1.5" />
                <path d="M11 5V3a1 1 0 00-1-1H3a1 1 0 00-1 1v7a1 1 0 001 1h2" />
              </svg>
            </IconBtn>
            <IconBtn title="Open in new tab" onClick={() => window.open(fileUrl, '_blank')}>
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 2h5v5M14 2 7 9M12 9v4a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h4" />
              </svg>
            </IconBtn>
            <IconBtn title="Close" onClick={onClose}>
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 3l10 10M13 3 3 13" />
              </svg>
            </IconBtn>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 flex items-center justify-center bg-zinc-50 overflow-auto p-4">
          {imgSrc ? (
            <img
              src={imgSrc}
              alt={file.originalName}
              className="max-w-full max-h-[75vh] object-contain"
            />
          ) : isVideo ? (
            <video
              src={fileUrl}
              controls
              className="max-w-full max-h-[75vh]"
            />
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;
