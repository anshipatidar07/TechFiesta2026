"use client"
import React, { useState, useRef, useEffect } from 'react';
import { X, Send, BookOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
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
  
  // Refs for auto-expanding textarea and auto-scrolling chat
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Handle auto-expanding textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Reset height
      // Set new height based on scrollHeight, max 150px
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  };

  // Allow 'Enter' to send, 'Shift+Enter' for new line
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = { role: 'user', content: inputMessage.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputMessage('');
    setIsLoading(true);

    // Reset textarea height after sending
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/project-progress/chat`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: updatedMessages, project_id: projectData.project_id })
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
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl h-[80vh] min-h-[600px] flex flex-col">
        
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between shrink-0">
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
        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50">
          <CommitLog projectId={projectData.project_id} />
          
          {/* Chat Messages */}
          {messages.map((msg, idx) => (
            msg.content && (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`p-4 rounded-xl max-w-[85%] sm:max-w-[75%] shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    /* Markdown Renderer for AI Responses */
                    <div className="text-sm leading-relaxed whitespace-pre-wrap markdown-content [&_li>p]:m-0">
                      <ReactMarkdown
                        components={{
                          p: ({node, ...props}) => <p className="mb-3 last:mb-0" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc ml-5 mb-3 space-y-1" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal ml-5 mb-3 space-y-1" {...props} />,
                          li: ({node, ...props}) => <li className="pl-1" {...props} />,
                          strong: ({node, ...props}) => <strong className="font-bold text-gray-900" {...props} />,
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            )
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 p-4 rounded-xl rounded-tl-none shadow-sm flex space-x-2 items-center h-12">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        {userRole === "teacher" && (
          <div className="border-t bg-white p-4 shrink-0 rounded-b-lg">
            <div className="flex items-end space-x-2">
              <textarea 
                ref={textareaRef}
                value={inputMessage} 
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-gray-100 border-transparent rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors min-h-[44px] max-h-[150px] overflow-y-auto"
                placeholder="Ask about project progress..."
                rows={1}
              />
              <button 
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-colors h-[44px] flex items-center justify-center shrink-0"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatLogbook;