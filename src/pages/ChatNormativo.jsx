import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  FileText, 
  Search, 
  BookOpen, 
  ShieldCheck,
  MessageSquare,
  Sparkles,
  Info,
  ShieldAlert,
  Headphones,
  ExternalLink
} from 'lucide-react';
import { normativaBase } from '../data/normativaBase';

const ChatNormativo = () => {
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: "¡Hola! Soy tu asistente normativo IMSS. Puedo ayudarte con dudas sobre el manual de operación de guarderías, lineamientos de salud o protocolos de seguridad. ¿En qué puedo apoyarte hoy?", 
      sender: 'bot',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const generateResponse = (query) => {
    const q = query.toLowerCase();
    const words = q.split(/\s+/).filter(w => w.length > 0);
    
    // 1. Manejo de consultas incompletas o muy cortas
    if (words.length < 5) {
      return {
        text: "Tu consulta parece incompleta o demasiado breve. Para ayudarte mejor, por favor selecciona uno de los temas normativos principales o bríndame más detalles sobre lo que necesitas consultar:",
        fuente: null,
        sugerencias: [
          "Seguridad en guarderías",
          "Protocolo de Salud",
          "Guía de Alimentación",
          "Reporte de Maltrato",
          "Horarios de Operación",
          "Cartas Responsivas",
          "Planeación Pedagógica"
        ],
        escalar: false
      };
    }

    // 2. Buscar coincidencia en la base normativa
    const match = normativaBase.find(item => {
      const keywords = item.preguntaClave.split(' ');
      return words.some(word => word.length > 3 && keywords.includes(word));
    });

    if (match) {
      return {
        text: match.respuesta,
        fuente: match.fuente,
        clave: match.claveDocumento,
        riesgo: match.nivelRiesgo,
        escalar: match.requiereEscalamiento || ['alto', 'crítico'].includes(match.nivelRiesgo)
      };
    }

    // 3. Fallback si no hay coincidencia clara
    return {
      text: "No encontré una referencia específica en la base normativa cargada para tu consulta específica. ¿Deseas explorar un tema relacionado o prefieres hablar con un especialista?",
      fuente: null,
      sugerencias: ["Seguridad", "Salud", "Alimentación", "Normativa General"],
      escalar: true
    };
  };

  const processMessage = (text) => {
    const userMessage = {
      id: Date.now(),
      text: text,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    setTimeout(() => {
      const response = generateResponse(text);
      const botResponse = {
        id: Date.now() + 1,
        ...response,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    processMessage(inputValue);
    setInputValue('');
  };

  const handleQuickQuery = (topic) => {
    processMessage(`Necesito información normativa sobre ${topic} en guarderías IMSS.`);
  };

  const quickTopics = [
    { title: "Protocolo de Seguridad", icon: <ShieldCheck size={16} /> },
    { title: "Filtro Sanitario", icon: <Info size={16} /> },
    { title: "Manual de Operación", icon: <BookOpen size={16} /> },
    { title: "Guía de Alimentación", icon: <FileText size={16} /> },
  ];

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-50 overflow-hidden">
      
      {/* Sidebar de Consultas Rápidas (Desktop) */}
      <div className="hidden lg:flex flex-col w-80 bg-white border-r border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-8 text-imss-green-dark font-bold text-lg">
          <MessageSquare className="text-imss-gold" />
          <h2>Consultas Normativas</h2>
        </div>
        
        <div className="space-y-6">
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-4">Temas Frecuentes</p>
            <div className="space-y-2">
              {quickTopics.map((topic, i) => (
                <button 
                  key={i}
                  onClick={() => setInputValue(topic.title)}
                  className="w-full flex items-center gap-3 p-3 text-sm text-gray-600 hover:bg-imss-bg hover:text-imss-green-dark rounded-xl transition text-left group"
                >
                  <span className="p-2 bg-gray-100 rounded-lg group-hover:bg-white transition text-gray-400 group-hover:text-imss-gold">
                    {topic.icon}
                  </span>
                  {topic.title}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 bg-imss-green-dark rounded-2xl text-white relative overflow-hidden">
            <Sparkles className="absolute -right-2 -top-2 opacity-20" size={60} />
            <p className="text-sm font-bold mb-2">Asistente Inteligente</p>
            <p className="text-xs opacity-80 leading-relaxed">
              Utilizo procesamiento de lenguaje natural entrenado con los manuales oficiales del IMSS para darte respuestas precisas.
            </p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col relative">
        
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-10 h-10 bg-imss-green-dark rounded-full flex items-center justify-center text-white shadow-md">
                <Bot size={24} />
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div>
              <h3 className="font-bold text-imss-green-dark">Asistente Normativo</h3>
              <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest">En línea • Especialista Pedagógico</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="p-2 text-gray-400 hover:text-imss-green-dark hover:bg-gray-100 rounded-lg transition">
              <Search size={20} />
            </button>
            <button className="p-2 text-gray-400 hover:text-imss-green-dark hover:bg-gray-100 rounded-lg transition">
              <Info size={20} />
            </button>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              <div className={`flex gap-3 max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white shadow-sm ${
                  msg.sender === 'user' ? 'bg-imss-gold' : 'bg-imss-green-dark'
                }`}>
                  {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div>
                  <div className={`p-4 rounded-2xl shadow-sm ${
                    msg.sender === 'user' 
                      ? 'bg-imss-green-dark text-white rounded-tr-none' 
                      : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    
                    {msg.sender === 'bot' && msg.fuente && (
                      <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-[10px] text-imss-green-medium font-bold uppercase tracking-wider">
                          <ExternalLink size={12} />
                          Fuente: {msg.fuente}
                        </div>
                        <div className="text-[10px] text-gray-400">Ref: {msg.clave}</div>
                      </div>
                    )}

                    {msg.sender === 'bot' && msg.riesgo && (msg.riesgo === 'alto' || msg.riesgo === 'crítico' || msg.text.toLowerCase().includes('maltrato') || msg.text.toLowerCase().includes('emergencia')) && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2 text-red-700">
                        <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                        <p className="text-[11px] font-medium italic">
                          Esta consulta involucra temas sensibles o de seguridad. Se recomienda encarecidamente escalar a asistencia humana inmediata.
                        </p>
                      </div>
                    )}

                    {msg.sender === 'bot' && msg.sugerencias && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {msg.sugerencias.map((sug, i) => (
                          <button 
                            key={i}
                            onClick={() => handleQuickQuery(sug)}
                            className="px-3 py-1.5 bg-imss-bg border border-imss-green-medium/20 text-imss-green-dark text-[10px] font-bold rounded-full hover:bg-imss-green-dark hover:text-white transition shadow-sm"
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    )}

                    {msg.sender === 'bot' && msg.escalar && (
                      <button className="mt-3 w-full flex items-center justify-center gap-2 py-2 bg-imss-gold text-white text-xs font-bold rounded-lg hover:bg-[#a68450] transition shadow-sm">
                        <Headphones size={14} />
                        Escalar a asistencia humana
                      </button>
                    )}
                  </div>
                  <p className={`text-[10px] text-gray-400 mt-1 font-medium ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                    {msg.timestamp}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start animate-pulse">
              <div className="flex gap-3 max-w-[80%]">
                <div className="w-8 h-8 rounded-full bg-imss-green-dark flex items-center justify-center text-white">
                  <Bot size={16} />
                </div>
                <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-none flex gap-1">
                  <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 bg-white border-t border-gray-200">
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex items-center gap-4 bg-gray-50 border border-gray-200 p-2 pl-4 rounded-2xl focus-within:ring-2 focus-within:ring-imss-green-dark focus-within:bg-white transition-all shadow-inner">
            <input 
              type="text" 
              placeholder="Escribe tu duda normativa aquí..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-gray-800 outline-none"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button 
              type="submit"
              disabled={!inputValue.trim()}
              className={`p-3 rounded-xl transition shadow-md flex items-center justify-center ${
                inputValue.trim() 
                  ? 'bg-imss-green-dark text-white hover:bg-imss-green-medium' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
              }`}
            >
              <Send size={20} />
            </button>
          </form>
          <div className="mt-4 flex justify-center gap-6">
            <p className="text-[10px] text-gray-400 flex items-center gap-1">
              <ShieldCheck size={12} /> Datos protegidos por el IMSS
            </p>
            <p className="text-[10px] text-gray-400 flex items-center gap-1">
              <Sparkles size={12} /> Inteligencia Artificial Normativa
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ChatNormativo;
