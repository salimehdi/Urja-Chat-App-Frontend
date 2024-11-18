import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { Search, UserRound, Send, MessageCircle } from "lucide-react";
import "../output.css";
import "../index.css";

const socket = io("https://urja-chat-app-backend-1v9fh2oub-salimehdis-projects.vercel.app", {
  withCredentials: true,
});

export default function ChatApp() {
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const selectedRef = useRef<HTMLDivElement | null>(null);
  const [id, setId] = useState("");
  const [userDetails, setUserDetails] = useState<any>(null);
  const [sender, setSender] = useState(false);

  const [contacts, setContacts] = useState([]);
  const [messages, setMessages] = useState<any>([]);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [messageContent, setMessageContent] = useState("");
  const [thisChatCode, setThisChatCode] = useState("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredContacts = contacts?.filter((contact: any) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function a() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const day = now.getDate().toString().padStart(2, "0");
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const year = now.getFullYear();
    return `${hours}:${minutes} | ${day}-${month}-${year}`;
  }

  useEffect(() => {
    const check = async()=>{
      try {
        const response = await fetch('https://urja-chat-app-backend-1v9fh2oub-salimehdis-projects.vercel.app/api/isloggedin', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        })
        const data = await response.json();
        if(!data.isLoggedIn) navigate('/login');
        if (!response.ok) {
          throw new Error(data.message || 'Failed to login');
        }
      } catch (error: any) {
        console.log(error.message);
    }}
    check();
  },[]);

  useEffect(() => {
    if (userDetails && selectedContact) {
      const temp = userDetails?.chats.filter(
        (chat: any) => chat.receiver === selectedContact._id
      )[0];
      setThisChatCode(temp?.chatCode);
    }
  }, [selectedContact, userDetails]);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const { data, userDetails } = await fetch(
          "https://urja-chat-app-backend-1v9fh2oub-salimehdis-projects.vercel.app/api/chats/all",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        ).then((res) => res.json());
        setUserDetails(userDetails[0] !== null ? userDetails[0] : null);
        setId(userDetails[0]._id);
        socket.emit("fromId", userDetails[0]._id, socket.id);
        socket.emit("goOnline", userDetails[0]._id);
        data.forEach((chat: any) => {
          chat.notify = false;
          chat.typing = false;
        });
        setContacts(data);
      } catch (error: any) {
        console.error("Error fetching contacts:", error.message);
      }
    };
    fetchContacts();
  }, []);

  useEffect(() => {
    socket.on("someOneGotOffline", (fromId) => {
      setContacts((prev) => {
        prev.forEach((chat: any) => {
          if (chat._id === fromId) {
            chat.isOnline = false;
          }
        });
        return [...prev];
      });
    });
    return () => {
      socket.off("someOneGotOffline");
    };
  }, []);

  useEffect(() => {
    socket.on("someOneCameOnline", (fromId) => {
      setContacts((prev) => {
        prev.forEach((chat: any) => {
          if (chat._id === fromId) {
            chat.isOnline = true;
          }
        });
        return [...prev];
      });
    });
    return () => {
      socket.off("someOneCameOnline");
    };
  }, []);

  useEffect(() => {
    socket.on("emitTyping", (fromId) => {
      setContacts((prev) => {
        prev.forEach((chat: any) => {
          if (chat._id === fromId) {
            chat.typing = true;
          }
        });
        return [...prev];
      });
    });
    return () => {
      socket.off("emitTyping");
    };
  }, []);

  useEffect(() => {
    socket.on("emitTypingStop", (fromId) => {
      setContacts((prev) => {
        prev.forEach((chat: any) => {
          if (chat._id === fromId) {
            chat.typing = false;
          }
        });
        return [...prev];
      });
    });
    return () => {
      socket.off("emitTypingStop");
    };
  }, []);

  const [addMessage, setAddMessage] = useState<any>(null);
  useEffect(() => {
    if (addMessage) {
      if (addMessage.chatCode === thisChatCode) {
        setMessages((prev: any) => [
          ...prev,
          { sender: "No", text: addMessage.message, time: a() },
        ]);
      } else {
        setContacts((prev) => {
          prev.forEach((chat: any) => {
            if (chat._id === addMessage.fromId) {
              chat.notify = true;
            }
          });
          return [...prev];
        });
      }
    }
  }, [addMessage]);
  useEffect(() => {
    socket.on("newMessage", (data) => {
      setAddMessage(data);
      if (data.temp === selectedContact.name) {
        console.log("Message received", {
          sender: sender,
          text: data.message,
          time: "idk",
        });
        setMessages((prev: any) => [
          ...prev,
          { sender: "No", text: data.message, time: a() },
        ]);
      } else {
        setContacts((prev) => {
          prev.forEach((chat: any) => {
            if (chat._id === data.fromId) {
              chat.notify = true;
            }
          });
          return [...prev];
        });
      }
    });

    return () => {
      socket.off("newMessage");
    };
  }, []);

  useEffect(() => {
    setMessages(() => []);
    if (selectedContact) {
      const fetchMessages = async () => {
        try {
          console.log(userDetails);
          const thisChatCode = userDetails.chats.filter(
            (chat: any) => chat.receiver === selectedContact._id
          )[0];
          console.log(thisChatCode);
          if (!thisChatCode) {
            console.log("Chat not found");
            return;
          }
          const response = await fetch(
            `https://urja-chat-app-backend-1v9fh2oub-salimehdis-projects.vercel.app/api/messages/${thisChatCode.chatCode}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
            }
          ).then((res) => res.json());
          console.log(response);
          if (response.first === userDetails._id) setSender(true);
          else setSender(false);
          setMessages(response.messages);
        } catch (error: any) {
          console.error("Error fetching messages:", error.message);
        }
      };
      fetchMessages();
    }
  }, [selectedContact]);

  const handleSendMessage = async (message: any) => {
    if (!messageContent.trim()) return;
    if (message == 0)
      socket.emit("startChat", id, selectedContact._id, messageContent);
    else {
      const thisChatCode = userDetails.chats.filter(
        (chat: any) => chat.receiver === selectedContact._id
      )[0];
      socket.emit(
        "sendMessage",
        id,
        thisChatCode.chatCode,
        selectedContact._id,
        messageContent
      );
    }
    setMessages((prev: any) => [
      ...prev,
      { sender: sender, text: messageContent, time: a() },
    ]);
    setMessageContent("");
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "instant" });
    }
  }, [messages]);

  useEffect(() => {
    if (selectedRef.current) {
      selectedRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedContact]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      try {
        socket.emit("fromIdClose", id);
        socket.emit("goOffline", id);
      } catch (error) {
        console.error("Error during beforeunload event:", error);
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [id]);

  const typingTimeoutRef = useRef<number | null>(null); 

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Typing event emitted');
    socket.emit('typing', id, selectedContact._id);
    setMessageContent(e.target.value);
    if (typingTimeoutRef.current !== null) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = window.setTimeout(() => {
      socket.emit('typingStop', id, selectedContact._id);
    }, 1000) as unknown as number; 
  };

  return (
    <div className="flex flex-col h-screen bg-gray-800 text-gray-100">
      <nav className="bg-blue-950 bg-opacity-50 shadow-md p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="text-xl font-bold text-blue-300">Urja Chat App</div>
          <div>
          <button
            onClick={() => navigate("/signup")}
            className="text-blue-300 mr-5 border-blue-300 hover:bg-blue-300 hover:text-gray-900 border rounded-lg py-1 px-4 transition-all duration-300"
          >
            Sign Up
          </button>
          <button
            onClick={() => navigate("/login")}
            className="text-blue-300 border-blue-300 hover:bg-blue-300 hover:text-gray-900 border rounded-lg py-1 px-4 transition-all duration-300"
          >
            Log in
          </button>
          </div>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* Contacts Section */}
        <div className="w-1/3 bg-gray-800 border-r border-gray-700 overflow-y-scroll">
          <div className="p-4">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                }}
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-700 border-gray-600 text-gray-100 focus:outline-none"
              />
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
            </div>
          </div>
          <div className="overflow-y-auto h-auto">
            {filteredContacts?.map((contact: any) => (
              <div
                key={contact._id}
                onClick={() => {
                  setContacts((prev) => {
                    prev.forEach((chat: any) => {
                      if (chat._id === contact._id) {
                        chat.notify = false;
                      }
                    });
                    return [...prev];
                  });
                  setSelectedContact(contact);
                }}
                ref={selectedContact?._id === contact._id ? selectedRef: null}
                className={`p-4 mb-4 rounded-lg mx-4 ${
                  selectedContact?._id === contact._id
                    ? "bg-gray-600"
                    : "bg-gray-700"
                } hover:bg-blue-950 transition-colors cursor-pointer`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-12 w-12 border-2 flex justify-center items-center text-blue-500 border-blue-500 rounded-full relative">
                      <UserRound />
                      {contact.notify &&
                      selectedContact?._id !== contact._id ? (
                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-yellow-900 flex justify-center items-center text-white text-xs">
                          <MessageCircle />
                        </span>
                      ) : null}
                    </div>
                    <div className="ml-3">
                      <h3 className="font-semibold">{contact.name}</h3>
                    </div>
                    {
                      contact.typing && (
                        <div className="ml-2">
                          <p className="text-xs text-gray-400">Typing...</p>
                        </div>
                      )
                    }
                  </div>
                  <div
                    className={`w-3 h-3 rounded-full ${
                      contact.isOnline ? "bg-blue-500" : "bg-gray-500"
                    }`}
                  ></div>
                </div>
              </div>
            ))}
            
          </div>
        </div>

        {/* Messages Section */}
        <div className="flex-1 flex flex-col bg-gray-900">
          {selectedContact ? (
            <>
              <div className="bg-gray-800 shadow-md p-4 flex items-center">
                <div className="h-12 w-12 border-2 flex justify-center items-center text-blue-500 border-blue-500 rounded-full">
                  <UserRound />
                </div>
                {
                      selectedContact.typing && (
                        <div className="ml-2">
                          <p className="text-xs text-gray-400">Typing...</p>
                        </div>
                      )
                    }
                <div className="ml-4">
                  <h2 className="font-semibold text-gray-100">
                    Chat with {selectedContact.name}
                  </h2>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message: any, index: any) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.sender === !sender || message.sender === "No"
                        ? "justify-start"
                        : "justify-end"
                    }`}
                  >
                    <div
                      className={`max-w-xs ${
                        message.sender === !sender || message.sender === "No"
                          ? "bg-gray-700"
                          : "bg-blue-600"
                      } rounded-lg p-3`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p className="text-xs text-right mt-1 opacity-70">
                        {message.time}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} className="p-2 w-2 h-2 " />
              </div>
              <div className="bg-gray-800 p-4 flex items-center space-x-2">
                <input
                  type="text"
                  value={messageContent}
                  onChange={(e) => handleInputChange(e)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && handleSendMessage(messages.length)
                  }
                  placeholder="Type your message..."
                  className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-700 border-gray-600 text-gray-100 focus:outline-none"
                />
                <button
                  onClick={() => handleSendMessage(messages.length)}
                  className="hover:text-blue-200 text-white"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Select a contact to start chatting
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
