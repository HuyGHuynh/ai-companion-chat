import { Link } from "react-router-dom";

function Navbar({ user, onLogout }) {
  return (
    <nav style={styles.navbar}>
      <h1 style={styles.title}>AI Companion</h1>
      <div>
        {user ? (
          <>
            <span style={styles.user}>Hello, {user.email}</span>
            <button onClick={onLogout} style={styles.button}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.button}>
              Log in
            </Link>
            <Link to="/register" style={styles.button}>
              Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

const styles = {
  navbar: {
    height: "60px",
    padding: "0 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  button: {
    marginRight: "5px",
    padding: "0.75rem",
    fontSize: "1rem",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  title: {
    margin: 0,
    fontSize: "1.5rem",
  },
  user: {
    marginRight: "1rem",
  },
};

export default Navbar;
