// Call this at the top of any admin page's component body.
// Bounces to /login if there's no stored admin token yet.
export function requireAdminAuth() {
  if (typeof window === "undefined") return; // skip during server render
  if (!localStorage.getItem("adminToken")) {
    window.location.href = "/login";
  }
}
