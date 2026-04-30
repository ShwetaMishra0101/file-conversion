import { useState, useRef, useEffect } from 'react';
import { uploadMedia } from '../Common/api/mediaApi';

const API_ORIGIN = 'http://localhost:7001';

const FORMATS = [
    { id: 'png', label: 'PNG', desc: 'PNG: Lossless compression, preserves transparency' },
    { id: 'jpeg', label: 'JPEG', desc: 'JPEG: Best for photos, smaller file size without transparency' },
    { id: 'webp', label: 'WebP', desc: 'WebP: Best for web, smaller file size with good quality' },
    { id: 'avif', label: 'AVIF', desc: 'AVIF: Next-gen format, smallest file size with excellent quality' },
    { id: 'heic', label: 'HEIC', desc: 'HEIC: High efficiency format, smaller file size with high quality, commonly used on Apple devices' },
    { id: 'raw', label: 'RAW', desc: 'RAW: Uncompressed image data from cameras, highest quality for editing but very large size' },
    { id: 'gif', label: 'GIF', desc: 'GIF: Supports simple animations, limited colors, best for short looping graphics' },
    { id: 'tif', label: 'TIF', desc: 'TIF: High-quality format, often used for printing and professional imaging' },
    { id: 'tiff', label: 'TIFF', desc: 'TIFF: Lossless, high-quality format, widely used in photography and publishing' },
  

];

const fmtSize = (b) => {
  if (b == null) return '';
  if (b < 1024) return b + ' B';
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB';
  return (b / (1024 * 1024)).toFixed(1) + ' MB';
};

const extFromMime = (mime) => (mime?.split('/')[1] || '').toUpperCase();

const convertFileToFormat = (file, format) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    const targetMime = `image/${format}`;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext('2d').drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          if (!blob) {
            return reject(new Error(`Could not encode ${format.toUpperCase()} in this browser.`));
          }
          // Browsers silently fall back to PNG when the requested MIME isn't supported.
          // If the returned blob's type doesn't match what we asked for, refuse it so we
          // don't produce a file with the wrong extension (e.g. PNG bytes saved as .svg).
          if (blob.type !== targetMime) {
            return reject(
              new Error(
                `${format.toUpperCase()} encoding is not supported in your browser. Client-side conversion only works for PNG, JPEG, WebP, and AVIF — ${format.toUpperCase()} needs server-side conversion.`,
              ),
            );
          }
          const baseName = file.name.replace(/\.[^/.]+$/, '');
          const ext = format === 'jpeg' ? 'jpg' : format;
          resolve(new File([blob], `${baseName}.${ext}`, { type: targetMime }));
        },
        targetMime,
        0.92,
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not load image for conversion'));
    };
    img.src = url;
  });

const UploadModal = ({ onClose, onRefresh }) => {
  const [queue, setQueue] = useState([]);
  const [view, setView] = useState('files');
  const [convertId, setConvertId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef();

  useEffect(() => {
    return () => {
      queue.forEach((item) => item.previewUrl && URL.revokeObjectURL(item.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addFiles = (fileList) => {
    const next = Array.from(fileList).map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      file,
      originalSize: file.size,
      originalMime: file.type,
      previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      status: 'ready',
      uploadedUrl: null,
      wasConverted: false,
    }));
    setQueue((q) => [...q, ...next]);
  };

  const removeItem = (id) => {
    setQueue((q) => {
      const t = q.find((i) => i.id === id);
      if (t?.previewUrl) URL.revokeObjectURL(t.previewUrl);
      return q.filter((i) => i.id !== id);
    });
  };

  const clearAll = () => {
    queue.forEach((i) => i.previewUrl && URL.revokeObjectURL(i.previewUrl));
    setQueue([]);
    setView('files');
    setConvertId(null);
  };

  const openConvert = (id) => {
    setConvertId(id);
    setView('convert');
  };

  const handleApplyConvert = async (format) => {
    const target = queue.find((i) => i.id === convertId);
    if (!target) return;
    try {
      const converted = await convertFileToFormat(target.file, format);
      setQueue((q) =>
        q.map((i) => {
          if (i.id !== convertId) return i;
          if (i.previewUrl) URL.revokeObjectURL(i.previewUrl);
          return {
            ...i,
            file: converted,
            previewUrl: URL.createObjectURL(converted),
            wasConverted: true,
          };
        }),
      );
      setView('files');
      setConvertId(null);
    } catch (err) {
      alert('Conversion failed: ' + err.message);
    }
  };

  const handleUploadAll = async () => {
    if (uploading || readyCount === 0) return;
    setUploading(true);
    let anySuccess = false;
    for (const item of queue) {
      if (item.status !== 'ready') continue;
      setQueue((q) => q.map((i) => (i.id === item.id ? { ...i, status: 'uploading' } : i)));
      try {
        const fd = new FormData();
        fd.append('file', item.file);
        const res = await uploadMedia(fd);
        const uploadedUrl = `${API_ORIGIN}/uploads/${res.data.storedName}`;
        setQueue((q) =>
          q.map((i) => (i.id === item.id ? { ...i, status: 'done', uploadedUrl } : i)),
        );
        anySuccess = true;
      } catch (err) {
        setQueue((q) =>
          q.map((i) =>
            i.id === item.id
              ? { ...i, status: 'error', errorMsg: err.response?.data?.message || err.message }
              : i,
          ),
        );
      }
    }
    setUploading(false);
    if (anySuccess) onRefresh();
  };

  const readyCount = queue.filter((i) => i.status === 'ready').length;
  const doneCount = queue.filter((i) => i.status === 'done').length;
  const convertTarget = queue.find((i) => i.id === convertId);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl w-[780px] max-w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="bg-red-600 px-6 py-5 flex justify-between items-start flex-shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-white">Upload Assets</h2>
            <p className="text-sm text-red-100/90 mt-0.5">Upload files to /general folder</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/90 hover:text-white transition-colors"
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25">
              <path d="M6 6l12 12M6 18L18 6" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {view === 'convert' && convertTarget ? (
            <ConvertView
              item={convertTarget}
              onBack={() => {
                setView('files');
                setConvertId(null);
              }}
              onApply={handleApplyConvert}
            />
          ) : queue.length === 0 ? (
            <EmptyDropzone
              onPick={() => inputRef.current.click()}
              onDrop={(files) => addFiles(files)}
            />
          ) : (
            <div className="p-6">
              <AddMoreBar onClick={() => inputRef.current.click()} onDrop={(files) => addFiles(files)} />
              <div className="grid grid-cols-3 gap-4 mt-4">
                {queue.map((item) => (
                  <FileCard
                    key={item.id}
                    item={item}
                    onConvertClick={() => openConvert(item.id)}
                    onRemove={() => removeItem(item.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) addFiles(e.target.files);
            e.target.value = '';
          }}
        />

        {/* Footer */}
        {view !== 'convert' && (
          <div className="border-t border-zinc-200 px-6 py-4 flex items-center justify-between flex-shrink-0 bg-white">
            <span className="text-sm flex items-center gap-1.5">
              {doneCount > 0 ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
                    <path d="M5 12l5 5 9-11" />
                  </svg>
                  <span className="text-green-600 font-medium">{doneCount} uploaded</span>
                  {readyCount > 0 && <span className="text-zinc-400">· {readyCount} ready</span>}
                </>
              ) : queue.length === 0 ? (
                <span className="text-zinc-400">No files selected</span>
              ) : (
                <span className="text-zinc-600">{readyCount} ready</span>
              )}
            </span>
            <div className="flex gap-4 items-center">
              <button
                onClick={clearAll}
                disabled={queue.length === 0 || uploading}
                className="text-sm text-zinc-600 hover:text-zinc-900 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Clear All
              </button>
              <button
                onClick={handleUploadAll}
                disabled={readyCount === 0 || uploading}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-zinc-200 disabled:text-zinc-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 15V3m0 0-4 4m4-4 4 4" />
                  <path d="M3 15v4a2 2 0 002 2h14a2 2 0 002-2v-4" />
                </svg>
                {uploading ? 'Uploading…' : `Upload ${readyCount} File${readyCount === 1 ? '' : 's'}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const EmptyDropzone = ({ onPick, onDrop }) => {
  const [dragging, setDragging] = useState(false);
  return (
    <div className="p-6">
      <div
        onClick={onPick}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (e.dataTransfer.files.length) onDrop(e.dataTransfer.files);
        }}
        className={`border-2 border-dashed rounded-2xl py-16 flex flex-col items-center justify-center cursor-pointer transition-colors ${
          dragging ? 'border-red-400 bg-red-50' : 'border-zinc-200 hover:border-zinc-300'
        }`}
      >
        <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mb-5">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="1.5">
            <path d="M16 16l-4-4-4 4" />
            <path d="M12 12v9" />
            <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-zinc-800">Drag and drop files</h3>
        <p className="text-sm text-zinc-400 mt-1">
          or <span className="text-blue-600 font-medium">browse</span> to choose files
        </p>
        <div className="flex gap-2 mt-6">
          {['Images', 'Videos', 'PDFs', 'Documents'].map((t) => (
            <span
              key={t}
              className="px-4 py-1.5 bg-zinc-100 rounded-full text-xs font-medium text-zinc-600"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

const AddMoreBar = ({ onClick, onDrop }) => (
  <div
    onClick={onClick}
    onDragOver={(e) => e.preventDefault()}
    onDrop={(e) => {
      e.preventDefault();
      if (e.dataTransfer.files.length) onDrop(e.dataTransfer.files);
    }}
    className="border-2 border-dashed border-zinc-200 hover:border-zinc-300 rounded-xl py-5 flex items-center justify-center gap-2 cursor-pointer text-zinc-500 transition-colors"
  >
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14M5 12h14" />
    </svg>
    <span className="text-sm font-medium">Add more files</span>
  </div>
);

const FileCard = ({ item, onConvertClick, onRemove }) => {
  const isImg = item.file.type.startsWith('image/');
  const [copied, setCopied] = useState(false);
  const isDone = item.status === 'done';
  const isError = item.status === 'error';

  const borderColor = isDone
    ? 'border-green-400'
    : isError
    ? 'border-red-400'
    : 'border-blue-400';

  const handleCopy = () => {
    if (!item.uploadedUrl) return;
    navigator.clipboard.writeText(item.uploadedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className={`border-2 ${borderColor} rounded-xl p-3 bg-white relative transition-colors`}>
      {item.status === 'ready' && (
        <button
          onClick={onRemove}
          className="absolute -top-2 -right-2 w-6 h-6 bg-white border border-zinc-200 rounded-full flex items-center justify-center text-zinc-400 hover:text-red-500 hover:border-red-300 shadow-sm text-xs z-10"
          aria-label="Remove"
        >
          ×
        </button>
      )}

      <div className="relative w-full h-40 rounded-lg bg-zinc-100 flex items-center justify-center overflow-hidden">
        {isImg && item.previewUrl ? (
          <img src={item.previewUrl} alt={item.file.name} className="w-full h-full object-contain" />
        ) : (
          <span className="text-xs font-semibold text-zinc-400 tracking-widest">
            {item.file.name.split('.').pop().toUpperCase() || 'FILE'}
          </span>
        )}
        {isDone && (
          <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-green-500 flex items-center justify-center shadow">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
              <path d="M5 12l5 5 9-11" />
            </svg>
          </div>
        )}
      </div>

      <div className="mt-3 flex justify-between items-start gap-2">
        <p className="text-sm font-semibold text-zinc-800 truncate" title={item.file.name}>
          {item.file.name}
        </p>
        <StatusBadge status={item.status} />
      </div>

      <div className="text-xs mt-1 flex items-center gap-1.5">
        {item.wasConverted ? (
          <>
            <span className="text-zinc-400 line-through">{fmtSize(item.originalSize)}</span>
            <span className="text-green-600 font-medium">{fmtSize(item.file.size)}</span>
          </>
        ) : (
          <span className="text-zinc-400">{fmtSize(item.file.size)}</span>
        )}
      </div>

      <div className="mt-3">
        {isDone ? (
          <button
            onClick={handleCopy}
            className="w-full flex items-center justify-center gap-2 py-2 bg-green-50 hover:bg-green-100 text-green-700 text-sm font-medium rounded-lg transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
            {copied ? 'Copied!' : 'Copy URL'}
          </button>
        ) : isError ? (
          <p className="text-xs text-red-600 truncate" title={item.errorMsg}>
            {item.errorMsg || 'Upload failed'}
          </p>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => alert('Crop will be added next — placeholder for now.')}
              disabled={item.status !== 'ready'}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-blue-50 hover:bg-blue-100 disabled:opacity-50 text-blue-600 text-xs font-medium rounded-md transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2v14a2 2 0 002 2h14" />
                <path d="M18 22V8a2 2 0 00-2-2H2" />
              </svg>
              Crop
            </button>
            <button
              onClick={onConvertClick}
              disabled={!isImg || item.status !== 'ready'}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-purple-50 hover:bg-purple-100 disabled:opacity-50 text-purple-600 text-xs font-medium rounded-md transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12a9 9 0 0115-6.7L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 01-15 6.7L3 16" />
                <path d="M3 21v-5h5" />
              </svg>
              Convert
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const map = {
    ready: { text: 'Ready', cls: 'bg-zinc-100 text-zinc-600' },
    uploading: { text: 'Uploading', cls: 'bg-amber-100 text-amber-700' },
    done: { text: 'Uploaded', cls: 'bg-green-100 text-green-700' },
    error: { text: 'Error', cls: 'bg-red-100 text-red-700' },
  };
  const { text, cls } = map[status] || map.ready;
  return (
    <span className={`text-[11px] px-2 py-0.5 rounded-md font-medium whitespace-nowrap ${cls}`}>
      {text}
    </span>
  );
};

const ConvertView = ({ item, onBack, onApply }) => {
  const currentExt = extFromMime(item.file.type) || 'IMG';
  const defaultFormat =
    currentExt.toLowerCase() === 'webp' ? 'png' : currentExt.toLowerCase() === 'jpeg' ? 'webp' : 'webp';
  const [picked, setPicked] = useState(defaultFormat);
  const [working, setWorking] = useState(false);
  const pickedFmt = FORMATS.find((f) => f.id === picked) || FORMATS[2];
  const alreadyInFormat = currentExt.toLowerCase() === picked;

  const apply = async () => {
    setWorking(true);
    try {
      await onApply(picked);
    } finally {
      setWorking(false);
    }
  };

  return (
    <div className="p-6">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-zinc-600 hover:text-zinc-900 mb-5"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Back to files
      </button>

      <div className="bg-zinc-50 rounded-xl p-5 border border-zinc-200">
        <h3 className="text-sm font-semibold text-zinc-800 mb-4">Convert Format</h3>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-lg p-4 border border-zinc-200">
            <p className="text-xs text-zinc-400 mb-1">Original</p>
            <p className="text-lg font-bold text-zinc-800">{fmtSize(item.originalSize)}</p>
            <p className="text-xs text-zinc-400 mt-0.5">{extFromMime(item.originalMime) || 'FILE'}</p>
          </div>
          <div className="bg-zinc-100 rounded-lg p-4 border border-zinc-200">
            <p className="text-xs text-zinc-400 mb-1">After Conversion</p>
            <p className="text-sm text-zinc-400">Not converted yet</p>
          </div>
        </div>

        <div className="flex gap-2 mt-5 flex-wrap">
          {FORMATS.map((f) => (
            <button
              key={f.id}
              onClick={() => setPicked(f.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                picked === f.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <p className="text-sm text-zinc-500 mt-4">{pickedFmt.desc}</p>

        <button
          onClick={apply}
          disabled={working || alreadyInFormat}
          className="w-full mt-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-200 disabled:text-zinc-400 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
        >
          {working
            ? 'Converting…'
            : alreadyInFormat
            ? `Already ${pickedFmt.label}`
            : `Convert to ${pickedFmt.label}`}
        </button>
      </div>
    </div>
  );
};

export default UploadModal;
