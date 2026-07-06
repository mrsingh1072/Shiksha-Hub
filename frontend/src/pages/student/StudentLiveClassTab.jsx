import React, { useState, useEffect, useRef } from "react";
import { VideoOff, Monitor, Radio } from "lucide-react";
import api from "../../services/api";

export default function StudentLiveClassTab({ classId }) {
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const videoRef = useRef(null);
  const wsRef = useRef(null);
  const pcRef = useRef(null);

  // Poll for live status
  useEffect(() => {
    checkStatus();
    
    // Poll every 10 seconds to see if teacher goes live
    const interval = setInterval(checkStatus, 10000);
    return () => clearInterval(interval);
  }, [classId]);

  const checkStatus = async () => {
    try {
      const res = await api.get(`/student/classes/${classId}/live`);
      if (res.data.session && res.data.session.status === "live") {
        if (!isLive) setIsLive(true);
      } else {
        if (isLive) setIsLive(false);
      }
    } catch (err) {
      console.error("Failed to fetch live status:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLive) {
      connectWebRTC();
    }
    
    return () => {
      closeWebRTC();
    };
  }, [isLive, classId]);

  const connectWebRTC = () => {
    if (wsRef.current) return;
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const studentEmail = user.email || `student_${Math.random().toString(36).substr(2, 6)}`;
    
    const wsUrl = `ws://localhost:8000/live/ws/${classId}/student/${studentEmail}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
        console.log("[WebRTC] Student connected to signaling server.");
        ws.send(JSON.stringify({ type: "join" })); // Basic presence heartbeat
    };
    
    ws.onmessage = async (event) => {
        const msg = JSON.parse(event.data);
        
        if (msg.type === "offer") {
            const teacherId = msg.sender_id;
            console.log(`[WebRTC] Received offer from teacher ${teacherId}`);
            
            if (pcRef.current) {
                pcRef.current.close();
            }
            
            const pc = new RTCPeerConnection({
                iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
            });
            pcRef.current = pc;
            
            pc.ontrack = (event) => {
                console.log("[WebRTC] Received remote track:", event.track.kind);
                if (videoRef.current) {
                    if (videoRef.current.srcObject !== event.streams[0]) {
                        videoRef.current.srcObject = event.streams[0];
                        videoRef.current.onloadedmetadata = () => {
                            videoRef.current.play().catch(e => console.error("Play error:", e));
                        };
                    }
                }
            };
            
            pc.onicecandidate = (e) => {
                if (e.candidate && wsRef.current) {
                    wsRef.current.send(JSON.stringify({
                        type: "ice-candidate",
                        target_id: teacherId,
                        candidate: e.candidate
                    }));
                }
            };
            
            await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            
            wsRef.current.send(JSON.stringify({
                type: "answer",
                target_id: teacherId,
                sdp: answer
            }));
            
        } else if (msg.type === "ice-candidate") {
            if (pcRef.current) {
                await pcRef.current.addIceCandidate(new RTCIceCandidate(msg.candidate));
            }
        }
    };
    
    ws.onclose = () => {
        console.log("[WebRTC] Signaling server disconnected.");
        wsRef.current = null;
    };
    
    ws.onerror = (err) => {
        console.error("[WebRTC] WebSocket error", err);
        setError("Connection error. Retrying...");
    };
  };

  const closeWebRTC = () => {
      if (wsRef.current) {
          wsRef.current.close();
          wsRef.current = null;
      }
      if (pcRef.current) {
          pcRef.current.close();
          pcRef.current = null;
      }
      if (videoRef.current) {
          videoRef.current.srcObject = null;
      }
  };

  if (loading) {
    return <div className="text-center py-10">Checking Live Session...</div>;
  }

  if (!isLive) {
      return (
        <div className="bg-white p-12 rounded-xl border shadow-sm flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                <VideoOff size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">No Live Class in Session</h2>
            <p className="text-gray-500 mt-2 max-w-md">
                The teacher has not started the live class yet. This page will automatically update when the broadcast begins.
            </p>
        </div>
      );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            Live Class 
            <span className="flex items-center gap-1 text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full uppercase animate-pulse">
                <span className="w-2 h-2 rounded-full bg-red-600"></span> Live Now
            </span>
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            You are viewing the teacher's live broadcast.
          </p>
        </div>
        
        {error && (
            <span className="text-sm text-red-500 font-medium bg-red-50 px-3 py-1 rounded border border-red-100">
                {error}
            </span>
        )}
      </div>

      <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-lg border border-gray-800 relative flex flex-col">
        <div className="aspect-video w-full relative bg-black flex items-center justify-center">
            <video 
                ref={videoRef}
                autoPlay 
                playsInline
                className="w-full h-full object-cover"
            />
            
            {/* Fallback if video hasn't loaded */}
            {!videoRef.current?.srcObject && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                    <Radio size={48} className="mb-4 animate-pulse text-blue-500/50" />
                    <p className="animate-pulse">Connecting to broadcast...</p>
                </div>
            )}
            
            <div className="absolute top-4 left-4 flex gap-2">
                <span className="bg-black/60 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm border border-white/10 flex items-center gap-2 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                    LIVE
                </span>
            </div>
        </div>
        
        <div className="bg-gray-800 p-4 border-t border-gray-700 flex justify-between">
            <div className="flex gap-2">
                {/* Audio is automatically played via the video element. We could add a volume slider here if needed. */}
            </div>
        </div>
      </div>
    </div>
  );
}
