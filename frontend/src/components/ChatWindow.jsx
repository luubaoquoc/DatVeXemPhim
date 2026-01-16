import { useState } from "react";
import { Send, X } from "lucide-react";

const ChatWindow = ({ onClose }) => {
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: " Xin chào! Bạn muốn hỏi phim hay suất chiếu nào?"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/ai/chatbot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input })
      });

      const data = await res.json();

      setMessages(prev => [
        ...prev,
        { role: "bot", text: data.reply }
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        { role: "bot", text: " Lỗi kết nối AI" }
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="fixed bottom-24 right-6 z-50 w-80 h-[420px] bg-black/80 rounded-xl shadow-2xl
    flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="bg-primary-dull text-white px-4 py-3 flex justify-between">
        <span> Chatbot GoCinema</span>
        <button onClick={onClose} className="hover:bg-primary p-1 rounded-full cursor-pointer">
          <X size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2 text-sm">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[80%] px-3 py-2 rounded-lg
              ${m.role === "user"
                ? "bg-primary-dull text-white ml-auto"
                : "bg-gray-200 text-black"
              }`}
          >
            {m.text}
          </div>
        ))}

        {loading && (
          <div className="bg-gray-200 px-3 py-2 rounded-lg w-fit text-black">
            Đang trả lời...
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-2 border-t flex gap-2">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
          placeholder="Nhập câu hỏi..."
          className="flex-1 border-b rounded-lg px-3 py-1 text-sm text-white outline-none"
        />
        <button
          onClick={sendMessage}
          className="bg-primary-dull text-white px-3 rounded-lg cursor-pointer"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
