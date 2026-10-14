/**
 * NONCHALANT JR STUDIO — Secure Authentication & Identity Engine
 * 
 * Supports Supabase Auth (Email & Password, Secure Sessions, Realtime Profile Sync)
 * with a secure local fallback for offline development.
 * Never stores plaintext passwords, and has NO hardcoded bypass PINs or backdoor passwords.
 */

const AuthEngine = (() => {
  const USERS_KEY = 'njr_studio_accounts_v3';
  const SESSION_KEY = 'njr_studio_active_session_v3';

  // Secure SHA-256 local hasher using Web Crypto API
  const hashPassword = async (password) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + '_njr_salt_secure_2026');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  // Fetch local account storage (used only when offline/local fallback)
  const getAllAccounts = () => {
    try {
      const raw = localStorage.getItem(USERS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  };

  // Get current active session user
  const getCurrentUser = () => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}

    // Default guest profile if not logged in
    return {
      id: 'guest_user',
      username: 'guest',
      gamerTag: 'NONCHALANT JR',
      email: 'studio@nonchalantjr.com',
      division: 'Division 1 (Top 100)',
      platform: 'PlayStation 5 & Mobile',
      efootballId: 'NJR-904-8821',
      favoriteClub: 'Real Madrid / Brazil XI',
      avatarUrl: 'assets/bg.jpg',
      isGuest: true
    };
  };

  // Register new account (Supabase or Local)
  const register = async (username, gamerTag, email, password) => {
    const cleanUsername = username.trim().toLowerCase();
    const cleanTag = (gamerTag || username).trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Please enter a valid email address.');
    }
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    if (window.SupabaseBridge && SupabaseBridge.isReady()) {
      try {
        const { user } = await SupabaseBridge.auth.signUp(cleanEmail, password, cleanTag, cleanUsername);
        const profile = {
          id: user.id,
          username: cleanUsername,
          gamerTag: cleanTag,
          email: cleanEmail,
          division: 'Division 1 (Top 100)',
          platform: 'PlayStation 5 & Mobile',
          efootballId: 'NJR-' + Math.floor(1000 + Math.random() * 9000),
          avatarUrl: 'assets/bg.jpg',
          createdAt: new Date().toISOString(),
          isGuest: false
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(profile));
        return profile;
      } catch (err) {
        throw new Error(err.message || 'Registration failed.');
      }
    }

    // Local Fallback
    const accounts = getAllAccounts();
    if (accounts.some(u => u.username.toLowerCase() === cleanUsername || u.email.toLowerCase() === cleanEmail)) {
      throw new Error('Username or email already registered. Please choose another or sign in.');
    }

    const hashed = await hashPassword(password);
    const newUser = {
      id: 'user_' + Date.now(),
      username: cleanUsername,
      gamerTag: cleanTag,
      email: cleanEmail,
      passwordHash: hashed,
      division: 'Division 1 (Top 100)',
      platform: 'PlayStation 5 & Mobile',
      efootballId: 'NJR-' + Math.floor(1000 + Math.random() * 9000),
      avatarUrl: 'assets/bg.jpg',
      createdAt: new Date().toISOString(),
      isGuest: false
    };

    accounts.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(accounts));
    localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
    return newUser;
  };

  // Sign In (Supabase or Local)
  const login = async (emailOrUsername, password) => {
    const cleanId = emailOrUsername.trim().toLowerCase();

    if (window.SupabaseBridge && SupabaseBridge.isReady()) {
      try {
        await SupabaseBridge.auth.signIn(cleanId, password);
        const profile = await SupabaseBridge.auth.getCurrentProfile();
        const active = {
          id: profile.id,
          username: profile.username,
          gamerTag: profile.gamer_tag,
          email: profile.email,
          division: profile.division,
          platform: profile.platform,
          efootballId: profile.efootball_id,
          avatarUrl: profile.avatar_url || 'assets/bg.jpg',
          isGuest: false
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(active));
        return active;
      } catch (err) {
        throw new Error(err.message || 'Incorrect email or password.');
      }
    }

    // Local Fallback
    const accounts = getAllAccounts();
    const user = accounts.find(u => u.username.toLowerCase() === cleanId || u.email.toLowerCase() === cleanId);

    if (!user) {
      // If no accounts exist yet, allow initial account creation
      if (accounts.length === 0) {
        return register(cleanId, 'NONCHALANT JR', cleanId.includes('@') ? cleanId : `${cleanId}@nonchalantjr.com`, password);
      }
      throw new Error('Account not found with this username or email.');
    }

    const hashed = await hashPassword(password);
    if (user.passwordHash !== hashed) {
      throw new Error('Incorrect studio password.');
    }

    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
  };

  // Account Recovery: Send password reset
  const recoverAccount = async (email) => {
    const cleanEmail = email.trim().toLowerCase();
    if (window.SupabaseBridge && SupabaseBridge.isReady()) {
      await SupabaseBridge.auth.resetPassword(cleanEmail);
      return 'Password reset link sent to your email address.';
    }
    return 'Password reset email initiated (Local simulation).';
  };

  // Update Profile details
  const updateProfile = async (updatedFields) => {
    const current = getCurrentUser();

    if (window.SupabaseBridge && SupabaseBridge.isReady() && !current.isGuest) {
      try {
        const dbFields = {};
        if (updatedFields.gamerTag) dbFields.gamer_tag = updatedFields.gamerTag;
        if (updatedFields.division) dbFields.division = updatedFields.division;
        if (updatedFields.platform) dbFields.platform = updatedFields.platform;
        if (updatedFields.efootballId) dbFields.efootball_id = updatedFields.efootballId;
        if (updatedFields.avatarUrl) dbFields.avatar_url = updatedFields.avatarUrl;

        await SupabaseBridge.auth.updateProfile(dbFields);
      } catch (e) {
        console.warn('Supabase profile update warning:', e);
      }
    }

    const merged = { ...current, ...updatedFields };
    localStorage.setItem(SESSION_KEY, JSON.stringify(merged));

    const accounts = getAllAccounts();
    const idx = accounts.findIndex(u => u.id === current.id);
    if (idx !== -1) {
      accounts[idx] = { ...accounts[idx], ...updatedFields };
      localStorage.setItem(USERS_KEY, JSON.stringify(accounts));
    }

    return merged;
  };

  // Sign Out
  const logout = async () => {
    if (window.SupabaseBridge && SupabaseBridge.isReady()) {
      try { await SupabaseBridge.auth.signOut(); } catch (e) {}
    }
    localStorage.removeItem(SESSION_KEY);
  };

  return {
    getCurrentUser,
    getAllAccounts,
    register,
    login,
    recoverAccount,
    updateProfile,
    logout
  };
})();
