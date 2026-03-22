import React, { useEffect, useState } from "react";

const typeStyles = {
  success: {
    bg: "#d4edda",
    color: "#155724",
    border: "#c3e6cb",
  },
  error: {
    bg: "#f8d7da",
    color: "#721c24",
    border: "#f5c6cb",
  },
  warning: {
    bg: "#fff3cd",
    color: "#856404",
    border: "#ffeeba",
  },
  info: {
    bg: "#d1ecf1",
    color: "#0c5460",
    border: "#bee5eb",
  },
};

const Snackbar = ({
  type = "info",
  message = "",
  duration = 3000,
  onClose,
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setVisible(false);
    if (onClose) onClose();
  };

  if (!visible) return null;

  const style = typeStyles[type] || typeStyles.info;

  return (
    <div style={{ ...styles.container, backgroundColor: style.bg, borderColor: style.border }}>
      <span style={{ ...styles.message, color: style.color }}>
        {message}
      </span>
      <button style={styles.closeBtn} onClick={handleClose}>
        ✕
      </button>
    </div>
  );
};

const styles = {
  container: {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    minWidth: "250px",
    maxWidth: "400px",
    padding: "12px 16px",
    border: "1px solid",
    borderRadius: "6px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    zIndex: 9999,
    animation: "slideIn 0.3s ease",
  },
  message: {
    fontSize: "14px",
    marginRight: "10px",
    flex: 1,
  },
  closeBtn: {
    border: "none",
    background: "transparent",
    fontSize: "16px",
    cursor: "pointer",
  },
};

export default Snackbar;