'use client';

import React, { useState } from 'react';
import { MessageSquare, Send, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const AIStudioIframe: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
    
      role: 'assistant',
      content: 'Ciao! Sono il Consulente IA specializzato in turni, Permessi e Regolamenti Marina Militare. Come posso aiutarti?',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const generateAIResponse = async (userInput: string): Promise<string> => {
    try {
      const response = await fetch('/api/groq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userInput,
        }),
      });

      if (!response.ok) {
        return 'Error: Unable to get response from AI';
      }

      const data = await response.json();
      return data.response || 'Error: No response from AI';
    } catch (error) {
      return 'Error: Failed to connect to AI service';
    }
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() === '') return;

    setMessages([...messages, { role: 'user', content: inputValue, timestamp: new Date() }]);
    setInputValue('');
    setIsLoading(true);

    const aiResponse = await generateAIResponse(inputValue);
    setMessages((prev) => [
      ...prev,
      { role: 'assistant', content: aiResponse, timestamp: new Date() },
    ]);
    setIsLoading(false);
  };

  return (
    <div className="flex h-full w-full flex-col rounded-lg border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
        <MessageSquare className="h-5 w-5 text-blue-600" />
        <div>
          <h3 className="font-semibold text-gray-900">AI Consultant</h3>
          <p className="text-sm text-gray-500">Powered by Groq API</p>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-xs rounded-lg px-4 py-2 ${
                  msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white text-gray-900 shadow-sm'
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                <p className={`text-xs mt-1 ${
                  msg.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {msg.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white text-gray-900 shadow-sm rounded-lg px-4 py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask about shifts, permissions, or regulations..."
            disabled={isLoading}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:bg-gray-100"
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIStudioIframe;
