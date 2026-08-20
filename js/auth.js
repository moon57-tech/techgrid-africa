/* ============================================================
   Techgrid Africa — Auth (email/password + Google-ready)
   - Email accounts are stored in browser localStorage (demo mode).
   - Google Sign-In uses Google Identity Services. Set your Client ID
     in TG_CONFIG.GOOGLE_CLIENT_ID (see README) to activate it.
   ============================================================ */
const TG_CONFIG = {
  GOOGLE_CLIENT_ID: "" // <- paste your Google OAuth web client ID to enable Google sign-in
};

const Auth = (function () {
  const LS_USERS = "tg_users";
  const LS_SESSION = "tg_session";

  /* ----- hashing (SHA-256 when available, fallback for file://) ----- */
  function fallbackHash(str) {
    let h1 = 5381, h2 = 52711, i = str.length;
    while (i--) {
      const c = str.charCodeAt(i);
      h1 = (h1 * 33) ^ c;
      h2 = (h2 * 31) ^ c;
    }
    return (h1 >>> 0).toString(16) + (h2 >>> 0).toString(16);
  }

  function hashString(str) {
    if (window.crypto && crypto.subtle && crypto.subtle.digest) {
      return crypto.subtle.digest("SHA-256", new TextEncoder().encode(str))
        .then(function (buf) {
          return Array.prototype.map.call(new Uint8Array(buf), function (b) {
            return b.toString(16).padStart(2, "0");
          }).join("");
        })
        .catch(function () { return fallbackHash(str); });
    }
    return Promise.resolve(fallbackHash(str));
  }

  function salt() {
    return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  }

  /* ----- storage ----- */
  function loadUsers() {
    try { return JSON.parse(localStorage.getItem(LS_USERS)) || []; } catch (e) { return []; }
  }
  function saveUsers(users) {
    localStorage.setItem(LS_USERS, JSON.stringify(users));
  }
  function loadSession() {
    try { return JSON.parse(localStorage.getItem(LS_SESSION)) || null; } catch (e) { return null; }
  }
  function saveSession(s) {
    if (s) localStorage.setItem(LS_SESSION, JSON.stringify(s));
    else localStorage.removeItem(LS_SESSION);
    window.dispatchEvent(new CustomEvent("authchange"));
  }

  /* ----- public API ----- */
  function currentUser() { return loadSession(); }
  function isLoggedIn() { return !!loadSession(); }

  function registerUser(name, email, password) {
    return hashString(password).then(function (pass) {
      const users = loadUsers();
      const emailNorm = email.trim().toLowerCase();
      if (users.some(function (u) { return u.email === emailNorm; })) {
        throw new Error("An account with this email already exists. Please sign in.");
      }
      const user = {
        id: "u_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
        name: name.trim(),
        email: emailNorm,
        pass: pass,
        provider: "email",
        createdAt: new Date().toISOString()
      };
      users.push(user);
      saveUsers(users);
      saveSession({ uid: user.id, name: user.name, email: user.email, provider: "email", at: Date.now() });
      return user;
    });
  }

  function loginUser(email, password) {
    return hashString(password).then(function (pass) {
      const emailNorm = email.trim().toLowerCase();
      const user = loadUsers().find(function (u) { return u.email === emailNorm && u.pass === pass; });
      if (!user) throw new Error("Invalid email or password.");
      saveSession({ uid: user.id, name: user.name, email: user.email, provider: user.provider || "email", at: Date.now() });
      return user;
    });
  }

  /* ----- Google Identity Services ----- */
  function googleReady() {
    return !!(TG_CONFIG.GOOGLE_CLIENT_ID && window.google && google.accounts && google.accounts.id);
  }

  function decodeJwt(token) {
    try {
      const part = token.split(".")[1];
      const json = atob(part.replace(/-/g, "+").replace(/_/g, "/"));
      return JSON.parse(decodeURIComponent(Array.prototype.map.call(json, function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      }).join("")));
    } catch (e) { return null; }
  }

  function handleGoogleCredential(credential) {
    const payload = decodeJwt(credential);
    if (!payload || !payload.email) throw new Error("Google sign-in failed. Please try again.");
    const users = loadUsers();
    let user = users.find(function (u) { return u.googleId === payload.sub || u.email === payload.email.toLowerCase(); });
    if (!user) {
      user = {
        id: "u_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
        name: payload.name || payload.email.split("@")[0],
        email: payload.email.toLowerCase(),
        pass: null,
        googleId: payload.sub,
        provider: "google",
        createdAt: new Date().toISOString()
      };
      users.push(user);
      saveUsers(users);
    } else {
      user.provider = user.provider || "google";
      user.googleId = user.googleId || payload.sub;
      user.name = user.name || payload.name;
      saveUsers(users);
    }
    saveSession({ uid: user.id, name: user.name, email: user.email, provider: "google", at: Date.now() });
    return user;
  }

  /* Render the Google button into `container`. Returns true if rendered. */
  function renderGoogleButton(container) {
    if (!googleReady()) return false;
    google.accounts.id.initialize({
      client_id: TG_CONFIG.GOOGLE_CLIENT_ID,
      callback: function (res) {
        try {
          handleGoogleCredential(res.credential);
          App.toast("Signed in with Google", "success");
          location.hash = "#/account";
        } catch (e) {
          App.toast(e.message, "error");
        }
      }
    });
    google.accounts.id.renderButton(container, { theme: "outline", size: "large", width: "100%", text: "continue_with" });
    return true;
  }

  function logout() {
    saveSession(null);
  }

  function isEmailValid(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  }

  return {
    currentUser, isLoggedIn, registerUser, loginUser, logout,
    renderGoogleButton, handleGoogleCredential, isEmailValid,
    googleReady, config: TG_CONFIG
  };
})();