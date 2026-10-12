import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  Car,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Bot,
  User as UserIcon,
  Loader2,
  ArrowRight,
  Shield,
} from 'lucide-react';
import { RecommendedVehicleItem } from '../../types/index.ts';
import { useLanguage } from '../../context/LanguageContext.tsx';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  recommendations?: RecommendedVehicleItem[];
  timestamp: Date;
  isAiPowered?: boolean;
}

interface CrystalAssistantProps {
  onSelectVehicleForBooking: (vehicleId: string) => void;
}

const QUICK_PROMPTS = [
  'Voiture 4 personnes avec bagages pour un séjour à Hammamet',
  'SUV automatique hybride pour 5 jours',
  'Citadine économique avec climatisation pour Tunis',
  'Berline de luxe Mercedes pour un événement VIP',
];

export const CrystalAssistant: React.FC<CrystalAssistantProps> = ({
  onSelectVehicleForBooking,
}) => {
  const { formatPrice, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg_welcome',
      sender: 'assistant',
      text:
        'Bonjour ! Je suis Crystal Assistant, votre conseiller automobile en Tunisie. Dites-moi vos dates, le nombre de passagers ou vos préférences (ex: Aéroport Tunis-Carthage, SUV, automatique...), et je sélectionne immédiatement les meilleurs véhicules de notre flotte.',
      timestamp: new Date(),
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputText.trim();
    if (!textToSend || isLoading) return;

    const userMsg: Message = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputText('');
    setIsLoading(true);

    try {
      const historyPayload = messages.slice(-5).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));

      const res = await fetch('/api/v1/chat/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: historyPayload,
          language,
        }),
      });

      const data = await res.json();
      if (data.success) {
        const assistantMsg: Message = {
          id: `bot_${Date.now()}`,
          sender: 'assistant',
          text: data.reply,
          recommendations: data.recommendations || [],
          isAiPowered: data.isAiPowered,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `err_${Date.now()}`,
            sender: 'assistant',
            text: data.error || 'Désolé, une erreur est survenue lors de l’analyse.',
            timestamp: new Date(),
          },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'assistant',
          text:
            'Impossible de joindre le serveur. Veuillez vérifier votre connexion ou contacter l’agence directement par téléphone.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: `msg_welcome_${Date.now()}`,
        sender: 'assistant',
        text:
          'Conversation réinitialisée. Comment puis-je vous guider pour votre location de voiture en Tunisie ?',
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-[#d4af37] via-[#c49e29] to-[#997715] text-black font-bold text-xs sm:text-sm shadow-2xl shadow-[#d4af37]/30 hover:scale-105 active:scale-95 transition group"
          aria-label="Ouvrir Crystal Assistant IA"
        >
          <div className="w-6 h-6 rounded-full bg-black/20 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-black" />
          </div>
          <span>Crystal Assistant IA</span>
          <span className="w-2 h-2 rounded-full bg-emerald-950 animate-ping"></span>
        </button>
      )}

      {/* Floating Chat Modal / Drawer */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[95vw] sm:w-[420px] h-[580px] max-h-[85vh] rounded-2xl bg-[#0e121a] border border-[#d4af37]/30 shadow-2xl flex flex-col overflow-hidden text-gray-200 animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="px-4 py-3.5 bg-gradient-to-r from-[#141a26] to-[#0e121a] border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#d4af37] to-[#806413] p-[1px] flex items-center justify-center">
                <div className="w-full h-full bg-[#0e121a] rounded-[7px] flex items-center justify-center">
                  <Bot className="w-4 h-4 text-[#d4af37]" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold text-white tracking-wide">
                    Crystal Assistant
                  </h3>
                  <span className="px-1.5 py-0.2 rounded bg-[#d4af37]/20 text-[#d4af37] text-[9px] font-extrabold border border-[#d4af37]/40">
                    GEMINI
                  </span>
                </div>
                <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Connecté à la flotte réelle en Tunisie
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleReset}
                title="Réinitialiser"
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-[#d4af37]/20 text-[#d4af37] flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 space-y-2.5 ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-[#d4af37] to-[#b89628] text-black font-medium'
                      : 'bg-[#161c28] border border-white/10 text-gray-200'
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>

                  {/* Recommendations Cards rendered inside bot response */}
                  {msg.recommendations && msg.recommendations.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <p className="text-[10px] uppercase font-bold text-[#d4af37] tracking-wider">
                        Recommandations de la flotte :
                      </p>
                      {msg.recommendations.map((rec) => (
                        <div
                          key={rec.vehicleId}
                          className="p-2.5 rounded-xl bg-[#0d1118] border border-white/10 flex flex-col gap-2"
                        >
                          <div className="flex gap-2.5">
                            <img
                              src={rec.image}
                              alt={rec.model}
                              className="w-16 h-12 rounded-lg object-cover bg-black shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-white truncate">
                                {rec.brand} {rec.model}
                              </p>
                              <p className="text-[10px] text-gray-400">
                                {rec.seats} places • {rec.transmission} • {rec.fuelType}
                              </p>
                              <p className="text-xs font-extrabold text-[#d4af37] mt-0.5">
                                {formatPrice(rec.dailyRateTnd)}/jour
                              </p>
                            </div>
                          </div>

                          <p className="text-[10px] text-gray-300 italic bg-white/5 p-1.5 rounded">
                            {rec.reason}
                          </p>

                          <button
                            onClick={() => {
                              onSelectVehicleForBooking(rec.vehicleId);
                              setIsOpen(false);
                            }}
                            className="w-full py-1.5 rounded-lg bg-gradient-to-r from-[#d4af37] to-[#aa8421] text-black font-bold text-[11px] hover:brightness-110 transition flex items-center justify-center gap-1"
                          >
                            <span>Réserver cette voiture</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <span
                    className={`block text-[9px] text-right ${
                      msg.sender === 'user' ? 'text-black/60' : 'text-gray-500'
                    }`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-6 h-6 rounded-full bg-white/10 text-gray-300 flex items-center justify-center shrink-0 mt-0.5">
                    <UserIcon className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-gray-400 text-xs italic p-2 bg-[#161c28]/60 rounded-xl max-w-xs">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#d4af37]" />
                <span>Crystal Assistant analyse l'inventaire...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Quick Prompt Chips */}
          <div className="px-3 py-2 bg-[#090c12] border-t border-white/5 flex gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
            {QUICK_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSendMessage(prompt)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-[#111622] border-t border-white/10 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ex: Voiture 4 places automatique pour Tunis..."
              className="flex-1 px-3.5 py-2 rounded-xl bg-[#090c12] border border-white/10 text-white text-xs outline-none focus:border-[#d4af37]"
            />
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="p-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#aa8421] text-black hover:brightness-110 disabled:opacity-50 transition"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
