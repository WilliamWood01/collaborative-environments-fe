import React, { useState, useEffect, useRef } from "react";

interface Message {
  id: string;
  user_id: string;
  room_id: string;
  text: string;
  timestamp: string;
  file_id?: string;
  file_name?: string;
  file_type?: string;
}

interface ChatProps {
  userID: string;
}

const Chat: React.FC<ChatProps> = ({ userID }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null); // Add ref for file input

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
  const sendMessage = async () => {
    if (ws.current && (message || file)) {
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          if (ws.current) {
            const fileData = reader.result as ArrayBuffer;
            const fileMessage = {
              user_id: userID,
              room_id: "chat-room-1",
              text: message,
              file_data: Array.from(new Uint8Array(fileData)), // Convert ArrayBuffer to byte array
              file_name: file.name, // Include the original file name
              file_type: file.type, // Include the original file type
            };
            ws.current.send(JSON.stringify(fileMessage));
            setMessage(""); // Clear the message input
            setFile(null); // Clear the file input
            if (fileInputRef.current) {
              fileInputRef.current.value = ""; // Reset the file input element
            }
          }
        };
        reader.readAsArrayBuffer(file);
      } else {
        ws.current.send(
          JSON.stringify({
            user_id: userID,
            room_id: "chat-room-1",
            text: message,
          })
        );
        setMessage(""); // Clear the message input
        setFile(null); // Clear the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = ""; // Reset the file input element
        }
      }
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
                {msg.file_id && (
                  <a
                    href={`http://localhost:8080/files/${
                      msg.file_id
                    }?token=${localStorage.getItem("token")}`} //Not ideal to include token here, should be handled as a header in a real app
                    target="_blank"
                    rel="noopener noreferrer"
                    download={msg.file_name} // Use the original file name for download
                  >
                    {msg.file_name} {/* Display the original file name */}
                  </a>
                )}{" "}
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
        <input
          type="file"
          ref={fileInputRef} // Attach ref to file input
          onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chat;
