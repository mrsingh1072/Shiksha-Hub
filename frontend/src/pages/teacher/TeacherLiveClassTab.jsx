import React, { useState, useEffect, useRef } from "react";
import { Video, Mic, MicOff, VideoOff, Monitor, XCircle, AlertTriangle, Settings, RefreshCcw } from "lucide-react";
import teacherService from "../../services/teacherService";

export default function TeacherLiveClassTab({ classId }) {
  const [isLive, setIsLive] = useState(false);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Device & Permission State
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [permissionError, setPermissionError] = useState("");
  
  // Device Selection State
  const [cameras, setCameras] = useState([]);
  const [mics, setMics] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState("");
  const [selectedMicId, setSelectedMicId] = useState("");

  // Audio Level State
  const [audioLevel, setAudioLevel] = useState(0);

  // WebRTC Phase 2 Stats
  const [connectedStudents, setConnectedStudents] = useState(0);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const originalVideoTrackRef = useRef(null); 
  
  // Audio Context Refs
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const microphoneRef = useRef(null);
  const animationFrameRef = useRef(null);

  // WebRTC Refs
  const wsRef = useRef(null);
  const peerConnections = useRef({}); // { [studentId]: RTCPeerConnection }

  useEffect(() => {
    checkStatus();
    return () => {
      stopAllMedia();
      closeWebRTC();
    };
  }, [classId]);

  const checkStatus = async () => {
    try {
      const res = await teacherService.getLiveClassStatus(classId);
      if (res.data.session && res.data.session.status === "live") {
        setSession(res.data.session);
        setIsLive(true);
      }
    } catch (err) {
      console.error("Failed to fetch live status:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(d => d.kind === 'videoinput');
      const audioDevices = devices.filter(d => d.kind === 'audioinput');
      
      setCameras(videoDevices);
      setMics(audioDevices);
      
      if (videoDevices.length > 0 && !selectedCameraId) setSelectedCameraId(videoDevices[0].deviceId);
      if (audioDevices.length > 0 && !selectedMicId) setSelectedMicId(audioDevices[0].deviceId);
    } catch (err) {
      console.error("Failed to enumerate devices:", err);
    }
  };

  const setupAudioMeter = (stream) => {
    if (!window.AudioContext && !window.webkitAudioContext) return;
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioContext();
    audioContextRef.current = audioContext;
    
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyserRef.current = analyser;
    
    try {
      const microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(analyser);
      microphoneRef.current = microphone;
      
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      const updateLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        setAudioLevel(average);
        
        animationFrameRef.current = requestAnimationFrame(updateLevel);
      };
      
      updateLevel();
    } catch (err) {
      console.error("Failed to setup audio meter:", err);
    }
  };

  const stopAudioMeter = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(console.error);
      audioContextRef.current = null;
    }
    setAudioLevel(0);
  };

  const stopAllMedia = (skipVideoRefClear = false) => {
    console.log("[Media] Media stream stopped");
    stopAudioMeter();
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (originalVideoTrackRef.current) {
      originalVideoTrackRef.current.stop();
      originalVideoTrackRef.current = null;
    }
    if (!skipVideoRefClear && videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const closeWebRTC = () => {
      if (wsRef.current) {
          wsRef.current.close();
          wsRef.current = null;
      }
      Object.values(peerConnections.current).forEach(pc => pc.close());
      peerConnections.current = {};
      setConnectedStudents(0);
  };

  const updatePeerTracks = (stream) => {
      Object.values(peerConnections.current).forEach(pc => {
          const senders = pc.getSenders();
          stream.getTracks().forEach(track => {
              const sender = senders.find(s => s.track && s.track.kind === track.kind);
              if (sender) {
                  sender.replaceTrack(track);
              }
          });
      });
  };

  const startLiveClass = async (useSpecificDevices = false) => {
    try {
      setPermissionError("");
      setLoading(true);
      console.log("[Media] Requesting permissions...");
      
      const constraints = {
        video: useSpecificDevices && selectedCameraId ? { deviceId: { exact: selectedCameraId } } : true,
        audio: useSpecificDevices && selectedMicId ? { deviceId: { exact: selectedMicId } } : true
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      console.log("[Media] Camera permission granted");
      console.log("[Media] Microphone permission granted");
      
      const videoTracks = stream.getVideoTracks();
      const audioTracks = stream.getAudioTracks();
      
      console.log(`[Media] Video tracks found: ${videoTracks.length}`);
      console.log(`[Media] Audio tracks found: ${audioTracks.length}`);
      
      streamRef.current = stream;
      
      await loadDevices();
      setupAudioMeter(stream);
      
      if (!isLive) {
        const res = await teacherService.startLiveClass(classId);
        setSession(res.data.session);
        setIsLive(true);
      } else {
        // If already live (e.g. switching devices), we just hot-swap tracks in WebRTC
        updatePeerTracks(stream);
      }
      
      setCameraEnabled(true);
      setMicEnabled(true);
      setIsScreenSharing(false);
      
    } catch (err) {
      console.error("[Media] Initialization failed:", err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionError("Camera or Microphone permission was denied. Please allow access in your browser settings.");
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setPermissionError("No camera or microphone found. Please connect a device.");
      } else {
        setPermissionError("An error occurred while accessing media devices: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const endLiveClass = async () => {
    if (!window.confirm("Are you sure you want to end the live class?")) return;
    try {
      await teacherService.endLiveClass(classId);
      stopAllMedia();
      closeWebRTC();
      setIsLive(false);
      setSession(null);
    } catch (err) {
      console.error(err);
      alert("Failed to end live class.");
    }
  };

  const toggleMic = () => {
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = !track.enabled;
      });
      setMicEnabled(!micEnabled);
      console.log(`[Media] Mic toggle: ${!micEnabled ? 'ON' : 'OFF'}`);
    }
  };

  const toggleCamera = () => {
    if (isScreenSharing) return; 
    if (streamRef.current) {
      const videoTracks = streamRef.current.getVideoTracks();
      videoTracks.forEach((track) => {
        track.enabled = !track.enabled;
      });
      setCameraEnabled(!cameraEnabled);
      console.log(`[Media] Camera toggle: ${!cameraEnabled ? 'ON' : 'OFF'}`);
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (isScreenSharing) {
        const videoTracks = streamRef.current.getVideoTracks();
        videoTracks.forEach(track => track.stop()); 
        
        streamRef.current.removeTrack(videoTracks[0]);
        if (originalVideoTrackRef.current) {
            streamRef.current.addTrack(originalVideoTrackRef.current);
            originalVideoTrackRef.current.enabled = cameraEnabled;
        }
        
        updatePeerTracks(streamRef.current);
        setIsScreenSharing(false);
        console.log("[Media] Screen sharing stopped. Reverted to camera.");
      } else {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const displayTrack = displayStream.getVideoTracks()[0];
        
        const currentVideoTrack = streamRef.current.getVideoTracks()[0];
        originalVideoTrackRef.current = currentVideoTrack;
        
        streamRef.current.removeTrack(currentVideoTrack);
        streamRef.current.addTrack(displayTrack);
        
        updatePeerTracks(streamRef.current);
        
        displayTrack.onended = () => {
            streamRef.current.removeTrack(displayTrack);
            if (originalVideoTrackRef.current) {
                streamRef.current.addTrack(originalVideoTrackRef.current);
                originalVideoTrackRef.current.enabled = cameraEnabled;
            }
            updatePeerTracks(streamRef.current);
            setIsScreenSharing(false);
            console.log("[Media] Screen sharing ended externally. Reverted to camera.");
        };
        
        setIsScreenSharing(true);
        console.log("[Media] Screen sharing started.");
      }
    } catch (err) {
      console.error("[Media] Screen sharing error:", err);
    }
  };

  const switchDevice = async () => {
    if (isLive && !isScreenSharing) {
      console.log(`[Media] Switching device. Camera: ${selectedCameraId}, Mic: ${selectedMicId}`);
      stopAllMedia(true);
      await startLiveClass(true);
    }
  };

  // Phase 2 WebRTC Signaling Effect
  useEffect(() => {
      if (isLive && !wsRef.current) {
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          const teacherEmail = user.email || "teacher";
          
          const wsUrl = `ws://localhost:8000/live/ws/${classId}/teacher/${teacherEmail}`;
          const ws = new WebSocket(wsUrl);
          wsRef.current = ws;

          ws.onopen = () => console.log("[WebRTC] Teacher connected to signaling server");
          
          ws.onmessage = async (event) => {
              const msg = JSON.parse(event.data);
              
              if (msg.type === "join_student") {
                  const studentId = msg.student_id;
                  console.log(`[WebRTC] Student ${studentId} joined. Connecting...`);
                  
                  const pc = new RTCPeerConnection({
                      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
                  });
                  peerConnections.current[studentId] = pc;
                  
                  if (streamRef.current) {
                      streamRef.current.getTracks().forEach(track => {
                          pc.addTrack(track, streamRef.current);
                      });
                  }
                  
                  pc.onicecandidate = (e) => {
                      if (e.candidate && wsRef.current) {
                          wsRef.current.send(JSON.stringify({
                              type: "ice-candidate",
                              target_id: studentId,
                              candidate: e.candidate
                          }));
                      }
                  };
                  
                  const offer = await pc.createOffer();
                  await pc.setLocalDescription(offer);
                  
                  wsRef.current.send(JSON.stringify({
                      type: "offer",
                      target_id: studentId,
                      sdp: offer
                  }));
                  
                  setConnectedStudents(Object.keys(peerConnections.current).length);
                  
              } else if (msg.type === "answer") {
                  const pc = peerConnections.current[msg.sender_id];
                  if (pc) {
                      await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
                  }
              } else if (msg.type === "ice-candidate") {
                  const pc = peerConnections.current[msg.sender_id];
                  if (pc) {
                      await pc.addIceCandidate(new RTCIceCandidate(msg.candidate));
                  }
              } else if (msg.type === "leave_student") {
                  const pc = peerConnections.current[msg.student_id];
                  if (pc) {
                      pc.close();
                      delete peerConnections.current[msg.student_id];
                      setConnectedStudents(Object.keys(peerConnections.current).length);
                      console.log(`[WebRTC] Student ${msg.student_id} left.`);
                  }
              }
          };

          ws.onclose = () => {
              console.log("[WebRTC] Signaling server disconnected.");
              wsRef.current = null;
          };
      }
  }, [isLive, classId]);

  // Video Element Binding Effect
  useEffect(() => {
      if (isLive && videoRef.current && streamRef.current) {
          console.log("[Media] Media stream attached (useEffect)");
          videoRef.current.srcObject = streamRef.current;
          videoRef.current.onloadedmetadata = () => {
              videoRef.current.play().then(() => {
                  console.log("[Media] Video playing (useEffect)");
              }).catch(e => console.error("Play error:", e));
          };
      }
  }, [isLive]);

  if (loading) {
    return <div className="text-center py-10">Loading Live Session...</div>;
  }

  return (
    <div className="space-y-6">
      
      {permissionError && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start justify-between">
          <div className="flex gap-3">
            <AlertTriangle className="shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="font-bold">Media Permission Error</h3>
              <p className="text-sm mt-1">{permissionError}</p>
            </div>
          </div>
          <button onClick={() => startLiveClass()} className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700">
            <RefreshCcw size={14} /> Retry
          </button>
        </div>
      )}

      <div className="flex justify-between items-center bg-white p-4 rounded-xl border shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            Live Class 
            {isLive ? (
              <span className="flex items-center gap-1 text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full uppercase animate-pulse">
                <span className="w-2 h-2 rounded-full bg-red-600"></span> Live Now
              </span>
            ) : (
              <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full uppercase">
                Not Started
              </span>
            )}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Stream high-quality video, audio, and share your screen with students.
          </p>
        </div>
        {!isLive && !permissionError && (
          <button 
            onClick={() => startLiveClass()}
            className="flex items-center gap-2 bg-red-500 text-white px-6 py-2 rounded-xl font-semibold hover:bg-red-600 transition shadow-sm"
          >
            <Video size={18} /> Start Live Class
          </button>
        )}
      </div>

      {isLive && (
        <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-lg border border-gray-800 relative flex flex-col">
          
          <div className="aspect-video w-full relative bg-black flex items-center justify-center">
            <video 
              ref={videoRef}
              autoPlay 
              muted 
              playsInline
              className={`w-full h-full object-cover ${!isScreenSharing ? "scale-x-[-1]" : ""}`}
            />
            
            {(!cameraEnabled && !isScreenSharing) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-gray-500">
                <VideoOff size={48} className="mb-2 opacity-50" />
                <p>Camera is off</p>
              </div>
            )}
            
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              <div className="flex gap-2">
                  <span className="bg-black/60 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm border border-white/10 flex items-center gap-2 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                    LIVE
                  </span>
                  {isScreenSharing && (
                    <span className="bg-blue-500/80 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm shadow-sm flex items-center gap-1">
                      <Monitor size={12}/> Screen Shared
                    </span>
                  )}
              </div>
              <span className="bg-black/60 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm border border-white/10 shadow-sm w-max font-medium">
                {connectedStudents} Student{connectedStudents !== 1 ? 's' : ''} Watching
              </span>
            </div>
            
            <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
              {micEnabled ? (
                <>
                  <Mic size={14} className="text-green-400" />
                  <div className="flex items-end gap-0.5 h-3">
                    <div className="w-1 bg-green-400 rounded-t-sm transition-all duration-75" style={{ height: Math.max(2, (audioLevel / 255) * 12) + 'px' }}></div>
                    <div className="w-1 bg-green-400 rounded-t-sm transition-all duration-75" style={{ height: Math.max(2, (audioLevel / 200) * 12) + 'px' }}></div>
                    <div className="w-1 bg-green-400 rounded-t-sm transition-all duration-75" style={{ height: Math.max(2, (audioLevel / 150) * 12) + 'px' }}></div>
                  </div>
                </>
              ) : (
                <>
                  <MicOff size={14} className="text-red-500" />
                  <span className="text-xs text-red-500 font-semibold">Muted</span>
                </>
              )}
            </div>
          </div>

          <div className="bg-gray-800 p-4 flex justify-between items-center border-t border-gray-700 flex-wrap gap-4">
            <div className="flex gap-3">
              <button 
                onClick={toggleMic}
                className={`p-3 rounded-full transition shadow-sm ${micEnabled ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-red-500/20 text-red-500 hover:bg-red-500/30"}`}
                title={micEnabled ? "Mute Microphone" : "Unmute Microphone"}
              >
                {micEnabled ? <Mic size={20} /> : <MicOff size={20} />}
              </button>
              
              <button 
                onClick={toggleCamera}
                disabled={isScreenSharing}
                className={`p-3 rounded-full transition shadow-sm ${cameraEnabled ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-red-500/20 text-red-500 hover:bg-red-500/30"} ${isScreenSharing ? "opacity-50 cursor-not-allowed" : ""}`}
                title={cameraEnabled ? "Turn Off Camera" : "Turn On Camera"}
              >
                {cameraEnabled ? <Video size={20} /> : <VideoOff size={20} />}
              </button>
              
              <button 
                onClick={toggleScreenShare}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition shadow-sm ${isScreenSharing ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-gray-700 text-white hover:bg-gray-600"}`}
              >
                <Monitor size={18} /> {isScreenSharing ? "Stop Sharing" : "Share Screen"}
              </button>
            </div>
            
            <div className="flex gap-2 items-center text-xs text-gray-400">
                <div className="flex flex-col gap-1">
                  <select 
                    className="bg-gray-900 border border-gray-700 rounded px-2 py-1 max-w-[150px] truncate outline-none focus:border-gray-500"
                    value={selectedCameraId}
                    onChange={(e) => setSelectedCameraId(e.target.value)}
                    disabled={isScreenSharing}
                  >
                    {cameras.map(c => <option key={c.deviceId} value={c.deviceId}>{c.label || 'Camera'}</option>)}
                  </select>
                  <select 
                    className="bg-gray-900 border border-gray-700 rounded px-2 py-1 max-w-[150px] truncate outline-none focus:border-gray-500"
                    value={selectedMicId}
                    onChange={(e) => setSelectedMicId(e.target.value)}
                  >
                    {mics.map(m => <option key={m.deviceId} value={m.deviceId}>{m.label || 'Microphone'}</option>)}
                  </select>
                </div>
                <button 
                  onClick={switchDevice} 
                  disabled={isScreenSharing}
                  className="bg-gray-700 p-2 rounded hover:bg-gray-600 transition disabled:opacity-50"
                  title="Apply Device Change"
                >
                  <Settings size={14} />
                </button>
            </div>
            
            <button 
              onClick={endLiveClass}
              className="flex items-center gap-2 bg-red-500 text-white px-6 py-2 rounded-xl font-bold hover:bg-red-600 transition shadow-sm ml-auto"
            >
              <XCircle size={18} /> End Class
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
