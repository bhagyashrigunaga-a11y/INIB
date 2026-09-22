import { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:5000";

function App() {
  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState("");

  const loadFiles = async () => {
    try {
      const response = await fetch(`${API}/files`);
      const data = await response.json();

      setFiles(data.filter((item) => item.fileName));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${API}/upload`, {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      setMessage(data.message);
      setFile(null);

      document.getElementById("fileInput").value = "";

      loadFiles();
    } catch (error) {
      console.error(error);
      setMessage("Upload failed.");
    }
  };

  const handleDownload = (fileName) => {
    window.open(
      `${API}/download/${encodeURIComponent(fileName)}`,
      "_blank"
    );
  };

  return (
    <div className="app">
      <div className="container">
        <h1>INIB Cloud Storage</h1>

        <p className="subtitle">
          Upload, store and download your files using AWS S3
        </p>

        <div className="upload-box">
          <input
            id="fileInput"
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
          />

          <button onClick={handleUpload}>
            Upload File
          </button>
        </div>

        {file && (
          <p className="selected">
            Selected: {file.name}
          </p>
        )}

        {message && (
          <p className="message">
            {message}
          </p>
        )}

        <div className="files-section">
          <h2>My Files</h2>

          {files.length === 0 ? (
            <p>No files available.</p>
          ) : (
            files.map((item) => (
              <div className="file-card" key={item.fileName}>
                <div>
                  <strong>{item.fileName}</strong>
                  <p>{item.size} bytes</p>
                </div>

                <button
                  onClick={() => handleDownload(item.fileName)}
                >
                  Download
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;