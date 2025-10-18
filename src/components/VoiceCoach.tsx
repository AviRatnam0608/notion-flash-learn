import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AudioRecorder, encodeAudioForAPI, playAudioData } from "@/utils/RealtimeVoice";
import type { FlashCardData } from "@/types/flashcard";

interface VoiceCoachProps {
  currentCard: FlashCardData;
  isEnabled: boolean;
  onToggle: () => void;
}

export const VoiceCoach = ({ currentCard, isEnabled, onToggle }: VoiceCoachProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isEnabled && !isConnected) {
      connectToVoiceCoach();
    } else if (!isEnabled && isConnected) {
      disconnectVoiceCoach();
    }
  }, [isEnabled]);

  useEffect(() => {
    if (isConnected && wsRef.current) {
      sendCardContext();
    }
  }, [currentCard, isConnected]);

  const getWebSocketUrl = () => {
    const projectRef = window.location.hostname.split('.')[0];
    return `wss://${projectRef}.supabase.co/functions/v1/openai-voice-relay`;
  };

  const connectToVoiceCoach = async () => {
    try {
      const ws = new WebSocket(getWebSocketUrl());
      wsRef.current = ws;

      ws.onopen = async () => {
        console.log("Connected to voice coach");
        setIsConnected(true);

        // Initialize session
        ws.send(JSON.stringify({
          type: "session.update",
          session: {
            modalities: ["text", "audio"],
            instructions: `You are a technical interviewer helping a candidate practice coding problems. Be encouraging but critical. Give subtle hints without revealing the solution. The candidate will explain their approach verbally, and you should:
1. Listen carefully to their reasoning
2. Point out logical flaws or edge cases they might have missed
3. Ask clarifying questions
4. Give hints only when they're stuck
5. Never directly give the solution
6. Be concise and conversational`,
            voice: "alloy",
            input_audio_format: "pcm16",
            output_audio_format: "pcm16",
            turn_detection: {
              type: "server_vad",
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 1000
            },
            temperature: 0.8
          }
        }));

        // Start audio recording
        audioContextRef.current = new AudioContext({ sampleRate: 24000 });
        recorderRef.current = new AudioRecorder((audioData) => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'input_audio_buffer.append',
              audio: encodeAudioForAPI(audioData)
            }));
          }
        });
        await recorderRef.current.start();

        // Send initial context
        sendCardContext();

        toast({
          title: "Voice Coach Connected",
          description: "Start explaining your approach!",
        });
      };

      ws.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        console.log("Received:", data.type);

        if (data.type === 'response.audio.delta') {
          const binaryString = atob(data.delta);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          if (audioContextRef.current) {
            await playAudioData(audioContextRef.current, bytes);
          }
        } else if (data.type === 'response.created') {
          setIsSpeaking(true);
        } else if (data.type === 'response.done') {
          setIsSpeaking(false);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        toast({
          title: "Connection Error",
          description: "Failed to connect to voice coach",
          variant: "destructive",
        });
      };

      ws.onclose = () => {
        console.log("WebSocket closed");
        setIsConnected(false);
        setIsSpeaking(false);
      };
    } catch (error) {
      console.error("Error connecting:", error);
      toast({
        title: "Error",
        description: "Failed to start voice coach",
        variant: "destructive",
      });
    }
  };

  const sendCardContext = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const contextMessage = `The candidate is now working on: "${currentCard.title}". Problem: ${currentCard.description}. Topic area: ${currentCard.topic}. Listen to their explanation and provide guidance.`;
      
      wsRef.current.send(JSON.stringify({
        type: 'conversation.item.create',
        item: {
          type: 'message',
          role: 'user',
          content: [{
            type: 'input_text',
            text: contextMessage
          }]
        }
      }));
    }
  };

  const disconnectVoiceCoach = () => {
    recorderRef.current?.stop();
    wsRef.current?.close();
    audioContextRef.current?.close();
    setIsConnected(false);
    setIsSpeaking(false);
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={onToggle}
        variant={isEnabled ? "default" : "outline"}
        size="sm"
        className="gap-2"
      >
        {isEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
        Voice Coach
      </Button>
      {isConnected && isSpeaking && (
        <div className="flex items-center gap-1 text-sm text-muted-foreground animate-pulse">
          <Volume2 className="w-4 h-4" />
          Speaking...
        </div>
      )}
    </div>
  );
};
