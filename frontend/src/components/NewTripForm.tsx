import React, { useState, ChangeEvent, FormEvent } from "react";
import { uploadTravelLog } from "../services/api";

interface NewTripFormProps {
  userId: number;
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

    setLoading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("user_id", userId.toString());
    formData.append("country", country);
    formData.append("place_name", placeName);
    formData.append("description", description);
    formData.append("photo", photo);

    try {
      await uploadTravelLog(formData);
      setMessage("Trip added successfully! 🎉");

      setCountry("");
      setPlaceName("");
      setDescription("");
      setPhoto(null);

      if (onSuccess) onSuccess();
    } catch (err) {
      setMessage("Failed to upload trip. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Add a New Trip</h2>
      <form onSubmit={handleSubmit}>
        <label style={styles.label}>Country</label>
        <input
          type="text"
          value={country}
          placeholder="e.g., Turkey"
          onChange={(e) => setCountry(e.target.value)}
          required
          style={styles.input}
        />

        <label style={styles.label}>Place Name</label>
        <input
          type="text"
          value={placeName}
          placeholder="e.g., Blue Mosque"
          onChange={(e) => setPlaceName(e.target.value)}
          required
          style={styles.input}
        />

        <label style={styles.label}>Description</label>
        <textarea
          value={description}
          placeholder="Write something about your trip..."
          onChange={(e) => setDescription(e.target.value)}
          required
          style={styles.textarea}
        />

        <label style={styles.label}>Photo</label>
        <input
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          required
          style={{ marginBottom: "15px" }}
        />

        <button type="submit" disabled={loading} style={{ ...styles.button, background: loading ? "#999" : "#007bff" }}>
          {loading ? "Uploading..." : "Add Trip"}
        </button>

        {message && (
          <p style={{ ...styles.message, color: message.includes("success") ? "green" : "red" }}>{message}</p>
        )}
      </form>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: "400px",
    margin: "30px auto",
    padding: "20px",
    borderRadius: "10px",
    background: "#ffffff",
    boxShadow: "0px 0px 15px rgba(0,0,0,0.1)",
    fontFamily: "Arial, sans-serif",
  },
  title: {
    textAlign: "center",
    marginBottom: "20px",
    color: "#333",
  },
  label: {
    fontWeight: "bold",
    display: "block",
    marginBottom: "5px",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "15px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  textarea: {
    width: "100%",
    padding: "10px",
    marginBottom: "15px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    minHeight: "100px",
  },
  button: {
    width: "100%",
    padding: "12px",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  message: {
    marginTop: "15px",
    textAlign: "center",
    fontWeight: "bold",
  },
};

export default NewTripForm;
