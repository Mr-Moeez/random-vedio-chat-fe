import { useCallback, useEffect, useRef, useState } from "react";

export function useCallSocket() {
    const socketRef = useRef(null);

    const [status, setStatus] = useState("disconnected");
    const [partner, setPartner] = useState(null);
    const [callSessionId, setCallSessionId] = useState(null);
    const [isInitiator, setIsInitiator] = useState(false);
    const [lastEvent, setLastEvent] = useState(null);

    const sendEvent = useCallback((payload) => {
        if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
            setStatus("socket_not_connected");
            return;
        }

        socketRef.current.send(JSON.stringify(payload));
    }, []);

    const connectSocket = useCallback(() => {
        const token = localStorage.getItem("accessToken");

        if (!token) {
            setStatus("missing_token");
            return;
        }

        // 🔥 IMPORTANT FIX
        if (socketRef.current) {
            return;
        }

        const wsUrl = `${import.meta.env.VITE_WS_BASE_URL}/call/?token=${token}`;
        console.log("WS URL:", wsUrl);

        const socket = new WebSocket(wsUrl);
        socketRef.current = socket;

        setStatus("connecting");

        socket.onopen = () => {
            console.log("WS OPEN");
            setStatus("connected");
        };

        socket.onmessage = (event) => {
            console.log("WS MESSAGE:", event.data);
            const data = JSON.parse(event.data);
            setLastEvent(data);

            if (data.type === "connection_established") {
                setStatus("connected");
            }

            if (data.type === "matching_started") {
                setStatus("matching");
                setPartner(null);
            }

            if (data.type === "match_found" || data.type === "match_found_event") {
                setStatus("matched");
                setPartner(data.partner);
                setCallSessionId(data.call_session_id);
                setIsInitiator(Boolean(data.is_initiator));
            }

            if (data.type === "matching_stopped") {
                setStatus("stopped");
                setPartner(null);
                setCallSessionId(null);
                setIsInitiator(false);
            }

            if (data.type === "call_ended") {
                setStatus("call_ended");
                setPartner(null);
                setCallSessionId(null);
                setIsInitiator(false);
            }

            if (data.type === "user_disconnected") {
                setStatus("partner_disconnected");
                setPartner(null);
                setCallSessionId(null);
                setIsInitiator(false);
            }
        };

        socket.onerror = (err) => {
            console.log("WS ERROR:", err);
        };

        socket.onclose = (event) => {
            console.log("WS CLOSED:", event.code);

            // 🔥 IMPORTANT: allow reconnect later
            socketRef.current = null;

            setStatus("disconnected");
        };
    }, []);

    const disconnectSocket = useCallback(() => {
        socketRef.current?.close();
        socketRef.current = null;
        setStatus("disconnected");
    }, []);

    useEffect(() => {
        connectSocket();
    }, []);

    const startMatching = () => {
        sendEvent({ type: "start_matching" });
    };

    const stopMatching = () => {
        sendEvent({ type: "stop_matching" });
    };

    const skip = () => {
        sendEvent({ type: "skip" });
    };

    return {
        status,
        partner,
        callSessionId,
        isInitiator,
        lastEvent,
        startMatching,
        stopMatching,
        skip,
        sendEvent,
        connectSocket,
        disconnectSocket,
    };
}