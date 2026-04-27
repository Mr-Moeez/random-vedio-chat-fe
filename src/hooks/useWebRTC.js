import { useEffect, useRef } from "react";

export function useWebRTC({
  socketSend,
  lastEvent,
  stream,
  isInitiator,
  callSessionId,
}) {
  const peerRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const hasCreatedOfferRef = useRef(false);
  const pendingCandidatesRef = useRef([]);
  const pendingEventsRef = useRef([]); 
  
  const resetPeer = () => {
    if (peerRef.current) {
      console.log("WEBRTC: resetting old peer");
      peerRef.current.ontrack = null;
      peerRef.current.onicecandidate = null;
      peerRef.current.onconnectionstatechange = null;
      peerRef.current.oniceconnectionstatechange = null;
      peerRef.current.close();
      peerRef.current = null;
    }

    hasCreatedOfferRef.current = false;
    pendingCandidatesRef.current = [];

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    if (!stream || !callSessionId) {
      resetPeer();
      return;
    }

    resetPeer();

    console.log("WEBRTC: creating peer", { isInitiator, callSessionId });

    const peer = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    peerRef.current = peer;

    stream.getTracks().forEach((track) => {
      peer.addTrack(track, stream);
    });

    peer.ontrack = (event) => {
      console.log("WEBRTC: remote stream received", event.streams);

      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    peer.onicecandidate = (event) => {
      if (!event.candidate) return;

      console.log("WEBRTC: sending ICE");

      socketSend({
        type: "ice_candidate",
        candidate: event.candidate,
      });
    };

    peer.onconnectionstatechange = () => {
      console.log("WEBRTC connection:", peer.connectionState);
    };

    peer.oniceconnectionstatechange = () => {
      console.log("ICE connection:", peer.iceConnectionState);
    };

    if (isInitiator) {
      createOffer(peer);
    }

    return () => {
      resetPeer();
    };
  }, [stream, callSessionId, isInitiator, socketSend]);

  useEffect(() => {
    if (
      lastEvent?.type === "call_ended" ||
      lastEvent?.type === "matching_stopped" ||
      lastEvent?.type === "user_disconnected"
    ) {
      resetPeer();
    }
  }, [lastEvent]);

  useEffect(() => {
    if (!lastEvent) return;

    const peer = peerRef.current;

    if (!peer) {
      console.log("WEBRTC: peer not ready, queueing", lastEvent.type);
      pendingEventsRef.current.push(lastEvent);
      return;
    }

    async function handleEvent() {
      try {
        if (lastEvent.type === "offer") {
          console.log("WEBRTC: received offer");

          await peer.setRemoteDescription(
            new RTCSessionDescription(lastEvent.sdp)
          );

          const answer = await peer.createAnswer();
          await peer.setLocalDescription(answer);

          console.log("WEBRTC: sending answer");

          socketSend({
            type: "answer",
            sdp: answer,
          });

          for (const candidate of pendingCandidatesRef.current) {
            await peer.addIceCandidate(new RTCIceCandidate(candidate));
          }

          pendingCandidatesRef.current = [];
          return;
        }

        if (lastEvent.type === "answer") {
          console.log("WEBRTC: received answer");

          if (!peer.currentRemoteDescription) {
            await peer.setRemoteDescription(
              new RTCSessionDescription(lastEvent.sdp)
            );
          }

          return;
        }

        if (lastEvent.type === "ice_candidate") {
          console.log("WEBRTC: received ICE");

          if (peer.remoteDescription) {
            await peer.addIceCandidate(
              new RTCIceCandidate(lastEvent.candidate)
            );
          } else {
            pendingCandidatesRef.current.push(lastEvent.candidate);
          }
        }
      } catch (error) {
        console.error("WEBRTC error:", error);
      }
    }

    handleEvent();
  }, [lastEvent, socketSend]);

  async function createOffer(peer) {
    if (hasCreatedOfferRef.current) return;

    hasCreatedOfferRef.current = true;

    console.log("WEBRTC: creating offer");

    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);

    console.log("WEBRTC: sending offer");

    socketSend({
      type: "offer",
      sdp: offer,
    });
  }

  return {
    remoteVideoRef,
  };
}