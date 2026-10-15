const API_BASE_URL = "http://127.0.0.1:8000";

export async function createArchitecture(data) {
  const response = await fetch(
    `${API_BASE_URL}/api/architectures`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.detail || "Failed to create architecture"
    );
  }

  return response.json();
}

export async function getArchitecture(id) {
  const response = await fetch(
    `${API_BASE_URL}/api/architectures/${id}`
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.detail || "Failed to get architecture"
    );
  }

  return response.json();
}