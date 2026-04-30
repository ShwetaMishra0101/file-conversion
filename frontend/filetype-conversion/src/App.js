import { useState, useEffect, useCallback } from 'react';
import { getMedia, deleteMedia, convertMedia } from './Component/Api/mediaApi';
import MediaGrid from './Component/MediaGrid';
import Toolbar from './Component/Toolbar';
import Pagination from './Component/Pagination';
import UploadModal from './Component/UploadModal';


export default function App() {
  const [files,setFiles] = useState([]);
  const [total,setTotal] = useState(0);
  const [totalPages,setTotalPages]  = useState(1);
  const [page,setPage] = useState(1);
  const [ipp,setIpp] = useState(50);
  const [filters,setFilters] = useState({ name: '', from: '', to: '' });
  const [loading,setLoading] = useState(false);
  const [showUpload,setShowUpload] = useState(false);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMedia({
        page, limit: ipp,
        name: filters.name || undefined,
        from: filters.from || undefined,
        to:   filters.to   || undefined,
      });
      setFiles(res.data.files);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, ipp, filters]);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);
  useEffect(() => { setPage(1); }, [filters, ipp]);

  const handleDelete = async (id) => {
    await deleteMedia(id);
    fetchFiles();
  };

  const handleConvert = async (file) => {
    const format = prompt('Convert to (png/jpeg/webp/gif/avif):');
    if (!format) return;
    await convertMedia(file._id, format);
    fetchFiles();
  };

  return (
    <div className="min-h-screen bg-zinc-100">
      <div className="max-w-[1400px] mx-auto px-6 py-6">

        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Media Library</h1>
            <p className="text-sm text-zinc-500 mt-1">
              Browse and manage all uploaded files from S3 (/general folder)
            </p>
          </div>
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            + Upload Assets
          </button>
        </div>

        {/* Toolbar */}
        <Toolbar
          filters={filters}
          setFilters={setFilters}
          ipp={ipp}
          setIpp={setIpp}
        />

        {/* Grid */}
        {loading ? (
          <div className="text-center py-20 text-zinc-400 text-sm">Loading...</div>
        ) : (
          <MediaGrid
            files={files}
            onConvert={handleConvert}
            onDelete={handleDelete}
            onRefresh={fetchFiles}
          />
        )}

        {/* Pagination */}
        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          onPage={setPage}
        />
      </div>

      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onRefresh={fetchFiles}
        />
      )}
    </div>
  );
}