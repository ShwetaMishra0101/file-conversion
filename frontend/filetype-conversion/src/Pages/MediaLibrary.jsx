import { useState, useEffect, useCallback } from 'react';
import { getMedia, deleteMedia, convertMedia } from '../Component/Api/mediaApi';
import MediaGrid from '../Component/MediaGrid';
import Toolbar from '../Component/Toolbar';
import Pagination from '../Component/Pagination';
import UploadModal from '../Component/UploadModal';

export default function MediaLibrary() {
  const [files, setFiles] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [ipp, setIpp] = useState(50);
  const [filters, setFilters] = useState({ name: '', from: '', to: '' });
  const [loading, setLoading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

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
      <div className="md:max-w-[1440px] mx-auto md:px-[24px] px-[16px] py-6">
        <div className="flex justify-between items-start mb-6 gap-[12px]">
          <div>
            <h1 className="md:text-[38px] text-[28px] !font-[600] text-zinc-900  !font-poppins">Media Library</h1>
          </div>
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-[12px] md:text-[14px] font-medium rounded-[8px] transition-colors"
          >
            + Upload Assets
          </button>
        </div>

        <Toolbar
          filters={filters}
          setFilters={setFilters}
          ipp={ipp}
          setIpp={setIpp}
        />

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
