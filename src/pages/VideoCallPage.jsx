import ThemeToggle from "../components/ThemeToggle";
import { useAuth } from "../context/AuthContext";
import { useCallSocket } from "../hooks/useCallSocket";
import { getCallStatusText } from "../utils/callStatus";

function VideoCallPage() {
  const { user, logout } = useAuth();

  const {
    status,
    partner,
    callSessionId,
    isInitiator,
    lastEvent,
    startMatching,
    stopMatching,
    skip,
  } = useCallSocket();

  const isMatched = status === "matched";

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

      <main className="p-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-6">
            <p className="text-sm text-slate-500 dark:text-slate-400">Status</p>
            <h2 className="text-2xl font-semibold">{getCallStatusText(status)}</h2>
          </div>

          {partner && (
            <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
              <p className="text-sm text-slate-500 dark:text-slate-400">Matched with</p>
              <h3 className="text-lg font-semibold">{partner.nickname}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {partner.age} · {partner.gender}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Session: {callSessionId}
              </p>

              <p className="text-xs text-slate-400">
                Role: {isInitiator ? "Initiator" : "Receiver"}
              </p>
            </div>
          )}

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

          {lastEvent && (
            <pre className="mt-6 max-h-72 overflow-auto rounded-xl bg-slate-950 p-4 text-xs text-green-300 dark:bg-black">
              {JSON.stringify(lastEvent, null, 2)}
            </pre>
          )}
        </section>
      </main>
    </div>
  );
}

export default VideoCallPage;