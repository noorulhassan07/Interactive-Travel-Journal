import React, { useState, ChangeEvent, FormEvent } from "react";
import { uploadTravelLog } from "../services/api";

interface NewTripFormProps {
  userId: string;
  onSuccess?: () => void;
}

const NewTripForm: React.FC<NewTripFormProps> = ({ userId, onSuccess }) => {
  const [country, setCountry] = useState("");
  const [placeName, setPlaceName] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

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
    formData.append("user_id", userId);
    formData.append("country", country.trim());
    formData.append("place_name", placeName.trim());
    formData.append("description", description.trim());
    formData.append("photo", photo);

    console.log("Uploading trip with data:");
    console.log("User ID:", userId);
    console.log("Country:", country);
    console.log("Place Name:", placeName);
    console.log("Description:", description);
    console.log("Photo:", photo.name, photo.size, "bytes");
    
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(key, ":", value.name, `(${value.type}, ${value.size} bytes)`);
      } else {
        console.log(key, ":", value);
      }
    }

    try {
      const response = await uploadTravelLog(formData);
      console.log("Upload successful:", response);
      
      setMessage("Trip added successfully! ");

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
          setMessage("File too large. Please upload a smaller photo.");
        } else if (err.response.data?.detail) {
          setMessage(`Error: ${JSON.stringify(err.response.data.detail)}`);
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

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>Add a New Trip</h2>

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
        />

        <label style={styles.label}>Photo *</label>
        <input
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          required
          disabled={loading}
          style={styles.file}
        />
        {photo && (
          <div style={styles.preview}>
            <span>Selected: {photo.name} ({(photo.size / 1024).toFixed(1)} KB)</span>
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
          {loading ? "Uploading..." : "Add Trip"}
        </button>

        {message && (
          <div
            style={{
              ...styles.message,
              color: message.includes("success") || message.includes("🎉") 
                ? "#059669" 
                : "#dc2626",
              background: message.includes("success") || message.includes("🎉")
                ? "#d1fae5"
                : "#fee2e2",
              padding: "12px",
              borderRadius: "8px",
              marginTop: "16px",
            }}
          >
            {message}
          </div>
        )}
      </form>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    width: "100%",
    maxWidth: "500px",
    margin: "40px auto",
    padding: "30px",
    borderRadius: "20px",
    background: "linear-gradient(145deg, #fefefe, #f0f4ff)",
    boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
    transition: "transform 0.3s, box-shadow 0.3s",
  },
  title: {
    textAlign: "center",
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "25px",
    color: "#1d3557",
    textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
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
    display: "flex",
    alignItems: "center",
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
  },
  textarea: {
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    marginBottom: "18px",
    fontSize: "15px",
    outline: "none",
    transition: "0.3s",
    fontFamily: "inherit",
    resize: "vertical",
    minHeight: "100px",
    backgroundColor: "white",
  },
  file: {
    marginBottom: "10px",
    padding: "10px",
    border: "1px dashed #d1d5db",
    borderRadius: "8px",
    backgroundColor: "white",
  },
  preview: {
    marginBottom: "18px",
    fontSize: "14px",
    color: "#6b7280",
    padding: "8px 12px",
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
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
  },
  message: {
    marginTop: "18px",
    textAlign: "center",
    fontWeight: "600",
    fontSize: "15px",
  },
};

export default NewTripForm;
