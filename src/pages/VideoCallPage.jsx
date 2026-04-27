import { Mic, MicOff, Video, VideoOff } from "lucide-react";

import ThemeToggle from "../components/ThemeToggle";
import { useAuth } from "../context/AuthContext";
import { useCallSocket } from "../hooks/useCallSocket";
import { useMediaStream } from "../hooks/useMediaStream";
import { useWebRTC } from "../hooks/useWebRTC";
import { getCallStatusText } from "../utils/callStatus";

function VideoCallPage() {
    const { user, logout } = useAuth();

    const {
        status,
        partner,
        callSessionId,
        isInitiator,
        startMatching,
        stopMatching,
        skip,
        sendEvent,
        registerSignalHandler,
    } = useCallSocket();

    const {
        videoRef,
        stream,
        audioEnabled,
        videoEnabled,
        toggleAudio,
        toggleVideo,
        loading: mediaLoading,
        error: mediaError,
    } = useMediaStream();

    const { remoteVideoRef } = useWebRTC({
        socketSend: sendEvent,
        socketRegister: registerSignalHandler,
        stream,
        isInitiator,
        callSessionId,
    });

    const isMatched = Boolean(callSessionId && partner);

    setTimeout(() => {
        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
        }
    }, 0);
    
    return (
        <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
            <header className="h-16 border-b border-slate-200 bg-white px-6 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex h-full items-center justify-between">
                    <div>
                        <h1 className="font-semibold">Random Video Call</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Logged in as {user?.profile?.nickname || user?.name}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <ThemeToggle />

                        <button
                            onClick={logout}
                            className="rounded-xl bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="space-y-5 p-5">
                <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Status
                            </p>
                            <h2 className="text-2xl font-semibold">
                                {getCallStatusText(status)}
                            </h2>

                            {partner && (
                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                    Matched with{" "}
                                    <span className="font-medium text-slate-900 dark:text-white">
                                        {partner.nickname}
                                    </span>{" "}
                                    · {partner.age} · {partner.gender}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={startMatching}
                                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-500"
                            >
                                Start Matching
                            </button>

                            <button
                                onClick={stopMatching}
                                className="rounded-xl bg-slate-800 px-5 py-3 text-sm font-medium text-white hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600"
                            >
                                Stop Matching
                            </button>

                            <button
                                onClick={skip}
                                disabled={!isMatched}
                                className="rounded-xl bg-purple-600 px-5 py-3 text-sm font-medium text-white hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Skip
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-black shadow-xl dark:border-slate-800">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="h-[420px] w-full object-cover"
                            />

                            {!videoEnabled && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black">
                                    <div className="rounded-full bg-slate-800 px-4 py-2 text-sm text-white">
                                        Camera is off
                                    </div>
                                </div>
                            )}

                            <div className="absolute left-4 top-4 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                                You
                            </div>

                            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-2xl bg-black/50 p-2 backdrop-blur-md">
                                <button
                                    onClick={toggleAudio}
                                    className={`flex h-12 w-12 items-center justify-center rounded-full transition ${audioEnabled
                                        ? "bg-white text-slate-900 hover:bg-slate-100"
                                        : "bg-red-600 text-white hover:bg-red-500"
                                        }`}
                                    title={audioEnabled ? "Mute" : "Unmute"}
                                >
                                    {audioEnabled ? <Mic size={22} /> : <MicOff size={22} />}
                                </button>

                                <button
                                    onClick={toggleVideo}
                                    className={`flex h-12 w-12 items-center justify-center rounded-full transition ${videoEnabled
                                        ? "bg-white text-slate-900 hover:bg-slate-100"
                                        : "bg-red-600 text-white hover:bg-red-500"
                                        }`}
                                    title={videoEnabled ? "Camera off" : "Camera on"}
                                >
                                    {videoEnabled ? (
                                        <Video size={22} />
                                    ) : (
                                        <VideoOff size={22} />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-xl dark:border-slate-800 dark:bg-slate-950">
                            <video
                                ref={remoteVideoRef}
                                autoPlay
                                playsInline
                                muted={false}
                                controls={false}
                                className="h-[420px] w-full object-cover bg-black"
                            />

                            {!partner && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Waiting for partner video...
                                    </p>
                                </div>
                            )}

                            {partner && (
                                <div className="absolute left-4 top-4 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                                    {partner.nickname}
                                </div>
                            )}
                        </div>
                    </div>

                    {mediaLoading && (
                        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                            Accessing camera...
                        </p>
                    )}

                    {mediaError && (
                        <p className="mt-3 text-sm text-red-500">{mediaError}</p>
                    )}

                    {callSessionId && (
                        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                            <p>Session: {callSessionId}</p>
                            <p>Role: {isInitiator ? "Initiator" : "Receiver"}</p>
                        </div>
                    )}

                    {/* {lastEvent && (
                        <pre className="mt-4 max-h-72 overflow-auto rounded-2xl bg-slate-950 p-4 text-xs text-green-300 dark:bg-black">
                            {JSON.stringify(lastEvent, null, 2)}
                        </pre>
                    )} */}
                </section>
            </main>
        </div>
    );
}

export default VideoCallPage;