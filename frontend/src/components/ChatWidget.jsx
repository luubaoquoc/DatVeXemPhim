import { useState } from "react";
import ChatWindow from "./ChatWindow";
import chatIcon from "../assets/chatBox.jpg";

const ChatWidget = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Chat window */}
      {open && <ChatWindow onClose={() => setOpen(false)} />}

      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50
                   bg-primary-dull hover:bg-primary cursor-pointer
                   text-white rounded-full shadow-lg"
      >
        <img src={chatIcon} alt="Chat Icon" className="w-16 h-16 rounded-full" title="chat box" />
      </button>
    </>
  );
};

export default ChatWidget;
