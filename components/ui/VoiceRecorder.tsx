"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Square, Play, Pause, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface VoiceRecorderProps {
  onRecordingComplete?: (audioBlob: Blob) => void;
  onRecordingRemove?: () => void;
  className?: string;
}

export default function VoiceRecorder({
  onRecordingComplete,
  onRecordingRemove,
  className = "",
}: VoiceRecorderProps) {
  const { locale } = useLanguage();
  const isArabic = locale === "ar";
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        setAudioBlob(audioBlob);
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        if (onRecordingComplete) {
          onRecordingComplete(audioBlob);
        }
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert(
        isArabic
          ? "فشل الوصول إلى الميكروفون. يرجى التحقق من الصلاحيات."
          : "Failed to access microphone. Please check permissions."
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
  };

  const playRecording = () => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const pausePlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const removeRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    setIsPlaying(false);
    if (onRecordingRemove) {
      onRecordingRemove();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {!audioBlob ? (
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6">
          <div className="flex flex-col items-center gap-4">
            {!isRecording ? (
              <>
                <div className="bg-primary/10 p-4 rounded-full">
                  <Mic className="w-8 h-8 text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-900 mb-2">
                    {isArabic
                      ? "تسجيل صوتي للتعديل"
                      : "Voice Recording for Modification"}
                  </p>
                  <p className="text-xs text-gray-600">
                    {isArabic
                      ? "انقر لبدء التسجيل الصوتي"
                      : "Click to start voice recording"}
                  </p>
                </div>
                <Button
                  onClick={startRecording}
                  className="bg-primary text-black hover:bg-primary/90 rounded-lg"
                >
                  <Mic className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
                  {isArabic ? "بدء التسجيل" : "Start Recording"}
                </Button>
              </>
            ) : (
              <>
                <div className="bg-red-500/10 p-4 rounded-full animate-pulse">
                  <Mic className="w-8 h-8 text-red-500" />
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-500 mb-2">
                    {formatTime(recordingTime)}
                  </p>
                  <p className="text-xs text-gray-600">
                    {isArabic ? "جاري التسجيل..." : "Recording..."}
                  </p>
                </div>
                <div className="flex gap-2">
                  {isPaused ? (
                    <Button
                      onClick={resumeRecording}
                      variant="outline"
                      className="rounded-lg"
                    >
                      <Play className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
                      {isArabic ? "استئناف" : "Resume"}
                    </Button>
                  ) : (
                    <Button
                      onClick={pauseRecording}
                      variant="outline"
                      className="rounded-lg"
                    >
                      <Pause className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
                      {isArabic ? "إيقاف مؤقت" : "Pause"}
                    </Button>
                  )}
                  <Button
                    onClick={stopRecording}
                    className="bg-red-500 text-white hover:bg-red-600 rounded-lg"
                  >
                    <Square className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
                    {isArabic ? "إيقاف" : "Stop"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="border border-gray-300 rounded-xl p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Mic className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">
                  {isArabic ? "تسجيل صوتي" : "Voice Recording"}
                </p>
                <p className="text-xs text-gray-600">
                  {formatTime(recordingTime)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <audio
                ref={audioRef}
                src={audioUrl || undefined}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />
              {isPlaying ? (
                <Button
                  onClick={pausePlayback}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                >
                  <Pause className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={playRecording}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                >
                  <Play className="w-4 h-4" />
                </Button>
              )}
              <Button
                onClick={removeRecording}
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
