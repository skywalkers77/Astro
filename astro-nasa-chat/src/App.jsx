import React, { useState, useRef, useEffect } from 'react';
// Added 'Star' to the import line
import { Send, Sparkles, Rocket, Upload, Image, Mic, MicOff, FileText, Database, Globe, Star } from 'lucide-react';

const API_ENDPOINT = 'https://rag-ai-tutorial.hemanth3292.workers.dev/query';
const TOP_K = 10;
const SCORE_THRESHOLD = 0.3;

// Helper component for the animated star background
const StarField = () => {
  const [stars, setStars] = useState([]);
  useEffect(() => {
    const newStars = Array.from({ length: 200 }, (_, i) => ({
      id: i, x: Math.random() * 100, y: Math.random() * 100,
      size: Math.random() * 2.5 + 0.5, duration: Math.random() * 3 + 2, delay: Math.random() * 2
    }));
    setStars(newStars);
  }, []);
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {stars.map(star => (
        <div key={star.id} className="absolute rounded-full bg-white"
          style={{ left: `${star.x}%`, top: `${star.y}%`, width: `${star.size}px`, height: `${star.size}px`,
            animation: `twinkle ${star.duration}s ease-in-out ${star.delay}s infinite`, opacity: 0.6 }} />
      ))}
    </div>
  );
};

// Helper component for the Saturn-like icon
const SaturnIcon = ({ size = 80, animate = true }) => (
  <div className="relative" style={{ width: size, height: size }}>
    <div className={`absolute inset-0 rounded-full ${animate ? 'animate-pulse' : ''}`}
      style={{ background: 'radial-gradient(circle at 30% 30%, rgba(236, 72, 153, 0.8), rgba(147, 51, 234, 0.9), rgba(88, 28, 135, 1))',
        boxShadow: '0 0 60px rgba(147, 51, 234, 0.6), inset -10px -10px 40px rgba(0, 0, 0, 0.5)', animationDuration: '3s' }} />
    <div className="absolute" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-20deg)',
        width: size * 1.6, height: size * 0.3, borderRadius: '50%', border: '3px solid rgba(59, 130, 246, 0.6)',
        boxShadow: '0 0 30px rgba(59, 130, 246, 0.4), inset 0 0 20px rgba(59, 130, 246, 0.2)',
        background: 'linear-gradient(to bottom, rgba(59, 130, 246, 0.3), transparent, rgba(59, 130, 246, 0.3))' }} />
    <div className={`absolute inset-0 rounded-full ${animate ? 'animate-ping' : ''}`}
      style={{ background: 'radial-gradient(circle, rgba(147, 51, 234, 0.4), transparent 70%)', animationDuration: '3s' }} />
  </div>
);

// ** MODIFICATION START **
// New Footer Component from the provided reference
const Footer = () => (
    <div className="flex-shrink-0 pb-4 px-6">
      <div className="max-w-5xl mx-auto text-center">
        <p className="text-xs text-white/30 flex items-center justify-center gap-2">
          <Star className="w-3 h-3" />
          <span>Powered by Cloudflare AI • Google Gemini • Vector Search</span>
          <Star className="w-3 h-3" />
        </p>
      </div>
    </div>
);
// ** MODIFICATION END **
//SourceDisplay
// Component to display the sources for an AI message
const SourcesDisplay = ({ sources }) => {
  if (!sources || sources.length === 0) return null;
  return (
    <div className="mt-4 p-4 backdrop-blur-xl border rounded-2xl" style={{ background: 'rgba(15, 15, 35, 0.7)', borderColor: 'rgba(147, 51, 234, 0.3)' }}>
      <div className="flex items-center gap-2 mb-3">
        <FileText className="w-4 h-4 text-purple-400" />
        <span className="text-sm font-medium text-purple-300">Source Documents</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {sources.map((source, idx) => (
          <div key={idx} className="flex items-center justify-between p-2 rounded-lg hover:bg-purple-500/10 transition-colors">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Database className="w-3 h-3 text-cyan-400 flex-shrink-0" />
              <span className="text-xs text-white/70 truncate">{source.source || source}</span>
            </div>
            {source.relevance && (
              <span className={`text-xs px-2 py-1 rounded-full ml-2 ${
                  source.relevance === 'High' ? 'bg-green-500/20 text-green-300' :
                  source.relevance === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-gray-500/20 text-gray-300'}`}>
                {source.relevance}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// The initial landing page component
const LandingPage = ({ onStart }) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const [augmentedSearch, setAugmentedSearch] = useState(false);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const recognitionRef = useRef(null);
  const uploadMenuRef = useRef(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript + ' ';
        }
        if (finalTranscript) setInput(prev => prev + finalTranscript);
      };
      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
    const handleClickOutside = (event) => {
      if (uploadMenuRef.current && !uploadMenuRef.current.contains(event.target)) setShowUploadMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (recognitionRef.current && isListening) recognitionRef.current.stop();
    };
  }, [isListening]);

  const toggleDictation = () => {
    if (!recognitionRef.current) { alert('Speech recognition is not supported in your browser.'); return; }
    if (isListening) { recognitionRef.current.stop(); setIsListening(false); }
    else { recognitionRef.current.start(); setIsListening(true); }
  };

  const handleLaunch = () => {
    if (input.trim()) {
      if (isListening && recognitionRef.current) recognitionRef.current.stop();
      onStart(input, augmentedSearch);
    }
  };

  const handleKeyPress = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleLaunch(); } };
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onStart(`📄 Research document uploaded: "${file.name}" (${(file.size / 1024).toFixed(1)} KB)`, augmentedSearch);
    setShowUploadMenu(false);
  };
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onStart(`🖼️ Image uploaded: "${file.name}"`, augmentedSearch);
    setShowUploadMenu(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-4xl w-full text-center animate-fadeIn">
        <div className="flex justify-center mb-8 animate-scaleIn"><SaturnIcon size={120} animate={true} /></div>
        <div className="mb-4 animate-slideUp" style={{ animationDelay: '0.2s' }}>
          <h1 className="text-8xl font-bold mb-4 tracking-tight" style={{
              background: 'linear-gradient(135deg, #ec4899 0%, #a855f7 25%, #6366f1 50%, #3b82f6 75%, #06b6d4 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              textShadow: '0 0 80px rgba(147, 51, 234, 0.5)' }}>ASTRO</h1>
          <p className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-cyan-300 to-pink-300 font-light tracking-wide">
            NASA Bioscience Research Engine</p>
        </div>
        <div className="mb-12 animate-slideUp" style={{ animationDelay: '0.4s' }}>
          <p className="text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
            Unlock decades of space biology research with AI-powered intelligence.<br />
            <span className="text-purple-300">Explore radiation effects, microgravity adaptations, and human performance in space.</span>
          </p>
        </div>
        <div className="animate-slideUp" style={{ animationDelay: '0.6s' }}>
          <div className="relative max-w-3xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 via-cyan-500/30 to-pink-500/30 blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
            <div className="relative backdrop-blur-2xl border rounded-3xl p-4 shadow-2xl" style={{
                background: 'linear-gradient(135deg, rgba(15, 15, 35, 0.8) 0%, rgba(88, 28, 135, 0.3) 50%, rgba(15, 15, 35, 0.9) 100%)',
                borderColor: 'rgba(147, 51, 234, 0.5)' }}>
              <div className="flex items-center gap-4">
                <div className="relative" ref={uploadMenuRef}>
                  <button onClick={() => setShowUploadMenu(!showUploadMenu)}
                    className="p-3 rounded-2xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/40 transition-all duration-300 flex-shrink-0">
                    <Upload className="w-5 h-5 text-purple-300" />
                  </button>
                  {showUploadMenu && (
                    <div className="absolute top-full mt-2 left-0 backdrop-blur-xl border border-purple-400/40 rounded-2xl overflow-hidden shadow-2xl z-50"
                      style={{ background: 'rgba(15, 15, 35, 0.95)' }}>
                      <button onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-purple-500/20 transition-colors w-full text-left">
                        <Upload className="w-4 h-4 text-purple-300" />
                        <span className="text-sm text-white/90 whitespace-nowrap">Upload File</span>
                      </button>
                      <button onClick={() => imageInputRef.current?.click()}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-purple-500/20 transition-colors w-full text-left">
                        <Image className="w-4 h-4 text-purple-300" />
                        <span className="text-sm text-white/90 whitespace-nowrap">Upload Image</span>
                      </button>
                    </div>
                  )}
                  <input ref={fileInputRef} type="file" onChange={handleFileChange} className="hidden" accept=".pdf,.doc,.docx,.txt" />
                  <input ref={imageInputRef} type="file" onChange={handleImageChange} className="hidden" accept="image/*" />
                </div>
                <Sparkles className="w-6 h-6 text-purple-400 flex-shrink-0 animate-pulse" />
                <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about space biology research..."
                  className="flex-1 bg-transparent text-white placeholder-white/50 text-lg focus:outline-none" autoFocus />
                <button onClick={toggleDictation}
                  className={`relative p-3 rounded-2xl transition-all duration-300 flex-shrink-0 border ${
                    isListening ? 'bg-gradient-to-r from-pink-500 to-purple-500 border-pink-400 shadow-lg shadow-pink-500/50 scale-110'
                      : 'bg-purple-500/20 hover:bg-purple-500/30 border-purple-400/40'}`}
                  title={isListening ? 'Click to stop recording' : 'Start voice input'}>
                  {isListening && (<><div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-purple-400 rounded-2xl opacity-75 blur-lg"
                      style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
                    <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl opacity-30"
                      style={{ animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite' }} /></>)}
                  <Mic className={`w-5 h-5 relative z-10 ${isListening ? 'text-white' : 'text-purple-300'}`} />
                </button>
                <div className="flex items-center gap-2">
                  <button onClick={() => setAugmentedSearch(!augmentedSearch)}
                    className={`relative w-11 h-6 rounded-full transition-all duration-300 ${
                      augmentedSearch ? 'bg-gradient-to-r from-cyan-500 to-purple-500' : 'bg-gray-600'}`} title="Toggle web augmentation">
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-lg ${
                      augmentedSearch ? 'left-6' : 'left-1'}`} />
                  </button>
                  <span className="text-xs text-white/60 whitespace-nowrap">Web Search</span>
                </div>
                <button onClick={handleLaunch} disabled={!input.trim()}
                  className="group relative bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 hover:from-purple-400 hover:via-pink-400 hover:to-cyan-400 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-2xl px-8 py-3 transition-all duration-300 shadow-lg disabled:cursor-not-allowed font-medium">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300" />
                  <span className="relative z-10 flex items-center gap-2">Launch <Rocket className="w-5 h-5" /></span>
                </button>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            {['🧬 Radiation Research', '💪 Muscle Atrophy', '🦴 Bone Density', '❤️ Cardiovascular', '🧠 Neurological'].map((feature, i) => (
              <div key={i} className="px-4 py-2 rounded-full backdrop-blur-xl border border-purple-400/30 text-white/70 text-sm animate-fadeIn"
                style={{ background: 'rgba(147, 51, 234, 0.1)', animationDelay: `${0.8 + i * 0.1}s` }}>{feature}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Component for an individual chat message
const ChatMessage = ({ message, isAI, timestamp, sources, mode }) => {
    // Function to parse the message and convert **text** to <strong>text</strong>
    const formatMessage = (text) => {
        const boldedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        return boldedText;
    };

    return (
        <div className={`flex ${isAI ? 'justify-start' : 'justify-end'} mb-6 animate-fadeIn`}>
            <div className={`max-w-3xl relative group ${isAI ? 'mr-auto' : 'ml-auto'}`}>
                <div className="px-6 py-4 rounded-3xl backdrop-blur-xl border shadow-2xl relative overflow-hidden" style={{
                    background: isAI ? 'linear-gradient(135deg, rgba(15, 15, 35, 0.85) 0%, rgba(88, 28, 135, 0.4) 30%, rgba(147, 51, 234, 0.3) 70%, rgba(15, 15, 35, 0.9) 100%)'
                        : 'linear-gradient(135deg, rgba(15, 15, 35, 0.9) 0%, rgba(30, 58, 138, 0.5) 40%, rgba(59, 130, 246, 0.4) 70%, rgba(15, 15, 35, 0.95) 100%)',
                    borderColor: isAI ? 'rgba(147, 51, 234, 0.4)' : 'rgba(59, 130, 246, 0.4)',
                    borderRadius: isAI ? '24px 24px 24px 6px' : '24px 24px 6px 24px'
                }}>
                    <div className="relative flex items-start gap-3">
                        {isAI && (
                            <div className="flex flex-col items-center gap-1">
                                <Sparkles className="w-5 h-5 text-purple-400 flex-shrink-0 animate-pulse" />
                                {mode && (
                                    <div className="mt-2">
                                        {mode === 'augmented' ? <Globe className="w-3 h-3 text-cyan-400" title="Augmented with web search" />
                                            : <Database className="w-3 h-3 text-purple-400" title="Database search" />}
                                    </div>
                                )}
                            </div>
                        )}
                        <div className="flex-1">
                            <p
                                className="text-white/90 leading-relaxed text-base whitespace-pre-wrap"
                                dangerouslySetInnerHTML={{ __html: formatMessage(message) }}
                            />
                            <span className="text-xs text-white/40 mt-2 block">{timestamp}</span>
                        </div>
                    </div>
                    {isAI && <div className="absolute -top-1 -left-1 w-2 h-2 bg-purple-400 rounded-full animate-ping" />}
                </div>
                {isAI && sources && <SourcesDisplay sources={sources} />}
            </div>
        </div>
    );
};

// The main chat interface component
const ChatInterface = ({ messages, isTyping, onSendMessage, messagesEndRef }) => {
  const [input, setInput] = useState('');
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [augmentedSearch, setAugmentedSearch] = useState(false);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const uploadMenuRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript + ' ';
        }
        if (finalTranscript) setInput(prev => prev + finalTranscript);
      };
      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
    const handleClickOutside = (event) => {
      if (uploadMenuRef.current && !uploadMenuRef.current.contains(event.target)) setShowUploadMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (recognitionRef.current && isListening) recognitionRef.current.stop();
    };
  }, [isListening]);

  const toggleDictation = () => {
    if (!recognitionRef.current) { alert('Speech recognition is not supported in your browser.'); return; }
    if (isListening) { recognitionRef.current.stop(); setIsListening(false); }
    else { recognitionRef.current.start(); setIsListening(true); }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    if (isListening && recognitionRef.current) recognitionRef.current.stop();
    onSendMessage(input, augmentedSearch);
    setInput('');
  };

  const handleKeyPress = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onSendMessage(`📄 Research document uploaded: "${file.name}" (${(file.size / 1024).toFixed(1)} KB)`, augmentedSearch);
    setShowUploadMenu(false);
  };
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onSendMessage(`🖼️ Image uploaded: "${file.name}"`, augmentedSearch);
    setShowUploadMenu(false);
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-shrink-0 pt-4 pb-3 px-6 backdrop-blur-xl border-b border-purple-500/20 animate-slideDown">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <SaturnIcon size={40} animate={false} />
            <div>
              <h1 className="text-2xl font-bold" style={{
                  background: 'linear-gradient(135deg, #ec4899 0%, #a855f7 50%, #3b82f6 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>ASTRO</h1>
              <p className="text-xs text-purple-300/70 tracking-wide">NASA Bioscience Research Engine</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-white/50">AI Active</span>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-5xl mx-auto">
          {messages.map((message) => (<ChatMessage key={message.id} message={message.text} isAI={message.isAI}
            timestamp={message.timestamp} sources={message.sources} mode={message.mode} />))}
          {isTyping && (
            <div className="flex justify-start mb-6 animate-fadeIn">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/30 to-cyan-500/30 border border-purple-400/40 backdrop-blur-xl flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-purple-300 border-t-transparent rounded-full animate-spin" />
                </div>
                <div className="px-6 py-4 rounded-3xl rounded-tl-lg backdrop-blur-xl border border-purple-400/40" style={{
                    background: 'linear-gradient(135deg, rgba(15, 15, 35, 0.85) 0%, rgba(88, 28, 135, 0.4) 30%, rgba(147, 51, 234, 0.3) 70%, rgba(15, 15, 35, 0.9) 100%)' }}>
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (<div key={i} className="w-2 h-2 bg-purple-300 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.2}s` }} />))}
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="flex-shrink-0 px-6 pb-6">
        <div className="max-w-5xl mx-auto">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-cyan-500/20 to-pink-500/20 blur-xl" />
            <div className="relative backdrop-blur-2xl border rounded-3xl p-3 shadow-2xl" style={{
                background: 'linear-gradient(135deg, rgba(15, 15, 35, 0.9) 0%, rgba(88, 28, 135, 0.4) 50%, rgba(15, 15, 35, 0.95) 100%)',
                borderColor: 'rgba(147, 51, 234, 0.4)' }}>
              <div className="flex items-end gap-3">
                <div className="relative" ref={uploadMenuRef}>
                  <button onClick={() => setShowUploadMenu(!showUploadMenu)}
                    className="p-3 rounded-2xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/40 transition-all duration-300">
                    <Upload className="w-5 h-5 text-purple-300" />
                  </button>
                  {showUploadMenu && (
                    <div className="absolute bottom-full mb-2 left-0 backdrop-blur-xl border border-purple-400/40 rounded-2xl overflow-hidden shadow-2xl z-50"
                      style={{ background: 'rgba(15, 15, 35, 0.95)' }}>
                      <button onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-purple-500/20 transition-colors w-full text-left">
                        <Upload className="w-4 h-4 text-purple-300" />
                        <span className="text-sm text-white/90 whitespace-nowrap">Upload File</span>
                      </button>
                      <button onClick={() => imageInputRef.current?.click()}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-purple-500/20 transition-colors w-full text-left">
                        <Image className="w-4 h-4 text-purple-300" />
                        <span className="text-sm text-white/90 whitespace-nowrap">Upload Image</span>
                      </button>
                    </div>
                  )}
                  <input ref={fileInputRef} type="file" onChange={handleFileChange} className="hidden" accept=".pdf,.doc,.docx,.txt" />
                  <input ref={imageInputRef} type="file" onChange={handleImageChange} className="hidden" accept="image/*" />
                </div>
                <Sparkles className="w-5 h-5 text-purple-400 flex-shrink-0 animate-pulse" />
                <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about space biology research..."
                  className="flex-1 bg-transparent text-white placeholder-white/50 text-lg focus:outline-none" autoFocus />
                <button onClick={toggleDictation}
                  className={`relative p-3 rounded-2xl transition-all duration-300 flex-shrink-0 border ${
                    isListening ? 'bg-gradient-to-r from-pink-500 to-purple-500 border-pink-400 shadow-lg shadow-pink-500/50 scale-110'
                      : 'bg-purple-500/20 hover:bg-purple-500/30 border-purple-400/40'}`}
                  title={isListening ? 'Click to stop recording' : 'Start voice input'}>
                  {isListening && (<><div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-purple-400 rounded-2xl opacity-75 blur-lg"
                      style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
                    <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl opacity-30"
                      style={{ animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite' }} />
                    </>)}
                  <Mic className={`w-5 h-5 relative z-10 ${isListening ? 'text-white' : 'text-purple-300'}`} />
                </button>
                <div className="flex items-center gap-2">
                  <button onClick={() => setAugmentedSearch(!augmentedSearch)}
                      className={`relative w-11 h-6 rounded-full transition-all duration-300 ${
                          augmentedSearch ? 'bg-gradient-to-r from-cyan-500 to-purple-500' : 'bg-gray-600'}`} title="Toggle web augmentation">
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-lg ${
                          augmentedSearch ? 'left-6' : 'left-1'}`} />
                  </button>
                  <span className="text-xs text-white/60 whitespace-nowrap">Web Search</span>
                </div>
                <button onClick={handleSend} disabled={!input.trim()}
                  className="group bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-2xl p-3 transition-all duration-300 shadow-lg disabled:cursor-not-allowed">
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* ** MODIFICATION START ** */}
      {/* Replaced the old footer tag with the new Footer component call */}
      <Footer />
      {/* ** MODIFICATION END ** */}
    </div>
  );
};

// Main App component to manage state and logic
const App = () => {
  const [hasStarted, setHasStarted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, isTyping]);

  const handleSendMessage = async (text, augmented) => {
    const userMessage = {
      id: Date.now(),
      text,
      isAI: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const params = new URLSearchParams({
        text: text,
        top_k: TOP_K.toString(),
        mode: augmented ? 'hybrid' : 'db-only',
        scoreThreshold: SCORE_THRESHOLD.toString(),
      });

      const urlWithParams = `${API_ENDPOINT}?${params.toString()}`;
      
      const response = await fetch(urlWithParams);

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      const uniqueSourcesMap = data.sources.reduce((acc, currentSource) => {
        const existingSource = acc.get(currentSource.source);
        if (!existingSource || currentSource.score > existingSource.score) {
          acc.set(currentSource.source, currentSource);
        }
        return acc;
      }, new Map());

      const uniqueSources = Array.from(uniqueSourcesMap.values());

      const sources = uniqueSources.map(s => {
        let relevance;
        if (s.score > SCORE_THRESHOLD) relevance = 'High';
        else if (s.score > SCORE_THRESHOLD - 0.1) relevance = 'Medium';
        else relevance = 'Low';
        return { ...s, relevance };
      });

      const aiMessage = {
        id: Date.now() + 1,
        text: data.answer.trim(),
        isAI: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: sources,
        mode: augmented ? 'hybrid' : 'db-only',
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Failed to fetch AI response:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: `I'm sorry, but I encountered an error: ${error.message}. Please check the API endpoint and try again.`,
        isAI: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: [],
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleStartChat = (text, augmented) => {
    setHasStarted(true);
    handleSendMessage(text, augmented);
  };
  
  return (
    <div className="bg-[#0f0f23] text-white font-sans">
      <StarField />
      <div className="relative z-10">
        {!hasStarted ? (
          <LandingPage onStart={handleStartChat} />
        ) : (
          <ChatInterface
            messages={messages}
            isTyping={isTyping}
            onSendMessage={handleSendMessage}
            messagesEndRef={messagesEndRef}
          />
        )}
      </div>
    </div>
  );
};

export default App;