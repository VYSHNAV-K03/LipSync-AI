import React, { useEffect } from "react";
import axios from "axios";
import backgroundImage from "../assets/img.jpg";

const Home = () => {
  useEffect(() => {
    const checkServer = async () => {
      try {
        const response = await axios.get("http://localhost:7000");
        console.log(response.data); // Server response
      } catch (error) {
        console.error("Error connecting to server:", error);
      }
    };

    checkServer();
  }, []);

  return (
    <div
      className="d-flex justify-content-center align-items-center text-center vh-100 position-relative"
      style={{
        backgroundImage: `url("${backgroundImage}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        color: "white",
      }}
    >
      {/* Overlay for better text visibility */}
      <div
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
      ></div>

      {/* Main content */}
      <div className="position-relative z-1 animate__animated animate__fadeInDown">
        <h1 className="display-3 fw-bold mb-3">LIP SYNC AI</h1>
        <p className="lead px-4">
          Bringing your voice to life — synchronize your speech with video using
          cutting-edge AI lip sync technology.
        </p>
        <a
          href="/login"
          className="btn btn-outline-light mt-4 px-4 py-2 fw-semibold animate__animated animate__fadeInUp animate__delay-1s"
        >
          Try it Now
        </a>
      </div>
    </div>
  );
};

export default Home;
