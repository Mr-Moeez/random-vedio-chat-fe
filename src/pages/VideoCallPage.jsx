import ThemeToggle from "../components/ThemeToggle";
import { useAuth } from "../context/AuthContext";

function VideoCallPage() {
  const { user, logout } = useAuth();

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
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-800 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
          Frontend auth is ready. Next: WebSocket connection.
        </div>
      </main>
    </div>
  );
}

export default VideoCallPage;