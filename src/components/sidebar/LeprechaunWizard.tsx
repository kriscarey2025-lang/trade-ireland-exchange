import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Sparkles, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface LeprechaunWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/leprechaun-chat`;

// Check if Speech Recognition is available
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

const LeprechaunWizard = ({ open, onOpenChange }: LeprechaunWizardProps) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Top o' the mornin' to ya! 🍀 I'm Lucky, your friendly leprechaun guide. What can I help you with today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [irishVoice, setIrishVoice] = useState<SpeechSynthesisVoice | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Find Irish or English voice
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      // Try to find Irish English voice first
      let voice = voices.find(v => v.lang === 'en-IE');
      // Fall back to UK English (closer to Irish)
      if (!voice) voice = voices.find(v => v.lang === 'en-GB');
      // Fall back to any English
      if (!voice) voice = voices.find(v => v.lang.startsWith('en'));
      setIrishVoice(voice || null);
      console.log('Available voices:', voices.map(v => `${v.name} (${v.lang})`));
      console.log('Selected voice:', voice?.name, voice?.lang);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Stop speaking when dialog closes
  useEffect(() => {
    if (!open) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [open]);

  const speakText = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) {
      toast({
        title: "Voice output not supported",
        description: "Your browser doesn't support text-to-speech.",
        variant: "destructive",
      });
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Clean the text (remove emojis for cleaner speech)
    const cleanText = text.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    if (irishVoice) {
      utterance.voice = irishVoice;
    }
    utterance.lang = 'en-IE';
    utterance.rate = 0.95; // Slightly slower for clarity
    utterance.pitch = 1.1; // Slightly higher pitch for friendliness

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [irishVoice, toast]);

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  // Initialize speech recognition
  useEffect(() => {
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-IE'; // Irish English

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setInput(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          toast({
            title: "Microphone access denied",
            description: "Please allow microphone access to use voice input.",
            variant: "destructive",
          });
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [toast]);

  useEffect(() => {
    if (open && inputRef.current) {
      // Delay focus to avoid keyboard issues on mobile
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const toggleListening = () => {
    if (!SpeechRecognition) {
      toast({
        title: "Voice input not supported",
        description: "Your browser doesn't support voice input. Try Chrome or Safari.",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      // Stop any ongoing speech before listening
      stopSpeaking();
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
      }
    }
  };

  const streamChat = async (userMessages: Message[]) => {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages: userMessages }),
    });

    if (!resp.ok || !resp.body) {
      throw new Error("Failed to start stream");
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let assistantSoFar = "";
    let streamDone = false;

    // Add empty assistant message
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") {
          streamDone = true;
          break;
        }

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            assistantSoFar += content;
            setMessages((prev) => {
              const newMessages = [...prev];
              newMessages[newMessages.length - 1] = {
                role: "assistant",
                content: assistantSoFar,
              };
              return newMessages;
            });
          }
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }

    // Auto-speak if enabled
    if (autoSpeak && assistantSoFar) {
      speakText(assistantSoFar);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Stop listening if active
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }

    // Stop any ongoing speech
    stopSpeaking();

    const userMessage: Message = { role: "user", content: input.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      await streamChat(updatedMessages);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Ah sure, something went a bit wobbly there! 🍀 Could you try asking again?",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden max-h-[85vh] h-[85vh] sm:h-auto sm:max-h-none flex flex-col">
        <DialogHeader className="p-4 pb-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">🍀</span>
              <span>Lucky the Leprechaun</span>
              <Sparkles className="h-4 w-4 text-yellow-500" />
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Label htmlFor="auto-speak" className="text-xs text-muted-foreground cursor-pointer">
                {autoSpeak ? "🔊" : "🔇"}
              </Label>
              <Switch
                id="auto-speak"
                checked={autoSpeak}
                onCheckedChange={setAutoSpeak}
                className="scale-75"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            A bit of fun — take with a pinch of salt! 🧂 But I do know my SwapSkills stuff.
          </p>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "flex gap-2",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">🍀</span>
                  </div>
                )}
                <div
                  className={cn(
                    "rounded-2xl px-4 py-2 max-w-[80%] group relative",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  {message.role === "assistant" && message.content && (
                    <button
                      onClick={() => isSpeaking ? stopSpeaking() : speakText(message.content)}
                      className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-muted"
                      title={isSpeaking ? "Stop speaking" : "Listen to this"}
                    >
                      {isSpeaking ? (
                        <VolumeX className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Volume2 className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="flex gap-2 justify-start">
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg animate-bounce">🍀</span>
                </div>
                <div className="bg-muted rounded-2xl px-4 py-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <form onSubmit={handleSubmit} className="p-3 sm:p-4 border-t bg-muted/30 flex-shrink-0">
          <div className="flex gap-2">
            <Button
              type="button"
              size="icon"
              variant={isListening ? "default" : "outline"}
              onClick={toggleListening}
              disabled={isLoading}
              className={cn(
                "flex-shrink-0 transition-colors",
                isListening && "bg-red-500 hover:bg-red-600 animate-pulse"
              )}
              title={isListening ? "Stop listening" : "Voice input"}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? "Listening..." : "Ask Lucky a question..."}
              disabled={isLoading}
              className="flex-1 text-base"
            />
            <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
          {isListening && (
            <p className="text-xs text-muted-foreground text-center mt-2 animate-pulse">
              🎤 Speak now...
            </p>
          )}
          {isSpeaking && (
            <p className="text-xs text-muted-foreground text-center mt-2 animate-pulse">
              🔊 Lucky is speaking...
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LeprechaunWizard;
