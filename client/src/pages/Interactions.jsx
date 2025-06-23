import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const Interactions = () => {
  const [interactionsByUser, setInteractionsByUser] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInteractions = async () => {
      try {
        const res = await axios.get("http://localhost:7000/api/interactions"); // Adjust endpoint if needed
        const grouped = {};

        console.log(res.data);

        res.data.forEach((interaction) => {
          const userId = interaction.userId._id || interaction.userId;
          const username = interaction.userId.username || "Unknown User";

          if (!grouped[userId]) {
            grouped[userId] = {
              username,
              interactions: [],
            };
          }

          grouped[userId].interactions.push(interaction);
        });

        setInteractionsByUser(grouped);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching interactions:", error);
        setLoading(false);
      }
    };

    fetchInteractions();
  }, []);

  if (loading)
    return <div className="text-center mt-5">Loading interactions...</div>;

  return (
    <div className="container py-5">
      <h2 className="text-center mb-4">User Interactions</h2>
      {Object.entries(interactionsByUser).map(([userId, userData]) => (
        <div className="card mb-4 shadow-sm" key={userId}>
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">{userData.username}</h5>
          </div>
          <ul className="list-group list-group-flush">
            {userData.interactions.map((interaction, index) => (
              <li className="list-group-item" key={index}>
                <p className="mb-1">
                  <strong>Q:</strong> {interaction.question}
                </p>
                <p className="mb-0">
                  <strong>A:</strong> {interaction.answer}
                </p>
                <small className="text-muted">
                  {new Date(interaction.createdAt).toLocaleString()}
                </small>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default Interactions;
