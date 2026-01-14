import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { base64ToUint8Array, float32To16BitPCM, arrayBufferToBase64 } from '../services/geminiService';
import { AgentRole } from '../types';

interface LiveVoiceAgentProps {
  active: boolean;
  onClose: () => void;
  role: AgentRole;
}

const LiveVoiceAgent: React.FC<LiveVoiceAgentProps> = ({ active, onClose, role }) => {
  const [connected, setConnected] = useState(false);
  const [isTalking, setIsTalking] = useState(false);
  const [volume, setVolume] = useState(0); // For visualization
  
  // Refs for audio handling to avoid re-renders
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sessionRef = useRef<Promise<any> | null>(null); // Holds the LiveSession promise

  const connectToLiveAPI = async () => {
    try {
      if (!process.env.API_KEY) {
        alert("API Key missing");
        return;
      }

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Initialize Audio Contexts
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContextClass({ sampleRate: 24000 });
      
      // Input handling (Microphone) - Need separate context for input usually 16k
      const inputCtx = new AudioContextClass({ sampleRate: 16000 });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const connectPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction: `You are a real-time ${role} for a real estate platform. Keep answers concise and professional.`,
        },
        callbacks: {
          onopen: () => {
            console.log("Live Session Connected");
            setConnected(true);

            // Setup Input Stream
            const source = inputCtx.createMediaStreamSource(stream);
            const processor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              // Calculate volume for visualizer
              let sum = 0;
              for(let i=0; i<inputData.length; i++) sum += inputData[i]*inputData[i];
              const rms = Math.sqrt(sum/inputData.length);
              setVolume(Math.min(rms * 5, 1)); // Amplify for visual

              // Convert to PCM16
              const pcm16 = float32To16BitPCM(inputData);
              const base64Data = arrayBufferToBase64(pcm16);

              connectPromise.then((session) => {
                 session.sendRealtimeInput({
                    media: {
                        mimeType: 'audio/pcm;rate=16000',
                        data: base64Data
                    }
                 });
              });
            };

            source.connect(processor);
            processor.connect(inputCtx.destination);
            
            sourceRef.current = source;
            processorRef.current = processor;
          },
          onmessage: async (msg: LiveServerMessage) => {
            // Handle Audio Output
            const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData) {
               setIsTalking(true);
               if (!audioContextRef.current) return;
               
               const ctx = audioContextRef.current;
               const rawBytes = base64ToUint8Array(audioData);
               
               // Manual Decode (simplified for PCM output from Gemini if raw)
               // The prompt says Gemini returns raw PCM. 
               // We need to convert Int16 ArrayBuffer to Float32 AudioBuffer
               
               const dataInt16 = new Int16Array(rawBytes.buffer);
               const audioBuffer = ctx.createBuffer(1, dataInt16.length, 24000);
               const channelData = audioBuffer.getChannelData(0);
               for(let i=0; i<dataInt16.length; i++) {
                   channelData[i] = dataInt16[i] / 32768.0;
               }

               const source = ctx.createBufferSource();
               source.buffer = audioBuffer;
               source.connect(ctx.destination);
               
               // Scheduling
               const currentTime = ctx.currentTime;
               const startTime = Math.max(nextStartTimeRef.current, currentTime);
               source.start(startTime);
               nextStartTimeRef.current = startTime + audioBuffer.duration;
               
               source.onended = () => {
                 // rough approximation of when talking stops
                 if (ctx.currentTime >= nextStartTimeRef.current - 0.1) {
                    setIsTalking(false);
                 }
               };
            }
          },
          onclose: () => {
            console.log("Live Session Closed");
            setConnected(false);
          },
          onerror: (err) => {
            console.error("Live Session Error", err);
            setConnected(false);
          }
        }
      });
      
      // Store session to close later if needed
      sessionRef.current = connectPromise;

    } catch (e) {
      console.error("Failed to start voice agent", e);
    }
  };

  const disconnect = () => {
    // Cleanup Audio
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (processorRef.current) processorRef.current.disconnect();
    if (sourceRef.current) sourceRef.current.disconnect();
    if (audioContextRef.current) audioContextRef.current.close();
    
    // Close session
    if (sessionRef.current) {
      sessionRef.current.then((session) => {
        session.close();
      }).catch((e) => {
        console.error("Error closing session", e);
      });
    }
    
    setConnected(false);
    onClose();
  };

  // Start on mount if active
  useEffect(() => {
    if (active) {
        connectToLiveAPI();
    }
    return () => {
        disconnect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 rounded-3xl p-8 w-full max-w-md flex flex-col items-center shadow-2xl border border-slate-700">
        <h2 className="text-white text-xl font-semibold mb-6 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          Live Voice Agent
        </h2>
        
        {/* Visualizer Circle */}
        <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
             {/* Ripple effects */}
             <div className={`absolute inset-0 rounded-full border border-blue-500/30 transition-all duration-100 ease-out`}
                  style={{ transform: `scale(${1 + volume})` }}></div>
             <div className={`absolute inset-0 rounded-full border border-purple-500/20 transition-all duration-150 ease-out`}
                  style={{ transform: `scale(${1 + (volume * 1.5)})` }}></div>
             
             {/* Center Orb */}
             <div className={`w-32 h-32 rounded-full bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-transform duration-200 ${isTalking ? 'scale-110' : 'scale-100'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
             </div>
        </div>

        <p className="text-slate-400 text-center mb-8 h-6">
          {connected ? (isTalking ? `${role} is speaking...` : "Listening...") : "Connecting..."}
        </p>

        <button 
          onClick={disconnect}
          className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-full font-medium transition-colors w-full"
        >
          End Call
        </button>
      </div>
    </div>
  );
};

export default LiveVoiceAgent;