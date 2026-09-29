const BASE_URL = "http://localhost:8000";


export async function askQuestion(question, history = []) {
  const response = await fetch(
    `${BASE_URL}/ask`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        question,
        history,
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();

    throw new Error(
      errorData.detail ||
      `Backend error: ${response.status}`
    );
  }

  return response.json();
}


export async function uploadPdf(file) {
  const formData = new FormData();

  formData.append(
    "file",
    file
  );

  const response = await fetch(
    `${BASE_URL}/upload-pdf`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const errorData = await response.json();

    throw new Error(
      errorData.detail ||
      "PDF upload failed"
    );
  }

  return response.json();
}


export async function generateQuiz(
  topic = "",
  count = 5
) {
  const response = await fetch(
    `${BASE_URL}/quiz`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        topic,
        count,
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();

    throw new Error(
      errorData.detail ||
      "Quiz generation failed"
    );
  }

  return response.json();
}


export async function generateFlashcards(
  topic = "",
  count = 8
) {
  const response = await fetch(
    `${BASE_URL}/flashcards`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        topic,
        count,
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();

    throw new Error(
      errorData.detail ||
      "Flashcard generation failed"
    );
  }

  return response.json();
}