import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality, Blob, FunctionDeclaration, Type } from '@google/genai';
import { Recipe } from '../types';
import { decode, encode, decodeAudioData } from '../utils/audioUtils';
import { MicIcon, MicOffIcon, StopIcon, CheckCircleIcon, FlameIcon, CircleIcon } from './icons';
import { Translation, Language, translations } from '../i18n/translations';

interface CookingAssistantProps {
  recipe: Recipe;
  onFinish: () => void;
  t: Translation;
  language: Language;
}

type TranscriptEntry = {
  speaker: 'user' | 'alchemist';
  text: string;
};

type IngredientState = {
  name: string;
  status: 'PENDING' | 'IN_USE' | 'DONE';
};

const updateIngredientStatusFunction: FunctionDeclaration = {
    name: 'updateIngredientStatus',
    parameters: {
      type: Type.OBJECT,
      description: 'Updates the status of a specific ingredient in the recipe checklist.',
      properties: {
        ingredientName: {
          type: Type.STRING,
          description: 'The name of the ingredient to update. Must be one of the ingredients from the recipe list.',
        },
        status: {
          type: Type.STRING,
          description: "The new status of the ingredient. Should be 'IN_USE' when the user starts actively using it, or 'DONE' when they have finished with it for the recipe.",
        },
      },
      required: ['ingredientName', 'status'],
    },
  };

const CookingAssistant: React.FC<CookingAssistantProps> = ({ recipe, onFinish, t, language }) => {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [ingredients, setIngredients] = useState<IngredientState[]>(
    recipe.ingredients.map(name => ({ name, status: 'PENDING' }))
  );
  
  const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const audioProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const videoStreamIntervalRef = useRef<number | null>(null);
  const videoElementRef = useRef<HTMLVideoElement>(null);
  const canvasElementRef = useRef<HTMLCanvasElement>(null);

  const currentInputTranscriptionRef = useRef('');
  const currentOutputTranscriptionRef = useRef('');
  const nextAudioStartTimeRef = useRef(0);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const stopSession = useCallback(() => {
    if (sessionPromiseRef.current) {
        sessionPromiseRef.current.then(session => session.close());
        sessionPromiseRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if(outputAudioContextRef.current) {
        outputAudioContextRef.current.close();
        outputAudioContextRef.current = null;
    }
    if (videoStreamIntervalRef.current) {
      clearInterval(videoStreamIntervalRef.current);
      videoStreamIntervalRef.current = null;
    }
    audioSourcesRef.current.forEach(source => source.stop());
    audioSourcesRef.current.clear();
    setIsSessionActive(false);
    setIsListening(false);
  }, []);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      stopSession();
    };
  }, [stopSession]);
  
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const startSession = async () => {
    try {
      setError(null);
      setIsListening(true);
      setTranscript([]);
      setIngredients(recipe.ingredients.map(name => ({ name, status: 'PENDING' })));
      currentInputTranscriptionRef.current = '';
      currentOutputTranscriptionRef.current = '';

      mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });

      if (videoElementRef.current) {
        videoElementRef.current.srcObject = mediaStreamRef.current;
      }
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const systemInstruction = translations[language].prompts.cookingAssistantSystem(recipe);

      sessionPromiseRef.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setIsSessionActive(true);
            const source = audioContextRef.current!.createMediaStreamSource(mediaStreamRef.current!);
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            audioProcessorRef.current = scriptProcessor;
            
            scriptProcessor.onaudioprocess = (event) => {
              const inputData = event.inputBuffer.getChannelData(0);
              const pcmBlob: Blob = {
                data: encode(new Uint8Array(new Int16Array(inputData.map(x => x * 32768)).buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              sessionPromiseRef.current?.then(session => session.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);

            videoStreamIntervalRef.current = window.setInterval(() => {
                if(videoElementRef.current && canvasElementRef.current) {
                    const video = videoElementRef.current;
                    const canvas = canvasElementRef.current;
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    canvas.getContext('2d')?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                    canvas.toBlob(async (blob) => {
                        if(blob) {
                            const base64Data = await blobToBase64(blob);
                            sessionPromiseRef.current?.then(session => session.sendRealtimeInput({
                                media: { data: base64Data, mimeType: 'image/jpeg' }
                            }));
                        }
                    }, 'image/jpeg', 0.8);
                }
            }, 1000); // 1 frame per second
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.toolCall) {
                for (const fc of message.toolCall.functionCalls) {
                  if (fc.name === 'updateIngredientStatus') {
                    const { ingredientName, status } = fc.args;
                    setIngredients(prev =>
                      prev.map(ing =>
                        ing.name.toLowerCase() === (ingredientName as string).toLowerCase()
                          ? { ...ing, status: status as IngredientState['status'] }
                          : ing
                      )
                    );
                    sessionPromiseRef.current?.then(session => {
                      session.sendToolResponse({
                        functionResponses: {
                          id: fc.id,
                          name: fc.name,
                          response: { result: 'ok, status updated' },
                        }
                      });
                    });
                  }
                }
              }

            const outputAudio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (outputAudio && outputAudioContextRef.current) {
                const audioBuffer = await decodeAudioData(decode(outputAudio), outputAudioContextRef.current, 24000, 1);
                const source = outputAudioContextRef.current.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(outputAudioContextRef.current.destination);
                const currentTime = outputAudioContextRef.current.currentTime;
                nextAudioStartTimeRef.current = Math.max(nextAudioStartTimeRef.current, currentTime);
                source.start(nextAudioStartTimeRef.current);
                nextAudioStartTimeRef.current += audioBuffer.duration;
                audioSourcesRef.current.add(source);
                source.onended = () => audioSourcesRef.current.delete(source);
            }
            if(message.serverContent?.interrupted){
                audioSourcesRef.current.forEach(source => source.stop());
                audioSourcesRef.current.clear();
                nextAudioStartTimeRef.current = 0;
            }

            if(message.serverContent?.inputTranscription) {
                currentInputTranscriptionRef.current += message.serverContent.inputTranscription.text;
            }
            if(message.serverContent?.outputTranscription) {
                currentOutputTranscriptionRef.current += message.serverContent.outputTranscription.text;
            }
            if(message.serverContent?.turnComplete) {
                const userText = currentInputTranscriptionRef.current.trim();
                const alchemistText = currentOutputTranscriptionRef.current.trim();
                if(userText || alchemistText) {
                    setTranscript(prev => [...prev, {speaker: 'user', text: userText}, {speaker: 'alchemist', text: alchemistText}]);
                }
                currentInputTranscriptionRef.current = '';
                currentOutputTranscriptionRef.current = '';
            }
          },
          onerror: (e: ErrorEvent) => {
            setError(t.error.sessionStartFailed);
            console.error(e);
            stopSession();
          },
          onclose: () => {
            stopSession();
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          tools: [{ functionDeclarations: [updateIngredientStatusFunction] }],
          systemInstruction,
        },
      });
    } catch (err) {
      setError(t.error.sessionStartFailed);
      console.error(err);
      setIsListening(false);
    }
  };
  
  const getIngredientRow = (ing: IngredientState) => {
    const statusStyles = {
        PENDING: 'text-gray-400',
        IN_USE: 'text-green-300 font-semibold animate-pulse',
        DONE: 'text-gray-500 line-through',
    };
    const Icon = {
        PENDING: CircleIcon,
        IN_USE: FlameIcon,
        DONE: CheckCircleIcon,
    }[ing.status];

    return (
        <li className={`flex items-center gap-3 transition-all duration-300 ${statusStyles[ing.status]}`}>
            <Icon />
            <span>{ing.name}</span>
        </li>
    );
  }

  return (
    <div className="w-full max-w-6xl h-[80vh] flex flex-col bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700 p-4 md:p-6">
       <div className="flex justify-between items-center mb-4 flex-shrink-0">
        <h2 className="text-2xl font-bold font-display">{t.cookingAssistant.title}</h2>
        <button onClick={onFinish} className="px-4 py-2 bg-gray-700/50 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600/70 transition-colors">
            {t.cookingAssistant.finishButton}
        </button>
      </div>

      <div className="flex-grow grid grid-cols-1 md:grid-cols-5 gap-4 overflow-hidden">
        <div className="md:col-span-3 flex flex-col bg-gray-900/40 rounded-lg p-4">
            <div className="flex-grow overflow-y-auto pr-2 space-y-4">
                {transcript.map((entry, index) => (
                    entry.text && <div key={index} className={`flex flex-col ${entry.speaker === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`px-4 py-2 rounded-2xl max-w-[80%] ${entry.speaker === 'user' ? 'bg-indigo-600 rounded-br-none' : 'bg-gray-700 rounded-bl-none'}`}>
                           <p>{entry.text}</p>
                        </div>
                    </div>
                ))}
            </div>
            {!isSessionActive && (
              <div className="text-center p-4">
                <button
                  onClick={startSession}
                  className="px-8 py-4 bg-gradient-to-r from-green-400 to-teal-500 text-white font-bold rounded-full shadow-lg hover:scale-105 transform transition-transform flex items-center gap-2 mx-auto"
                >
                  <MicIcon /> {t.cookingAssistant.startButton}
                </button>
              </div>
            )}
             {isSessionActive && (
              <div className="text-center p-4">
                <button
                  onClick={stopSession}
                  className="px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold rounded-full shadow-lg hover:scale-105 transform transition-transform flex items-center gap-2 mx-auto"
                >
                  <StopIcon /> {t.cookingAssistant.endButton}
                </button>
              </div>
            )}
        </div>
        <div className="md:col-span-2 flex flex-col gap-4 overflow-hidden">
            <div className="bg-gray-900/40 rounded-lg p-2 flex flex-col items-center justify-center">
                <video ref={videoElementRef} autoPlay muted className="w-full h-auto max-h-64 object-cover rounded-lg transform -scale-x-100"></video>
                <canvas ref={canvasElementRef} className="hidden"></canvas>
                <div className={`mt-2 p-2 rounded-full transition-colors ${isListening ? 'bg-green-500/50' : 'bg-gray-600'}`}>
                    {isListening ? <MicIcon /> : <MicOffIcon />}
                </div>
            </div>
            <div className="bg-gray-900/40 rounded-lg p-4 flex-grow overflow-y-auto">
                <h3 className="text-xl font-bold mb-3 font-display text-purple-300">{t.cookingAssistant.ingredientsChecklist}</h3>
                <ul className="space-y-2">
                    {ingredients.map((ing, index) => (
                       <React.Fragment key={index}>{getIngredientRow(ing)}</React.Fragment>
                    ))}
                </ul>
            </div>
        </div>
      </div>
       {error && <p className="text-red-400 text-center mt-2">{error}</p>}
    </div>
  );
};

export default CookingAssistant;
