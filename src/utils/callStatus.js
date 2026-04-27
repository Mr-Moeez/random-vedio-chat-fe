export function getCallStatusText(status) {
  const statusMap = {
    disconnected: "Socket disconnected",
    connecting: "Connecting...",
    connected: "Connected. Ready to match.",
    matching: "Searching for a stranger...",
    matched: "Matched. Preparing call...",
    call_ended: "Call ended.",
    stopped: "Matching stopped.",
    partner_disconnected: "Partner disconnected. Searching again...",
    socket_not_connected: "Socket not connected.",
    missing_token: "Missing login token.",
    error: "Something went wrong.",
  };

  return statusMap[status] || status;
}