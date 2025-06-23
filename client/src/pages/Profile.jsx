import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const Profile = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [interactions, setInteractions] = useState([]);

  console.log(interactions);

  useEffect(() => {
    fetch(`http://localhost:7000/api/interactions/${user.id}`)
      .then((res) => res.json())
      .then((data) => setInteractions(data))
      .catch((err) => console.error("Error fetching interactions", err));
  }, [user._id]);

  const generateProfileImage = (username) => {
    const initials = username
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase())
      .join("");
    const bgColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
    return { initials, bgColor };
  };

  const { initials, bgColor } = generateProfileImage(user.username);

  return (
    <div className="container">
      <div className="row justify-content-center align-items-start vh-100">
        <div className="col-md-6 p-5 bg-light rounded-3 shadow mt-5">
          <div className="text-center mb-4">
            <div
              className="rounded-circle d-flex justify-content-center align-items-center mb-3"
              style={{
                width: "100px",
                height: "100px",
                backgroundColor: bgColor,
                color: "#fff",
                fontSize: "36px",
              }}
            >
              {initials}
            </div>
            <h2 className="fw-bold">{user.username}</h2>
            <p className="text-muted">{user.email}</p>
            <p className="text-muted">Phone: {user.phone}</p>
            <p className="text-muted">Role: {user.role}</p>
          </div>

          <hr />

          {user.role === "user" && (
            <>
              <h4 className="mt-4 mb-3 text-primary">🧠 Your Interactions</h4>
              {interactions.length === 0 ? (
                <p>No interactions yet.</p>
              ) : (
                interactions.map((item, index) => (
                  <div key={index} className="border rounded p-3 mb-3 bg-white">
                    <p className="mb-1">
                      <strong>Q:</strong> {item.question}
                    </p>
                    <p className="mb-0">
                      <strong>A:</strong> {item.answer}
                    </p>
                    <small className="text-muted">
                      {new Date(item.createdAt).toLocaleString()}
                    </small>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
