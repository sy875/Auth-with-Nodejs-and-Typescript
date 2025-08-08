import React, { useState, useEffect } from "react";

const App = () => {
  const [user, setUser] = useState(null);

  // Fetch current user from backend (after OAuth redirect)
  useEffect(() => {
    fetch("http://localhost:3000/api/v1/auth/current-user", {
      credentials: "include", // important for cookies/sessions
    })
      .then(res => res.json())
      .then(data => {
        if (data?.user) setUser(data.user);
      })
      .catch(err => console.error(err));
  }, []);

  const loginWithGoogle = () => {
    window.open("http://localhost:3000/api/v1/auth/google", "_self");
  };

  const loginWithGithub = () => {
    window.open("http://localhost:3000/api/v1/auth/github", "_self");
  };

  const logout = () => {
    fetch("http://localhost:3000/api/v1/auth/logout", {
      method: "POST",
      credentials: "include",
    }).then(() => setUser(null));
  };

  return (
    <div style={{ fontFamily: "sans-serif", textAlign: "center", marginTop: "50px" }}>
      {!user ? (
        <>
          <h1>Login</h1>
          <button onClick={loginWithGoogle} style={btnStyle}>Login with Google</button>
          <br /><br />
          <button onClick={loginWithGithub} style={btnStyle}>Login with GitHub</button>
        </>
      ) : (
        <>
          <h1>Welcome, {user.name}</h1>
          <img
            src={user.avatar || user.picture}
            alt="profile"
            style={{ borderRadius: "50%", width: "80px", height: "80px" }}
          />
          <p>Email: {user.email}</p>
          <button onClick={logout} style={btnStyle}>Logout</button>
        </>
      )}
    </div>
  );
};

const btnStyle = {
  padding: "10px 20px",
  fontSize: "16px",
  cursor: "pointer",
  backgroundColor: "#4285F4",
  color: "white",
  border: "none",
  borderRadius: "5px",
};

export default App;
