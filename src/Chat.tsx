import React, { useState, useEffect, useRef } from "react";

interface Message {
  id: string;
  user_id: string;
  room_id: string;
  text: string;
  timestamp: string;
}

interface ChatProps {
  userID: string;
}

const Chat: React.FC<ChatProps> = ({ userID }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState<string>("");
  const ws = useRef<WebSocket | null>(null);

  // Establish WebSocket connection when the component mounts
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("No token found, please log in");
      return;
    }
    if (ws.current) return; // If WebSocket already exists, do nothing

    // Connect to WebSocket server
    console.log("Connecting to WebSocket server");
    const socket = new WebSocket(`ws://localhost:8080/ws?token=${token}`);

    socket.onopen = () => {
      console.log("Connected to WebSocket server");
    };

    socket.onclose = () => {
      console.log("Disconnected from WebSocket server");
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
      ws.current.send(
        JSON.stringify({
          user_id: userID,
          room_id: "chat-room-1",
          text: message,
        })
      ); // Send the message to the server
      setMessage(""); // Clear the input field
    }
  };

  // Format timestamp to show date and time in hours and minutes
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div>
      <h3>Chat Room</h3>
      <div>
        {messages.length === 0 ? (
          <p>No messages yet</p>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              style={{ display: "flex", justifyContent: "space-between" }}
            >
              <p>
                <strong>{msg.user_id}:</strong> {msg.text}{" "}
                <small>{formatTimestamp(msg.timestamp)}</small>
              </p>
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
};

export default Chat;
