import MediaCard from './MediaCard';

const MediaGrid = ({ files, onConvert, onDelete, onRefresh }) => {
  if (!files?.length) return (
    <div className="text-center py-20 text-zinc-400 text-sm">
      No files found
    </div>
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
      {files.map(file => (
        <MediaCard
          key={file._id}
          file={file}
          onConvert={onConvert}
          onDelete={onDelete}
          onRefresh={onRefresh}
        />
      ))}
    </div>
  );
};

export default MediaGrid;