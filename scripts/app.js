/**
 * NONCHALANT JR STUDIO — Private eFootball Gaming Archive
 * Main Client Controller
 * 
 * Exclusively for a single user's personal archive:
 * - Dashboard with live figures (zero fake metrics)
 * - Complete Match History with CRUD, search, filter, and sort
 * - Match Recordings & Highlights Vault (Supabase private storage upload + streaming)
 * - Trophy Room & Cup History (pedestal honors)
 * - Game Plans & Tactical Lab (interactive drag-and-drop pitch chalkboard)
 * - Starting Eleven & Squad Management (Starting XI, bench, coach boosts, set-piece roles)
 * - Personal Statistics & Performance Telemetry (Canvas line, doughnut, and bar charts)
 * - Deep Personal Match Archive (chronological match-to-video-to-trophy timeline)
 * - Structured Backup Export & Validated Restore
 * - Gamer Identity & Supabase Cloud Engine Configuration
 */

document.addEventListener('DOMContentLoaded', async () => {
  // =========================================================================
  // APPLICATION STATE
  // =========================================================================
  const AppState = {
    currentUser: null,
    activeSection: 'dashboard',
    matches: [],
    recordings: [],
    trophies: [],
    gamePlans: [],
    activeGamePlanIndex: 0,
    squad: null,
    editingMatchId: null,
    filters: {
      matchSearch: '',
      matchResult: 'all',
      matchCompetition: 'all',
      matchSort: 'newest',
      recordingSearch: '',
      trophyTier: 'all'
    }
  };

  // =========================================================================
  // DOM ELEMENT REFERENCES
  // =========================================================================
  const UI = {
    // Navigation
    navItems: document.querySelectorAll('.nav-item'),
    sections: document.querySelectorAll('.studio-section'),
    userAvatarBadge: document.getElementById('user-avatar-badge'),
    userAvatar: document.getElementById('user-avatar'),
    userGamerTag: document.getElementById('user-gamer-tag'),
    userDivision: document.getElementById('user-division'),
    supabaseStatusPill: document.getElementById('supabase-status-pill'),
    supabaseStatusText: document.getElementById('supabase-status-text'),
    btnQuickRecordMatch: document.getElementById('btn-quick-record-match'),

    // Hero Counters
    heroMatchesCount: document.getElementById('hero-matches-count'),
    heroWinRate: document.getElementById('hero-win-rate'),
    heroTrophiesCount: document.getElementById('hero-trophies-count'),
    heroVideosCount: document.getElementById('hero-videos-count'),

    // Dashboard
    dashboardRecentMatches: document.getElementById('dashboard-recent-matches'),
    dashboardTrophyShowcase: document.getElementById('dashboard-trophy-showcase'),
    dashboardTacticsSummary: document.getElementById('dashboard-tactics-summary'),

    // Match History
    matchesHistoryGrid: document.getElementById('matches-history-grid'),
    btnNewMatchOpen: document.getElementById('btn-new-match-open'),
    searchMatchesInput: document.getElementById('search-matches-input'),
    filterMatchResult: document.getElementById('filter-match-result'),
    filterMatchCompetition: document.getElementById('filter-match-competition'),
    sortMatchesSelect: document.getElementById('sort-matches-select'),

    // Recordings Vault
    recordingsGrid: document.getElementById('recordings-grid'),
    btnUploadRecordingModal: document.getElementById('btn-upload-recording-modal'),
    searchRecordings: document.getElementById('search-recordings'),

    // Trophy Room
    trophiesGrid: document.getElementById('trophies-grid'),
    btnNewTrophy: document.getElementById('btn-new-trophy'),
    filterTrophyTier: document.getElementById('filter-trophy-tier'),

    // Tactical Lab
    tacticsField: document.getElementById('tactics-field'),
    tacticsControlsPanel: document.getElementById('tactics-controls-panel'),
    btnCreateTactic: document.getElementById('btn-create-tactic'),
    btnDuplicateTactic: document.getElementById('btn-duplicate-tactic'),
    btnEditTactic: document.getElementById('btn-edit-tactic'),
    btnDeleteTactic: document.getElementById('btn-delete-tactic'),

    // Squad Management
    managerName: document.getElementById('manager-name'),
    managerPlaystyle: document.getElementById('manager-playstyle'),
    managerBoost: document.getElementById('manager-boost'),
    startingXiGrid: document.getElementById('starting-xi-grid'),
    subsRow: document.getElementById('subs-row'),
    rolesList: document.getElementById('roles-list'),
    btnAddPlayer: document.getElementById('btn-add-player'),
    btnEditCoach: document.getElementById('btn-edit-coach'),

    // Statistics & Charts
    kpiMatches: document.getElementById('kpi-matches'),
    kpiWins: document.getElementById('kpi-wins'),
    kpiDraws: document.getElementById('kpi-draws'),
    kpiLosses: document.getElementById('kpi-losses'),
    kpiWinRate: document.getElementById('kpi-winrate'),
    kpiGoalsScored: document.getElementById('kpi-goals-scored'),
    kpiGoalsConceded: document.getElementById('kpi-goals-conceded'),
    kpiGoalDiff: document.getElementById('kpi-goal-diff'),
    kpiCleanSheets: document.getElementById('kpi-clean-sheets'),
    formStreakContainer: document.getElementById('form-streak-container'),
    chartTrajectory: document.getElementById('chart-trajectory'),
    chartResultsDoughnut: document.getElementById('chart-results-doughnut'),
    chartGoalsBar: document.getElementById('chart-goals-bar'),
    opponentsStatsTbody: document.getElementById('opponents-stats-tbody'),

    // Archive
    personalArchiveTimeline: document.getElementById('personal-archive-timeline'),

    // Backup & Restore
    btnExportBackupMain: document.getElementById('btn-export-backup-main'),
    fileImportBackupMain: document.getElementById('file-import-backup-main'),

    // Settings
    formSettingsProfile: document.getElementById('form-settings-profile'),
    settingsGamertagInput: document.getElementById('settings-gamertag-input'),
    settingsDivisionInput: document.getElementById('settings-division-input'),
    settingsEfootballId: document.getElementById('settings-efootball-id'),
    settingsPlatformInput: document.getElementById('settings-platform-input'),
    btnStudioLogout: document.getElementById('btn-studio-logout'),

    // Modals
    modalNewMatch: document.getElementById('modal-new-match'),
    modalMatchTitle: document.getElementById('modal-match-title'),
    formNewMatch: document.getElementById('form-new-match'),
    matchEditId: document.getElementById('match-edit-id'),
    matchOpponent: document.getElementById('match-opponent'),
    matchCompetition: document.getElementById('match-competition'),
    matchMyScore: document.getElementById('match-my-score'),
    matchOppScore: document.getElementById('match-opp-score'),
    matchDate: document.getElementById('match-date'),
    matchTypeSelect: document.getElementById('match-type-select'),
    matchFormationSelect: document.getElementById('match-formation-select'),
    matchManagerInput: document.getElementById('match-manager-input'),
    matchGoalscorers: document.getElementById('match-goalscorers'),
    matchVideoFile: document.getElementById('match-video-file'),
    matchVideoUrl: document.getElementById('match-video-url'),
    matchNotes: document.getElementById('match-notes'),
    uploadProgressWrap: document.getElementById('upload-progress-wrap'),
    uploadProgressFill: document.getElementById('upload-progress-fill'),
    uploadProgressText: document.getElementById('upload-progress-text'),

    modalMatchDetails: document.getElementById('modal-match-details'),
    matchDetailsBody: document.getElementById('match-details-body'),

    modalNewRecording: document.getElementById('modal-new-recording'),
    formNewRecording: document.getElementById('form-new-recording'),
    recTitleInput: document.getElementById('rec-title-input'),
    recFileInput: document.getElementById('rec-file-input'),
    recProgressWrap: document.getElementById('rec-progress-wrap'),
    recProgressFill: document.getElementById('rec-progress-fill'),
    recProgressText: document.getElementById('rec-progress-text'),
    recTagsInput: document.getElementById('rec-tags-input'),
    recDescInput: document.getElementById('rec-desc-input'),

    modalNewTrophy: document.getElementById('modal-new-trophy'),
    formNewTrophy: document.getElementById('form-new-trophy'),
    trophyTitleInput: document.getElementById('trophy-title-input'),
    trophyPlacementInput: document.getElementById('trophy-placement-input'),
    trophyDateInput: document.getElementById('trophy-date-input'),
    trophyOpponentInput: document.getElementById('trophy-opponent-input'),
    trophyScoreInput: document.getElementById('trophy-score-input'),
    trophyNotesInput: document.getElementById('trophy-notes-input'),

    modalCinemaPlayer: document.getElementById('modal-cinema-player'),
    cinemaVideoTitle: document.getElementById('cinema-video-title'),
    cinemaVideoMeta: document.getElementById('cinema-video-meta'),
    cinemaVideoPlayer: document.getElementById('cinema-video-player'),
    cinemaDownloadBtn: document.getElementById('cinema-download-btn'),

    modalCreateTactic: document.getElementById('modal-create-tactic'),
    formCreateTactic: document.getElementById('form-create-tactic'),
    tacticNameInput: document.getElementById('tactic-name-input'),
    tacticFormationInput: document.getElementById('tactic-formation-input'),
    tacticPlaystyleInput: document.getElementById('tactic-playstyle-input'),
    tacticManagerInput: document.getElementById('tactic-manager-input'),
    tacticDescInput: document.getElementById('tactic-desc-input'),
    tacticWhentouseInput: document.getElementById('tactic-whentouse-input'),
    tacticAtk1Input: document.getElementById('tactic-atk1-input'),
    tacticAtk2Input: document.getElementById('tactic-atk2-input'),
    tacticDef1Input: document.getElementById('tactic-def1-input'),
    tacticDef2Input: document.getElementById('tactic-def2-input'),

    modalEditCoach: document.getElementById('modal-edit-coach'),
    formEditCoach: document.getElementById('form-edit-coach'),
    coachNameInput: document.getElementById('coach-name-input'),
    coachPlaystyleInput: document.getElementById('coach-playstyle-input'),
    coachBoostInput: document.getElementById('coach-boost-input'),
    roleCaptainInput: document.getElementById('role-captain-input'),
    rolePenaltyInput: document.getElementById('role-penalty-input'),
    roleShortfkInput: document.getElementById('role-shortfk-input'),
    roleLongfkInput: document.getElementById('role-longfk-input'),

    modalAddPlayer: document.getElementById('modal-add-player'),
    formAddPlayer: document.getElementById('form-add-player'),
    playerSlotInput: document.getElementById('player-slot-input'),
    playerPosInput: document.getElementById('player-pos-input'),
    playerNameInput: document.getElementById('player-name-input'),
    playerRatingInput: document.getElementById('player-rating-input'),
    playerTierInput: document.getElementById('player-tier-input'),

    modalSupabaseConfig: document.getElementById('modal-supabase-config'),
    formSupabaseConfig: document.getElementById('form-supabase-config'),
    supabaseUrlInput: document.getElementById('supabase-url-input'),
    supabaseKeyInput: document.getElementById('supabase-key-input'),
    supabaseTestFeedback: document.getElementById('supabase-test-feedback'),
    btnSupabaseReset: document.getElementById('btn-supabase-reset'),

    modalAuthHub: document.getElementById('modal-auth-hub'),
    tabBtnSignin: document.getElementById('tab-btn-signin'),
    tabBtnResetpass: document.getElementById('tab-btn-resetpass'),
    formAuthSignin: document.getElementById('form-auth-signin'),
    formAuthResetpass: document.getElementById('form-auth-resetpass'),
    signinEmail: document.getElementById('signin-email'),
    signinPassword: document.getElementById('signin-password'),
    resetEmail: document.getElementById('reset-email'),

    toastContainer: document.getElementById('toast-container')
  };

  // =========================================================================
  // TOAST & MODAL HELPERS
  // =========================================================================
  const showToast = (message, type = 'info') => {
    if (!UI.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
    toast.innerHTML = `<i class="fas ${icon}" style="color: var(--gold-bright);"></i> <span>${escapeHtml(message)}</span>`;
    UI.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  };

  const openModal = (modal) => {
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  };

  const closeModal = (modal) => {
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
      // Stop video playback if cinema player closed
      if (modal === UI.modalCinemaPlayer && UI.cinemaVideoPlayer) {
        UI.cinemaVideoPlayer.pause();
        UI.cinemaVideoPlayer.src = '';
      }
    }
  };

  // Wire all modal close triggers
  document.querySelectorAll('.btn-close-modal, .btn-modal-cancel').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modal = e.target.closest('.modal-overlay');
      if (modal) closeModal(modal);
    });
  });

  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal(modal);
    });
  });

  // =========================================================================
  // INITIALIZATION & DATA LOADING
  // =========================================================================
  const initApp = async () => {
    // 1. Establish User Session
    AppState.currentUser = AuthEngine.getCurrentUser();
    updateUserUI(AppState.currentUser);

    // 2. Check Supabase Connectivity
    updateSupabaseStatusUI();

    // 3. Load All Personal Studio Records
    await loadAllStudioData();

    // 4. Bind UI Event Listeners
    setupNavigationListeners();
    setupMatchEventListeners();
    setupRecordingEventListeners();
    setupTrophyEventListeners();
    setupTacticsEventListeners();
    setupSquadEventListeners();
    setupBackupEventListeners();
    setupSettingsEventListeners();
    setupAuthEventListeners();

    // 5. Render Initial Dashboard View
    switchSection('dashboard');
    console.log('⚡ NONCHALANT JR STUDIO loaded successfully.');
  };

  const updateUserUI = (user) => {
    if (!user) return;
    if (UI.userGamerTag) UI.userGamerTag.textContent = user.gamerTag || 'NONCHALANT JR';
    if (UI.userDivision) UI.userDivision.textContent = user.division || 'Division 1 (Top 100)';
    if (UI.userAvatar && user.avatarUrl) UI.userAvatar.src = user.avatarUrl;

    if (UI.settingsGamertagInput) UI.settingsGamertagInput.value = user.gamerTag || 'NONCHALANT JR';
    if (UI.settingsDivisionInput) UI.settingsDivisionInput.value = user.division || 'Division 1 (Top 100)';
    if (UI.settingsEfootballId) UI.settingsEfootballId.value = user.efootballId || 'NJR-904-8821';
    if (UI.settingsPlatformInput) UI.settingsPlatformInput.value = user.platform || 'PlayStation 5 & Mobile';
  };

  const updateSupabaseStatusUI = () => {
    const isReady = window.SupabaseBridge && SupabaseBridge.isReady();
    if (UI.supabaseStatusPill) {
      if (isReady) {
        UI.supabaseStatusPill.classList.remove('disconnected');
        UI.supabaseStatusPill.classList.add('connected');
        if (UI.supabaseStatusText) UI.supabaseStatusText.textContent = 'Cloud Engine Online';
      } else {
        UI.supabaseStatusPill.classList.remove('connected');
        UI.supabaseStatusPill.classList.add('disconnected');
        if (UI.supabaseStatusText) UI.supabaseStatusText.textContent = 'Local Offline Vault';
      }
    }
  };

  const loadAllStudioData = async () => {
    try {
      // Matches
      AppState.matches = await SupabaseBridge.matches.getAllMatches(
        {
          search: AppState.filters.matchSearch,
          result: AppState.filters.matchResult,
          competition: AppState.filters.matchCompetition
        },
        AppState.filters.matchSort
      );

      // Recordings
      AppState.recordings = await SupabaseBridge.recordings.getAllRecordings(AppState.filters.recordingSearch);

      // Trophies
      AppState.trophies = await SupabaseBridge.trophies.getAllTrophies(AppState.filters.trophyTier);

      // Game Plans
      AppState.gamePlans = await SupabaseBridge.gamePlans.getAllGamePlans();

      // Squad Setups
      const allSquads = await SupabaseBridge.squads.getAllSquads();
      AppState.squad = allSquads && allSquads.length > 0 ? allSquads[0] : getDefaultSquad();

      // Update Top Hero Counters immediately
      updateHeroMetrics();
    } catch (err) {
      console.warn('Error fetching studio records, using local fallback:', err);
      // Fallback from localStorage
      const uid = AppState.currentUser ? AppState.currentUser.id : 'default';
      AppState.matches = StorageEngine.loadData('matches', [], uid);
      AppState.trophies = StorageEngine.loadData('trophies', [], uid);
      AppState.gamePlans = StorageEngine.loadData('tactics', [], uid);
      const savedSquads = StorageEngine.loadData('squads', [], uid);
      AppState.squad = savedSquads && savedSquads.length > 0 ? savedSquads[0] : getDefaultSquad();
      updateHeroMetrics();
    }
  };

  const getDefaultSquad = () => {
    return {
      id: 'squad_default',
      squad_name: 'Primary Starting XI',
      manager: { name: 'Pep Guardiola', playstyle: 'Quick Counter', boost: '+1 Acceleration' },
      roles: { captain: 'Lionel Messi', penalty: 'Cristiano Ronaldo', shortFK: 'Lionel Messi', longFK: 'Roberto Carlos' },
      starting_xi: [
        { id: 'p1', pos: 'GK', name: 'T. Courtois', rating: 98, tier: 'Epic Booster' },
        { id: 'p2', pos: 'LB', name: 'Roberto Carlos', rating: 101, tier: 'Big Time' },
        { id: 'p3', pos: 'CB', name: 'P. Maldini', rating: 103, tier: 'Epic Booster' },
        { id: 'p4', pos: 'CB', name: 'A. Nesta', rating: 101, tier: 'Big Time' },
        { id: 'p5', pos: 'RB', name: 'Cafu', rating: 100, tier: 'Epic Booster' },
        { id: 'p6', pos: 'DMF', name: 'P. Vieira', rating: 104, tier: 'Epic Booster' },
        { id: 'p7', pos: 'DMF', name: 'F. Rijkaard', rating: 101, tier: 'Big Time' },
        { id: 'p8', pos: 'AMF', name: 'K. De Bruyne', rating: 100, tier: 'Show Time' },
        { id: 'p9', pos: 'LWF', name: 'Neymar Jr', rating: 102, tier: 'Big Time' },
        { id: 'p10', pos: 'CF', name: 'K. Mbappé', rating: 103, tier: 'Show Time' },
        { id: 'p11', pos: 'RWF', name: 'L. Messi', rating: 105, tier: 'Big Time' }
      ],
      subs: [
        { id: 's1', pos: 'CF', name: 'C. Ronaldo', rating: 101, tier: 'Show Time' },
        { id: 's2', pos: 'AMF', name: 'Ronaldinho', rating: 103, tier: 'Epic Booster' },
        { id: 's3', pos: 'CMF', name: 'L. Modrić', rating: 99, tier: 'Highlight' },
        { id: 's4', pos: 'CB', name: 'V. van Dijk', rating: 99, tier: 'Highlight' },
        { id: 's5', pos: 'GK', name: 'Alisson', rating: 97, tier: 'Standard' }
      ],
      formation: '4-2-1-3',
      is_active: true
    };
  };

  const updateHeroMetrics = () => {
    const total = AppState.matches.length;
    const wins = AppState.matches.filter(m => m.result === 'W').length;
    const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;
    const trophiesCount = AppState.trophies.filter(t => t.placement === 'champion').length;
    const clipsCount = AppState.recordings.length;

    if (UI.heroMatchesCount) UI.heroMatchesCount.textContent = total;
    if (UI.heroWinRate) UI.heroWinRate.textContent = `${winRate}%`;
    if (UI.heroTrophiesCount) UI.heroTrophiesCount.textContent = trophiesCount;
    if (UI.heroVideosCount) UI.heroVideosCount.textContent = clipsCount;
  };

  // =========================================================================
  // NAVIGATION & VIEW SWITCHING
  // =========================================================================
  const switchSection = (targetSectionId) => {
    AppState.activeSection = targetSectionId;

    // Update Navbar active styles
    UI.navItems.forEach(item => {
      if (item.dataset.section === targetSectionId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Show active section, hide others
    UI.sections.forEach(sec => {
      if (sec.id === `section-${targetSectionId}`) {
        sec.classList.add('active');
      } else {
        sec.classList.remove('active');
      }
    });

    // Render section-specific view
    switch (targetSectionId) {
      case 'dashboard':
        renderDashboard();
        break;
      case 'matches':
        renderMatches();
        break;
      case 'recordings':
        renderRecordings();
        break;
      case 'trophies':
        renderTrophies();
        break;
      case 'tactics':
        renderTactics();
        break;
      case 'squads':
        renderSquads();
        break;
      case 'stats':
        renderStatistics();
        break;
      case 'archive':
        renderArchive();
        break;
      case 'backup':
        // Ready for backup actions
        break;
      case 'settings':
        updateUserUI(AppState.currentUser);
        break;
    }

    // Scroll to top cleanly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const setupNavigationListeners = () => {
    UI.navItems.forEach(item => {
      item.addEventListener('click', () => {
        const target = item.dataset.section;
        if (target) switchSection(target);
      });
    });

    if (UI.btnQuickRecordMatch) {
      UI.btnQuickRecordMatch.addEventListener('click', () => {
        openRecordMatchModal();
      });
    }

    if (UI.userAvatarBadge) {
      UI.userAvatarBadge.addEventListener('click', () => {
        switchSection('settings');
      });
    }

    if (UI.supabaseStatusPill) {
      UI.supabaseStatusPill.addEventListener('click', () => {
        openSupabaseConfigModal();
      });
    }
  };

  // =========================================================================
  // 1. DASHBOARD
  // =========================================================================
  const renderDashboard = () => {
    updateHeroMetrics();

    // 1. Recent Matches (Last 4)
    if (UI.dashboardRecentMatches) {
      const recent = AppState.matches.slice(0, 4);
      if (recent.length === 0) {
        UI.dashboardRecentMatches.innerHTML = `
          <div class="empty-state-box" style="padding: 1.5rem; text-align: center;">
            <i class="fas fa-futbol empty-state-icon" style="font-size: 2rem; margin-bottom: 0.5rem;"></i>
            <h4 style="color: #fff; font-size: 1rem; margin-bottom: 0.3rem;">No Matches Recorded Yet</h4>
            <p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 1rem;">
              Log your eFootball victories to build your authoritative personal archive.
            </p>
            <button class="btn-gold" onclick="document.getElementById('btn-quick-record-match').click()">
              <i class="fas fa-plus-circle"></i> Record First Match
            </button>
          </div>
        `;
      } else {
        UI.dashboardRecentMatches.innerHTML = recent.map(m => `
          <div class="room-card" style="margin-bottom: 0.75rem; padding: 0.85rem 1rem; display: flex; justify-content: space-between; align-items: center; cursor: pointer;" onclick="window.viewMatchDetails('${m.id}')">
            <div style="display: flex; align-items: center; gap: 0.8rem;">
              <span class="score-pill ${m.result === 'W' ? 'win' : (m.result === 'D' ? 'draw' : 'loss')}" style="font-size: 0.85rem; padding: 0.25rem 0.6rem;">
                ${m.result}
              </span>
              <div>
                <div style="font-weight: 700; color: #fff; font-size: 0.95rem;">vs ${escapeHtml(m.opponent)}</div>
                <div style="font-size: 0.76rem; color: var(--text-secondary);">${escapeHtml(m.competition || 'eFootball')} • ${m.match_date || ''}</div>
              </div>
            </div>
            <div style="font-family: var(--font-title); font-size: 1.2rem; font-weight: 700; color: var(--gold-bright);">
              ${m.my_score} - ${m.opp_score}
            </div>
          </div>
        `).join('');
      }
    }

    // 2. Latest Trophy Honors
    if (UI.dashboardTrophyShowcase) {
      const topTrophies = AppState.trophies.slice(0, 2);
      if (topTrophies.length === 0) {
        UI.dashboardTrophyShowcase.innerHTML = `
          <div style="padding: 1rem; text-align: center; color: var(--text-secondary); font-size: 0.85rem;">
            <i class="fas fa-trophy" style="font-size: 1.5rem; color: var(--gold-dark); margin-bottom: 0.4rem; display: block;"></i>
            No trophies logged yet. Record your championship titles!
          </div>
        `;
      } else {
        UI.dashboardTrophyShowcase.innerHTML = topTrophies.map(t => `
          <div class="trophy-card ${t.placement === 'champion' ? 'gold' : 'silver'}" style="padding: 0.8rem 1rem; margin-bottom: 0.6rem;">
            <div style="display: flex; align-items: center; gap: 0.8rem;">
              <div style="font-size: 1.8rem;">${t.placement === 'champion' ? '🏆' : '🥈'}</div>
              <div>
                <div style="font-family: var(--font-title); font-size: 0.95rem; font-weight: 700; color: #fff;">${escapeHtml(t.title)}</div>
                <div style="font-size: 0.76rem; font-family: var(--font-mono); color: var(--gold-bright);">Final: ${escapeHtml(t.final_score || 'Won')} vs ${escapeHtml(t.final_opponent || 'Opponent')}</div>
              </div>
            </div>
          </div>
        `).join('');
      }
    }

    // 3. Active Game Plan Summary
    if (UI.dashboardTacticsSummary) {
      if (AppState.gamePlans.length === 0) {
        UI.dashboardTacticsSummary.innerHTML = `
          <div style="padding: 1rem; text-align: center; color: var(--text-secondary); font-size: 0.85rem;">
            Default setup: 4-2-1-3 Quick Counter. Create custom game plans in Tactical Lab!
          </div>
        `;
      } else {
        const activePlan = AppState.gamePlans[AppState.activeGamePlanIndex] || AppState.gamePlans[0];
        UI.dashboardTacticsSummary.innerHTML = `
          <div style="background: rgba(212, 175, 55, 0.05); border: 1px solid var(--gold-border); border-radius: var(--border-radius-sm); padding: 0.8rem 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
              <strong style="color: #fff; font-size: 0.95rem;">${escapeHtml(activePlan.name)}</strong>
              <span style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--gold-bright); font-weight: 700;">${escapeHtml(activePlan.formation)}</span>
            </div>
            <div style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.4;">
              Playstyle: <span style="color: #fff;">${escapeHtml(activePlan.playstyle)}</span> • Coach: <span style="color: #fff;">${escapeHtml(activePlan.manager || 'Custom')}</span>
            </div>
          </div>
        `;
      }
    }
  };

  // =========================================================================
  // 2. COMPLETE MATCH HISTORY
  // =========================================================================
  const renderMatches = () => {
    if (!UI.matchesHistoryGrid) return;

    let list = [...AppState.matches];

    // Search filter
    if (AppState.filters.matchSearch) {
      const q = AppState.filters.matchSearch.toLowerCase();
      list = list.filter(m => 
        (m.opponent && m.opponent.toLowerCase().includes(q)) ||
        (m.goalscorers && m.goalscorers.toLowerCase().includes(q)) ||
        (m.notes && m.notes.toLowerCase().includes(q)) ||
        (m.competition && m.competition.toLowerCase().includes(q))
      );
    }

    // Result filter
    if (AppState.filters.matchResult !== 'all') {
      list = list.filter(m => m.result === AppState.filters.matchResult);
    }

    // Competition filter
    if (AppState.filters.matchCompetition !== 'all') {
      list = list.filter(m => m.competition === AppState.filters.matchCompetition);
    }

    // Sort order
    if (AppState.filters.matchSort === 'oldest') {
      list.sort((a, b) => new Date(a.match_date || a.created_at) - new Date(b.match_date || b.created_at));
    } else if (AppState.filters.matchSort === 'opponent') {
      list.sort((a, b) => (a.opponent || '').localeCompare(b.opponent || ''));
    } else {
      // Newest
      list.sort((a, b) => new Date(b.match_date || b.created_at) - new Date(a.match_date || a.created_at));
    }

    if (list.length === 0) {
      UI.matchesHistoryGrid.innerHTML = `
        <div class="empty-state-box" style="grid-column: 1/-1;">
          <i class="fas fa-futbol empty-state-icon"></i>
          <h3 class="empty-state-title">No Matches Found</h3>
          <p class="empty-state-desc">No match records matched your search or filters. Log a new match to expand your archive.</p>
          <button class="btn-gold" onclick="document.getElementById('btn-new-match-open').click()">
            <i class="fas fa-plus-circle"></i> Record New Match
          </button>
        </div>
      `;
      return;
    }

    UI.matchesHistoryGrid.innerHTML = list.map(m => `
      <div class="room-card" style="display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <!-- Top Row: Competition & Result -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem;">
            <span class="competition-badge" style="position: static; font-size: 0.72rem;">${escapeHtml(m.competition || 'eFootball')}</span>
            <span class="score-pill ${m.result === 'W' ? 'win' : (m.result === 'D' ? 'draw' : 'loss')}">
              ${m.result === 'W' ? 'VICTORY (W)' : (m.result === 'D' ? 'DRAW (D)' : 'DEFEAT (L)')}
            </span>
          </div>

          <!-- Scoreline -->
          <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.6rem;">
            <div>
              <div style="font-size: 0.78rem; font-family: var(--font-mono); color: var(--gold-light); text-transform: uppercase;">Opponent</div>
              <h3 style="color: #fff; font-size: 1.15rem; margin: 0;">vs ${escapeHtml(m.opponent)}</h3>
            </div>
            <div style="font-family: var(--font-title); font-size: 1.5rem; font-weight: 700; color: var(--gold-bright);">
              ${m.my_score} - ${m.opp_score}
            </div>
          </div>

          <!-- Meta badges -->
          <div style="font-size: 0.78rem; color: var(--text-secondary); margin-bottom: 0.8rem; display: flex; flex-wrap: wrap; gap: 0.5rem;">
            <span><i class="far fa-calendar-alt"></i> ${m.match_date || 'Date not recorded'}</span>
            <span><i class="fas fa-chess-board"></i> ${escapeHtml(m.formation_used || '4-2-1-3')}</span>
            ${m.manager_used ? `<span><i class="fas fa-user-tie"></i> ${escapeHtml(m.manager_used)}</span>` : ''}
          </div>

          <!-- Goalscorers snippet -->
          ${m.goalscorers ? `
            <div style="font-size: 0.8rem; color: var(--text-gold); margin-bottom: 0.6rem;">
              <i class="fas fa-futbol"></i> <strong>Goals:</strong> ${escapeHtml(m.goalscorers)}
            </div>
          ` : ''}

          <!-- Notes snippet -->
          ${m.notes ? `
            <p style="font-size: 0.82rem; color: var(--text-secondary); line-height: 1.4; margin-bottom: 0.8rem;">
              ${escapeHtml(m.notes)}
            </p>
          ` : ''}

          <!-- Video clip indicator -->
          ${(m.video_url || m.media_storage_id) ? `
            <div style="margin-bottom: 0.8rem;">
              <button class="btn-secondary" style="font-size: 0.76rem; padding: 0.3rem 0.6rem; color: #3498db; border-color: rgba(52, 152, 219, 0.4);" onclick="window.playMatchClip('${m.id}')">
                <i class="fas fa-play"></i> Watch Attached Gameplay Clip
              </button>
            </div>
          ` : ''}
        </div>

        <!-- Action Row -->
        <div style="display: flex; gap: 0.5rem; border-top: 1px solid rgba(212, 175, 55, 0.15); padding-top: 0.8rem; margin-top: 0.6rem;">
          <button class="btn-secondary" style="flex: 1; font-size: 0.78rem; padding: 0.35rem 0.6rem;" onclick="window.viewMatchDetails('${m.id}')">
            <i class="fas fa-eye"></i> Details
          </button>
          <button class="btn-secondary" style="font-size: 0.78rem; padding: 0.35rem 0.6rem;" onclick="window.editMatch('${m.id}')">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn-secondary" style="font-size: 0.78rem; padding: 0.35rem 0.6rem; color: var(--loss-color);" onclick="window.deleteMatch('${m.id}')">
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>
      </div>
    `).join('');
  };

  const openRecordMatchModal = (existingMatch = null) => {
    if (!UI.modalNewMatch) return;
    UI.formNewMatch.reset();

    if (UI.uploadProgressWrap) UI.uploadProgressWrap.style.display = 'none';

    if (existingMatch) {
      AppState.editingMatchId = existingMatch.id;
      if (UI.modalMatchTitle) UI.modalMatchTitle.textContent = 'Edit Match Record';
      if (UI.matchEditId) UI.matchEditId.value = existingMatch.id;
      if (UI.matchOpponent) UI.matchOpponent.value = existingMatch.opponent || '';
      if (UI.matchCompetition) UI.matchCompetition.value = existingMatch.competition || 'Division 1 Online';
      if (UI.matchMyScore) UI.matchMyScore.value = existingMatch.my_score !== undefined ? existingMatch.my_score : 3;
      if (UI.matchOppScore) UI.matchOppScore.value = existingMatch.opp_score !== undefined ? existingMatch.opp_score : 1;
      if (UI.matchDate) UI.matchDate.value = existingMatch.match_date || new Date().toISOString().slice(0, 10);
      if (UI.matchTypeSelect) UI.matchTypeSelect.value = existingMatch.match_type || 'Ranked Match';
      if (UI.matchFormationSelect) UI.matchFormationSelect.value = existingMatch.formation_used || '4-2-1-3';
      if (UI.matchManagerInput) UI.matchManagerInput.value = existingMatch.manager_used || '';
      if (UI.matchGoalscorers) UI.matchGoalscorers.value = existingMatch.goalscorers || '';
      if (UI.matchVideoUrl) UI.matchVideoUrl.value = existingMatch.video_url || '';
      if (UI.matchNotes) UI.matchNotes.value = existingMatch.notes || '';
    } else {
      AppState.editingMatchId = null;
      if (UI.modalMatchTitle) UI.modalMatchTitle.textContent = 'Record Match Result';
      if (UI.matchEditId) UI.matchEditId.value = '';
      if (UI.matchDate) UI.matchDate.value = new Date().toISOString().slice(0, 10);
      if (UI.matchMyScore) UI.matchMyScore.value = 3;
      if (UI.matchOppScore) UI.matchOppScore.value = 1;
      if (UI.matchCompetition) UI.matchCompetition.value = 'Division 1 Online';
      if (UI.matchManagerInput) UI.matchManagerInput.value = AppState.squad?.manager?.name || 'Pep Guardiola';
    }

    openModal(UI.modalNewMatch);
  };

  const setupMatchEventListeners = () => {
    if (UI.btnNewMatchOpen) {
      UI.btnNewMatchOpen.addEventListener('click', () => openRecordMatchModal());
    }

    // Filter controls
    if (UI.searchMatchesInput) {
      UI.searchMatchesInput.addEventListener('input', (e) => {
        AppState.filters.matchSearch = e.target.value.trim();
        renderMatches();
      });
    }

    if (UI.filterMatchResult) {
      UI.filterMatchResult.addEventListener('change', (e) => {
        AppState.filters.matchResult = e.target.value;
        renderMatches();
      });
    }

    if (UI.filterMatchCompetition) {
      UI.filterMatchCompetition.addEventListener('change', (e) => {
        AppState.filters.matchCompetition = e.target.value;
        renderMatches();
      });
    }

    if (UI.sortMatchesSelect) {
      UI.sortMatchesSelect.addEventListener('change', (e) => {
        AppState.filters.matchSort = e.target.value;
        renderMatches();
      });
    }

    // Match Form Submit
    if (UI.formNewMatch) {
      UI.formNewMatch.addEventListener('submit', async (e) => {
        e.preventDefault();

        const opponent = UI.matchOpponent.value.trim();
        const competition = UI.matchCompetition.value.trim();
        const myScore = parseInt(UI.matchMyScore.value, 10) || 0;
        const oppScore = parseInt(UI.matchOppScore.value, 10) || 0;
        const matchDate = UI.matchDate.value || new Date().toISOString().slice(0, 10);
        const matchType = UI.matchTypeSelect.value;
        const formation = UI.matchFormationSelect.value;
        const manager = UI.matchManagerInput.value.trim();
        const goalscorers = UI.matchGoalscorers.value.trim();
        const notes = UI.matchNotes.value.trim();
        let videoUrl = UI.matchVideoUrl.value.trim();
        const videoFile = UI.matchVideoFile.files[0];

        try {
          // Video upload if provided
          if (videoFile) {
            if (UI.uploadProgressWrap) UI.uploadProgressWrap.style.display = 'block';
            if (UI.uploadProgressText) UI.uploadProgressText.textContent = 'Uploading gameplay recording...';

            const uploaded = await SupabaseBridge.recordings.uploadMediaFile(videoFile, (pct) => {
              if (UI.uploadProgressFill) UI.uploadProgressFill.style.width = `${pct}%`;
              if (UI.uploadProgressText) UI.uploadProgressText.textContent = `Uploading: ${pct}%`;
            });

            if (uploaded && uploaded.videoUrl) {
              videoUrl = uploaded.videoUrl;
            }
          }

          const matchPayload = {
            opponent,
            competition,
            my_score: myScore,
            opp_score: oppScore,
            match_date: matchDate,
            match_type: matchType,
            formation_used: formation,
            manager_used: manager,
            goalscorers,
            notes,
            video_url: videoUrl
          };

          if (AppState.editingMatchId) {
            // Update
            const updated = await SupabaseBridge.matches.updateMatch(AppState.editingMatchId, matchPayload);
            const idx = AppState.matches.findIndex(m => m.id === AppState.editingMatchId);
            if (idx !== -1) AppState.matches[idx] = updated;
            showToast('Match record updated successfully!', 'success');
          } else {
            // Create
            const created = await SupabaseBridge.matches.createMatch(matchPayload);
            AppState.matches.unshift(created);
            showToast('Match recorded and archived!', 'success');
          }

          closeModal(UI.modalNewMatch);
          UI.formNewMatch.reset();
          AppState.editingMatchId = null;

          updateHeroMetrics();
          renderMatches();
          renderDashboard();
        } catch (err) {
          console.error('Error saving match record:', err);
          showToast(err.message || 'Error saving match record.', 'error');
        }
      });
    }

    // Global action helpers
    window.editMatch = (matchId) => {
      const match = AppState.matches.find(m => m.id === matchId);
      if (match) openRecordMatchModal(match);
    };

    window.deleteMatch = async (matchId) => {
      if (!confirm('Are you sure you want to delete this match record? This will update your personal stats.')) return;
      try {
        await SupabaseBridge.matches.deleteMatch(matchId);
        AppState.matches = AppState.matches.filter(m => m.id !== matchId);
        updateHeroMetrics();
        renderMatches();
        renderDashboard();
        showToast('Match record deleted.', 'info');
      } catch (err) {
        showToast(err.message || 'Error deleting match.', 'error');
      }
    };

    window.viewMatchDetails = (matchId) => {
      const m = AppState.matches.find(item => item.id === matchId);
      if (!m || !UI.matchDetailsBody) return;

      UI.matchDetailsBody.innerHTML = `
        <div style="background: rgba(212, 175, 55, 0.06); border: 1px solid var(--gold-border); border-radius: var(--border-radius-sm); padding: 1.2rem; margin-bottom: 1rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.6rem;">
            <span class="competition-badge" style="position: static;">${escapeHtml(m.competition || 'eFootball')}</span>
            <span class="score-pill ${m.result === 'W' ? 'win' : (m.result === 'D' ? 'draw' : 'loss')}">
              ${m.result === 'W' ? 'VICTORY' : (m.result === 'D' ? 'DRAW' : 'DEFEAT')}
            </span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h2 style="font-family: var(--font-title); font-size: 1.3rem; color: #fff; margin: 0;">vs ${escapeHtml(m.opponent)}</h2>
            <div style="font-family: var(--font-title); font-size: 1.8rem; font-weight: 700; color: var(--gold-bright);">
              ${m.my_score} - ${m.opp_score}
            </div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem; margin-bottom: 1rem; font-size: 0.86rem;">
          <div><strong style="color: var(--gold-light);">Date:</strong> ${m.match_date || 'N/A'}</div>
          <div><strong style="color: var(--gold-light);">Match Type:</strong> ${escapeHtml(m.match_type || 'Ranked Match')}</div>
          <div><strong style="color: var(--gold-light);">Formation:</strong> ${escapeHtml(m.formation_used || '4-2-1-3')}</div>
          <div><strong style="color: var(--gold-light);">Coach:</strong> ${escapeHtml(m.manager_used || 'Pep Guardiola')}</div>
        </div>

        ${m.goalscorers ? `
          <div style="margin-bottom: 1rem; background: rgba(0,0,0,0.3); padding: 0.8rem; border-radius: 6px;">
            <div style="font-size: 0.8rem; font-family: var(--font-mono); color: var(--gold-bright); text-transform: uppercase; margin-bottom: 0.2rem;">Goalscorers</div>
            <div style="font-size: 0.9rem; color: #fff;">${escapeHtml(m.goalscorers)}</div>
          </div>
        ` : ''}

        ${m.notes ? `
          <div style="margin-bottom: 1rem; background: rgba(0,0,0,0.3); padding: 0.8rem; border-radius: 6px;">
            <div style="font-size: 0.8rem; font-family: var(--font-mono); color: var(--gold-bright); text-transform: uppercase; margin-bottom: 0.2rem;">Tactical Notes</div>
            <p style="font-size: 0.86rem; color: var(--text-secondary); line-height: 1.5; margin: 0;">${escapeHtml(m.notes)}</p>
          </div>
        ` : ''}

        ${m.video_url ? `
          <div style="margin-top: 1rem;">
            <button class="btn-gold" style="width: 100%; justify-content: center;" onclick="closeModal(UI.modalMatchDetails); window.playMatchClip('${m.id}')">
              <i class="fas fa-play"></i> Watch Gameplay Video
            </button>
          </div>
        ` : ''}
      `;

      openModal(UI.modalMatchDetails);
    };

    window.playMatchClip = (matchId) => {
      const match = AppState.matches.find(m => m.id === matchId);
      if (!match || !match.video_url) {
        showToast('No video attached to this match record.', 'error');
        return;
      }
      playCinemaVideo(match.video_url, `vs ${match.opponent}`, `Score: ${match.my_score} - ${match.opp_score} • ${match.competition}`);
    };
  };

  // =========================================================================
  // 3. MATCH RECORDINGS & HIGHLIGHTS
  // =========================================================================
  const renderRecordings = () => {
    if (!UI.recordingsGrid) return;

    let list = [...AppState.recordings];

    if (AppState.filters.recordingSearch) {
      const q = AppState.filters.recordingSearch.toLowerCase();
      list = list.filter(r => 
        (r.title && r.title.toLowerCase().includes(q)) ||
        (r.description && r.description.toLowerCase().includes(q)) ||
        (Array.isArray(r.tags) && r.tags.some(t => t.toLowerCase().includes(q)))
      );
    }

    if (list.length === 0) {
      UI.recordingsGrid.innerHTML = `
        <div class="empty-state-box" style="grid-column: 1/-1;">
          <i class="fas fa-video empty-state-icon"></i>
          <h3 class="empty-state-title">Gameplay Vault Ready</h3>
          <p class="empty-state-desc">Upload your eFootball highlights, goals, comeback wins and defensive masterclasses.</p>
          <button class="btn-gold" onclick="document.getElementById('btn-upload-recording-modal').click()">
            <i class="fas fa-cloud-upload-alt"></i> Upload First Highlight
          </button>
        </div>
      `;
      return;
    }

    UI.recordingsGrid.innerHTML = list.map(r => `
      <div class="recording-card">
        <div class="video-thumb-container" onclick="window.playHighlightClip('${r.id}')">
          <img src="${r.thumbnail_url || 'assets/bg.jpg'}" alt="Gameplay Thumbnail" class="video-thumb">
          <div class="play-overlay-btn"><i class="fas fa-play"></i></div>
          <span class="duration-badge"><i class="fas fa-film"></i> HD Highlight</span>
        </div>
        <div class="recording-info">
          <div style="display: flex; justify-content: space-between; align-items: start; gap: 0.5rem; margin-bottom: 0.3rem;">
            <h4 style="color: #fff; font-size: 1rem; margin: 0;">${escapeHtml(r.title)}</h4>
            <button class="btn-secondary" style="padding: 0.2rem 0.5rem; font-size: 0.72rem; color: var(--loss-color);" onclick="window.deleteRecording('${r.id}')" title="Delete Recording">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
          <div style="font-size: 0.75rem; font-family: var(--font-mono); color: var(--gold-light); margin-bottom: 0.4rem;">
            ${r.date || ''} ${r.file_size_bytes ? `• ${(r.file_size_bytes / 1024 / 1024).toFixed(1)} MB` : ''}
          </div>
          ${Array.isArray(r.tags) && r.tags.length > 0 ? `
            <div style="display: flex; flex-wrap: wrap; gap: 0.35rem; margin-bottom: 0.5rem;">
              ${r.tags.map(tag => `<span style="background: rgba(212,175,55,0.15); color: var(--gold-bright); font-size: 0.7rem; padding: 0.15rem 0.45rem; border-radius: 4px;">#${escapeHtml(tag)}</span>`).join('')}
            </div>
          ` : ''}
          ${r.description ? `
            <p style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.4; margin: 0;">${escapeHtml(r.description)}</p>
          ` : ''}
        </div>
      </div>
    `).join('');
  };

  const playCinemaVideo = (url, title, meta) => {
    if (!UI.modalCinemaPlayer || !UI.cinemaVideoPlayer) return;
    UI.cinemaVideoPlayer.src = url;
    if (UI.cinemaVideoTitle) UI.cinemaVideoTitle.textContent = title;
    if (UI.cinemaVideoMeta) UI.cinemaVideoMeta.textContent = meta;

    if (UI.cinemaDownloadBtn) {
      UI.cinemaDownloadBtn.onclick = () => {
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title.replace(/\s+/g, '_')}.mp4`;
        a.target = '_blank';
        a.click();
      };
    }

    openModal(UI.modalCinemaPlayer);
    UI.cinemaVideoPlayer.play().catch(() => {});
  };

  const setupRecordingEventListeners = () => {
    if (UI.btnUploadRecordingModal) {
      UI.btnUploadRecordingModal.addEventListener('click', () => {
        UI.formNewRecording.reset();
        if (UI.recProgressWrap) UI.recProgressWrap.style.display = 'none';
        openModal(UI.modalNewRecording);
      });
    }

    if (UI.searchRecordings) {
      UI.searchRecordings.addEventListener('input', (e) => {
        AppState.filters.recordingSearch = e.target.value.trim();
        renderRecordings();
      });
    }

    if (UI.formNewRecording) {
      UI.formNewRecording.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = UI.recTitleInput.value.trim();
        const file = UI.recFileInput.files[0];
        const tagsRaw = UI.recTagsInput.value.trim();
        const desc = UI.recDescInput.value.trim();

        if (!file) {
          showToast('Please select a video file to upload.', 'error');
          return;
        }

        try {
          if (UI.recProgressWrap) UI.recProgressWrap.style.display = 'block';
          if (UI.recProgressText) UI.recProgressText.textContent = 'Uploading gameplay recording...';

          const uploadRes = await SupabaseBridge.recordings.uploadMediaFile(file, (pct) => {
            if (UI.recProgressFill) UI.recProgressFill.style.width = `${pct}%`;
            if (UI.recProgressText) UI.recProgressText.textContent = `Uploading: ${pct}%`;
          });

          const tags = tagsRaw.split(',').map(t => t.trim()).filter(Boolean);

          const newRec = await SupabaseBridge.recordings.createRecording({
            title,
            video_url: uploadRes.videoUrl,
            storage_path: uploadRes.storagePath,
            file_size_bytes: uploadRes.size,
            mime_type: uploadRes.type,
            tags: tags.length > 0 ? tags : ['Highlight'],
            description: desc,
            date: new Date().toISOString().slice(0, 10)
          });

          AppState.recordings.unshift(newRec);
          closeModal(UI.modalNewRecording);
          UI.formNewRecording.reset();

          renderRecordings();
          updateHeroMetrics();
          showToast('Gameplay highlight saved to vault!', 'success');
        } catch (err) {
          console.error('Upload error:', err);
          showToast(err.message || 'Error uploading gameplay clip.', 'error');
        }
      });
    }

    window.playHighlightClip = (recId) => {
      const rec = AppState.recordings.find(r => r.id === recId);
      if (rec) playCinemaVideo(rec.video_url, rec.title, `${rec.date || ''} • Gameplay Highlight`);
    };

    window.deleteRecording = async (recId) => {
      if (!confirm('Are you sure you want to delete this highlight recording?')) return;
      try {
        await SupabaseBridge.recordings.deleteRecording(recId);
        AppState.recordings = AppState.recordings.filter(r => r.id !== recId);
        renderRecordings();
        updateHeroMetrics();
        showToast('Recording removed from vault.', 'info');
      } catch (err) {
        showToast(err.message || 'Error deleting recording.', 'error');
      }
    };
  };

  // =========================================================================
  // 4. TROPHY ROOM & CUP HISTORY
  // =========================================================================
  const renderTrophies = () => {
    if (!UI.trophiesGrid) return;

    let list = [...AppState.trophies];
    if (AppState.filters.trophyTier !== 'all') {
      list = list.filter(t => t.placement === AppState.filters.trophyTier);
    }

    if (list.length === 0) {
      UI.trophiesGrid.innerHTML = `
        <div class="empty-state-box" style="grid-column: 1/-1;">
          <i class="fas fa-trophy empty-state-icon"></i>
          <h3 class="empty-state-title">Trophy Cabinet Ready</h3>
          <p class="empty-state-desc">Win championships in Division 1 or log your milestone cups here.</p>
          <button class="btn-gold" onclick="document.getElementById('btn-new-trophy').click()">
            <i class="fas fa-trophy"></i> Log Championship Honor
          </button>
        </div>
      `;
      return;
    }

    UI.trophiesGrid.innerHTML = list.map(t => {
      const isChamp = t.placement === 'champion';
      const isRunner = t.placement === 'runner_up';
      const icon = isChamp ? '🏆' : isRunner ? '🥈' : '🥉';
      const tierClass = isChamp ? 'gold' : isRunner ? 'silver' : 'bronze';
      const label = isChamp ? 'CHAMPION (1ST PLACE)' : isRunner ? 'RUNNER-UP (2ND PLACE)' : '3RD PLACE / BRONZE';

      return `
        <div class="trophy-card ${tierClass}">
          <div class="trophy-icon-wrap" style="font-size: 2.8rem; text-align: center; margin-bottom: 0.6rem;">${icon}</div>
          <div style="font-family: var(--font-title); font-size: 1.15rem; color: #fff; font-weight: 700; text-align: center; margin-bottom: 0.2rem;">
            ${escapeHtml(t.title)}
          </div>
          <div style="font-size: 0.78rem; font-family: var(--font-mono); color: var(--gold-bright); text-align: center; text-transform: uppercase;">
            ${label}
          </div>
          <div style="font-size: 0.8rem; color: var(--text-secondary); text-align: center; margin-top: 0.5rem;">
            ${t.date_won || ''} ${t.season ? `• ${escapeHtml(t.season)}` : ''}
          </div>
          ${t.final_opponent ? `
            <div style="font-size: 0.82rem; color: var(--gold-light); text-align: center; margin-top: 0.4rem;">
              Final: ${escapeHtml(t.final_score || 'Won')} vs ${escapeHtml(t.final_opponent)}
            </div>
          ` : ''}
          ${t.notes ? `
            <p style="font-size: 0.8rem; color: var(--text-secondary); text-align: center; line-height: 1.4; margin-top: 0.6rem;">
              ${escapeHtml(t.notes)}
            </p>
          ` : ''}
          <div style="text-align: center; margin-top: 0.8rem;">
            <button class="btn-secondary" style="font-size: 0.72rem; padding: 0.25rem 0.6rem; color: var(--loss-color);" onclick="window.deleteTrophy('${t.id}')">
              <i class="fas fa-trash-alt"></i> Remove Trophy
            </button>
          </div>
        </div>
      `;
    }).join('');
  };

  const setupTrophyEventListeners = () => {
    if (UI.btnNewTrophy) {
      UI.btnNewTrophy.addEventListener('click', () => {
        UI.formNewTrophy.reset();
        if (UI.trophyDateInput) UI.trophyDateInput.value = new Date().toISOString().slice(0, 10);
        openModal(UI.modalNewTrophy);
      });
    }

    if (UI.filterTrophyTier) {
      UI.filterTrophyTier.addEventListener('change', (e) => {
        AppState.filters.trophyTier = e.target.value;
        renderTrophies();
      });
    }

    if (UI.formNewTrophy) {
      UI.formNewTrophy.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = UI.trophyTitleInput.value.trim();
        const placement = UI.trophyPlacementInput.value;
        const dateWon = UI.trophyDateInput.value || new Date().toISOString().slice(0, 10);
        const opponent = UI.trophyOpponentInput.value.trim();
        const score = UI.trophyScoreInput.value.trim();
        const notes = UI.trophyNotesInput.value.trim();

        try {
          const newTrophy = await SupabaseBridge.trophies.createTrophy({
            title,
            placement,
            date_won: dateWon,
            final_opponent: opponent,
            final_score: score,
            notes
          });

          AppState.trophies.unshift(newTrophy);
          closeModal(UI.modalNewTrophy);
          UI.formNewTrophy.reset();

          renderTrophies();
          renderDashboard();
          updateHeroMetrics();
          showToast('Championship honor added to Trophy Cabinet!', 'success');
        } catch (err) {
          showToast(err.message || 'Error saving trophy record.', 'error');
        }
      });
    }

    window.deleteTrophy = async (trophyId) => {
      if (!confirm('Are you sure you want to remove this trophy from your cabinet?')) return;
      try {
        await SupabaseBridge.trophies.deleteTrophy(trophyId);
        AppState.trophies = AppState.trophies.filter(t => t.id !== trophyId);
        renderTrophies();
        renderDashboard();
        updateHeroMetrics();
        showToast('Trophy removed.', 'info');
      } catch (err) {
        showToast(err.message || 'Error deleting trophy.', 'error');
      }
    };
  };

  // =========================================================================
  // 5. GAME PLANS & TACTICAL LAB
  // =========================================================================
  const getFormationCoordinates = (formation) => {
    switch (formation) {
      case '4-2-1-3':
        return [
          { role: 'GK', name: 'Goalkeeper', x: 50, y: 90, isGK: true },
          { role: 'LB', name: 'Left Back', x: 18, y: 75 },
          { role: 'CB', name: 'Centre Back', x: 38, y: 78 },
          { role: 'CB', name: 'Centre Back', x: 62, y: 78 },
          { role: 'RB', name: 'Right Back', x: 82, y: 75 },
          { role: 'DMF', name: 'Def Midfielder', x: 38, y: 62 },
          { role: 'DMF', name: 'Def Midfielder', x: 62, y: 62 },
          { role: 'AMF', name: 'Att Midfielder', x: 50, y: 44 },
          { role: 'LWF', name: 'Left Winger', x: 20, y: 22 },
          { role: 'CF', name: 'Centre Forward', x: 50, y: 18 },
          { role: 'RWF', name: 'Right Winger', x: 80, y: 22 }
        ];
      case '3-2-4-1':
        return [
          { role: 'GK', name: 'Goalkeeper', x: 50, y: 90, isGK: true },
          { role: 'CB', name: 'Centre Back', x: 25, y: 76 },
          { role: 'CB', name: 'Centre Back', x: 50, y: 78 },
          { role: 'CB', name: 'Centre Back', x: 75, y: 76 },
          { role: 'DMF', name: 'Def Midfielder', x: 38, y: 62 },
          { role: 'DMF', name: 'Def Midfielder', x: 62, y: 62 },
          { role: 'LMF', name: 'Left Mid', x: 16, y: 44 },
          { role: 'AMF', name: 'Att Midfielder', x: 38, y: 40 },
          { role: 'AMF', name: 'Att Midfielder', x: 62, y: 40 },
          { role: 'RMF', name: 'Right Mid', x: 84, y: 44 },
          { role: 'CF', name: 'Centre Forward', x: 50, y: 18 }
        ];
      case '5-2-3':
        return [
          { role: 'GK', name: 'Goalkeeper', x: 50, y: 90, isGK: true },
          { role: 'LWB', name: 'Left Wing Back', x: 14, y: 70 },
          { role: 'CB', name: 'Centre Back', x: 32, y: 78 },
          { role: 'CB', name: 'Centre Back', x: 50, y: 80 },
          { role: 'CB', name: 'Centre Back', x: 68, y: 78 },
          { role: 'RWB', name: 'Right Wing Back', x: 86, y: 70 },
          { role: 'DMF', name: 'Def Midfielder', x: 40, y: 55 },
          { role: 'CMF', name: 'Cent Midfielder', x: 60, y: 55 },
          { role: 'LWF', name: 'Left Winger', x: 22, y: 24 },
          { role: 'CF', name: 'Centre Forward', x: 50, y: 18 },
          { role: 'RWF', name: 'Right Winger', x: 78, y: 24 }
        ];
      case '4-4-2':
        return [
          { role: 'GK', name: 'Goalkeeper', x: 50, y: 90, isGK: true },
          { role: 'LB', name: 'Left Back', x: 18, y: 75 },
          { role: 'CB', name: 'Centre Back', x: 38, y: 78 },
          { role: 'CB', name: 'Centre Back', x: 62, y: 78 },
          { role: 'RB', name: 'Right Back', x: 82, y: 75 },
          { role: 'LMF', name: 'Left Mid', x: 18, y: 50 },
          { role: 'CMF', name: 'Cent Midfielder', x: 40, y: 54 },
          { role: 'CMF', name: 'Cent Midfielder', x: 60, y: 54 },
          { role: 'RMF', name: 'Right Mid', x: 82, y: 50 },
          { role: 'CF', name: 'Striker Left', x: 38, y: 20 },
          { role: 'CF', name: 'Striker Right', x: 62, y: 20 }
        ];
      default: // 4-3-3
        return [
          { role: 'GK', name: 'Goalkeeper', x: 50, y: 90, isGK: true },
          { role: 'LB', name: 'Left Back', x: 18, y: 75 },
          { role: 'CB', name: 'Centre Back', x: 38, y: 78 },
          { role: 'CB', name: 'Centre Back', x: 62, y: 78 },
          { role: 'RB', name: 'Right Back', x: 82, y: 75 },
          { role: 'DMF', name: 'Def Midfielder', x: 50, y: 62 },
          { role: 'CMF', name: 'Cent Midfielder', x: 35, y: 48 },
          { role: 'CMF', name: 'Cent Midfielder', x: 65, y: 48 },
          { role: 'LWF', name: 'Left Winger', x: 20, y: 24 },
          { role: 'CF', name: 'Centre Forward', x: 50, y: 18 },
          { role: 'RWF', name: 'Right Winger', x: 80, y: 24 }
        ];
    }
  };

  const renderTactics = () => {
    if (!UI.tacticsField || !UI.tacticsControlsPanel) return;

    // Check if any plans exist
    if (AppState.gamePlans.length === 0) {
      UI.tacticsField.querySelectorAll('.player-node').forEach(n => n.remove());
      UI.tacticsControlsPanel.innerHTML = `
        <div class="glass-panel" style="text-align: center; padding: 2rem;">
          <i class="fas fa-chess-board" style="font-size: 2.5rem; color: var(--gold-bright); margin-bottom: 0.8rem;"></i>
          <h3 style="color: #fff; margin-bottom: 0.5rem;">Tactical Lab Ready</h3>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1.2rem;">
            Create custom meta setups with individual player attacking/defensive instructions and draggable pitch formations.
          </p>
          <button class="btn-gold" onclick="document.getElementById('btn-create-tactic').click()">
            <i class="fas fa-plus-circle"></i> Create First Game Plan
          </button>
        </div>
      `;
      return;
    }

    const plan = AppState.gamePlans[AppState.activeGamePlanIndex] || AppState.gamePlans[0];

    // Render Tactics Controls Panel
    UI.tacticsControlsPanel.innerHTML = `
      <div class="glass-panel" style="margin-bottom: 1rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem;">
          <select class="filter-select" id="select-active-plan" style="font-size: 0.95rem; font-weight: 700; color: #fff; background: rgba(0,0,0,0.5);">
            ${AppState.gamePlans.map((p, idx) => `
              <option value="${idx}" ${idx === AppState.activeGamePlanIndex ? 'selected' : ''}>
                ${escapeHtml(p.name)} (${p.formation}) ${p.is_favorite ? '★' : ''}
              </option>
            `).join('')}
          </select>

          <button class="btn-secondary" id="btn-toggle-favorite-plan" style="font-size: 0.78rem; padding: 0.35rem 0.65rem;" title="Favorite this plan">
            <i class="${plan.is_favorite ? 'fas fa-star' : 'far fa-star'}" style="color: var(--gold-bright);"></i>
          </button>
        </div>

        <div style="display: flex; gap: 0.8rem; margin-bottom: 0.8rem; font-size: 0.85rem;">
          <div><strong style="color: var(--gold-light);">Playstyle:</strong> <span style="color: #fff;">${escapeHtml(plan.playstyle)}</span></div>
          <div><strong style="color: var(--gold-light);">Manager:</strong> <span style="color: #fff;">${escapeHtml(plan.manager || 'Custom')}</span></div>
        </div>

        <p style="font-size: 0.84rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 1rem;">
          ${escapeHtml(plan.description || 'No custom tactical description provided.')}
        </p>

        <div style="background: rgba(0,0,0,0.3); border-radius: 6px; padding: 0.8rem; margin-bottom: 1rem;">
          <div style="font-size: 0.78rem; font-family: var(--font-mono); color: var(--gold-bright); text-transform: uppercase; margin-bottom: 0.3rem;">When to Deploy</div>
          <div style="font-size: 0.84rem; color: #fff;">${escapeHtml(plan.when_to_use || 'Primary match configuration.')}</div>
        </div>

        <h4 style="font-family: var(--font-mono); font-size: 0.82rem; text-transform: uppercase; color: var(--gold-light); margin-bottom: 0.6rem;">Individual Player Instructions</h4>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: 0.8rem;">
          <div style="background: rgba(46, 204, 113, 0.1); border: 1px solid rgba(46, 204, 113, 0.3); border-radius: 6px; padding: 0.6rem;">
            <div style="color: var(--win-color); font-weight: 700;">Attacking 1:</div>
            <div>${escapeHtml(plan.offensive_instructions?.atk1 || 'None')}</div>
          </div>
          <div style="background: rgba(46, 204, 113, 0.1); border: 1px solid rgba(46, 204, 113, 0.3); border-radius: 6px; padding: 0.6rem;">
            <div style="color: var(--win-color); font-weight: 700;">Attacking 2:</div>
            <div>${escapeHtml(plan.offensive_instructions?.atk2 || 'None')}</div>
          </div>
          <div style="background: rgba(231, 76, 60, 0.1); border: 1px solid rgba(231, 76, 60, 0.3); border-radius: 6px; padding: 0.6rem;">
            <div style="color: var(--loss-color); font-weight: 700;">Defensive 1:</div>
            <div>${escapeHtml(plan.defensive_instructions?.def1 || 'None')}</div>
          </div>
          <div style="background: rgba(231, 76, 60, 0.1); border: 1px solid rgba(231, 76, 60, 0.3); border-radius: 6px; padding: 0.6rem;">
            <div style="color: var(--loss-color); font-weight: 700;">Defensive 2:</div>
            <div>${escapeHtml(plan.defensive_instructions?.def2 || 'None')}</div>
          </div>
        </div>
      </div>
    `;

    // Bind Plan Switcher
    const selectPlan = document.getElementById('select-active-plan');
    if (selectPlan) {
      selectPlan.addEventListener('change', (e) => {
        AppState.activeGamePlanIndex = parseInt(e.target.value, 10) || 0;
        renderTactics();
        renderDashboard();
      });
    }

    // Bind Favorite Toggle
    const btnFav = document.getElementById('btn-toggle-favorite-plan');
    if (btnFav) {
      btnFav.addEventListener('click', async () => {
        try {
          const newFav = !plan.is_favorite;
          await SupabaseBridge.gamePlans.updateGamePlan(plan.id, { is_favorite: newFav });
          plan.is_favorite = newFav;
          renderTactics();
          showToast(`Game plan ${newFav ? 'marked as favorite ★' : 'unfavorited'}.`, 'success');
        } catch (err) {
          showToast('Error updating favorite.', 'error');
        }
      });
    }

    // Render Draggable Pitch Nodes
    UI.tacticsField.querySelectorAll('.player-node').forEach(n => n.remove());
    const nodes = (plan.nodes && plan.nodes.length === 11) ? plan.nodes : getFormationCoordinates(plan.formation);

    nodes.forEach((node, nodeIdx) => {
      const el = document.createElement('div');
      el.className = `player-node ${node.isGK ? 'gk' : ''}`;
      el.style.left = `${node.x}%`;
      el.style.top = `${node.y}%`;
      el.dataset.nodeIndex = nodeIdx;

      el.innerHTML = `
        <div class="player-token">${node.role}</div>
        <div class="player-name-tag">${escapeHtml(node.name)}</div>
      `;

      // Enable Drag and Drop on Desktop and Mobile
      makeDraggable(el, UI.tacticsField, (newX, newY) => {
        node.x = Math.round(newX);
        node.y = Math.round(newY);
        // Persist node updates to game plan
        plan.nodes = nodes;
        SupabaseBridge.gamePlans.updateGamePlan(plan.id, { nodes: nodes }).catch(console.warn);
      });

      // Double click or long press to rename player node
      el.addEventListener('dblclick', () => {
        const newName = prompt(`Enter player name for position ${node.role}:`, node.name);
        if (newName && newName.trim()) {
          node.name = newName.trim();
          el.querySelector('.player-name-tag').textContent = node.name;
          plan.nodes = nodes;
          SupabaseBridge.gamePlans.updateGamePlan(plan.id, { nodes: nodes }).catch(console.warn);
        }
      });

      UI.tacticsField.appendChild(el);
    });
  };

  // Drag and Drop Helper for Pitch Chalkboard
  const makeDraggable = (nodeEl, containerEl, onDragEnd) => {
    let startX = 0, startY = 0, initialLeft = 0, initialTop = 0, isDragging = false;

    const onPointerDown = (e) => {
      isDragging = true;
      startX = e.clientX || (e.touches && e.touches[0].clientX);
      startY = e.clientY || (e.touches && e.touches[0].clientY);

      const rect = containerEl.getBoundingClientRect();
      const nodeRect = nodeEl.getBoundingClientRect();
      initialLeft = ((nodeRect.left - rect.left) / rect.width) * 100;
      initialTop = ((nodeRect.top - rect.top) / rect.height) * 100;

      nodeEl.style.zIndex = '100';
      nodeEl.style.cursor = 'grabbing';

      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
      window.addEventListener('touchmove', onPointerMove, { passive: false });
      window.addEventListener('touchend', onPointerUp);
    };

    const onPointerMove = (e) => {
      if (!isDragging) return;
      if (e.cancelable) e.preventDefault();

      const curX = e.clientX || (e.touches && e.touches[0].clientX);
      const curY = e.clientY || (e.touches && e.touches[0].clientY);
      const rect = containerEl.getBoundingClientRect();

      const dx = ((curX - startX) / rect.width) * 100;
      const dy = ((curY - startY) / rect.height) * 100;

      let newLeft = Math.max(5, Math.min(95, initialLeft + dx));
      let newTop = Math.max(5, Math.min(95, initialTop + dy));

      nodeEl.style.left = `${newLeft}%`;
      nodeEl.style.top = `${newTop}%`;
    };

    const onPointerUp = () => {
      if (!isDragging) return;
      isDragging = false;
      nodeEl.style.zIndex = '';
      nodeEl.style.cursor = 'grab';

      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);

      const pctX = parseFloat(nodeEl.style.left);
      const pctY = parseFloat(nodeEl.style.top);
      if (onDragEnd) onDragEnd(pctX, pctY);
    };

    nodeEl.addEventListener('pointerdown', onPointerDown);
    nodeEl.addEventListener('touchstart', onPointerDown, { passive: true });
  };

  const setupTacticsEventListeners = () => {
    if (UI.btnCreateTactic) {
      UI.btnCreateTactic.addEventListener('click', () => {
        UI.formCreateTactic.reset();
        openModal(UI.modalCreateTactic);
      });
    }

    if (UI.btnDuplicateTactic) {
      UI.btnDuplicateTactic.addEventListener('click', async () => {
        const cur = AppState.gamePlans[AppState.activeGamePlanIndex];
        if (!cur) return;
        try {
          const dup = await SupabaseBridge.gamePlans.duplicateGamePlan(cur.id);
          AppState.gamePlans.push(dup);
          AppState.activeGamePlanIndex = AppState.gamePlans.length - 1;
          renderTactics();
          showToast(`Game plan duplicated as "${dup.name}"!`, 'success');
        } catch (err) {
          showToast('Error duplicating game plan.', 'error');
        }
      });
    }

    if (UI.btnDeleteTactic) {
      UI.btnDeleteTactic.addEventListener('click', async () => {
        const cur = AppState.gamePlans[AppState.activeGamePlanIndex];
        if (!cur) return;
        if (!confirm(`Are you sure you want to delete game plan "${cur.name}"?`)) return;

        try {
          await SupabaseBridge.gamePlans.deleteGamePlan(cur.id);
          AppState.gamePlans = AppState.gamePlans.filter(p => p.id !== cur.id);
          AppState.activeGamePlanIndex = 0;
          renderTactics();
          renderDashboard();
          showToast('Game plan deleted.', 'info');
        } catch (err) {
          showToast('Error deleting game plan.', 'error');
        }
      });
    }

    if (UI.formCreateTactic) {
      UI.formCreateTactic.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = UI.tacticNameInput.value.trim();
        const formation = UI.tacticFormationInput.value;
        const playstyle = UI.tacticPlaystyleInput.value;
        const manager = UI.tacticManagerInput.value.trim();
        const desc = UI.tacticDescInput.value.trim();
        const whenToUse = UI.tacticWhentouseInput.value.trim();
        const atk1 = UI.tacticAtk1Input.value;
        const atk2 = UI.tacticAtk2Input.value;
        const def1 = UI.tacticDef1Input.value;
        const def2 = UI.tacticDef2Input.value;

        try {
          const newPlan = await SupabaseBridge.gamePlans.createGamePlan({
            name,
            formation,
            playstyle,
            manager: manager || 'Pep Guardiola',
            description: desc,
            when_to_use: whenToUse,
            offensive_instructions: { atk1, atk2 },
            defensive_instructions: { def1, def2 },
            nodes: getFormationCoordinates(formation),
            is_favorite: false
          });

          AppState.gamePlans.unshift(newPlan);
          AppState.activeGamePlanIndex = 0;
          closeModal(UI.modalCreateTactic);
          UI.formCreateTactic.reset();

          renderTactics();
          renderDashboard();
          showToast('New game plan saved to Tactical Lab!', 'success');
        } catch (err) {
          showToast(err.message || 'Error saving game plan.', 'error');
        }
      });
    }
  };

  // =========================================================================
  // 6. STARTING ELEVEN & SQUAD MANAGEMENT
  // =========================================================================
  const renderSquads = () => {
    const squad = AppState.squad || getDefaultSquad();

    // 1. Manager Card
    if (UI.managerName) UI.managerName.textContent = squad.manager?.name || 'Pep Guardiola';
    if (UI.managerPlaystyle) UI.managerPlaystyle.textContent = squad.manager?.playstyle || 'Quick Counter';
    if (UI.managerBoost) UI.managerBoost.textContent = squad.manager?.boost || '+1 Acceleration';

    // 2. Starting XI Grid
    if (UI.startingXiGrid) {
      const startingXI = squad.starting_xi || [];
      if (startingXI.length === 0) {
        UI.startingXiGrid.innerHTML = `
          <div style="grid-column: 1/-1; padding: 1.5rem; text-align: center; color: var(--text-secondary);">
            No players assigned to Starting XI yet. Click "Add Player" to build your squad.
          </div>
        `;
      } else {
        UI.startingXiGrid.innerHTML = startingXI.map(p => `
          <div class="player-card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.3rem;">
              <span class="pos-badge ${p.pos.toLowerCase()}">${p.pos}</span>
              <span style="font-family: var(--font-title); font-size: 1.1rem; font-weight: 700; color: var(--gold-bright);">${p.rating}</span>
            </div>
            <div style="font-weight: 700; color: #fff; font-size: 0.95rem; margin-bottom: 0.2rem;">${escapeHtml(p.name)}</div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.4rem;">
              <span style="font-size: 0.72rem; color: var(--text-secondary);">${escapeHtml(p.tier || 'Standard')}</span>
              <button class="btn-secondary" style="padding: 0.15rem 0.4rem; font-size: 0.7rem; color: var(--loss-color);" onclick="window.removeSquadPlayer('${p.id}', 'starting_xi')" title="Remove Player">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
        `).join('');
      }
    }

    // 3. Substitute Bench
    if (UI.subsRow) {
      const subs = squad.subs || [];
      if (subs.length === 0) {
        UI.subsRow.innerHTML = `
          <div style="padding: 1rem; color: var(--text-secondary); font-size: 0.85rem;">
            No substitutes on bench. Click "Add Player" with Substitute slot selected.
          </div>
        `;
      } else {
        UI.subsRow.innerHTML = subs.map(s => `
          <div class="player-card" style="min-width: 140px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.3rem;">
              <span class="pos-badge ${s.pos.toLowerCase()}">${s.pos}</span>
              <span style="font-family: var(--font-title); font-size: 1rem; font-weight: 700; color: var(--gold-bright);">${s.rating}</span>
            </div>
            <div style="font-weight: 700; color: #fff; font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(s.name)}</div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.3rem;">
              <span style="font-size: 0.7rem; color: var(--text-secondary);">${escapeHtml(s.tier || 'Standard')}</span>
              <button class="btn-secondary" style="padding: 0.1rem 0.35rem; font-size: 0.65rem; color: var(--loss-color);" onclick="window.removeSquadPlayer('${s.id}', 'subs')" title="Remove Sub">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
        `).join('');
      }
    }

    // 4. Set-Piece Specialists & Captaincy
    if (UI.rolesList) {
      const roles = squad.roles || {};
      UI.rolesList.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.8rem; font-size: 0.86rem;">
          <div style="background: rgba(0,0,0,0.3); padding: 0.8rem; border-radius: 6px; border: 1px solid var(--gold-border);">
            <div style="color: var(--gold-bright); font-size: 0.78rem; text-transform: uppercase; font-family: var(--font-mono);">Captain (C)</div>
            <div style="color: #fff; font-weight: 700; margin-top: 0.2rem;">${escapeHtml(roles.captain || 'Not Assigned')}</div>
          </div>
          <div style="background: rgba(0,0,0,0.3); padding: 0.8rem; border-radius: 6px; border: 1px solid var(--gold-border);">
            <div style="color: var(--gold-bright); font-size: 0.78rem; text-transform: uppercase; font-family: var(--font-mono);">Penalty Taker</div>
            <div style="color: #fff; font-weight: 700; margin-top: 0.2rem;">${escapeHtml(roles.penalty || 'Not Assigned')}</div>
          </div>
          <div style="background: rgba(0,0,0,0.3); padding: 0.8rem; border-radius: 6px; border: 1px solid var(--gold-border);">
            <div style="color: var(--gold-bright); font-size: 0.78rem; text-transform: uppercase; font-family: var(--font-mono);">Short Free-Kick</div>
            <div style="color: #fff; font-weight: 700; margin-top: 0.2rem;">${escapeHtml(roles.shortFK || 'Not Assigned')}</div>
          </div>
          <div style="background: rgba(0,0,0,0.3); padding: 0.8rem; border-radius: 6px; border: 1px solid var(--gold-border);">
            <div style="color: var(--gold-bright); font-size: 0.78rem; text-transform: uppercase; font-family: var(--font-mono);">Long Free-Kick</div>
            <div style="color: #fff; font-weight: 700; margin-top: 0.2rem;">${escapeHtml(roles.longFK || 'Not Assigned')}</div>
          </div>
        </div>
      `;
    }
  };

  const setupSquadEventListeners = () => {
    if (UI.btnEditCoach) {
      UI.btnEditCoach.addEventListener('click', () => {
        const sq = AppState.squad || getDefaultSquad();
        if (UI.coachNameInput) UI.coachNameInput.value = sq.manager?.name || 'Pep Guardiola';
        if (UI.coachPlaystyleInput) UI.coachPlaystyleInput.value = sq.manager?.playstyle || 'Quick Counter';
        if (UI.coachBoostInput) UI.coachBoostInput.value = sq.manager?.boost || '+1 Acceleration';
        if (UI.roleCaptainInput) UI.roleCaptainInput.value = sq.roles?.captain || '';
        if (UI.rolePenaltyInput) UI.rolePenaltyInput.value = sq.roles?.penalty || '';
        if (UI.roleShortfkInput) UI.roleShortfkInput.value = sq.roles?.shortFK || '';
        if (UI.roleLongfkInput) UI.roleLongfkInput.value = sq.roles?.longFK || '';
        openModal(UI.modalEditCoach);
      });
    }

    if (UI.btnAddPlayer) {
      UI.btnAddPlayer.addEventListener('click', () => {
        UI.formAddPlayer.reset();
        openModal(UI.modalAddPlayer);
      });
    }

    if (UI.formEditCoach) {
      UI.formEditCoach.addEventListener('submit', async (e) => {
        e.preventDefault();
        const sq = AppState.squad || getDefaultSquad();
        sq.manager = {
          name: UI.coachNameInput.value.trim(),
          playstyle: UI.coachPlaystyleInput.value,
          boost: UI.coachBoostInput.value.trim()
        };
        sq.roles = {
          captain: UI.roleCaptainInput.value.trim(),
          penalty: UI.rolePenaltyInput.value.trim(),
          shortFK: UI.roleShortfkInput.value.trim(),
          longFK: UI.roleLongfkInput.value.trim()
        };

        try {
          await SupabaseBridge.squads.saveSquad(sq);
          closeModal(UI.modalEditCoach);
          renderSquads();
          showToast('Manager & player roles updated!', 'success');
        } catch (err) {
          showToast('Error saving manager details.', 'error');
        }
      });
    }

    if (UI.formAddPlayer) {
      UI.formAddPlayer.addEventListener('submit', async (e) => {
        e.preventDefault();
        const slot = UI.playerSlotInput.value; // 'startingXI' or 'subs'
        const pos = UI.playerPosInput.value;
        const name = UI.playerNameInput.value.trim();
        const rating = parseInt(UI.playerRatingInput.value, 10) || 95;
        const tier = UI.playerTierInput.value;

        const sq = AppState.squad || getDefaultSquad();
        const newPlayer = { id: 'p_' + Date.now(), pos, name, rating, tier };

        if (slot === 'startingXI') {
          if (!sq.starting_xi) sq.starting_xi = [];
          if (sq.starting_xi.length >= 11) {
            showToast('Starting XI is full (11 players). Added as substitute instead.', 'info');
            sq.subs.push(newPlayer);
          } else {
            sq.starting_xi.push(newPlayer);
          }
        } else {
          if (!sq.subs) sq.subs = [];
          sq.subs.push(newPlayer);
        }

        try {
          await SupabaseBridge.squads.saveSquad(sq);
          closeModal(UI.modalAddPlayer);
          UI.formAddPlayer.reset();
          renderSquads();
          showToast(`${name} added to squad!`, 'success');
        } catch (err) {
          showToast('Error adding player.', 'error');
        }
      });
    }

    window.removeSquadPlayer = async (playerId, listKey) => {
      const sq = AppState.squad || getDefaultSquad();
      if (listKey === 'starting_xi') {
        sq.starting_xi = sq.starting_xi.filter(p => p.id !== playerId);
      } else {
        sq.subs = sq.subs.filter(p => p.id !== playerId);
      }

      try {
        await SupabaseBridge.squads.saveSquad(sq);
        renderSquads();
        showToast('Player removed from squad.', 'info');
      } catch (err) {
        showToast('Error removing player.', 'error');
      }
    };
  };

  // =========================================================================
  // 7. PERSONAL STATISTICS & PERFORMANCE TELEMETRY
  // =========================================================================
  const renderStatistics = () => {
    const statData = SupabaseBridge.stats.compute(AppState.matches);

    // KPIs
    if (UI.kpiMatches) UI.kpiMatches.textContent = statData.totalMatches;
    if (UI.kpiWins) UI.kpiWins.textContent = statData.wins;
    if (UI.kpiDraws) UI.kpiDraws.textContent = statData.draws;
    if (UI.kpiLosses) UI.kpiLosses.textContent = statData.losses;
    if (UI.kpiWinRate) UI.kpiWinRate.textContent = `${statData.winRate}%`;
    if (UI.kpiGoalsScored) UI.kpiGoalsScored.textContent = statData.goalsScored;
    if (UI.kpiGoalsConceded) UI.kpiGoalsConceded.textContent = statData.goalsConceded;
    if (UI.kpiGoalDiff) {
      const gd = statData.goalDiff;
      UI.kpiGoalDiff.textContent = gd > 0 ? `+${gd}` : gd;
      UI.kpiGoalDiff.style.color = gd > 0 ? 'var(--win-color)' : (gd < 0 ? 'var(--loss-color)' : 'var(--gold-bright)');
    }
    if (UI.kpiCleanSheets) UI.kpiCleanSheets.textContent = statData.cleanSheets;

    // Form Streak Badges (Last 5 matches)
    if (UI.formStreakContainer) {
      const recentMatches = AppState.matches.slice(0, 5).reverse();
      if (recentMatches.length === 0) {
        UI.formStreakContainer.innerHTML = '<span style="color: var(--text-muted); font-size: 0.8rem;">No matches</span>';
      } else {
        UI.formStreakContainer.innerHTML = recentMatches.map(m => `
          <span class="score-pill ${m.result === 'W' ? 'win' : (m.result === 'D' ? 'draw' : 'loss')}" style="padding: 0.15rem 0.45rem; font-size: 0.75rem; margin-right: 0.3rem;" title="vs ${m.opponent} (${m.my_score}-${m.opp_score})">
            ${m.result}
          </span>
        `).join('');
      }
    }

    // Head-to-Head Table Against Opponents
    if (UI.opponentsStatsTbody) {
      const opps = statData.opponents || [];
      if (opps.length === 0) {
        UI.opponentsStatsTbody.innerHTML = `
          <tr><td colspan="8" style="text-align: center; color: var(--text-secondary); padding: 1.5rem;">No opponents faced yet.</td></tr>
        `;
      } else {
        UI.opponentsStatsTbody.innerHTML = opps.map(op => {
          const wr = op.played > 0 ? Math.round((op.won / op.played) * 100) : 0;
          return `
            <tr>
              <td style="font-weight: 700; color: #fff;">vs ${escapeHtml(op.opponent)}</td>
              <td>${op.played}</td>
              <td style="color: var(--win-color); font-weight: 700;">${op.won}</td>
              <td style="color: var(--draw-color);">${op.drawn}</td>
              <td style="color: var(--loss-color);">${op.lost}</td>
              <td>${op.gf}</td>
              <td>${op.ga}</td>
              <td style="font-weight: 700; color: var(--gold-bright);">${wr}%</td>
            </tr>
          `;
        }).join('');
      }
    }

    // Canvas Charts
    drawTrajectoryChart(AppState.matches);
    drawResultsDoughnutChart(statData.wins, statData.draws, statData.losses);
    drawGoalsBarChart(AppState.matches);
  };

  // Canvas 1: Cumulative Points Trajectory Curve
  const drawTrajectoryChart = (matchesList) => {
    const canvas = UI.chartTrajectory;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || 400;
    const height = 240;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    if (matchesList.length === 0) {
      ctx.fillStyle = '#626473';
      ctx.font = '13px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Record match results to generate points curve.', width / 2, height / 2);
      return;
    }

    // Compute cumulative points in chronological order
    const chronoMatches = [...matchesList].reverse();
    const dataPoints = [0];
    let cumulative = 0;
    chronoMatches.forEach(m => {
      const pts = m.result === 'W' ? 3 : (m.result === 'D' ? 1 : 0);
      cumulative += pts;
      dataPoints.push(cumulative);
    });

    const maxPts = Math.max(10, Math.ceil(cumulative * 1.2));
    const padding = { top: 20, right: 30, bottom: 35, left: 40 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    // Draw gridlines
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartH / 4) * i;
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);

      const val = Math.round(maxPts - (maxPts / 4) * i);
      ctx.fillStyle = '#a0a2b0';
      ctx.font = '10px Rajdhani, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${val} pts`, padding.left - 6, y + 3);
    }
    ctx.stroke();

    // Map coordinates
    const stepX = chartW / (dataPoints.length - 1 || 1);
    const coords = dataPoints.map((pts, i) => {
      const x = padding.left + i * stepX;
      const y = padding.top + chartH - (pts / maxPts) * chartH;
      return { x, y };
    });

    // Draw glowing gradient area fill
    const grad = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
    grad.addColorStop(0, 'rgba(255, 215, 0, 0.35)');
    grad.addColorStop(1, 'rgba(212, 175, 55, 0.0)');

    ctx.beginPath();
    ctx.moveTo(coords[0].x, padding.top + chartH);
    coords.forEach(pt => ctx.lineTo(pt.x, pt.y));
    ctx.lineTo(coords[coords.length - 1].x, padding.top + chartH);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Draw main gold curve line
    ctx.beginPath();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 3;
    ctx.shadowColor = 'rgba(255, 215, 0, 0.5)';
    ctx.shadowBlur = 10;
    coords.forEach((pt, idx) => {
      if (idx === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Draw points & labels
    coords.forEach((pt, i) => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffd700';
      ctx.fill();
      ctx.strokeStyle = '#070709';
      ctx.lineWidth = 2;
      ctx.stroke();

      if (i > 0 && i === coords.length - 1) {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px Rajdhani, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${dataPoints[i]} pts`, pt.x, pt.y - 10);
      }
    });
  };

  // Canvas 2: Results Ratio Doughnut Chart
  const drawResultsDoughnutChart = (wins, draws, losses) => {
    const canvas = UI.chartResultsDoughnut;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || 280;
    const height = 240;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    const total = wins + draws + losses;
    if (total === 0) {
      ctx.fillStyle = '#626473';
      ctx.font = '13px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No match results recorded yet.', width / 2, height / 2);
      return;
    }

    const centerX = width / 2;
    const centerY = height / 2 - 10;
    const outerRadius = Math.min(centerX, centerY) - 20;
    const innerRadius = outerRadius * 0.62;

    const segments = [
      { count: wins, color: '#2ecc71', label: 'Victories (W)' },
      { count: draws, color: '#f1c40f', label: 'Draws (D)' },
      { count: losses, color: '#e74c3c', label: 'Defeats (L)' }
    ];

    let startAngle = -Math.PI / 2;
    segments.forEach(seg => {
      const sliceAngle = (seg.count / total) * Math.PI * 2;
      if (sliceAngle > 0) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, outerRadius, startAngle, startAngle + sliceAngle);
        ctx.arc(centerX, centerY, innerRadius, startAngle + sliceAngle, startAngle, true);
        ctx.closePath();
        ctx.fillStyle = seg.color;
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      startAngle += sliceAngle;
    });

    // Center win percentage
    const winRate = Math.round((wins / total) * 100);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 22px Cinzel, serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${winRate}%`, centerX, centerY + 5);

    ctx.fillStyle = 'var(--gold-bright)';
    ctx.font = '10px Rajdhani, sans-serif';
    ctx.fillText('WIN RATIO', centerX, centerY + 20);

    // Legend at bottom
    const legendY = height - 12;
    ctx.font = '11px Rajdhani, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#2ecc71';
    ctx.fillText(`W: ${wins}`, centerX - 60, legendY);
    ctx.fillStyle = '#f1c40f';
    ctx.fillText(`D: ${draws}`, centerX, legendY);
    ctx.fillStyle = '#e74c3c';
    ctx.fillText(`L: ${losses}`, centerX + 60, legendY);
  };

  // Canvas 3: Goals Scored vs Conceded Bar Chart
  const drawGoalsBarChart = (matchesList) => {
    const canvas = UI.chartGoalsBar;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || 600;
    const height = 180;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    const recent = matchesList.slice(0, 10).reverse();
    if (recent.length === 0) {
      ctx.fillStyle = '#626473';
      ctx.font = '13px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Record match scores to display goal metrics.', width / 2, height / 2);
      return;
    }

    const padding = { top: 20, right: 20, bottom: 35, left: 40 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const maxGoals = Math.max(4, ...recent.map(m => Math.max(m.my_score || 0, m.opp_score || 0)));
    const slotW = chartW / recent.length;
    const barW = Math.max(6, Math.min(18, slotW * 0.3));

    // Zero baseline
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top + chartH);
    ctx.lineTo(width - padding.right, padding.top + chartH);
    ctx.stroke();

    recent.forEach((m, idx) => {
      const centerX = padding.left + idx * slotW + slotW / 2;

      const scoredH = (m.my_score / maxGoals) * chartH;
      const concededH = (m.opp_score / maxGoals) * chartH;

      // Scored Bar (Gold)
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(centerX - barW - 2, padding.top + chartH - scoredH, barW, scoredH);

      // Conceded Bar (Red)
      ctx.fillStyle = '#e74c3c';
      ctx.fillRect(centerX + 2, padding.top + chartH - concededH, barW, concededH);

      // Score labels on top of bars
      ctx.font = '10px Rajdhani, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffd700';
      ctx.fillText(m.my_score, centerX - barW / 2 - 2, padding.top + chartH - scoredH - 4);
      ctx.fillStyle = '#e74c3c';
      ctx.fillText(m.opp_score, centerX + barW / 2 + 2, padding.top + chartH - concededH - 4);

      // Opponent name snippet below
      ctx.fillStyle = '#a0a2b0';
      ctx.font = '9px Outfit, sans-serif';
      const shortOpp = (m.opponent || '').slice(0, 6);
      ctx.fillText(shortOpp, centerX, padding.top + chartH + 16);
    });
  };

  // =========================================================================
  // 8. PERSONAL MATCH ARCHIVE
  // =========================================================================
  const renderArchive = () => {
    if (!UI.personalArchiveTimeline) return;

    if (AppState.matches.length === 0) {
      UI.personalArchiveTimeline.innerHTML = `
        <div class="empty-state-box">
          <i class="fas fa-archive empty-state-icon"></i>
          <h3 class="empty-state-title">Chronological Archive Awaiting Records</h3>
          <p class="empty-state-desc">Your personal eFootball archive will display your matches, formations, video clips and achievements in a unified timeline.</p>
        </div>
      `;
      return;
    }

    UI.personalArchiveTimeline.innerHTML = AppState.matches.map((m, idx) => {
      const isWin = m.result === 'W';
      return `
        <div style="position: relative; padding-left: 2.2rem; margin-bottom: 2rem; border-left: 2px solid ${isWin ? 'var(--win-color)' : 'rgba(212,175,55,0.3)'};">
          <!-- Timeline Marker Node -->
          <div style="position: absolute; left: -9px; top: 0; width: 16px; height: 16px; border-radius: 50%; background: ${isWin ? 'var(--win-color)' : 'var(--bg-darkest)'}; border: 2px solid var(--gold-bright);"></div>

          <div class="room-card" style="padding: 1.2rem;">
            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.5rem;">
              <span style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--gold-bright);">
                <i class="far fa-calendar-alt"></i> ${m.match_date || 'Undated'}
              </span>
              <span class="score-pill ${m.result === 'W' ? 'win' : (m.result === 'D' ? 'draw' : 'loss')}">
                ${m.result === 'W' ? 'VICTORY' : (m.result === 'D' ? 'DRAW' : 'DEFEAT')}
              </span>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem;">
              <h3 style="color: #fff; font-size: 1.2rem; margin: 0;">vs ${escapeHtml(m.opponent)}</h3>
              <div style="font-family: var(--font-title); font-size: 1.6rem; font-weight: 700; color: var(--gold-bright);">
                ${m.my_score} - ${m.opp_score}
              </div>
            </div>

            <div style="display: flex; flex-wrap: wrap; gap: 0.8rem; font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 0.8rem;">
              <span><i class="fas fa-trophy gold-text"></i> ${escapeHtml(m.competition || 'eFootball')}</span>
              <span><i class="fas fa-chess-board gold-text"></i> Formation: ${escapeHtml(m.formation_used || '4-2-1-3')}</span>
              ${m.manager_used ? `<span><i class="fas fa-user-tie gold-text"></i> Coach: ${escapeHtml(m.manager_used)}</span>` : ''}
            </div>

            ${m.goalscorers ? `
              <div style="font-size: 0.85rem; color: var(--gold-light); margin-bottom: 0.6rem;">
                <i class="fas fa-futbol"></i> <strong>Goalscorers:</strong> ${escapeHtml(m.goalscorers)}
              </div>
            ` : ''}

            ${m.notes ? `
              <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 1rem;">
                ${escapeHtml(m.notes)}
              </p>
            ` : ''}

            <div style="display: flex; gap: 0.6rem;">
              <button class="btn-secondary" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;" onclick="window.viewMatchDetails('${m.id}')">
                <i class="fas fa-file-alt"></i> View Full Match File
              </button>
              ${m.video_url ? `
                <button class="btn-gold" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;" onclick="window.playMatchClip('${m.id}')">
                  <i class="fas fa-play"></i> Watch Video
                </button>
              ` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');
  };

  // =========================================================================
  // 9. BACKUP & DATA RECOVERY
  // =========================================================================
  const setupBackupEventListeners = () => {
    if (UI.btnExportBackupMain) {
      UI.btnExportBackupMain.addEventListener('click', () => {
        const uid = AppState.currentUser ? AppState.currentUser.id : 'default';
        StorageEngine.exportBackupJSON(uid);
        showToast('📦 Master studio backup archive downloaded!', 'success');
      });
    }

    if (UI.fileImportBackupMain) {
      UI.fileImportBackupMain.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!confirm('Importing this backup will merge and update your studio records. Do you wish to continue?')) {
          e.target.value = '';
          return;
        }

        try {
          const uid = AppState.currentUser ? AppState.currentUser.id : 'default';
          await StorageEngine.importBackupJSON(file, uid);
          await loadAllStudioData();
          renderDashboard();
          showToast('Master backup restored successfully!', 'success');
        } catch (err) {
          showToast(err.message || 'Failed to import backup.', 'error');
        } finally {
          e.target.value = '';
        }
      });
    }
  };

  // =========================================================================
  // 10. SETTINGS & CLOUD CONFIGURATION
  // =========================================================================
  const openSupabaseConfigModal = () => {
    if (!UI.modalSupabaseConfig) return;
    const creds = SupabaseBridge.getCredentials();
    if (UI.supabaseUrlInput) UI.supabaseUrlInput.value = creds.url && !creds.url.includes('placeholder') ? creds.url : '';
    if (UI.supabaseKeyInput) UI.supabaseKeyInput.value = creds.anonKey && !creds.anonKey.includes('placeholder') ? creds.anonKey : '';
    if (UI.supabaseTestFeedback) UI.supabaseTestFeedback.style.display = 'none';
    openModal(UI.modalSupabaseConfig);
  };

  const setupSettingsEventListeners = () => {
    // Gamer Profile Save
    if (UI.formSettingsProfile) {
      UI.formSettingsProfile.addEventListener('submit', async (e) => {
        e.preventDefault();
        const gamerTag = UI.settingsGamertagInput.value.trim();
        const division = UI.settingsDivisionInput.value.trim();
        const efootballId = UI.settingsEfootballId.value.trim();
        const platform = UI.settingsPlatformInput.value.trim();

        try {
          const updated = await AuthEngine.updateProfile({
            gamerTag,
            division,
            efootballId,
            platform
          });

          AppState.currentUser = updated;
          updateUserUI(updated);
          showToast('Profile identity settings saved!', 'success');
        } catch (err) {
          showToast(err.message || 'Error saving profile settings.', 'error');
        }
      });
    }

    // Supabase Cloud Configuration Save
    if (UI.formSupabaseConfig) {
      UI.formSupabaseConfig.addEventListener('submit', async (e) => {
        e.preventDefault();
        const url = UI.supabaseUrlInput.value.trim();
        const key = UI.supabaseKeyInput.value.trim();

        if (UI.supabaseTestFeedback) {
          UI.supabaseTestFeedback.style.display = 'block';
          UI.supabaseTestFeedback.style.background = 'rgba(212,175,55,0.15)';
          UI.supabaseTestFeedback.style.color = 'var(--gold-bright)';
          UI.supabaseTestFeedback.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Testing Supabase Cloud connection...';
        }

        try {
          SupabaseBridge.configure(url, key);
          const isReady = SupabaseBridge.isReady();

          if (isReady) {
            if (UI.supabaseTestFeedback) {
              UI.supabaseTestFeedback.style.background = 'rgba(46,204,113,0.15)';
              UI.supabaseTestFeedback.style.color = 'var(--win-color)';
              UI.supabaseTestFeedback.innerHTML = '<i class="fas fa-check-circle"></i> Supabase Cloud connection verified & ready!';
            }
            updateSupabaseStatusUI();
            await loadAllStudioData();
            setTimeout(() => closeModal(UI.modalSupabaseConfig), 1200);
            showToast('Supabase Cloud Engine connected!', 'success');
          } else {
            throw new Error('Could not establish connection to the provided Supabase URL.');
          }
        } catch (err) {
          if (UI.supabaseTestFeedback) {
            UI.supabaseTestFeedback.style.background = 'rgba(231,76,60,0.15)';
            UI.supabaseTestFeedback.style.color = 'var(--loss-color)';
            UI.supabaseTestFeedback.innerHTML = `<i class="fas fa-times-circle"></i> ${escapeHtml(err.message)}`;
          }
        }
      });
    }

    if (UI.btnSupabaseReset) {
      UI.btnSupabaseReset.addEventListener('click', () => {
        SupabaseBridge.resetConfig();
        updateSupabaseStatusUI();
        closeModal(UI.modalSupabaseConfig);
        showToast('Reset to local offline studio engine.', 'info');
      });
    }

    // Studio Logout
    if (UI.btnStudioLogout) {
      UI.btnStudioLogout.addEventListener('click', async () => {
        if (!confirm('Lock studio on this device? You can log back in anytime.')) return;
        await AuthEngine.logout();
        AppState.currentUser = AuthEngine.getCurrentUser();
        updateUserUI(AppState.currentUser);
        openModal(UI.modalAuthHub);
        showToast('Studio locked.', 'info');
      });
    }
  };

  // =========================================================================
  // PRIVATE AUTHENTICATION MODAL
  // =========================================================================
  const setupAuthEventListeners = () => {
    if (UI.tabBtnSignin && UI.tabBtnResetpass) {
      UI.tabBtnSignin.addEventListener('click', () => {
        UI.tabBtnSignin.style.background = 'rgba(212, 175, 55, 0.15)';
        UI.tabBtnSignin.style.color = 'var(--gold-bright)';
        UI.tabBtnResetpass.style.background = 'none';
        UI.tabBtnResetpass.style.color = 'var(--text-secondary)';
        if (UI.formAuthSignin) UI.formAuthSignin.style.display = 'block';
        if (UI.formAuthResetpass) UI.formAuthResetpass.style.display = 'none';
      });

      UI.tabBtnResetpass.addEventListener('click', () => {
        UI.tabBtnResetpass.style.background = 'rgba(212, 175, 55, 0.15)';
        UI.tabBtnResetpass.style.color = 'var(--gold-bright)';
        UI.tabBtnSignin.style.background = 'none';
        UI.tabBtnSignin.style.color = 'var(--text-secondary)';
        if (UI.formAuthSignin) UI.formAuthSignin.style.display = 'none';
        if (UI.formAuthResetpass) UI.formAuthResetpass.style.display = 'block';
      });
    }

    if (UI.formAuthSignin) {
      UI.formAuthSignin.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = UI.signinEmail.value.trim();
        const password = UI.signinPassword.value;

        try {
          const user = await AuthEngine.login(email, password);
          AppState.currentUser = user;
          updateUserUI(user);
          closeModal(UI.modalAuthHub);
          await loadAllStudioData();
          renderDashboard();
          showToast(`Welcome back, ${user.gamerTag || 'NONCHALANT JR'}!`, 'success');
        } catch (err) {
          showToast(err.message || 'Login failed.', 'error');
        }
      });
    }

    if (UI.formAuthResetpass) {
      UI.formAuthResetpass.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = UI.resetEmail.value.trim();
        try {
          const msg = await AuthEngine.recoverAccount(email);
          showToast(msg, 'success');
          UI.formAuthResetpass.reset();
        } catch (err) {
          showToast(err.message || 'Error requesting password reset.', 'error');
        }
      });
    }
  };

  // Utility: HTML string escape
  const escapeHtml = (str) => {
    if (!str && str !== 0) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  // Launch Studio Engine
  await initApp();
});
