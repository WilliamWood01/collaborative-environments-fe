import React, { useState } from "react";
import Login from "./Login";
import Chat from "./Chat";

const App: React.FC = () => {
  const [userID, setUserID] = useState<string | null>(null);

  const handleLogin = (userID: string) => {
    setUserID(userID);
  };

  return (
    <div>
      {userID ? <Chat userID={userID} /> : <Login onLogin={handleLogin} />}
    </div>
  );
};

export default App;
