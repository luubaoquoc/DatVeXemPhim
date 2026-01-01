import { useState } from "react";
import ChatWindow from "./ChatWindow";
import { MessageCircle } from "lucide-react";

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
                   text-white p-4 rounded-full shadow-lg"
      >
        <MessageCircle size={24} />
      </button>
    </>
  );
};

export default ChatWidget;
