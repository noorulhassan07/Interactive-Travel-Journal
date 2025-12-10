import React, { useState, ChangeEvent, FormEvent } from "react";
import { uploadTravelLog } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

interface NewTripFormProps {
  onSuccess?: () => void;
}

const NewTripForm: React.FC<NewTripFormProps> = ({ onSuccess }) => {
  const { currentUser } = useAuth(); 
  const [country, setCountry] = useState("");
  const [placeName, setPlaceName] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (!file.type.startsWith('image/')) {
        setMessage("Please select an image file (JPEG, PNG, etc.)");
        e.target.value = ""; // Clear file input
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        setMessage("Image must be less than 10MB");
        e.target.value = "";
        return;
      }
      
      setPhoto(file);
      setMessage(""); 
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      setMessage("Please login to add a trip.");
      return;
    }

    if (!photo) {
      setMessage("Please upload a photo.");
      return;
    }

    if (!country.trim() || !placeName.trim() || !description.trim()) {
      setMessage("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("country", country.trim());
    formData.append("place_name", placeName.trim());
    formData.append("description", description.trim());
    formData.append("photo", photo);

    console.log("Uploading trip with data:");
    console.log("Country:", country);
    console.log("Place Name:", placeName);
    console.log("Description:", description);
    console.log("Photo:", photo.name, `${(photo.size / 1024).toFixed(1)} KB`);
    console.log("User (from token):", currentUser.email);
    
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(key, ":", value.name, `(${value.type}, ${(value.size / 1024).toFixed(1)} KB)`);
      } else {
        console.log(key, ":", value);
      }
    }

    try {
      const response = await uploadTravelLog(formData);
      console.log("Upload successful:", response);
      
      setMessage("Trip added successfully! Photos are now stored in HDFS for better reliability.");

      setCountry("");
      setPlaceName("");
      setDescription("");
      setPhoto(null);
      
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error("Upload failed:", err);
      
      if (err.response) {
        console.error("Response error:", err.response.data);
        if (err.response.status === 401) {
          setMessage("Authentication failed. Please login again.");
        } else if (err.response.status === 413) {
          setMessage("File too large. Please upload a photo smaller than 10MB.");
        } else if (err.response.data?.detail) {
          const detail = err.response.data.detail;
          if (typeof detail === 'string') {
            setMessage(`Error: ${detail}`);
          } else if (Array.isArray(detail)) {
            setMessage(`Validation error: ${detail.map(d => d.msg).join(', ')}`);
          } else {
            setMessage(`Error: ${JSON.stringify(detail)}`);
          }
        } else {
          setMessage(`Failed to upload trip. Server error: ${err.response.status}`);
        }
      } else if (err.request) {
        setMessage("Network error. Please check your connection.");
      } else {
        setMessage("Failed to upload trip. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div style={styles.card}>
        <h2 style={styles.title}>Add a New Trip</h2>
        <div style={styles.loginMessage}>
          <p>Please login to add a trip.</p>
          <a href="/login" style={styles.loginLink}>Go to Login</a>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>Add a New Trip</h2>
      <p style={styles.subtitle}>Photos are stored in HDFS for better reliability and scalability</p>

      <form onSubmit={handleSubmit} style={styles.form}>
        <label style={styles.label}>Country *</label>
        <input
          type="text"
          value={country}
          placeholder="e.g., Turkey"
          onChange={(e) => setCountry(e.target.value)}
          required
          disabled={loading}
          style={styles.input}
        />

        <label style={styles.label}>Place Name *</label>
        <input
          type="text"
          value={placeName}
          placeholder="e.g., Blue Mosque"
          onChange={(e) => setPlaceName(e.target.value)}
          required
          disabled={loading}
          style={styles.input}
        />

        <label style={styles.label}>Description *</label>
        <textarea
          value={description}
          placeholder="Write something about your trip..."
          onChange={(e) => setDescription(e.target.value)}
          required
          disabled={loading}
          style={styles.textarea}
          rows={4}
          maxLength={500}
        />
        <div style={styles.charCount}>
          {description.length}/500 characters
        </div>

        <label style={styles.label}>Photo *</label>
        <div style={styles.fileUploadArea}>
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            required
            disabled={loading}
            style={styles.fileInput}
            id="photo-upload"
          />
          <label htmlFor="photo-upload" style={styles.fileLabel}>
            {photo ? photo.name : "Choose a photo (max 10MB)"}
          </label>
        </div>
        
        {photo && (
          <div style={styles.preview}>
            <div style={styles.previewHeader}>
              <span>Selected: {photo.name}</span>
              <span>{(photo.size / 1024).toFixed(1)} KB</span>
            </div>
            <div style={styles.previewImage}>
              <img 
                src={URL.createObjectURL(photo)} 
                alt="Preview" 
                style={styles.imagePreview}
                onLoad={() => URL.revokeObjectURL(URL.createObjectURL(photo))}
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            ...styles.button,
            background: loading
              ? "#9ca3af"
              : "linear-gradient(135deg, #2563eb, #1d4ed8)",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? (
            <>
              <span style={styles.spinner}></span>
              Uploading to HDFS...
            </>
          ) : "Add Trip"}
        </button>

        {message && (
          <div
            style={{
              ...styles.message,
              color: message.includes("success") || message.includes("Success") 
                ? "#059669" 
                : "#dc2626",
              background: message.includes("success") || message.includes("Success")
                ? "#d1fae5"
                : "#fee2e2",
              padding: "12px",
              borderRadius: "8px",
              marginTop: "16px",
              borderLeft: `4px solid ${message.includes("success") || message.includes("Success") ? "#059669" : "#dc2626"}`,
            }}
          >
            {message}
          </div>
        )}

        <div style={styles.hdfsInfo}>
          <strong>HDFS Storage:</strong> Your photos are stored in Hadoop Distributed File System for enhanced reliability and scalability.
        </div>
      </form>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    width: "100%",
    maxWidth: "600px",
    margin: "40px auto",
    padding: "30px",
    borderRadius: "20px",
    background: "linear-gradient(145deg, #fefefe, #f0f4ff)",
    boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
    transition: "transform 0.3s, box-shadow 0.3s",
  },
  title: {
    textAlign: "center",
    fontSize: "28px",
    fontWeight: "bold",
    marginBottom: "10px",
    color: "#1d3557",
    textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
  },
  subtitle: {
    textAlign: "center",
    fontSize: "14px",
    color: "#6b7280",
    marginBottom: "25px",
  },
  loginMessage: {
    textAlign: "center",
    padding: "30px",
    background: "#f8fafc",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
  },
  loginLink: {
    display: "inline-block",
    marginTop: "10px",
    color: "#2563eb",
    fontWeight: "600",
    textDecoration: "none",
  },
  form: { 
    display: "flex", 
    flexDirection: "column" 
  },
  label: {
    fontWeight: "600",
    marginBottom: "8px",
    color: "#374151",
    fontSize: "14.5px",
  },
  input: {
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    marginBottom: "18px",
    fontSize: "15px",
    outline: "none",
    transition: "0.3s",
    backgroundColor: "white",
    boxSizing: "border-box" as const,
  },
  textarea: {
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    marginBottom: "8px",
    fontSize: "15px",
    outline: "none",
    transition: "0.3s",
    fontFamily: "inherit",
    resize: "vertical" as const,
    minHeight: "120px",
    backgroundColor: "white",
    boxSizing: "border-box" as const,
  },
  charCount: {
    fontSize: "12px",
    color: "#6b7280",
    textAlign: "right" as const,
    marginBottom: "18px",
  },
  fileUploadArea: {
    marginBottom: "10px",
    position: "relative" as const,
  },
  fileInput: {
    position: "absolute" as const,
    width: "1px",
    height: "1px",
    padding: 0,
    margin: "-1px",
    overflow: "hidden",
    clip: "rect(0, 0, 0, 0)",
    border: 0,
  },
  fileLabel: {
    display: "block",
    padding: "14px",
    borderRadius: "12px",
    border: "2px dashed #d1d5db",
    backgroundColor: "white",
    textAlign: "center" as const,
    cursor: "pointer",
    color: "#6b7280",
    transition: "0.3s",
  },
  preview: {
    marginBottom: "18px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    overflow: "hidden",
  },
  previewHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px",
    backgroundColor: "#f9fafb",
    fontSize: "14px",
    color: "#374151",
  },
  previewImage: {
    backgroundColor: "#f3f4f6",
    padding: "20px",
    textAlign: "center" as const,
  },
  imagePreview: {
    maxWidth: "100%",
    maxHeight: "200px",
    borderRadius: "8px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
  },
  button: {
    width: "100%",
    padding: "16px",
    color: "white",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "16px",
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    boxShadow: "0 5px 15px rgba(37, 99, 235, 0.4)",
    transition: "0.3s",
    marginTop: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
  },
  spinner: {
    width: "16px",
    height: "16px",
    border: "2px solid rgba(255,255,255,0.3)",
    borderRadius: "50%",
    borderTopColor: "white",
    animation: "spin 1s linear infinite",
  },
  message: {
    marginTop: "18px",
    textAlign: "center" as const,
    fontWeight: "600",
    fontSize: "15px",
  },
  hdfsInfo: {
    marginTop: "20px",
    padding: "12px",
    backgroundColor: "#e0f2fe",
    borderRadius: "8px",
    fontSize: "13px",
    color: "#0369a1",
    borderLeft: "4px solid #0ea5e9",
  },
};

const styleSheet = document.styleSheets[0];
if (styleSheet) {
  styleSheet.insertRule(`
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `, styleSheet.cssRules.length);
}

export default NewTripForm;
