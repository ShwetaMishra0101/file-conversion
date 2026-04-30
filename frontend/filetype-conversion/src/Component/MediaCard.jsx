import axios from 'axios';

const fmtSize = (bytes) => {

  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const fmtDate = (d) =>
  new Date(d).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

const isImage = (mime) => mime?.startsWith('image/');

const FileIcon = ({ type }) => (
  <div className="flex flex-col items-center gap-2">
    <svg width="40" height="48" viewBox="0 0 40 48" fill="none">
      <rect width="40" height="48" rx="4" fill="#e2e8f0" />
      <path d="M24 2v10h10" stroke="#94a3b8" strokeWidth="1.5" fill="none" />
      <path d="M24 2H6a2 2 0 00-2 2v40a2 2 0 002 2h28a2 2 0 002-2V12L24 2z"
        stroke="#94a3b8" strokeWidth="1.5" fill="none" />
      <rect x="8" y="22" width="24" height="2" rx="1" fill="#94a3b8" />
      <rect x="8" y="28" width="18" height="2" rx="1" fill="#94a3b8" />
      <rect x="8" y="34" width="20" height="2" rx="1" fill="#94a3b8" />
    </svg>
    <span className="text-xs font-semibold text-slate-400 tracking-widest">{type}</span>
  </div>
);

const IconBtn = ({ title, onClick, children, danger }) => (
  <button
    title={title}
    onClick={onClick}
    className={`w-8 h-8 flex items-center justify-center rounded-lg border text-sm transition-colors
      ${danger
        ? 'border-red-100 hover:bg-red-50 text-red-400'
        : 'border-zinc-200 hover:bg-zinc-100 text-zinc-500'
      }`}
  >
    {children}
  </button>
);

const MediaCard = ({ file, onConvert, onDelete, onRefresh }) => {
  const imgSrc = isImage(file.mimeType)
    ? `http://localhost:7001/uploads/${file.storedName}`
    : null;

  const handleCopy = () => {
    const url = `http://localhost:7001/uploads/${file.storedName}`;
    navigator.clipboard.writeText(url);
  };

  const handleDownload = async () => {
    const res = await axios.get(
      `http://localhost:7001/api/media/download/${file._id}`,
      { responseType: 'blob' }
    );
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = file.originalName;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this file?')) return;
    await onDelete(file._id);
    onRefresh();
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
      {/* Thumbnail */}
      <div className="h-40 bg-zinc-100 flex items-center justify-center overflow-hidden">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={file.originalName}
            className="w-full h-full object-top object-cover "
          />
        ) : file.mimeType === 'video/mp4' ? (
          <div className="w-full h-full bg-slate-800 flex flex-col items-center justify-content gap-2">
            <div className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center">
              <div className="w-0 h-0 border-t-8 border-b-8 border-l-[14px] border-transparent border-l-white ml-1" />
            </div>
            <span className="text-xs font-semibold text-slate-400">MP4</span>
          </div>
        ) : (
          <FileIcon type={file.fileType} />
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p
          className="text-xs font-semibold text-zinc-800 truncate mb-1"
          title={file.originalName}
        >
          {file.originalName}
        </p>
        <div className="flex justify-between text-xs text-zinc-400 mb-3">
          <span>{fmtSize(file.size)}</span>
          <span>{fmtDate(file.createdAt)}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-1.5 items-center">
          <button
            onClick={handleCopy}
            className="flex-1 py-1.5 border border-zinc-200 rounded-lg text-xs text-blue-600 hover:bg-zinc-50 transition-colors"
          >
            View
          </button>

          <IconBtn title="Copy URL" onClick={handleCopy}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="5" y="5" width="9" height="9" rx="1.5" />
              <path d="M11 5V3a1 1 0 00-1-1H3a1 1 0 00-1 1v7a1 1 0 001 1h2" />
            </svg>
          </IconBtn>

          <IconBtn title="Download" onClick={handleDownload}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M8 2v8m0 0-3-3m3 3 3-3M2 12v1a1 1 0 001 1h10a1 1 0 001-1v-1" />
            </svg>
          </IconBtn>

          {isImage(file.mimeType) && (
            <IconBtn title="Convert format" onClick={() => onConvert(file)}>
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M1 4h10M8 1l3 3-3 3M15 12H5m3 3-3-3 3-3" />
              </svg>
            </IconBtn>
          )}

          <IconBtn title="Delete" onClick={handleDelete} danger>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 9a1 1 0 001 1h6a1 1 0 001-1l1-9" />
            </svg>
          </IconBtn>
        </div>
      </div>
    </div>
  );
};

export default MediaCard;