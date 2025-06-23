import React, { useEffect, useRef, useState } from "react";
import * as cam from "@mediapipe/camera_utils";
import { FaceMesh, FACEMESH_LIPS } from "@mediapipe/face_mesh";
import * as drawingUtils from "@mediapipe/drawing_utils";
import "bootstrap/dist/css/bootstrap.min.css";

const LipSync = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSmiling, setIsSmiling] = useState(false);
  const [text, setText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [answer, setAnswer] = useState("");
  const [user, setuser] = useState(JSON.parse(localStorage.getItem("user")));

  let camera = null;
  let initialSmileWidth = null; // For smile reference

  const startListening = () => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      alert("Your browser does not support speech recognition.");
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event) => console.error("Speech error:", event);

    let debounceTimer;

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join(" ");
      setText(transcript);

      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        askFromCohere(transcript);
      }, 1500); // 1.5s delay to trigger AI after speaking stops
    };

    recognition.start();
  };

  useEffect(() => {
    startListening();
    const faceMesh = new FaceMesh({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    faceMesh.onResults(onResults);

    if (videoRef.current) {
      camera = new cam.Camera(videoRef.current, {
        onFrame: async () => {
          await faceMesh.send({ image: videoRef.current });
        },
        width: 640,
        height: 480,
      });
      camera.start();
    }
  }, []);

  const calculateDistance = (point1, point2) => {
    return Math.sqrt(
      Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2)
    );
  };

  const askFromCohere = async (questionText) => {
    try {
      const response = await fetch("http://localhost:7000/api/answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          context:
            "This is a sample context. Replace it with relevant content.",
          question: questionText,
        }),
      });

      const data = await response.json();
      setAnswer(data.answer);

      // Save to interaction DB
      await fetch("http://localhost:7000/api/interactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id, // replace this dynamically as needed
          question: questionText,
          answer: data.answer,
        }),
      });
    } catch (error) {
      console.error("Error fetching answer:", error);
      setAnswer("Error getting answer from AI.");
    }
  };

  const Refresh = () => {
    window.location.reload();
  };
  const onResults = (results) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const canvasCtx = canvas.getContext("2d");
    if (!canvasCtx) return;

    const video = videoRef.current;
    if (video) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

    if (results.multiFaceLandmarks) {
      for (const landmarks of results.multiFaceLandmarks) {
        drawingUtils.drawConnectors(canvasCtx, landmarks, FACEMESH_LIPS, {
          color: "#FF6347",
          lineWidth: 2,
        });

        const upperLip = landmarks[13];
        const lowerLip = landmarks[14];
        const leftLip = landmarks[61];
        const rightLip = landmarks[291];

        const mouthOpen = Math.abs(upperLip.y - lowerLip.y);
        const smileWidth = calculateDistance(leftLip, rightLip);

        // Detect speaking
        setIsSpeaking(mouthOpen > 0.03);

        // Initialize smile width reference
        if (!initialSmileWidth) {
          initialSmileWidth = smileWidth;
        }

        // Detect smile
        setIsSmiling(smileWidth > initialSmileWidth * 1.2); // 10% increase for smile
      }
    }
  };

  return (
    <div className="container-fluid bg-light d-flex align-items-center justify-content-center min-vh-100">
      <div className="row w-100">
        {/* Left Side: Video & Canvas */}
        <div className="col-lg-7 col-md-12 d-flex justify-content-center align-items-center mb-4 mb-lg-0">
          <div
            className="position-relative border border-secondary rounded-4 shadow-lg"
            style={{ width: "640px", height: "480px" }}
          >
            <video
              ref={videoRef}
              className="position-absolute w-100 h-100 rounded-4"
              autoPlay
              playsInline
              muted
              style={{ zIndex: 1 }}
            />
            <canvas
              ref={canvasRef}
              className="position-absolute w-100 h-100 rounded-4"
              style={{ zIndex: 2, pointerEvents: "none" }}
            />
          </div>
        </div>

        {/* Right Side: Details */}
        <div className="col-lg-5 col-md-12 d-flex flex-column justify-content-center align-items-center">
          <h1 className="text-primary fw-bold mb-4 animate__animated animate__fadeInDown">
            🎥 Lip Sync & Smile Detection
          </h1>

          {/* Status Indicators */}
          <div className="d-flex flex-column gap-3 w-75 mb-4">
            <div
              className={`p-3 rounded text-white fw-bold shadow-lg text-center ${
                isSpeaking
                  ? "bg-danger animate__animated animate__pulse animate__infinite"
                  : "bg-secondary"
              }`}
            >
              {isSpeaking ? "Speaking... 🎤" : "Silent 🤐"}
            </div>

            <div
              className={`p-3 rounded text-white fw-bold shadow-lg text-center ${
                isSmiling
                  ? "bg-success animate__animated animate__bounce animate__infinite"
                  : "bg-secondary"
              }`}
            >
              {isSmiling ? "Smiling 😊" : "Neutral 😐"}
            </div>
          </div>

          {/* Speech to Text Display */}
          <div className="card w-75 shadow-lg mb-4">
            <div className="card-body text-center">
              <h5 className="card-title fw-bold">🎙️ Speech to Text</h5>
              <p className="card-text border p-3 rounded bg-light">
                {text || "Say something..."}
              </p>
            </div>
          </div>

          {/* AI Answer Display */}
          <div className="card w-75 shadow-lg mb-4">
            <div className="card-body text-center">
              <h5 className="card-title fw-bold">🤖 AI Answer</h5>
              <p className="card-text border p-3 rounded bg-light">
                {answer || "Waiting for your question..."}
              </p>
            </div>
          </div>

          {/* Start/Stop Listening Button */}
          <div className="buttons">
            <button
              onClick={startListening}
              style={{ marginRight: "10px" }}
              className={`btn btn-lg text-white ${
                isListening
                  ? "bg-danger shadow-lg animate__animated animate__pulse animate__infinite"
                  : "bg-primary shadow"
              }`}
            >
              {isListening ? "Listening... 🕵️" : "Start Listening 🎧"}
            </button>
            <button
              className="btn btn-lg text-white bg-secondary shadow-lg "
              onClick={Refresh}
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LipSync;
