import React, { useState, useCallback } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";

function App() {
  const [file, setFile] = useState(null);
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    setFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ".pdf,.csv,.docx,.txt",
    multiple: false,
  });

  const handleQuestionChange = (e) => {
    setQuestion(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !question) {
      setError("Please upload a file and enter a question.");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("question", question);

    try {
      const res = await axios.post(
        "http://localhost:3000/read-file",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      const formattedResponse = formatResponse(res.data.generatedText);
      setResponse(formattedResponse);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatResponse = (text) => {
    // Replace **bold** with <strong>bold</strong>
    let formattedText = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    // Replace * with a new line and then the *
    formattedText = formattedText.replace(/\n?\*(.*?)\n/g, "<br />*$1<br />");

    return formattedText;
  };

  return (
    <div className="min-h-screen bg-[#0e141b] flex flex-col py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full space-y-8 mx-auto">
        <h2 className="text-center text-4xl font-extrabold text-white tracking-tight ">
          ARVIS (Adaptive Retrieval & Insight System)
        </h2>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-lg shadow-sm space-y-4">
            <div className="mb-6">
              <label
                htmlFor="file-upload"
                className="block text-lg font-medium text-gray-400"
              >
                Upload your business data (CSV, TXT, PDF)
              </label>

              <div
                {...getRootProps()}
                className={`transition duration-300 bg-gray-800 p-6 rounded-lg border-2 border-dashed border-gray-600 mt-3 flex items-center justify-center h-40 cursor-pointer hover:bg-gray-700 ${
                  isDragActive ? "border-indigo-500" : ""
                }`}
              >
                <input {...getInputProps()} />
                {!file ? (
                  <div className="text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M16 10l-4-4m0 0l-4 4m4-4v12"
                      />
                    </svg>
                    <p className="text-gray-400 text-sm mt-2">
                      {isDragActive
                        ? "Drop your file here..."
                        : "Drag & drop a file, or click to select one"}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-300">{file.name}</p>
                )}
              </div>
            </div>
            <div>
              <label
                htmlFor="question"
                className="block text-lg font-medium text-gray-400"
              >
                Ask a business-related question:
              </label>
              <input
                id="question"
                name="question"
                type="text"
                value={question}
                onChange={handleQuestionChange}
                className="appearance-none w-full px-4 py-3 border border-gray-700 bg-gray-900 text-gray-300 rounded-lg mt-2 transition duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter your question"
                required
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300"
              disabled={loading}
            >
              {loading ? "Processing..." : "Submit"}
            </button>
          </div>
        </form>

        {response && (
          <div
            className="mt-8 p-6 bg-gray-800 text-gray-100 shadow-lg rounded-lg transition-all duration-300"
            dangerouslySetInnerHTML={{ __html: response }} // Render formatted HTML
          />
        )}

        {error && (
          <div className="mt-8 p-4 bg-red-600 text-white shadow-lg rounded-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
