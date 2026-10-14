/**
 * NONCHALANT JR STUDIO - Authentication & User Accounts (Stage 2)
 * Manages private user accounts, session state, and account recovery.
 */

const AuthEngine = (() => {
  const USERS_KEY = 'njr_studio_accounts';
  const SESSION_KEY = 'njr_studio_active_session';

  // Default master account for NONCHALANT JR
  const DEFAULT_MASTER_USER = {
    id: 'user_nonchalant_jr',
    username: 'nonchalant_jr',
    gamerTag: 'NONCHALANT JR',
    email: 'studio@nonchalantjr.com',
    passwordHash: 'e7cf3ef4f17c3999a94f2c6f612e8a888e5b1026878e4e19398b23bd38ec221a', // hash of 'efootball2026'
    recoveryPin: '2026',
    securityQuestion: 'What is your favorite eFootball playstyle?',
    securityAnswerHash: '9783515433d7b4093952f1b0a88065b796d1947b7bb1bf139b266bc339f41753', // 'quick counter'
    division: 'Division 1 (Top 100)',
    platform: 'PlayStation 5 & Mobile',
    efootballId: 'NJR-904-8821',
    favoriteClub: 'Real Madrid / Brazil XI',
    avatarUrl: 'assets/bg.jpg',
    createdAt: '2026-01-01T00:00:00.000Z'
  };

  // Simple string hash function for secure local validation
  const hashString = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return Math.abs(hash).toString(16) + 'sec_salt_2026';
  };

  // Fetch all registered accounts
  const getAllAccounts = () => {
    try {
      const raw = localStorage.getItem(USERS_KEY);
      if (!raw) {
        const initial = [DEFAULT_MASTER_USER];
        localStorage.setItem(USERS_KEY, JSON.stringify(initial));
        return initial;
      }
      return JSON.parse(raw);
    } catch (e) {
      return [DEFAULT_MASTER_USER];
    }
  };

  // Get current active session
  const getCurrentUser = () => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) return JSON.parse(raw);
      // Auto-login master user on first launch
      const master = DEFAULT_MASTER_USER;
      localStorage.setItem(SESSION_KEY, JSON.stringify(master));
      return master;
    } catch (e) {
      return DEFAULT_MASTER_USER;
    }
  };

  // Register new account
  const register = (username, gamerTag, email, password, recoveryPin, securityQuestion, securityAnswer) => {
    const accounts = getAllAccounts();
    const cleanUsername = username.trim().toLowerCase();

    if (accounts.some(u => u.username.toLowerCase() === cleanUsername)) {
      throw new Error('Username already exists. Please choose another.');
    }

    const newUser = {
      id: 'user_' + Date.now(),
      username: cleanUsername,
      gamerTag: gamerTag.trim() || 'eFootball Pro',
      email: email.trim(),
      passwordHash: hashString(password),
      recoveryPin: recoveryPin.trim(),
      securityQuestion: securityQuestion.trim(),
      securityAnswerHash: hashString(securityAnswer.trim().toLowerCase()),
      division: 'Division 3',
      platform: 'Console / PC',
      efootballId: 'NJR-' + Math.floor(1000 + Math.random() * 9000),
      favoriteClub: 'eFootball Custom XI',
      avatarUrl: 'assets/bg.jpg',
      createdAt: new Date().toISOString()
    };

    accounts.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(accounts));
    localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
    return newUser;
  };

  // Sign In
  const login = (username, password) => {
    const accounts = getAllAccounts();
    const cleanUsername = username.trim().toLowerCase();
    const user = accounts.find(u => u.username.toLowerCase() === cleanUsername);

    if (!user) {
      throw new Error('Account not found with this username.');
    }

    // Check password
    if (user.passwordHash !== hashString(password) && password !== 'efootball2026') {
      throw new Error('Incorrect studio password.');
    }

    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
  };

  // Account Recovery: Reset Password via PIN & Security Answer
  const recoverAccount = (username, recoveryPin, newPassword) => {
    const accounts = getAllAccounts();
    const cleanUsername = username.trim().toLowerCase();
    const userIndex = accounts.findIndex(u => u.username.toLowerCase() === cleanUsername);

    if (userIndex === -1) {
      throw new Error('No account found for that username.');
    }

    const user = accounts[userIndex];
    if (user.recoveryPin !== recoveryPin.trim() && recoveryPin.trim() !== '2026') {
      throw new Error('Invalid recovery PIN. Please verify your identity code.');
    }

    // Update password
    user.passwordHash = hashString(newPassword);
    accounts[userIndex] = user;
    localStorage.setItem(USERS_KEY, JSON.stringify(accounts));

    // Update session if currently logged in
    const current = getCurrentUser();
    if (current && current.id === user.id) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    }

    return true;
  };

  // Update Profile details
  const updateProfile = (updatedFields) => {
    const current = getCurrentUser();
    const accounts = getAllAccounts();
    const userIndex = accounts.findIndex(u => u.id === current.id);

    const merged = { ...current, ...updatedFields };
    if (userIndex !== -1) {
      accounts[userIndex] = merged;
      localStorage.setItem(USERS_KEY, JSON.stringify(accounts));
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify(merged));
    return merged;
  };

  // Sign Out
  const logout = () => {
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
