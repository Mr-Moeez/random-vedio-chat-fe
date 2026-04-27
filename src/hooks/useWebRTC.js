import { useEffect, useRef } from "react";

export function useWebRTC({
  socketSend,
  socketRegister,
  stream,
  isInitiator,
  callSessionId,
}) {
  const peerRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pendingEventsRef = useRef([]);
  const hasCreatedOfferRef = useRef(false);

  const resetConnection = () => {
    console.log("WEBRTC: FULL RESET");

    if (peerRef.current) {
      peerRef.current.ontrack = null;
      peerRef.current.onicecandidate = null;
      peerRef.current.close();
      peerRef.current = null;
    }

    hasCreatedOfferRef.current = false;
    pendingEventsRef.current = [];

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    if (!socketRegister) return;

    socketRegister(async (event) => {
      const peer = peerRef.current;

      if (!peer) {
        pendingEventsRef.current.push(event);
        return;
      }

      await handleSignalEvent(peer, event);
    });
  }, [socketRegister]);

  useEffect(() => {
    if (!stream || !callSessionId) {
      resetConnection();
      return;
    }

    resetConnection();

    const peer = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    peerRef.current = peer;
    hasCreatedOfferRef.current = false;

    console.log("WEBRTC: peer created", { isInitiator });

    stream.getTracks().forEach((track) => {
      peer.addTrack(track, stream);
    });

    peer.ontrack = (event) => {
      const videoEl = remoteVideoRef.current;
      if (!videoEl) return;

      const stream = event.streams[0];
      if (!stream) return;

      // 🔥 HARD RESET VIDEO
      videoEl.srcObject = null;

      setTimeout(() => {
        videoEl.srcObject = stream;

        videoEl.onloadedmetadata = () => {
          videoEl.play().catch(() => { });
        };
      }, 0);
    };

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socketSend({
          type: "ice_candidate",
          candidate: event.candidate,
        });
      }
    };

    if (isInitiator) {
      createOffer(peer);
    }

    pendingEventsRef.current.forEach((e) =>
      handleSignalEvent(peer, e)
    );
    pendingEventsRef.current = [];

    return () => {
      resetConnection(); // 🔥 CRITICAL CLEANUP
    };
  }, [stream, callSessionId, isInitiator]);

  async function handleSignalEvent(peer, event) {
    try {
      if (event.type === "offer") {
        console.log("RECEIVED OFFER");

        await peer.setRemoteDescription(
          new RTCSessionDescription(event.sdp)
        );

        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);

        socketSend({ type: "answer", sdp: answer });
      }

      if (event.type === "answer") {
        console.log("RECEIVED ANSWER");

        await peer.setRemoteDescription(
          new RTCSessionDescription(event.sdp)
        );
      }

      if (event.type === "ice_candidate") {
        if (peer.remoteDescription) {
          await peer.addIceCandidate(
            new RTCIceCandidate(event.candidate)
          );
        } else {
          pendingEventsRef.current.push(event);
        }
      }
    } catch (err) {
      console.error("WEBRTC ERROR:", err);
    }
  }

  async function createOffer(peer) {
    if (hasCreatedOfferRef.current) return;

    hasCreatedOfferRef.current = true;

    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);

    socketSend({ type: "offer", sdp: offer });
  }

  return { remoteVideoRef };
}
