import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Bot, User } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { useLanguage } from '../contexts/LanguageContext';

export default function ChatSupport({ isInVenteComptoir = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const { direction, t, language } = useLanguage();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getAIResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    const greetingWords = language === 'ar' ? ['مرحبا', 'السلام', 'أهلا'] : language === 'fr' ? ['bonjour', 'salut', 'bonsoir'] : ['hello', 'hi', 'hey'];
    const helpWords = language === 'ar' ? ['مساعدة', 'مساعدة', 'مساعدة'] : language === 'fr' ? ['aide', 'help', 'assistance'] : ['help', 'assistance', 'support'];

    if (greetingWords.some(word => lowerMessage.includes(word))) {
      return t('chat.greeting');
    } else if (helpWords.some(word => lowerMessage.includes(word))) {
      return t('chat.help');
    } else {
      return t('chat.default');
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        content: getAIResponse(inputValue),
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000);
  };

  if (isInVenteComptoir) return null;

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`fixed ${direction === 'rtl' ? 'left-6' : 'right-6'} bottom-6 w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg flex items-center justify-center transition-all duration-200 z-[9999]`}
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {isOpen && (
        <div className={`fixed ${direction === 'rtl' ? 'left-6' : 'right-6'} bottom-6 w-96 h-[600px] z-[9999] flex flex-col`}>
          <Card className="flex flex-col h-full shadow-2xl border-0">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-blue-600 text-white rounded-t-xl">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                <span className="font-semibold">
                  {t('chat.title')}
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {messages.length === 0 && (
                <div className="text-center text-slate-500 py-8">
                  <Bot className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                  <p>{t('chat.welcomeMessage')}</p>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start gap-2 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${message.sender === 'user' ? 'bg-blue-600' : 'bg-slate-200'
                      }`}>
                      {message.sender === 'user' ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-slate-600" />
                      )}
                    </div>
                    <div className={`rounded-lg p-3 ${message.sender === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-slate-800 border border-slate-200'
                      }`}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-slate-600" />
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-slate-200">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </CardContent>

            <div className="p-4 border-t border-slate-200 bg-white rounded-b-xl">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder={t('chat.placeholder')}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} size="icon">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}

