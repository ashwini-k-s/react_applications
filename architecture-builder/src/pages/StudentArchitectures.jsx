import { useEffect, useState } from "react";
import StudentArchitectureViewer from "./StudentArchitectureViewer";

function StudentArchitectures({ onEditArchitecture }) {
  const [architectures, setArchitectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedArchitectureId, setSelectedArchitectureId] =
    useState(null);

  const fetchArchitectures = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://127.0.0.1:8000/api/student/architectures"
      );

      if (!response.ok) {
        throw new Error("Failed to load architectures");
      }

      const data = await response.json();

      setArchitectures(data.architectures || []);
    } catch (err) {
      console.error(err);
      setError("Unable to load architectures");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchitectures();
  }, []);

  if (selectedArchitectureId !== null) {
    return (
      <StudentArchitectureViewer
        architectureId={selectedArchitectureId}
        onBack={() => setSelectedArchitectureId(null)}
      />
    );
  }

  if (loading) {
    return (
      <div style={{ padding: "30px" }}>
        Loading architectures...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "30px", color: "red" }}>
        <p>{error}</p>
        <button className="tool-button" onClick={fetchArchitectures}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "30px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <h1>Student View</h1>

        <button
          className="tool-button"
          onClick={fetchArchitectures}
        >
          Refresh
        </button>
      </div>

      <h2>Available Architectures</h2>

      {architectures.length === 0 ? (
        <p>
          No saved architectures available. Save an architecture first,
          then click Refresh.
        </p>
      ) : (
        <div>
          {architectures.map((architecture) => {
            const status =
              architecture.status === "published" ||
              architecture.published === true
                ? "Published"
                : "Draft";

            return (
              <div
                key={architecture.id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  padding: "20px",
                  marginBottom: "15px",
                  background: "#fff",
                }}
              >
                <h3>{architecture.name}</h3>

                <p>
                  {architecture.description ||
                    "No description available."}
                </p>

                <p>
                  Status:{" "}
                  <strong
                    style={{
                      color:
                        status === "Published"
                          ? "green"
                          : "#b7791f",
                    }}
                  >
                    {status}
                  </strong>
                </p>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginTop: "15px",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    className="tool-button"
                    onClick={() =>
                      setSelectedArchitectureId(architecture.id)
                    }
                  >
                    View Architecture
                  </button>

                  <button
                    className="tool-button"
                    onClick={() =>
                      onEditArchitecture?.(architecture.id)
                    }
                  >
                    Edit
                  </button>

                  <button
                    className="tool-button"
                    onClick={async () => {
                      const link =
                        `${window.location.origin}/student/architecture/${architecture.id}`;

                      try {
                        await navigator.clipboard.writeText(link);
                        alert("Student link copied successfully.");
                      } catch (err) {
                        console.error(err);
                        window.prompt("Copy this link:", link);
                      }
                    }}
                  >
                    Copy Share Link
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default StudentArchitectures;

