// frontend/src/components/NewTripForm.tsx
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

    setLoading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("user_id", userId);
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
    <div style={styles.card}>
      <h2 style={styles.title}>Add a New Trip</h2>

      <form onSubmit={handleSubmit} style={styles.form}>
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
          style={styles.file}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            ...styles.button,
            background: loading
              ? "#9ca3af"
              : "linear-gradient(135deg, #2563eb, #1d4ed8)",
          }}
        >
          {loading ? "Uploading..." : "Add Trip"}
        </button>

        {message && (
          <p
            style={{
              ...styles.message,
              color: message.includes("success") ? "green" : "red",
            }}
          >
            {message}
          </p>
        )}
      </form>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    width: "450px",
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
  form: { display: "flex", flexDirection: "column" },
  label: {
    fontWeight: "600",
    marginBottom: "8px",
    color: "#4a4a4a",
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
  },
  inputFocus: {
    borderColor: "#2563eb",
    boxShadow: "0 0 8px rgba(37,99,235,0.2)",
  },
  textarea: {
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    marginBottom: "18px",
    minHeight: "130px",
    fontSize: "15px",
    outline: "none",
    transition: "0.3s",
  },
  file: {
    marginBottom: "18px",
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
  },
  buttonHover: {
    transform: "translateY(-2px)",
    boxShadow: "0 8px 20px rgba(37, 99, 235, 0.5)",
  },
  message: {
    marginTop: "18px",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: "15px",
  },
};

export default NewTripForm;
