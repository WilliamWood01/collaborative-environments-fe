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
        //Send a POST request to the BE endpoint with the user_id and password
        const response = await fetch("http://localhost:8080/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_id: userID, password: password }),
        });

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem("token", data.token);
          onLogin(userID);
        } else {
          // Handle any errors
          const errorData = await response.text();
          if (errorData === "User not found") {
            alert("User does not exist. Please check your UserID or sign up.");
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
      alert("Please enter both UserID and password");
    }
  };

  // Calls the BE endpoint to sign up a new user and save them to the MongoDB database
  const handleSignUp = async () => {
    if (userID && password) {
      try {
        //Send a POST request to the BE endpoint with the user_id and password
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
          const errorData = await response.text();
          if (errorData === "UserID already exists") {
            alert("UserID already exists. Please choose a different username.");
          } else {
            alert(`Sign-up failed: ${errorData}`);
          }
        }
      } catch (error: any) {
        alert(`Sign-up failed: ${error.message}`);
      }
    } else {
      alert("Please enter both UserID and password");
    }
  };

  //Appearance of the login page
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h3 className="card-title text-center">
                {isSignUp ? "Sign Up" : "Login"}
              </h3>
              <div className="form-group">
                <label htmlFor="userID">UserID</label>
                <input
                  type="text"
                  className="form-control"
                  id="userID"
                  value={userID}
                  onChange={(e) => setUserID(e.target.value)}
                  placeholder="Enter your UserID"
                />
              </div>
              <div className="form-group mb-3">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />
              </div>
              {isSignUp ? (
                <button
                  className="btn btn-primary btn-block"
                  onClick={handleSignUp}
                >
                  Sign Up
                </button>
              ) : (
                <button
                  className="btn btn-primary btn-block"
                  onClick={handleLogin}
                >
                  Login
                </button>
              )}
              <button
                className="btn btn-link btn-block"
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp
                  ? "Already have an account? Login"
                  : "Don't have an account? Sign Up"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
