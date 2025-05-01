import React from "react";
import "../styles/NumberItem.css";

const NumberItem = ({ number, isCollected, onToggle }) => {
  return (
    <button
      className={`number-item ${isCollected ? "collected" : ""}`}
      onClick={onToggle}
    >
      {isCollected && (
        <span className="check-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </span>
      )}
      <span className="number-text">{number}</span>
    </button>
  );
};

export default NumberItem;
