"use client"
import React, { useState } from 'react';
import { X, Send, BookOpen } from 'lucide-react';
import CommitLog from '@/components/commit-log';

interface ChatLogbookProps {
  isOpen: boolean;
  onClose: () => void;
  projectData: any;
  userRole: 'student' | 'teacher';
}

const ChatLogbook = ({ isOpen, onClose, projectData, userRole }: ChatLogbookProps) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  console.log("Current User Role in Logbook:", userRole);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = { role: 'user', content: inputMessage };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/project-progress/chat`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: updatedMessages, projectId: projectData.project_id })
        }
      );

      const data = await response.json();

      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: data.content }
      ]);

    } catch (error) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Error connecting to AI.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl h-[600px] flex flex-col">
        
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center">
            <BookOpen className="w-6 h-6 mr-2" /> 
            <h3 className="text-lg font-semibold">Project Tracker</h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 hover:bg-blue-700 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <CommitLog projectId={projectData.project_id} />
          
          {/* Chat Messages */}
          {messages.map((msg, idx) => (
            msg.content && (
              <div
                key={idx}
                className={`p-3 rounded-lg max-w-[75%] break-words ${
                  msg.role === 'user'
                    ? 'bg-blue-50 ml-auto'
                    : 'bg-gray-100 mr-auto'
                }`}
              >
                <p className="text-sm">{msg.content}</p>
              </div>
            )
          ))}

          {/* Loading Indicator (aligned like assistant) */}
          {isLoading && (
            <div className="bg-gray-100 mr-auto p-3 rounded-lg max-w-[75%]">
              <div className="animate-pulse h-4 w-16 bg-gray-300 rounded" />
            </div>
          )}
        </div>

        {/* Input Area */}
        {userRole === "teacher" && (
          <div className="border-t p-4 flex space-x-2">
            <textarea 
              value={inputMessage} 
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 border rounded-lg p-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type here..."
              rows={1}
            />
            <button 
              onClick={handleSendMessage} 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatLogbook;