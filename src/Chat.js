import React, { useState, useEffect } from "react";

function Chat() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [ws, setWs] = useState(null);

  // Establish WebSocket connection when the component mounts
  useEffect(() => {
    // Connect to WebSocket server
    const socket = new WebSocket("ws://localhost:8080/ws");
    setWs(socket);

    // When receiving a message, update the message list
    socket.onmessage = (event) => {
      const newMessage = event.data;
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    };

    // Cleanup the WebSocket connection when the component unmounts
    return () => {
      socket.close();
    };
  }, []);

  // Send a message to the WebSocket server
  const sendMessage = () => {
    if (ws && message) {
      ws.send(message); // Send the message to the server
      setMessage(""); // Clear the input field
    }
  };

  return (
    <div>
      <h3>Chat Room</h3>
      <div>
        {messages.length === 0 ? (
          <p>No messages yet</p>
        ) : (
          messages.map((msg, index) => <div key={index}>{msg}</div>)
        )}
      </div>
      <div>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message"
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default Chat;
