import { useState } from "react";
import axios from "axios";

const FORMATS = ['tiff', "tif", "svg", "heic", "raw", 'png', 'jpeg', 'webp', 'gif', 'avif'];

const ImageConverter = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [format, setFormat] = useState("png");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Handle image select
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // Convert image
  const handleConvert = async () => {
    if (!image) return alert("Please select an image!");

    setLoading(true);
    const formData = new FormData();
    formData.append("image", image);
    formData.append("format", format);

    try {
      const res = await axios.post(
        "http://localhost:7001/api/image/convert",
        formData,
        { responseType: "blob" }
      );

      // Auto download converted image
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `converted.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();

    } catch (err) {
      alert("Conversion failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch history
  const fetchHistory = async () => {
    try {
      const res = await axios.get("http://localhost:7001/api/image/history");
      setHistory(res.data);
      setShowHistory(true);
    } catch (err) {
      alert("Failed to fetch history");
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "40px auto", padding: "20px" }}>
      <h1>🖼️ Image Converter</h1>

      {/* Upload */}
      <div style={{ marginBottom: "20px" }}>
        <input type="file" accept="image/*" onChange={handleImageChange} />
      </div>

      {/* Preview */}
      {preview && (
        <div style={{ marginBottom: "20px" }}>
          <img src={preview} alt="preview" style={{ width: "100%", borderRadius: "8px" }} />
        </div>
      )}

      {/* Format Select */}
      <div style={{ marginBottom: "20px" }}>
        <label>Convert to: </label>
        <select value={format} onChange={(e) => setFormat(e.target.value)}>
          {FORMATS.map((f) => (
            <option key={f} value={f}>{f.toUpperCase()}</option>
          ))}
        </select>
      </div>

      {/* Convert Button */}
      <button
        onClick={handleConvert}
        disabled={loading || !image}
        style={{
          padding: "10px 20px",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          marginRight: "10px"
        }}
      >
        {loading ? "Converting..." : "Convert & Download"}
      </button>

      {/* History Button */}
      <button
        onClick={fetchHistory}
        style={{
          padding: "10px 20px",
          backgroundColor: "#2196F3",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer"
        }}
      >
        View History
      </button>

      {/* History List */}
      {showHistory && (
        <div style={{ marginTop: "30px" }}>
          <h2>Conversion History</h2>
          {history.length === 0 ? (
            <p>No history found</p>
          ) : (
            history.map((item) => (
              <div key={item._id} style={{
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "6px",
                marginBottom: "10px"
              }}>
                <p>📄 <b>{item.originalName}</b></p>
                <p>🔄 {item.originalFormat.toUpperCase()} → {item.convertedFormat.toUpperCase()}</p>
                <p>📦 {(item.originalSize / 1024).toFixed(2)} KB → {(item.convertedSize / 1024).toFixed(2)} KB</p>
                <p>🕒 {new Date(item.createdAt).toLocaleString()}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ImageConverter;