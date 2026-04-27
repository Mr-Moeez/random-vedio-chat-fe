import { useEffect, useRef, useState } from "react";

export function useMediaStream() {
  const videoRef = useRef(null);

  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let localStream;

    async function initMedia() {
      try {
        setLoading(true);

        localStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        setStream(localStream);

        if (videoRef.current) {
          videoRef.current.srcObject = localStream;
        }
      } catch (err) {
        console.error("Media error:", err);
        setError("Camera/Microphone access denied");
      } finally {
        setLoading(false);
      }
    }

    initMedia();

    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return {
    videoRef,
    stream,
    error,
    loading,
  };
}