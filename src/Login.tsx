import React, { useState } from "react";

interface LoginProps {
  onLogin: (userID: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [userID, setUserID] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isSignUp, setIsSignUp] = useState<boolean>(false);

  // Calls the BE endpoint to login a user
  const handleLogin = async () => {
    if (userID && password) {
      try {
        const response = await fetch("http://localhost:8080/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_id: userID, password: password }),
        });

        if (response.ok) {
          onLogin(userID);
        } else {
          const errorData = await response.text();
          if (errorData === "User not found") {
            alert(
              "User does not exist. Please check your username or sign up."
            );
          } else if (errorData === "Invalid password") {
            alert("Incorrect password. Please try again.");
          } else {
            alert(`Login failed: ${errorData}`);
          }
        }
      } catch (error: any) {
        alert(`Login failed: ${error.message}`);
      }
    } else {
      alert("Please enter both username and password");
    }
  };

  // Calls the BE endpoint to sign up a new user and save them to the MongoDB database
  const handleSignUp = async () => {
    if (userID && password) {
      try {
        const response = await fetch("http://localhost:8080/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_id: userID, password: password }),
        });

        if (response.ok) {
          alert("Sign-up successful, please log in");
          setIsSignUp(false);
        } else {
          const errorData = await response.json();
          alert(`Sign-up failed: ${errorData.message}`);
        }
      } catch (error: any) {
        alert(`Sign-up failed: ${error.message}`);
      }
    } else {
      alert("Please enter both username and password");
    }
  };

  return (
    <div>
      <h3>{isSignUp ? "Sign Up" : "Login"}</h3>
      <input
        type="text"
        value={userID}
        onChange={(e) => setUserID(e.target.value)}
        placeholder="Enter your username"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter your password"
      />
      {isSignUp ? (
        <button onClick={handleSignUp}>Sign Up</button>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
      <button onClick={() => setIsSignUp(!isSignUp)}>
        {isSignUp
          ? "Already have an account? Login"
          : "Don't have an account? Sign Up"}
      </button>
    </div>
  );
};

export default Login;
