import { AppLayout } from "./AppLayout";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import {
  Send,
  MessageSquare,
  Sparkles,
  Phone,
  Video as VideoIcon,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface TalkToHugoAIProps {
  navigate?: (page: string) => void;
  isAdmin?: boolean;
}

interface ChatMessage {
  role: "user" | "coach";
  text: string;
  timestamp: string;
}

export function TalkToHugoAI({ navigate, isAdmin }: TalkToHugoAIProps) {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: "coach",
      text: "Hey! Waar wil je vandaag mee aan de slag? Ik kan je helpen met sales technieken, rollenspel tips, of gewoon sparren over een klantgesprek.",
      timestamp: new Date().toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isTyping]);

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      role: "user",
      text: chatInput,
      timestamp: new Date().toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" }),
    };
    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput("");

    // Simulate Hugo typing
    setIsTyping(true);
    setTimeout(() => {
      const coachResponse: ChatMessage = {
        role: "coach",
        text: getHugoResponse(chatInput),
        timestamp: new Date().toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" }),
      };
      setChatMessages((prev) => [...prev, coachResponse]);
      setIsTyping(false);
    }, 1500);
  };

  // Simple response logic (mock Hugo)
  const getHugoResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase();
    
    if (lowerInput.includes("ontdekking") || lowerInput.includes("vragen")) {
      return "Goede focus! Ontdekkingsvragen zijn cruciaal. Denk aan de LEAD-techniek: Luisteren, Empathie tonen, Aansluiten bij hun wereld, en Dan doorvragen. Wil je dat we dit samen oefenen in een roleplay?";
    }
    
    if (lowerInput.includes("bezwaar") || lowerInput.includes("objectie")) {
      return "Bezwaren zijn altijd een teken van interesse — ze twijfelen, maar zijn nog niet weg. Belangrijkste: luister eerst volledig, toon empathie ('Ik snap dat...'), en vraag door naar de echte reden. Vaak zit er meer achter dan wat ze initieel zeggen.";
    }
    
    if (lowerInput.includes("afsluiting") || lowerInput.includes("deal")) {
      return "People buy people — onthoud dat altijd. De afsluiting is niet het moment om te pushen, maar om vertrouwen te bevestigen. Gebruik proefafsluitingen tijdens het gesprek: 'Als we dit kunnen oplossen, zou je dan...?' Zo voel je de temperatuur.";
    }
    
    if (lowerInput.includes("help") || lowerInput.includes("wat kun je")) {
      return "Ik kan je helpen met: sales technieken uitleggen, tips geven voor specifieke situaties, samen oefenen via roleplay, of gewoon sparren over een klantgesprek. Vertel me waar je tegenaan loopt!";
    }
    
    return "Interessant punt! Hier is mijn advies: blijf altijd authentiek, luister meer dan je praat, en onthoud dat elke klant uniek is. Wil je dat ik dieper inga op een specifieke techniek, of zullen we dit samen oefenen?";
  };

  return (
    <AppLayout currentPage="talk-to-hugo" navigate={navigate} isAdmin={isAdmin}>
      <div className="h-[calc(100vh-73px)] flex flex-col bg-hh-ui-50">
        {/* Chat Header */}
        <div className="flex-shrink-0 bg-white border-b border-hh-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-hh-primary flex items-center justify-center text-white font-semibold">
                HH
              </div>
              <div>
                <h1 className="text-[20px] leading-[24px] font-medium text-hh-text">
                  Talk to Hugo <sup className="text-[12px]">AI</sup>
                </h1>
                <p className="text-[13px] leading-[18px] text-hh-muted">
                  Direct sparren met je AI sales coach
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 h-9 text-[13px]"
                onClick={() => console.log("Start voice call")}
              >
                <Phone className="w-4 h-4" />
                <span className="hidden sm:inline">Voice Call</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 h-9 text-[13px]"
                onClick={() => console.log("Start video call")}
              >
                <VideoIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Video Call</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {chatMessages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                  message.role === "user"
                    ? "bg-hh-primary text-white"
                    : "bg-white border border-hh-border text-hh-text"
                }`}
              >
                <p className="text-[14px] leading-[20px]">{message.text}</p>
                <p
                  className={`text-[11px] leading-[14px] mt-1.5 ${
                    message.role === "user" ? "text-white/70" : "text-hh-muted"
                  }`}
                >
                  {message.timestamp}
                </p>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-hh-border rounded-2xl px-4 py-3">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-hh-muted rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 bg-hh-muted rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 bg-hh-muted rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Suggested Quick Actions (when chat is empty-ish) */}
        {chatMessages.length <= 2 && (
          <div className="flex-shrink-0 px-6 pb-3">
            <div className="flex flex-wrap gap-2">
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-hh-ui-50 px-3 py-1.5 text-[13px]"
                onClick={() => setChatInput("Hoe pak ik bezwaren goed aan?")}
              >
                <Sparkles className="w-3 h-3 mr-1.5" />
                Bezwaren aanpakken
              </Badge>
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-hh-ui-50 px-3 py-1.5 text-[13px]"
                onClick={() => setChatInput("Hoe stel ik goede ontdekkingsvragen?")}
              >
                <Sparkles className="w-3 h-3 mr-1.5" />
                Ontdekkingsvragen
              </Badge>
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-hh-ui-50 px-3 py-1.5 text-[13px]"
                onClick={() => setChatInput("Tips voor een goede afsluiting?")}
              >
                <Sparkles className="w-3 h-3 mr-1.5" />
                Afsluiting tips
              </Badge>
            </div>
          </div>
        )}

        {/* Chat Input */}
        <div className="flex-shrink-0 bg-white border-t border-hh-border px-6 py-4">
          <div className="flex items-center gap-3">
            <Input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Type je vraag of situatie..."
              className="flex-1 h-11 text-[14px] rounded-full border-hh-border"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!chatInput.trim()}
              className="w-11 h-11 rounded-full p-0 flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-[11px] leading-[14px] text-hh-muted mt-2 text-center">
            Hugo AI kan fouten maken. Controleer belangrijke informatie.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}