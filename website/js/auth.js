const auth = {
  setSession(token) {
    localStorage.setItem("duroos_token", token);
  },
  clearSession() {
    localStorage.removeItem("duroos_token");
  },
  isSignedIn() {
    return !!localStorage.getItem("duroos_token");
  },
  // Call at the top of any gated page — bounces to login if no token.
  requireSignIn() {
    if (!this.isSignedIn()) {
      window.location.href = "login.html";
    }
  },
  signOut() {
    this.clearSession();
    window.location.href = "index.html";
  },
};
