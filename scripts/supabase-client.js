/**
 * NONCHALANT JR STUDIO — Private Personal Gaming Client
 * 
 * Provides unified interface for Supabase Auth, PostgreSQL Database,
 * Private Media Storage, and local storage resilience.
 * Exclusively for a single user's personal eFootball archive.
 */

const SupabaseBridge = (() => {
  let client = null;
  let isConnected = false;

  // Retrieve Supabase credentials
  const getCredentials = () => {
    try {
      const saved = localStorage.getItem('njr_custom_supabase_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.url && parsed.anonKey && !parsed.url.includes('placeholder')) {
          return { url: parsed.url.trim(), anonKey: parsed.anonKey.trim(), isValid: true };
        }
      }
    } catch (e) {}

    const cfg = window.NJR_CONFIG || {};
    const url = cfg.SUPABASE_URL || '';
    const anonKey = cfg.SUPABASE_ANON_KEY || '';
    const isValid = url && anonKey && !url.includes('placeholder') && !anonKey.includes('placeholder');
    return { url, anonKey, isValid };
  };

  // Initialize Supabase Client
  const init = () => {
    const { url, anonKey, isValid } = getCredentials();

    if (isValid && window.supabase && typeof window.supabase.createClient === 'function') {
      try {
        client = window.supabase.createClient(url, anonKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
          }
        });
        isConnected = true;
        console.log('⚡ Supabase Private Studio Client initialized.');
      } catch (err) {
        console.warn('⚠️ Supabase init warning:', err);
        client = null;
        isConnected = false;
      }
    } else {
      isConnected = false;
      client = null;
    }

    return isConnected;
  };

  const configure = (url, anonKey) => {
    if (!url || !anonKey) throw new Error('Both Supabase URL and Anon Key are required.');
    const cleanUrl = url.trim().replace(/\/+$/, '');
    const cleanKey = anonKey.trim();
    localStorage.setItem('njr_custom_supabase_config', JSON.stringify({ url: cleanUrl, anonKey: cleanKey }));
    return init();
  };

  const resetConfig = () => {
    localStorage.removeItem('njr_custom_supabase_config');
    client = null;
    isConnected = false;
  };

  const isReady = () => isConnected && client !== null;
  const getRawClient = () => client;

  // ==========================================================================
  // AUTHENTICATION (Private Owner Only)
  // ==========================================================================
  const auth = {
    async signIn(email, password) {
      if (!isReady()) return mockAuth.signIn(email, password);
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    },

    async signUp(email, password, gamerTag = 'NONCHALANT JR') {
      if (!isReady()) return mockAuth.signUp(email, password, gamerTag);
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          data: {
            gamer_tag: gamerTag,
            username: 'nonchalant_jr'
          }
        }
      });
      if (error) throw error;
      return data;
    },

    async signOut() {
      if (!isReady()) return mockAuth.signOut();
      const { error } = await client.auth.signOut();
      if (error) throw error;
      return true;
    },

    async resetPassword(email) {
      if (!isReady()) return mockAuth.resetPassword(email);
      const { data, error } = await client.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin
      });
      if (error) throw error;
      return data;
    },

    async getSession() {
      if (!isReady()) return mockAuth.getSession();
      const { data, error } = await client.auth.getSession();
      if (error) throw error;
      return data.session;
    },

    async getCurrentProfile() {
      if (!isReady()) return mockAuth.getCurrentProfile();
      const session = await auth.getSession();
      if (!session || !session.user) return null;

      const { data, error } = await client
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      if (!data) {
        // Create initial private profile
        const initial = {
          id: session.user.id,
          username: 'nonchalant_jr',
          gamer_tag: 'NONCHALANT JR',
          email: session.user.email,
          division: 'Division 1 (Top 100)',
          platform: 'PlayStation 5 & Mobile',
          efootball_id: 'NJR-904-8821',
          favorite_club: 'Real Madrid / Brazil XI',
          avatar_url: 'assets/bg.jpg'
        };
        await client.from('profiles').insert(initial);
        return initial;
      }
      return data;
    },

    async updateProfile(updates) {
      if (!isReady()) return mockAuth.updateProfile(updates);
      const session = await auth.getSession();
      if (!session || !session.user) throw new Error('Not authenticated.');

      const { data, error } = await client
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', session.user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  };

  // ==========================================================================
  // PERSONAL MATCHES (CRUD)
  // ==========================================================================
  const matches = {
    // Automatically determine W / D / L
    determineResult(myScore, oppScore) {
      const s1 = Number(myScore) || 0;
      const s2 = Number(oppScore) || 0;
      if (s1 > s2) return 'W';
      if (s1 === s2) return 'D';
      return 'L';
    },

    async getAllMatches(filters = {}, sort = 'newest') {
      if (!isReady()) return mockMatches.getAllMatches(filters, sort);
      const prof = await auth.getCurrentProfile();
      if (!prof) return [];

      let query = client
        .from('personal_matches')
        .select('*')
        .eq('user_id', prof.id);

      if (filters.result && filters.result !== 'all') {
        query = query.eq('result', filters.result);
      }
      if (filters.competition && filters.competition !== 'all') {
        query = query.eq('competition', filters.competition);
      }
      if (filters.formation && filters.formation !== 'all') {
        query = query.eq('formation_used', filters.formation);
      }
      if (filters.search) {
        query = query.ilike('opponent', `%${filters.search}%`);
      }

      if (sort === 'oldest') {
        query = query.order('match_date', { ascending: true }).order('created_at', { ascending: true });
      } else if (sort === 'opponent') {
        query = query.order('opponent', { ascending: true });
      } else {
        query = query.order('match_date', { ascending: false }).order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    async getMatchById(id) {
      if (!isReady()) return mockMatches.getMatchById(id);
      const { data, error } = await client.from('personal_matches').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    },

    async createMatch(matchData) {
      if (!isReady()) return mockMatches.createMatch(matchData);
      const prof = await auth.getCurrentProfile();
      if (!prof) throw new Error('Authentication required.');

      const myScore = parseInt(matchData.my_score, 10) || 0;
      const oppScore = parseInt(matchData.opp_score, 10) || 0;
      const result = matches.determineResult(myScore, oppScore);

      const newRow = {
        user_id: prof.id,
        match_date: matchData.match_date || new Date().toISOString().slice(0, 10),
        match_time: matchData.match_time || new Date().toTimeString().slice(0, 5),
        opponent: matchData.opponent.trim(),
        my_team: matchData.my_team?.trim() || 'NONCHALANT JR XI',
        opp_team: matchData.opp_team?.trim() || 'Opponent Team',
        my_score: myScore,
        opp_score: oppScore,
        result: result,
        competition: matchData.competition?.trim() || 'Division 1 Online',
        match_type: matchData.match_type?.trim() || 'Ranked Match',
        formation_used: matchData.formation_used || '4-2-1-3',
        manager_used: matchData.manager_used || 'Pep Guardiola',
        goalscorers: matchData.goalscorers?.trim() || '',
        rating: matchData.rating ? Number(matchData.rating) : null,
        notes: matchData.notes?.trim() || '',
        video_url: matchData.video_url?.trim() || '',
        screenshot_url: matchData.screenshot_url?.trim() || ''
      };

      const { data, error } = await client.from('personal_matches').insert(newRow).select().single();
      if (error) throw error;
      return data;
    },

    async updateMatch(id, matchData) {
      if (!isReady()) return mockMatches.updateMatch(id, matchData);
      const myScore = parseInt(matchData.my_score, 10) || 0;
      const oppScore = parseInt(matchData.opp_score, 10) || 0;
      const result = matches.determineResult(myScore, oppScore);

      const { data, error } = await client
        .from('personal_matches')
        .update({
          ...matchData,
          my_score: myScore,
          opp_score: oppScore,
          result: result,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async deleteMatch(id) {
      if (!isReady()) return mockMatches.deleteMatch(id);
      const { error } = await client.from('personal_matches').delete().eq('id', id);
      if (error) throw error;
      return true;
    }
  };

  // ==========================================================================
  // GAMEPLAY RECORDINGS LIBRARY (Private Cloud Media)
  // ==========================================================================
  const recordings = {
    async getAllRecordings(search = '') {
      if (!isReady()) return mockRecordings.getAllRecordings(search);
      const prof = await auth.getCurrentProfile();
      if (!prof) return [];

      let query = client
        .from('gameplay_recordings')
        .select('*, personal_matches(id, opponent, my_score, opp_score, result, competition, match_date)')
        .eq('user_id', prof.id)
        .order('date', { ascending: false });

      if (search) {
        query = query.ilike('title', `%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    async uploadMediaFile(file, onProgress = null) {
      if (!isReady()) return mockRecordings.uploadMediaFile(file, onProgress);
      const prof = await auth.getCurrentProfile();
      if (!prof) throw new Error('Please sign in to upload media.');

      const MAX_SIZE = 200 * 1024 * 1024; // 200MB limit
      if (file.size > MAX_SIZE) {
        throw new Error(`File is too large (${Math.round(file.size / 1024 / 1024)}MB). Maximum size is 200MB.`);
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${prof.id}/${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

      if (onProgress) onProgress(30);

      const { data, error } = await client.storage
        .from('gameplay-media')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (error) throw error;
      if (onProgress) onProgress(100);

      const { data: publicData } = client.storage.from('gameplay-media').getPublicUrl(fileName);

      return {
        storagePath: data.path,
        videoUrl: publicData.publicUrl,
        size: file.size,
        type: file.type
      };
    },

    async createRecording(recData) {
      if (!isReady()) return mockRecordings.createRecording(recData);
      const prof = await auth.getCurrentProfile();
      if (!prof) throw new Error('Authentication required.');

      const newRow = {
        user_id: prof.id,
        match_id: recData.match_id || null,
        title: recData.title.trim(),
        description: recData.description?.trim() || '',
        date: recData.date || new Date().toISOString().slice(0, 10),
        video_url: recData.video_url.trim(),
        storage_path: recData.storage_path || null,
        file_size_bytes: recData.file_size_bytes || null,
        mime_type: recData.mime_type || 'video/mp4',
        thumbnail_url: recData.thumbnail_url || 'assets/bg.jpg',
        tags: Array.isArray(recData.tags) ? recData.tags : [],
        is_favorite: !!recData.is_favorite
      };

      const { data, error } = await client.from('gameplay_recordings').insert(newRow).select().single();
      if (error) throw error;
      return data;
    },

    async updateRecording(id, updates) {
      if (!isReady()) return mockRecordings.updateRecording(id, updates);
      const { data, error } = await client
        .from('gameplay_recordings')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async deleteRecording(id) {
      if (!isReady()) return mockRecordings.deleteRecording(id);
      const { error } = await client.from('gameplay_recordings').delete().eq('id', id);
      if (error) throw error;
      return true;
    }
  };

  // ==========================================================================
  // TROPHY ROOM & CUP HISTORY
  // ==========================================================================
  const trophies = {
    async getAllTrophies(filterTier = 'all') {
      if (!isReady()) return mockTrophies.getAllTrophies(filterTier);
      const prof = await auth.getCurrentProfile();
      if (!prof) return [];

      let query = client
        .from('trophies')
        .select('*, personal_matches(*)')
        .eq('user_id', prof.id)
        .order('date_won', { ascending: false });

      if (filterTier && filterTier !== 'all') {
        query = query.eq('placement', filterTier);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    async createTrophy(data) {
      if (!isReady()) return mockTrophies.createTrophy(data);
      const prof = await auth.getCurrentProfile();
      if (!prof) throw new Error('Authentication required.');

      const newRow = {
        user_id: prof.id,
        title: data.title.trim(),
        date_won: data.date_won || new Date().toISOString().slice(0, 10),
        season: data.season?.trim() || 'eFootball Season 2026',
        category: data.category || 'Championship',
        placement: data.placement || 'champion',
        final_opponent: data.final_opponent?.trim() || 'Grand Finalist',
        final_score: data.final_score?.trim() || '1 - 0',
        image_url: data.image_url || 'assets/bg.jpg',
        linked_match_id: data.linked_match_id || null,
        notes: data.notes?.trim() || ''
      };

      const { data: inserted, error } = await client.from('trophies').insert(newRow).select().single();
      if (error) throw error;
      return inserted;
    },

    async updateTrophy(id, updates) {
      if (!isReady()) return mockTrophies.updateTrophy(id, updates);
      const { data, error } = await client
        .from('trophies')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async deleteTrophy(id) {
      if (!isReady()) return mockTrophies.deleteTrophy(id);
      const { error } = await client.from('trophies').delete().eq('id', id);
      if (error) throw error;
      return true;
    }
  };

  // ==========================================================================
  // GAME PLANS & TACTICAL LAB
  // ==========================================================================
  const gamePlans = {
    async getAllGamePlans() {
      if (!isReady()) return mockGamePlans.getAllGamePlans();
      const prof = await auth.getCurrentProfile();
      if (!prof) return [];

      const { data, error } = await client
        .from('game_plans')
        .select('*')
        .eq('user_id', prof.id)
        .order('is_favorite', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },

    async createGamePlan(data) {
      if (!isReady()) return mockGamePlans.createGamePlan(data);
      const prof = await auth.getCurrentProfile();
      if (!prof) throw new Error('Authentication required.');

      const newRow = {
        user_id: prof.id,
        name: data.name.trim(),
        formation: data.formation || '4-2-1-3',
        manager: data.manager?.trim() || 'Pep Guardiola',
        playstyle: data.playstyle || 'Quick Counter',
        description: data.description?.trim() || '',
        when_to_use: data.when_to_use?.trim() || 'Primary setup',
        offensive_instructions: data.offensive_instructions || {},
        defensive_instructions: data.defensive_instructions || {},
        player_roles: data.player_roles || {},
        nodes: data.nodes || [],
        is_favorite: !!data.is_favorite
      };

      const { data: inserted, error } = await client.from('game_plans').insert(newRow).select().single();
      if (error) throw error;
      return inserted;
    },

    async updateGamePlan(id, updates) {
      if (!isReady()) return mockGamePlans.updateGamePlan(id, updates);
      const { data, error } = await client
        .from('game_plans')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async duplicateGamePlan(id) {
      if (!isReady()) return mockGamePlans.duplicateGamePlan(id);
      const { data: original, error: fErr } = await client.from('game_plans').select('*').eq('id', id).single();
      if (fErr) throw fErr;

      const copy = {
        user_id: original.user_id,
        name: `${original.name} (Copy)`,
        formation: original.formation,
        manager: original.manager,
        playstyle: original.playstyle,
        description: original.description,
        when_to_use: original.when_to_use,
        offensive_instructions: original.offensive_instructions,
        defensive_instructions: original.defensive_instructions,
        player_roles: original.player_roles,
        nodes: original.nodes,
        is_favorite: false
      };

      const { data: inserted, error: iErr } = await client.from('game_plans').insert(copy).select().single();
      if (iErr) throw iErr;
      return inserted;
    },

    async deleteGamePlan(id) {
      if (!isReady()) return mockGamePlans.deleteGamePlan(id);
      const { error } = await client.from('game_plans').delete().eq('id', id);
      if (error) throw error;
      return true;
    }
  };

  // ==========================================================================
  // STARTING ELEVEN & SQUAD SETUPS
  // ==========================================================================
  const squads = {
    async getAllSquads() {
      if (!isReady()) return mockSquads.getAllSquads();
      const prof = await auth.getCurrentProfile();
      if (!prof) return [];

      const { data, error } = await client
        .from('squad_setups')
        .select('*')
        .eq('user_id', prof.id)
        .order('is_active', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },

    async saveSquad(squadData) {
      if (!isReady()) return mockSquads.saveSquad(squadData);
      const prof = await auth.getCurrentProfile();
      if (!prof) throw new Error('Authentication required.');

      if (squadData.id) {
        const { data, error } = await client
          .from('squad_setups')
          .update({
            ...squadData,
            updated_at: new Date().toISOString()
          })
          .eq('id', squadData.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const newRow = {
          user_id: prof.id,
          squad_name: squadData.squad_name || 'Primary Starting XI',
          manager: squadData.manager || {},
          roles: squadData.roles || {},
          starting_xi: squadData.starting_xi || [],
          subs: squadData.subs || [],
          formation: squadData.formation || '4-2-1-3',
          is_active: true
        };
        const { data, error } = await client.from('squad_setups').insert(newRow).select().single();
        if (error) throw error;
        return data;
      }
    }
  };

  // ==========================================================================
  // STATISTICS ENGINE (Calculated authoritatively from real match records)
  // ==========================================================================
  const stats = {
    compute(matchList = []) {
      const total = matchList.length;
      const wins = matchList.filter(m => m.result === 'W').length;
      const draws = matchList.filter(m => m.result === 'D').length;
      const losses = matchList.filter(m => m.result === 'L').length;
      const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;

      let totalGf = 0;
      let totalGa = 0;
      let cleanSheets = 0;

      const oppMap = {};
      const teamMap = {};
      const formationMap = {};

      matchList.forEach(m => {
        const s1 = Number(m.my_score) || 0;
        const s2 = Number(m.opp_score) || 0;
        totalGf += s1;
        totalGa += s2;
        if (s2 === 0) cleanSheets++;

        // Opponent stats
        const opp = m.opponent || 'Unknown';
        if (!oppMap[opp]) oppMap[opp] = { opponent: opp, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0 };
        oppMap[opp].played++;
        oppMap[opp].gf += s1;
        oppMap[opp].ga += s2;
        if (m.result === 'W') oppMap[opp].won++;
        else if (m.result === 'D') oppMap[opp].drawn++;
        else oppMap[opp].lost++;

        // Team stats
        const tm = m.my_team || 'NONCHALANT JR XI';
        if (!teamMap[tm]) teamMap[tm] = { team: tm, played: 0, won: 0, drawn: 0, lost: 0 };
        teamMap[tm].played++;
        if (m.result === 'W') teamMap[tm].won++;
        else if (m.result === 'D') teamMap[tm].drawn++;
        else teamMap[tm].lost++;

        // Formation stats
        const form = m.formation_used || '4-2-1-3';
        if (!formationMap[form]) formationMap[form] = { formation: form, played: 0, won: 0, drawn: 0, lost: 0 };
        formationMap[form].played++;
        if (m.result === 'W') formationMap[form].won++;
        else if (m.result === 'D') formationMap[form].drawn++;
        else formationMap[form].lost++;
      });

      const avgGf = total > 0 ? (totalGf / total).toFixed(1) : '0.0';
      const avgGa = total > 0 ? (totalGa / total).toFixed(1) : '0.0';

      return {
        totalMatches: total,
        wins,
        draws,
        losses,
        winRate,
        goalsScored: totalGf,
        goalsConceded: totalGa,
        goalDiff: totalGf - totalGa,
        cleanSheets,
        avgGoalsScored: avgGf,
        avgGoalsConceded: avgGa,
        recentForm: matchList.slice(0, 5).map(m => m.result),
        opponents: Object.values(oppMap).sort((a, b) => b.played - a.played),
        teams: Object.values(teamMap).sort((a, b) => b.played - a.played),
        formations: Object.values(formationMap).sort((a, b) => b.played - a.played)
      };
    }
  };

  // ==========================================================================
  // LOCAL STORAGE MOCK RESILIENCE (Graceful Offline State)
  // ==========================================================================
  const MOCK_STORAGE_KEY = 'njr_personal_studio_db_v3';

  const getMockDB = () => {
    try {
      const raw = localStorage.getItem(MOCK_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return {
      matches: [],
      recordings: [],
      trophies: [],
      gamePlans: [],
      squads: []
    };
  };

  const saveMockDB = (db) => {
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(db));
  };

  const mockAuth = {
    signIn: async (email, password) => {
      const u = AuthEngine.getCurrentUser();
      return { user: u };
    },
    signUp: async (email, password, gamerTag) => {
      const u = {
        id: 'user_local_owner',
        username: 'nonchalant_jr',
        gamerTag: gamerTag || 'NONCHALANT JR',
        email,
        division: 'Division 1 (Top 100)',
        platform: 'PlayStation 5 & Mobile',
        efootballId: 'NJR-904-8821',
        avatarUrl: 'assets/bg.jpg'
      };
      localStorage.setItem('njr_studio_active_session_v3', JSON.stringify(u));
      return { user: u };
    },
    signOut: async () => {
      localStorage.removeItem('njr_studio_active_session_v3');
      return true;
    },
    resetPassword: async (email) => {
      return { message: 'Reset email triggered (offline simulation).' };
    },
    getSession: async () => {
      const u = AuthEngine.getCurrentUser();
      return u ? { user: u } : null;
    },
    getCurrentProfile: async () => {
      return AuthEngine.getCurrentUser();
    },
    updateProfile: async (updates) => {
      return AuthEngine.updateProfile(updates);
    }
  };

  const mockMatches = {
    getAllMatches: async (filters, sort) => {
      const db = getMockDB();
      let list = db.matches || [];
      if (filters.result && filters.result !== 'all') list = list.filter(m => m.result === filters.result);
      if (filters.competition && filters.competition !== 'all') list = list.filter(m => m.competition === filters.competition);
      if (filters.search) list = list.filter(m => m.opponent.toLowerCase().includes(filters.search.toLowerCase()));

      if (sort === 'oldest') list.sort((a, b) => new Date(a.match_date) - new Date(b.match_date));
      else if (sort === 'opponent') list.sort((a, b) => a.opponent.localeCompare(b.opponent));
      else list.sort((a, b) => new Date(b.match_date) - new Date(a.match_date));

      return list;
    },
    getMatchById: async (id) => {
      const db = getMockDB();
      return db.matches.find(m => m.id === id);
    },
    createMatch: async (data) => {
      const db = getMockDB();
      const myScore = parseInt(data.my_score, 10) || 0;
      const oppScore = parseInt(data.opp_score, 10) || 0;
      const res = matches.determineResult(myScore, oppScore);
      const newMatch = {
        id: 'match_' + Date.now(),
        ...data,
        my_score: myScore,
        opp_score: oppScore,
        result: res,
        created_at: new Date().toISOString()
      };
      db.matches.unshift(newMatch);
      saveMockDB(db);
      return newMatch;
    },
    updateMatch: async (id, data) => {
      const db = getMockDB();
      const idx = db.matches.findIndex(m => m.id === id);
      if (idx !== -1) {
        const myScore = parseInt(data.my_score, 10) || 0;
        const oppScore = parseInt(data.opp_score, 10) || 0;
        db.matches[idx] = {
          ...db.matches[idx],
          ...data,
          my_score: myScore,
          opp_score: oppScore,
          result: matches.determineResult(myScore, oppScore),
          updated_at: new Date().toISOString()
        };
        saveMockDB(db);
        return db.matches[idx];
      }
      return null;
    },
    deleteMatch: async (id) => {
      const db = getMockDB();
      db.matches = db.matches.filter(m => m.id !== id);
      saveMockDB(db);
      return true;
    }
  };

  const mockRecordings = {
    getAllRecordings: async (search) => {
      const db = getMockDB();
      let list = db.recordings || [];
      if (search) list = list.filter(r => r.title.toLowerCase().includes(search.toLowerCase()));
      return list;
    },
    uploadMediaFile: async (file, onProgress) => {
      if (onProgress) onProgress(50);
      const fileId = 'vid_' + Date.now();
      await StorageEngine.saveMedia(fileId, file, { name: file.name });
      if (onProgress) onProgress(100);
      return {
        storagePath: fileId,
        videoUrl: URL.createObjectURL(file),
        size: file.size,
        type: file.type
      };
    },
    createRecording: async (data) => {
      const db = getMockDB();
      const newRec = {
        id: 'rec_' + Date.now(),
        ...data,
        created_at: new Date().toISOString()
      };
      db.recordings.unshift(newRec);
      saveMockDB(db);
      return newRec;
    },
    updateRecording: async (id, data) => {
      const db = getMockDB();
      const idx = db.recordings.findIndex(r => r.id === id);
      if (idx !== -1) {
        db.recordings[idx] = { ...db.recordings[idx], ...data, updated_at: new Date().toISOString() };
        saveMockDB(db);
        return db.recordings[idx];
      }
      return null;
    },
    deleteRecording: async (id) => {
      const db = getMockDB();
      db.recordings = db.recordings.filter(r => r.id !== id);
      saveMockDB(db);
      return true;
    }
  };

  const mockTrophies = {
    getAllTrophies: async (tier) => {
      const db = getMockDB();
      let list = db.trophies || [];
      if (tier && tier !== 'all') list = list.filter(t => t.placement === tier);
      return list;
    },
    createTrophy: async (data) => {
      const db = getMockDB();
      const newTrophy = {
        id: 'trophy_' + Date.now(),
        ...data,
        created_at: new Date().toISOString()
      };
      db.trophies.unshift(newTrophy);
      saveMockDB(db);
      return newTrophy;
    },
    updateTrophy: async (id, data) => {
      const db = getMockDB();
      const idx = db.trophies.findIndex(t => t.id === id);
      if (idx !== -1) {
        db.trophies[idx] = { ...db.trophies[idx], ...data, updated_at: new Date().toISOString() };
        saveMockDB(db);
        return db.trophies[idx];
      }
      return null;
    },
    deleteTrophy: async (id) => {
      const db = getMockDB();
      db.trophies = db.trophies.filter(t => t.id !== id);
      saveMockDB(db);
      return true;
    }
  };

  const mockGamePlans = {
    getAllGamePlans: async () => {
      const db = getMockDB();
      return db.gamePlans || [];
    },
    createGamePlan: async (data) => {
      const db = getMockDB();
      const newPlan = {
        id: 'plan_' + Date.now(),
        ...data,
        created_at: new Date().toISOString()
      };
      db.gamePlans.push(newPlan);
      saveMockDB(db);
      return newPlan;
    },
    updateGamePlan: async (id, data) => {
      const db = getMockDB();
      const idx = db.gamePlans.findIndex(p => p.id === id);
      if (idx !== -1) {
        db.gamePlans[idx] = { ...db.gamePlans[idx], ...data, updated_at: new Date().toISOString() };
        saveMockDB(db);
        return db.gamePlans[idx];
      }
      return null;
    },
    duplicateGamePlan: async (id) => {
      const db = getMockDB();
      const orig = db.gamePlans.find(p => p.id === id);
      if (!orig) return null;
      const copy = {
        ...orig,
        id: 'plan_' + Date.now(),
        name: `${orig.name} (Copy)`,
        created_at: new Date().toISOString()
      };
      db.gamePlans.push(copy);
      saveMockDB(db);
      return copy;
    },
    deleteGamePlan: async (id) => {
      const db = getMockDB();
      db.gamePlans = db.gamePlans.filter(p => p.id !== id);
      saveMockDB(db);
      return true;
    }
  };

  const mockSquads = {
    getAllSquads: async () => {
      const db = getMockDB();
      if (!db.squads || db.squads.length === 0) {
        const initial = [{
          id: 'squad_default',
          squad_name: 'Primary Starting XI',
          manager: { name: 'Pep Guardiola', playstyle: 'Quick Counter', boost: '+1 Acceleration' },
          roles: { captain: 'Lionel Messi', penalty: 'Cristiano Ronaldo', shortFK: 'Lionel Messi', longFK: 'Roberto Carlos' },
          starting_xi: [],
          subs: [],
          formation: '4-2-1-3',
          is_active: true
        }];
        db.squads = initial;
        saveMockDB(db);
      }
      return db.squads;
    },
    saveSquad: async (data) => {
      const db = getMockDB();
      if (data.id) {
        const idx = db.squads.findIndex(s => s.id === data.id);
        if (idx !== -1) db.squads[idx] = { ...db.squads[idx], ...data, updated_at: new Date().toISOString() };
      } else {
        const newSq = { id: 'squad_' + Date.now(), ...data, created_at: new Date().toISOString() };
        db.squads.push(newSq);
      }
      saveMockDB(db);
      return data;
    }
  };

  // Self-init on load
  init();

  return {
    init,
    configure,
    resetConfig,
    isReady,
    getRawClient,
    getCredentials,
    auth,
    matches,
    recordings,
    trophies,
    gamePlans,
    squads,
    stats
  };
})();
