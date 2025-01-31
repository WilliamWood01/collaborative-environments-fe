import React, { useState, useEffect, useRef } from "react";

interface Message {
  text: string;
  timestamp: string;
}

function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState<string>("");
  const ws = useRef<WebSocket | null>(null);

  // Establish WebSocket connection when the component mounts
  useEffect(() => {
    if (ws.current) return; // If WebSocket already exists, do nothing

    // Connect to WebSocket server
    console.log("Connecting to WebSocket server");
    const socket = new WebSocket("ws://localhost:8080/ws");

    socket.onopen = () => {
      console.log("Connected to WebSocket server");
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.current = socket;

    // When receiving a message, update the message list
    socket.onmessage = (event) => {
      console.log(event.data);
      try {
        const newMessage: Message = JSON.parse(event.data);
        console.log("Received message:", newMessage);
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    };

    // Cleanup the WebSocket connection when the component unmounts
    return () => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.close();
      }
    };
  }, []);

  // Send a message to the WebSocket server
  const sendMessage = () => {
    if (ws.current && message) {
      ws.current.send(message); // Send the message to the server
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
          messages.map((msg, index) => (
            <div key={index}>
              <p>{msg.text}</p>
              <small>{msg.timestamp}</small>
            </div>
          ))
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
