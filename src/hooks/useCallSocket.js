import { useEffect, useRef, useState } from "react";

export function useCallSocket() {
    const socketRef = useRef(null);
    const onSignalEventRef = useRef(null);

    const [status, setStatus] = useState("idle");
    const [partner, setPartner] = useState(null);
    const [callSessionId, setCallSessionId] = useState(null);
    const [isInitiator, setIsInitiator] = useState(false);

    useEffect(() => {
        connectSocket();
        return () => disconnectSocket();
    }, []);

    const connectSocket = () => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            setStatus("missing_token");
            return;
        }
        const ws = new WebSocket(
            `${import.meta.env.VITE_WS_BASE_URL}/call/?token=${token}`
        );

        socketRef.current = ws;

        ws.onopen = () => {
            console.log("WS OPEN");
        };

        ws.onmessage = (event) => {
            const raw = JSON.parse(event.data);

            let data = raw;

            // normalize backend signal
            if (raw.type === "signal_event") {
                data = {
                    ...raw.payload,
                    sender_id: raw.sender,
                };
            }

            console.log("WS MESSAGE:", data);

            // ---- SIGNAL EVENTS (CRITICAL FIX) ----
            if (["offer", "answer", "ice_candidate"].includes(data.type)) {
                if (onSignalEventRef.current) {
                    onSignalEventRef.current(data);
                }
                return;
            }

            // ---- APP EVENTS ----
            if (data.type === "matching_started") {
                setStatus("searching");
            }

            if (data.type === "match_found" || data.type === "match_found_event") {
                setStatus("matched");
                setPartner(data.partner);
                setCallSessionId(data.call_session_id);
                setIsInitiator(data.is_initiator);
            }

            if (data.type === "call_ended") {
                setStatus("ended");
                setPartner(null);
                setCallSessionId(null);
            }

            if (data.type === "matching_stopped") {
                setStatus("stopped");
                setPartner(null);
                setCallSessionId(null);
            }

            if (data.type === "user_disconnected") {
                setStatus("searching");
                setPartner(null);
                setCallSessionId(null);
            }
        };

        ws.onerror = (err) => {
            console.error("WS ERROR:", err);
        };

        ws.onclose = (e) => {
            console.log("WS CLOSED:", e.code);
        };
    };

    const disconnectSocket = () => {
        socketRef.current?.close();
    };

    const sendEvent = (payload) => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify(payload));
        }
    };

    const registerSignalHandler = (handler) => {
        onSignalEventRef.current = handler;
    };

    return {
        status,
        partner,
        callSessionId,
        isInitiator,
        startMatching: () => sendEvent({ type: "start_matching" }),
        stopMatching: () => sendEvent({ type: "stop_matching" }),
        skip: () => sendEvent({ type: "skip" }),
        sendEvent,
        registerSignalHandler,
    };
}