/**
 * NONCHALANT JR STUDIO - Main Application Engine
 * Fresh clean state: zero dummy matches, zero fake trophies, empty squads ready to build,
 * and custom Tournament Creator with Friends.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Application State
  const AppState = {
    currentUser: null,
    matches: [],
    trophies: [],
    tactics: [],
    squads: [],
    tournament: null,
    activeSection: 'recordings',
    activeTacticIndex: 0,
    tournamentFriends: ['NONCHALANT JR'] // Default participant
  };

  // DOM Elements Cache
  const UI = {
    // Navigation
    navItems: document.querySelectorAll('.nav-item'),
    sections: document.querySelectorAll('.studio-section'),
    userGamerTag: document.getElementById('user-gamer-tag'),
    userDivision: document.getElementById('user-division'),
    userAvatar: document.getElementById('user-avatar'),
    currentTime: document.getElementById('live-clock'),

    // Hero stats
    heroMatchesCount: document.getElementById('hero-matches-count'),
    heroWinRate: document.getElementById('hero-win-rate'),
    heroTrophiesCount: document.getElementById('hero-trophies-count'),
    heroVideosCount: document.getElementById('hero-videos-count'),

    // Section A: Match Recordings
    recordingsGrid: document.getElementById('recordings-grid'),
    searchRecordings: document.getElementById('search-recordings'),
    filterCompetition: document.getElementById('filter-competition'),
    filterResult: document.getElementById('filter-result'),
    btnNewRecording: document.getElementById('btn-new-recording'),

    // Section B: Trophy Room
    trophiesGrid: document.getElementById('trophies-grid'),
    filterTrophyTier: document.getElementById('filter-trophy-tier'),
    btnNewTrophy: document.getElementById('btn-new-trophy'),

    // Section C: Tactics
    tacticsPitch: document.getElementById('tactics-field'),
    tacticsControlsPanel: document.getElementById('tactics-controls-panel'),
    btnCreateTactic: document.getElementById('btn-create-tactic'),
    btnEditTactic: document.getElementById('btn-edit-tactic'),
    btnDeleteTactic: document.getElementById('btn-delete-tactic'),

    // Section D: Squads
    managerName: document.getElementById('manager-name'),
    managerPlaystyle: document.getElementById('manager-playstyle'),
    managerBoost: document.getElementById('manager-boost'),
    startingXiGrid: document.getElementById('starting-xi-grid'),
    subsRow: document.getElementById('subs-row'),
    rolesList: document.getElementById('roles-list'),
    btnEditCoach: document.getElementById('btn-edit-coach'),
    btnAddPlayer: document.getElementById('btn-add-player'),

    // Section E: Statistics
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

    // Section F: Tournament
    bracketContainer: document.getElementById('bracket-tree-container'),
    leagueStandingsTbody: document.getElementById('league-standings-tbody'),
    tournamentMatchesLogContainer: document.getElementById('tournament-matches-log-container'),
    btnCrownChampion: document.getElementById('btn-crown-champion'),
    btnCreateTournament: document.getElementById('btn-create-tournament'),
    btnInviteTournament: document.getElementById('btn-invite-tournament'),
    btnRecordTourneyMatch: document.getElementById('btn-record-tourney-match'),
    modalRecordTourneyMatch: document.getElementById('modal-record-tourney-match'),
    formRecordTourneyMatch: document.getElementById('form-record-tourney-match'),
    tourneyMatchStageSelect: document.getElementById('tourney-match-stage-select'),
    tourneyMatchTeam1Select: document.getElementById('tourney-match-team1-select'),
    tourneyMatchScore1Input: document.getElementById('tourney-match-score1-input'),
    tourneyMatchTeam2Select: document.getElementById('tourney-match-team2-select'),
    tourneyMatchScore2Input: document.getElementById('tourney-match-score2-input'),
    tourneyMatchDateInput: document.getElementById('tourney-match-date-input'),

    // Modals
    modalNewMatch: document.getElementById('modal-new-match'),
    modalNewTrophy: document.getElementById('modal-new-trophy'),
    modalCinemaPlayer: document.getElementById('modal-cinema-player'),
    modalAccount: document.getElementById('modal-account'),
    modalRecovery: document.getElementById('modal-recovery'),
    modalBackups: document.getElementById('modal-backups'),
    modalCreateTournament: document.getElementById('modal-create-tournament'),
    modalEditCoach: document.getElementById('modal-edit-coach'),
    modalAddPlayer: document.getElementById('modal-add-player'),
    modalCreateTactic: document.getElementById('modal-create-tactic'),
    modalEditTactic: document.getElementById('modal-edit-tactic'),
    modalInviteTournament: document.getElementById('modal-invite-tournament'),
    modalJoinTournament: document.getElementById('modal-join-tournament'),

    // Tournament Invite / Join Elements
    tournamentInviteUrl: document.getElementById('tournament-invite-url'),
    btnCopyInviteLink: document.getElementById('btn-copy-invite-link'),
    btnShareWhatsapp: document.getElementById('btn-share-whatsapp'),
    btnShareDiscord: document.getElementById('btn-share-discord'),
    btnShareNative: document.getElementById('btn-share-native'),
    inviteQrImage: document.getElementById('invite-qr-image'),
    inviteTourneyNameDisplay: document.getElementById('invite-tourney-name-display'),
    inviteTourneyHostDisplay: document.getElementById('invite-tourney-host-display'),
    inviteFriendGamertag: document.getElementById('invite-friend-gamertag'),
    btnInviteAddFriend: document.getElementById('btn-invite-add-friend'),
    formJoinTournament: document.getElementById('form-join-tournament'),
    joinFriendGamertag: document.getElementById('join-friend-gamertag'),
    joinTourneyName: document.getElementById('join-tourney-name'),
    joinTourneyInviter: document.getElementById('join-tourney-inviter'),

    // Tournament Friends Builder
    inputFriendName: document.getElementById('input-friend-name'),
    btnAddFriendPill: document.getElementById('btn-add-friend-pill'),
    friendsListWrap: document.getElementById('friends-list-wrap'),

    // Cinema Player
    cinemaVideoPlayer: document.getElementById('cinema-video-player'),
    cinemaVideoTitle: document.getElementById('cinema-video-title'),
    cinemaVideoMeta: document.getElementById('cinema-video-meta'),
    cinemaDownloadBtn: document.getElementById('cinema-download-btn'),

    // Toast Container
    toastContainer: document.getElementById('toast-container')
  };

  // --- INITIALIZATION ---
  const initApp = async () => {
    await StorageEngine.initDB();
    AppState.currentUser = AuthEngine.getCurrentUser();

    // Check version flag to wipe legacy dummy data once
    const CLEAN_KEY = 'njr_studio_clean_v2';
    if (!localStorage.getItem(CLEAN_KEY)) {
      localStorage.removeItem(StorageEngine.getStorageKey ? StorageEngine.getStorageKey('matches', AppState.currentUser.id) : `njr_studio_${AppState.currentUser.id}_matches`);
      localStorage.removeItem(StorageEngine.getStorageKey ? StorageEngine.getStorageKey('trophies', AppState.currentUser.id) : `njr_studio_${AppState.currentUser.id}_trophies`);
      localStorage.removeItem(StorageEngine.getStorageKey ? StorageEngine.getStorageKey('squads', AppState.currentUser.id) : `njr_studio_${AppState.currentUser.id}_squads`);
      localStorage.removeItem(StorageEngine.getStorageKey ? StorageEngine.getStorageKey('tournament', AppState.currentUser.id) : `njr_studio_${AppState.currentUser.id}_tournament`);
      localStorage.setItem(CLEAN_KEY, 'true');
    }

    // Wipe legacy tactics to provide clean slate for user
    const TACTICS_CLEAN_KEY = 'njr_studio_tactics_wipe_v1';
    if (!localStorage.getItem(TACTICS_CLEAN_KEY)) {
      const tKey = StorageEngine.getStorageKey ? StorageEngine.getStorageKey('tactics', AppState.currentUser.id) : `njr_studio_${AppState.currentUser.id}_tactics`;
      localStorage.removeItem(tKey);
      localStorage.setItem(TACTICS_CLEAN_KEY, 'true');
    }

    loadUserData();
    updateClock();
    setInterval(updateClock, 1000);
    renderUserProfile();

    setupNavigation();
    setupModals();
    setupForms();

    renderAllSections();
    checkIncomingInvite();
    fetchServerTournament();
    setInterval(fetchServerTournament, 4000);
  };

  // Load User Data
  const loadUserData = () => {
    const uid = AppState.currentUser.id;

    AppState.matches = StorageEngine.loadData('matches', [], uid);
    AppState.trophies = StorageEngine.loadData('trophies', [], uid);

    AppState.tactics = StorageEngine.loadData('tactics', [], uid);
    if (Array.isArray(AppState.tactics)) {
      AppState.tactics = AppState.tactics.filter(t => t.id !== 'tactic_default');
    } else {
      AppState.tactics = [];
    }
    StorageEngine.saveData('tactics', AppState.tactics, uid);

    AppState.squads = StorageEngine.loadData('squads', null, uid);
    if (!AppState.squads || AppState.squads.length === 0) {
      AppState.squads = [...DemoData.squads];
      StorageEngine.saveData('squads', AppState.squads, uid);
    }

    AppState.tournament = StorageEngine.loadData('tournament', null, uid);
    if (AppState.tournament) {
      AppState.tournament.matchLog = AppState.tournament.matchLog || [];
      AppState.tournament.championsHistory = AppState.tournament.championsHistory || [];
      syncTournamentWithServer();
    }
  };

  // Update Clock Display
  const updateClock = () => {
    const now = new Date();
    if (UI.currentTime) {
      UI.currentTime.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' UTC';
    }
  };

  // Render User Profile In Top Deck
  const renderUserProfile = () => {
    if (!AppState.currentUser) return;
    const tag = AppState.currentUser.gamerTag || 'NONCHALANT JR';
    const div = AppState.currentUser.division || 'Division 1 (Top 100)';
    if (UI.userGamerTag) UI.userGamerTag.textContent = tag;
    if (UI.userDivision) UI.userDivision.textContent = div;
    const heroTag = document.getElementById('user-gamer-tag');
    if (heroTag) heroTag.textContent = tag;
    const heroDiv = document.getElementById('user-division');
    if (heroDiv) heroDiv.textContent = div;
  };

  // Toast Notification
  const showToast = (message) => {
    if (!UI.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <i class="fas fa-check-circle" style="color: var(--gold-bright); font-size: 1.1rem;"></i>
      <span style="font-size: 0.9rem;">${message}</span>
    `;
    UI.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  };

  // --- NAVIGATION ---
  const setupNavigation = () => {
    UI.navItems.forEach(item => {
      item.addEventListener('click', () => {
        const target = item.dataset.section;
        if (!target) return;

        UI.navItems.forEach(n => n.classList.remove('active'));
        item.classList.add('active');

        UI.sections.forEach(sec => {
          if (sec.id === `section-${target}`) {
            sec.classList.add('active');
          } else {
            sec.classList.remove('active');
          }
        });

        AppState.activeSection = target;
        if (target === 'stats') {
          setTimeout(renderStatistics, 50);
        }
      });
    });
  };

  // Render All Sections
  const renderAllSections = () => {
    renderHeroStats();
    renderMatchRecordings();
    renderTrophyRoom();
    renderTactics();
    renderSquads();
    renderStatistics();
    renderTournament();
  };

  // --- HERO STATS ---
  const renderHeroStats = () => {
    const totalMatches = AppState.matches.length;
    const wins = AppState.matches.filter(m => m.result === 'W').length;
    const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;
    const trophiesCount = AppState.trophies.filter(t => t.placement === 'champion').length;

    if (UI.heroMatchesCount) UI.heroMatchesCount.textContent = totalMatches;
    if (UI.heroWinRate) UI.heroWinRate.textContent = `${winRate}%`;
    if (UI.heroTrophiesCount) UI.heroTrophiesCount.textContent = trophiesCount;
    if (UI.heroVideosCount) UI.heroVideosCount.textContent = totalMatches;
  };

  // =========================================================================
  // SECTION A: MATCH RECORDINGS (FRESH EMPTY STATE READY FOR USER)
  // =========================================================================
  const renderMatchRecordings = () => {
    if (!UI.recordingsGrid) return;

    const searchTerm = (UI.searchRecordings ? UI.searchRecordings.value.toLowerCase() : '');
    const compFilter = (UI.filterCompetition ? UI.filterCompetition.value : 'all');
    const resultFilter = (UI.filterResult ? UI.filterResult.value : 'all');

    const filtered = AppState.matches.filter(m => {
      const matchSearch = m.opponent.toLowerCase().includes(searchTerm) ||
                          (m.notes && m.notes.toLowerCase().includes(searchTerm)) ||
                          (m.tags && m.tags.some(t => t.toLowerCase().includes(searchTerm)));
      const matchComp = (compFilter === 'all' || m.competition === compFilter);
      const matchRes = (resultFilter === 'all' || m.result === resultFilter);
      return matchSearch && matchComp && matchRes;
    });

    if (filtered.length === 0) {
      UI.recordingsGrid.innerHTML = `
        <div class="empty-state-box" style="grid-column: 1/-1;">
          <i class="fas fa-video empty-state-icon"></i>
          <h3 class="empty-state-title">No Match Recordings Yet</h3>
          <p class="empty-state-desc">
            Your studio archive is completely fresh! Record your eFootball matches, upload screen-recorded gameplay clips, and celebrate your best goals here.
          </p>
          <button class="btn-gold" onclick="document.getElementById('modal-new-match').classList.add('active')">
            <i class="fas fa-plus-circle"></i> Record Your First Match
          </button>
        </div>
      `;
      return;
    }

    UI.recordingsGrid.innerHTML = filtered.map(m => {
      const resultClass = m.result === 'W' ? 'win' : (m.result === 'D' ? 'draw' : 'loss');
      const tagHtml = (m.tags || []).map(t => `<span class="tag-badge">#${t}</span>`).join('');

      return `
        <div class="recording-card" data-match-id="${m.id}">
          <div class="video-thumb-container" onclick="window.playRecordingVideo('${m.id}')">
            <img src="${m.thumbUrl || 'assets/bg.jpg'}" alt="Match Thumbnail" class="video-thumb">
            <span class="competition-badge">${m.competition}</span>
            <div class="play-overlay-btn"><i class="fas fa-play"></i></div>
            <span class="duration-badge"><i class="fas fa-clock"></i> Gameplay Clip</span>
          </div>
          <div class="recording-info">
            <div class="match-scoreline-header">
              <span class="opponent-title">vs ${m.opponent}</span>
              <span class="score-pill ${resultClass}">${m.myScore} - ${m.oppScore}</span>
            </div>
            <div class="recording-meta">
              <span><i class="far fa-calendar-alt"></i> ${m.date}</span>
              <span style="color: var(--text-gold);"><i class="fas fa-shield-alt"></i> ${m.teamUsed || 'NONCHALANT JR XI'}</span>
            </div>
            <div class="tag-list">${tagHtml}</div>
            <p class="recording-notes">${m.notes || 'No notes added.'}</p>
            <div class="recording-card-footer">
              <button class="btn-gold" style="padding: 0.35rem 0.8rem; font-size: 0.8rem;" onclick="window.playRecordingVideo('${m.id}')">
                <i class="fas fa-play"></i> Watch
              </button>
              <div style="display: flex; gap: 0.4rem;">
                <button class="btn-icon" title="Download Gameplay Video" onclick="window.downloadRecording('${m.id}')">
                  <i class="fas fa-download"></i>
                </button>
                <button class="btn-icon danger" title="Delete Recording" onclick="window.deleteRecording('${m.id}')">
                  <i class="fas fa-trash-alt"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  };

  // Video Playback Trigger
  window.playRecordingVideo = async (matchId) => {
    const match = AppState.matches.find(m => m.id === matchId);
    if (!match) return;

    if (UI.cinemaVideoTitle) UI.cinemaVideoTitle.textContent = `NONCHALANT JR vs ${match.opponent} (${match.myScore} - ${match.oppScore})`;
    if (UI.cinemaVideoMeta) UI.cinemaVideoMeta.textContent = `${match.competition} • ${match.date}`;

    let videoSource = match.videoUrl;
    if (match.mediaStorageId) {
      try {
        const stored = await StorageEngine.getMediaUrl(match.mediaStorageId);
        if (stored && stored.url) videoSource = stored.url;
      } catch (e) {
        console.warn('Error fetching video:', e);
      }
    }

    if (UI.cinemaVideoPlayer) {
      UI.cinemaVideoPlayer.src = videoSource || 'assets/bg.jpg';
      UI.cinemaVideoPlayer.load();
      UI.cinemaVideoPlayer.play().catch(e => console.log('Autoplay prevented:', e));
    }

    if (UI.cinemaDownloadBtn) {
      UI.cinemaDownloadBtn.onclick = () => window.downloadRecording(matchId);
    }

    if (UI.modalCinemaPlayer) UI.modalCinemaPlayer.classList.add('active');
  };

  window.deleteRecording = async (matchId) => {
    if (!confirm('Delete this match recording?')) return;
    const match = AppState.matches.find(m => m.id === matchId);
    if (match && match.mediaStorageId) {
      await StorageEngine.deleteMedia(match.mediaStorageId);
    }
    AppState.matches = AppState.matches.filter(m => m.id !== matchId);
    StorageEngine.saveData('matches', AppState.matches, AppState.currentUser.id);
    renderMatchRecordings();
    renderHeroStats();
    renderStatistics();
    showToast('Match recording deleted.');
  };

  window.downloadRecording = async (matchId) => {
    const match = AppState.matches.find(m => m.id === matchId);
    if (!match) return;
    const a = document.createElement('a');
    a.href = match.videoUrl || 'assets/bg.jpg';
    a.download = `NONCHALANT_JR_vs_${match.opponent}_${match.date}.mp4`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // =========================================================================
  // SECTION B: TOURNAMENT TROPHY ROOM (FRESH EMPTY STATE)
  // =========================================================================
  const renderTrophyRoom = () => {
    if (!UI.trophiesGrid) return;

    const tierFilter = (UI.filterTrophyTier ? UI.filterTrophyTier.value : 'all');
    const filtered = AppState.trophies.filter(t => {
      if (tierFilter === 'all') return true;
      return t.placement === tierFilter;
    });

    if (filtered.length === 0) {
      UI.trophiesGrid.innerHTML = `
        <div class="empty-state-box" style="grid-column: 1/-1;">
          <i class="fas fa-trophy empty-state-icon"></i>
          <h3 class="empty-state-title">Trophy Cabinet Awaiting Your Championships</h3>
          <p class="empty-state-desc">
            No tournaments or trophies logged yet. As you win championships with your friends or online events, log them here to put your silverware on the pedestal!
          </p>
          <button class="btn-gold" onclick="document.getElementById('modal-new-trophy').classList.add('active')">
            <i class="fas fa-trophy"></i> Log Tournament Cup
          </button>
        </div>
      `;
      return;
    }

    UI.trophiesGrid.innerHTML = filtered.map(t => {
      const tierBadgeClass = t.placement === 'champion' ? 'tier-gold' : (t.placement === 'runner_up' ? 'tier-silver' : 'tier-bronze');
      const tierBadgeText = t.placement === 'champion' ? 'CHAMPION' : (t.placement === 'runner_up' ? 'RUNNER-UP' : 'HONOR');
      const icon = t.iconEmoji || (t.placement === 'champion' ? '🏆' : '🥈');

      return `
        <div class="trophy-card">
          <span class="trophy-tier-badge ${tierBadgeClass}">${tierBadgeText}</span>
          <div class="trophy-pedestal-visual">
            <div class="trophy-glow-halo"></div>
            <div class="trophy-icon-wrapper">${icon}</div>
          </div>
          <h3 class="trophy-title">${t.title}</h3>
          <div class="trophy-date"><i class="far fa-calendar-alt"></i> ${t.date}</div>
          <div class="final-match-stats">
            <div class="final-match-label">Grand Final Scoreline</div>
            <div class="final-match-teams">NONCHALANT JR vs ${t.finalOpponent}</div>
            <div class="final-match-score">${t.finalScore}</div>
          </div>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1.2rem; line-height: 1.4;">
            ${t.notes || 'Championship recorded in the studio hall of fame.'}
          </p>
          <div style="display: flex; gap: 0.6rem; justify-content: center;">
            <button class="btn-secondary" style="padding: 0.4rem 0.8rem; font-size: 0.82rem;" onclick="window.deleteTrophy('${t.id}')">
              <i class="fas fa-trash-alt"></i> Delete
            </button>
          </div>
        </div>
      `;
    }).join('');
  };

  window.deleteTrophy = (trophyId) => {
    if (!confirm('Remove this achievement from your Trophy Room?')) return;
    AppState.trophies = AppState.trophies.filter(t => t.id !== trophyId);
    StorageEngine.saveData('trophies', AppState.trophies, AppState.currentUser.id);
    renderTrophyRoom();
    renderHeroStats();
    showToast('Trophy removed.');
  };

  // =========================================================================
  // SECTION C: GAME PLANS & TACTICS
  // =========================================================================
  const getFormationNodes = (formation) => {
    switch (formation) {
      case '4-2-1-3':
        return [
          { role: 'GK', name: 'Goalkeeper', x: 50, y: 90, rating: 90, isGK: true },
          { role: 'LB', name: 'Left Back', x: 18, y: 75, rating: 90 },
          { role: 'CB', name: 'Centre Back', x: 38, y: 78, rating: 90 },
          { role: 'CB', name: 'Centre Back', x: 62, y: 78, rating: 90 },
          { role: 'RB', name: 'Right Back', x: 82, y: 75, rating: 90 },
          { role: 'DMF', name: 'Def Midfielder', x: 38, y: 64, rating: 90 },
          { role: 'DMF', name: 'Def Midfielder', x: 62, y: 64, rating: 90 },
          { role: 'AMF', name: 'Att Midfielder', x: 50, y: 44, rating: 90 },
          { role: 'LWF', name: 'Left Winger', x: 20, y: 24, rating: 90 },
          { role: 'CF', name: 'Centre Forward', x: 50, y: 18, rating: 90 },
          { role: 'RWF', name: 'Right Winger', x: 80, y: 24, rating: 90 }
        ];
      case '4-4-2':
        return [
          { role: 'GK', name: 'Goalkeeper', x: 50, y: 90, rating: 90, isGK: true },
          { role: 'LB', name: 'Left Back', x: 18, y: 75, rating: 90 },
          { role: 'CB', name: 'Centre Back', x: 38, y: 78, rating: 90 },
          { role: 'CB', name: 'Centre Back', x: 62, y: 78, rating: 90 },
          { role: 'RB', name: 'Right Back', x: 82, y: 75, rating: 90 },
          { role: 'LMF', name: 'Left Mid', x: 18, y: 48, rating: 90 },
          { role: 'CMF', name: 'Cent Midfielder', x: 38, y: 52, rating: 90 },
          { role: 'CMF', name: 'Cent Midfielder', x: 62, y: 52, rating: 90 },
          { role: 'RMF', name: 'Right Mid', x: 82, y: 48, rating: 90 },
          { role: 'CF', name: 'Centre Forward', x: 38, y: 20, rating: 90 },
          { role: 'CF', name: 'Centre Forward', x: 62, y: 20, rating: 90 }
        ];
      case '4-1-2-3':
        return [
          { role: 'GK', name: 'Goalkeeper', x: 50, y: 90, rating: 90, isGK: true },
          { role: 'LB', name: 'Left Back', x: 18, y: 75, rating: 90 },
          { role: 'CB', name: 'Centre Back', x: 38, y: 78, rating: 90 },
          { role: 'CB', name: 'Centre Back', x: 62, y: 78, rating: 90 },
          { role: 'RB', name: 'Right Back', x: 82, y: 75, rating: 90 },
          { role: 'DMF', name: 'Def Midfielder', x: 50, y: 64, rating: 90 },
          { role: 'AMF', name: 'Att Midfielder', x: 36, y: 44, rating: 90 },
          { role: 'AMF', name: 'Att Midfielder', x: 64, y: 44, rating: 90 },
          { role: 'LWF', name: 'Left Winger', x: 20, y: 24, rating: 90 },
          { role: 'CF', name: 'Centre Forward', x: 50, y: 18, rating: 90 },
          { role: 'RWF', name: 'Right Winger', x: 80, y: 24, rating: 90 }
        ];
      case '3-2-4-1':
        return [
          { role: 'GK', name: 'Goalkeeper', x: 50, y: 90, rating: 90, isGK: true },
          { role: 'CB', name: 'Left CB', x: 28, y: 78, rating: 90 },
          { role: 'CB', name: 'Centre Back', x: 50, y: 80, rating: 90 },
          { role: 'CB', name: 'Right CB', x: 72, y: 78, rating: 90 },
          { role: 'DMF', name: 'Def Midfielder', x: 38, y: 62, rating: 90 },
          { role: 'DMF', name: 'Def Midfielder', x: 62, y: 62, rating: 90 },
          { role: 'LMF', name: 'Left Mid', x: 18, y: 42, rating: 90 },
          { role: 'AMF', name: 'Att Midfielder', x: 38, y: 38, rating: 90 },
          { role: 'AMF', name: 'Att Midfielder', x: 62, y: 38, rating: 90 },
          { role: 'RMF', name: 'Right Mid', x: 82, y: 42, rating: 90 },
          { role: 'CF', name: 'Centre Forward', x: 50, y: 18, rating: 90 }
        ];
      case '5-2-3':
        return [
          { role: 'GK', name: 'Goalkeeper', x: 50, y: 90, rating: 90, isGK: true },
          { role: 'LWB', name: 'Left Wingback', x: 15, y: 68, rating: 90 },
          { role: 'CB', name: 'Left CB', x: 32, y: 78, rating: 90 },
          { role: 'CB', name: 'Centre Back', x: 50, y: 80, rating: 90 },
          { role: 'CB', name: 'Right CB', x: 68, y: 78, rating: 90 },
          { role: 'RWB', name: 'Right Wingback', x: 85, y: 68, rating: 90 },
          { role: 'CMF', name: 'Cent Midfielder', x: 38, y: 52, rating: 90 },
          { role: 'CMF', name: 'Cent Midfielder', x: 62, y: 52, rating: 90 },
          { role: 'LWF', name: 'Left Winger', x: 20, y: 24, rating: 90 },
          { role: 'CF', name: 'Centre Forward', x: 50, y: 18, rating: 90 },
          { role: 'RWF', name: 'Right Winger', x: 80, y: 24, rating: 90 }
        ];
      case '4-2-2-2':
        return [
          { role: 'GK', name: 'Goalkeeper', x: 50, y: 90, rating: 90, isGK: true },
          { role: 'LB', name: 'Left Back', x: 18, y: 75, rating: 90 },
          { role: 'CB', name: 'Centre Back', x: 38, y: 78, rating: 90 },
          { role: 'CB', name: 'Centre Back', x: 62, y: 78, rating: 90 },
          { role: 'RB', name: 'Right Back', x: 82, y: 75, rating: 90 },
          { role: 'DMF', name: 'Def Midfielder', x: 38, y: 62, rating: 90 },
          { role: 'DMF', name: 'Def Midfielder', x: 62, y: 62, rating: 90 },
          { role: 'AMF', name: 'Left AMF', x: 30, y: 42, rating: 90 },
          { role: 'AMF', name: 'Right AMF', x: 70, y: 42, rating: 90 },
          { role: 'CF', name: 'Centre Forward', x: 38, y: 20, rating: 90 },
          { role: 'CF', name: 'Centre Forward', x: 62, y: 20, rating: 90 }
        ];
      case '3-4-3':
        return [
          { role: 'GK', name: 'Goalkeeper', x: 50, y: 90, rating: 90, isGK: true },
          { role: 'CB', name: 'Left CB', x: 30, y: 78, rating: 90 },
          { role: 'CB', name: 'Centre Back', x: 50, y: 80, rating: 90 },
          { role: 'CB', name: 'Right CB', x: 70, y: 78, rating: 90 },
          { role: 'LMF', name: 'Left Mid', x: 18, y: 50, rating: 90 },
          { role: 'CMF', name: 'Cent Midfielder', x: 38, y: 52, rating: 90 },
          { role: 'CMF', name: 'Cent Midfielder', x: 62, y: 52, rating: 90 },
          { role: 'RMF', name: 'Right Mid', x: 82, y: 50, rating: 90 },
          { role: 'LWF', name: 'Left Winger', x: 20, y: 24, rating: 90 },
          { role: 'CF', name: 'Centre Forward', x: 50, y: 18, rating: 90 },
          { role: 'RWF', name: 'Right Winger', x: 80, y: 24, rating: 90 }
        ];
      case '4-3-3':
      case 'Custom':
      default:
        return [
          { role: 'GK', name: 'Goalkeeper', x: 50, y: 90, rating: 90, isGK: true },
          { role: 'LB', name: 'Left Back', x: 18, y: 75, rating: 90 },
          { role: 'CB', name: 'Centre Back', x: 38, y: 78, rating: 90 },
          { role: 'CB', name: 'Centre Back', x: 62, y: 78, rating: 90 },
          { role: 'RB', name: 'Right Back', x: 82, y: 75, rating: 90 },
          { role: 'DMF', name: 'Def Midfielder', x: 50, y: 62, rating: 90 },
          { role: 'CMF', name: 'Cent Midfielder', x: 35, y: 48, rating: 90 },
          { role: 'CMF', name: 'Cent Midfielder', x: 65, y: 48, rating: 90 },
          { role: 'LWF', name: 'Left Winger', x: 20, y: 24, rating: 90 },
          { role: 'CF', name: 'Centre Forward', x: 50, y: 18, rating: 90 },
          { role: 'RWF', name: 'Right Winger', x: 80, y: 24, rating: 90 }
        ];
    }
  };

  const renderTactics = () => {
    // If no tactics exist, render clean empty states ready for user's own game plans
    if (!AppState.tactics || AppState.tactics.length === 0) {
      if (UI.btnEditTactic) UI.btnEditTactic.style.display = 'none';
      if (UI.btnDeleteTactic) UI.btnDeleteTactic.style.display = 'none';

      // Clear pitch player nodes and show chalkboard banner
      if (UI.tacticsPitch) {
        const existingNodes = UI.tacticsPitch.querySelectorAll('.player-node, .empty-pitch-banner');
        existingNodes.forEach(n => n.remove());

        const banner = document.createElement('div');
        banner.className = 'empty-pitch-banner';
        banner.innerHTML = `
          <i class="fas fa-clipboard-list gold-text"></i>
          <h4>Clean Tactical Chalkboard</h4>
          <p>All preset game plans have been cleared. Build your own custom formation, select your playstyle, and position your players on the pitch!</p>
          <button class="btn-gold" style="padding: 0.5rem 1.2rem; font-size: 0.85rem;" onclick="document.getElementById('modal-create-tactic').classList.add('active')">
            <i class="fas fa-plus-circle"></i> Create Game Plan
          </button>
        `;
        UI.tacticsPitch.appendChild(banner);
      }

      // Empty Controls Panel
      if (UI.tacticsControlsPanel) {
        UI.tacticsControlsPanel.innerHTML = `
          <div class="tactics-empty-state">
            <i class="fas fa-chess-board empty-state-icon"></i>
            <h3 class="empty-state-title">No Game Plans Added</h3>
            <p class="empty-state-desc">
              Your tactical chalkboard is completely clean. Click "Create Game Plan" below to configure your formation (4-3-3, 4-2-1-3, 5-2-3, etc.), team playstyle, and individual player instructions.
            </p>
            <button class="btn-gold" onclick="document.getElementById('modal-create-tactic').classList.add('active')">
              <i class="fas fa-plus-circle"></i> Create Your First Game Plan
            </button>
          </div>
        `;
      }
      return;
    }

    // When tactics exist:
    if (UI.btnEditTactic) UI.btnEditTactic.style.display = 'inline-flex';
    if (UI.btnDeleteTactic) UI.btnDeleteTactic.style.display = 'inline-flex';

    if (AppState.activeTacticIndex >= AppState.tactics.length) {
      AppState.activeTacticIndex = 0;
    }
    const currentTactic = AppState.tactics[AppState.activeTacticIndex] || AppState.tactics[0];

    // Render Controls Panel
    if (UI.tacticsControlsPanel) {
      UI.tacticsControlsPanel.innerHTML = `
        <div class="glass-panel">
          <div class="tactics-card-header">
            <span class="gold-text" style="font-size: 0.85rem; font-family: var(--font-mono); text-transform: uppercase;">Active Strategy Preset</span>
            <div class="preset-selector-row" id="tactics-presets-container">
              ${AppState.tactics.map((tac, idx) => `
                <button class="preset-pill ${idx === AppState.activeTacticIndex ? 'active' : ''}" onclick="window.switchTactic(${idx})">
                  ${tac.formation} • ${tac.name.split('(')[0].trim()}
                </button>
              `).join('')}
            </div>
          </div>

          <h3 style="font-family: var(--font-title); font-size: 1.4rem; margin-bottom: 0.4rem;">${currentTactic.name}</h3>
          <div style="font-family: var(--font-mono); font-size: 0.9rem; color: var(--gold-bright); margin-bottom: 1rem;">Playstyle: ${currentTactic.playstyle}</div>
          <p style="color: var(--text-secondary); font-size: 0.92rem; margin-bottom: 1.2rem; line-height: 1.6;">
            ${currentTactic.description || 'Custom tactical game plan.'}
          </p>

          <div class="playstyle-box">
            <div class="playstyle-title">
              <i class="fas fa-lightbulb"></i> When to Deploy This Game Plan
            </div>
            <p style="font-size: 0.88rem; color: var(--text-secondary);">
              ${currentTactic.whenToUse || 'Primary tactical setup.'}
            </p>
          </div>

          <h4 style="font-family: var(--font-mono); font-size: 0.85rem; text-transform: uppercase; color: var(--gold-light); margin-bottom: 0.8rem;">
            Individual Player Instructions
          </h4>
          <div class="instructions-grid">
            <div class="instruction-item"><div class="instruction-type">Attacking 1</div><div class="instruction-value">${currentTactic.instructions ? (currentTactic.instructions.attacking1 || 'None') : 'None'}</div></div>
            <div class="instruction-item"><div class="instruction-type">Attacking 2</div><div class="instruction-value">${currentTactic.instructions ? (currentTactic.instructions.attacking2 || 'None') : 'None'}</div></div>
            <div class="instruction-item"><div class="instruction-type">Defensive 1</div><div class="instruction-value">${currentTactic.instructions ? (currentTactic.instructions.defensive1 || 'None') : 'None'}</div></div>
            <div class="instruction-item"><div class="instruction-type">Defensive 2</div><div class="instruction-value">${currentTactic.instructions ? (currentTactic.instructions.defensive2 || 'None') : 'None'}</div></div>
          </div>
        </div>
      `;
    }

    // Render interactive pitch player nodes
    if (UI.tacticsPitch) {
      const existingNodes = UI.tacticsPitch.querySelectorAll('.player-node, .empty-pitch-banner');
      existingNodes.forEach(n => n.remove());

      if (currentTactic.nodes && currentTactic.nodes.length > 0) {
        currentTactic.nodes.forEach((node) => {
          const el = document.createElement('div');
          el.className = `player-node ${node.isGK ? 'gk' : ''}`;
          el.style.left = `${node.x}%`;
          el.style.top = `${node.y}%`;
          el.title = `Double-click to rename ${node.name} (${node.role})`;
          el.innerHTML = `
            <div class="player-token">${node.role}</div>
            <div class="player-name-tag">${node.name}</div>
          `;

          let isDragging = false;

          const onStartDrag = (e) => {
            isDragging = true;
            if (e.cancelable && e.type === 'touchstart') e.preventDefault();
            document.addEventListener('mousemove', onMoveDrag);
            document.addEventListener('mouseup', onEndDrag);
            document.addEventListener('touchmove', onMoveDrag, { passive: false });
            document.addEventListener('touchend', onEndDrag);
          };

          const onMoveDrag = (e) => {
            if (!isDragging) return;
            const rect = UI.tacticsPitch.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            let newX = Math.round(((clientX - rect.left) / rect.width) * 100);
            let newY = Math.round(((clientY - rect.top) / rect.height) * 100);
            newX = Math.max(5, Math.min(95, newX));
            newY = Math.max(5, Math.min(95, newY));
            el.style.left = `${newX}%`;
            el.style.top = `${newY}%`;
            node.x = newX;
            node.y = newY;
          };

          const onEndDrag = () => {
            if (isDragging) {
              isDragging = false;
              document.removeEventListener('mousemove', onMoveDrag);
              document.removeEventListener('mouseup', onEndDrag);
              document.removeEventListener('touchmove', onMoveDrag);
              document.removeEventListener('touchend', onEndDrag);
              StorageEngine.saveData('tactics', AppState.tactics, AppState.currentUser.id);
            }
          };

          el.addEventListener('mousedown', onStartDrag);
          el.addEventListener('touchstart', onStartDrag, { passive: false });

          // Double click to rename player or role
          el.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            const newName = prompt(`Enter player name for position ${node.role}:`, node.name);
            if (newName && newName.trim()) {
              node.name = newName.trim();
              StorageEngine.saveData('tactics', AppState.tactics, AppState.currentUser.id);
              renderTactics();
            }
          });

          UI.tacticsPitch.appendChild(el);
        });
      }
    }
  };

  window.switchTactic = (index) => {
    AppState.activeTacticIndex = index;
    renderTactics();
  };

  // =========================================================================
  // SECTION D: SQUAD SETUPS (USER BUILDS COACH & PLAYERS)
  // =========================================================================
  const renderSquads = () => {
    if (!AppState.squads || AppState.squads.length === 0) return;
    const squad = AppState.squads[0];

    if (UI.managerName) UI.managerName.textContent = squad.manager.name;
    if (UI.managerPlaystyle) UI.managerPlaystyle.textContent = squad.manager.playstyle;
    if (UI.managerBoost) UI.managerBoost.textContent = squad.manager.boost;

    // Starting XI Cards
    if (UI.startingXiGrid) {
      if (squad.startingXI.length === 0) {
        UI.startingXiGrid.innerHTML = `
          <div style="grid-column: 1/-1; text-align: center; padding: 2.5rem 1rem; color: var(--text-secondary); border: 1px dashed var(--gold-border); border-radius: var(--border-radius-sm);">
            <i class="fas fa-users" style="font-size: 2rem; color: var(--gold-primary); margin-bottom: 0.6rem; display: block;"></i>
            <h4 style="color: #fff; margin-bottom: 0.3rem;">No Starting Players Added</h4>
            <p style="font-size: 0.85rem; margin-bottom: 1rem;">Build your dream starting eleven by clicking "Add Player".</p>
            <button class="btn-gold" style="font-size: 0.82rem; padding: 0.4rem 1rem;" onclick="document.getElementById('modal-add-player').classList.add('active')">
              <i class="fas fa-plus"></i> Add Player
            </button>
          </div>
        `;
      } else {
        UI.startingXiGrid.innerHTML = squad.startingXI.map((p, idx) => `
          <div class="player-card-slot">
            <button class="btn-icon danger" style="position: absolute; top: 6px; right: 6px; width: 22px; height: 22px; font-size: 0.7rem;" title="Remove Player" onclick="window.removePlayer('startingXI', ${idx})">
              <i class="fas fa-times"></i>
            </button>
            <div class="player-top-row">
              <span class="player-pos-badge">${p.pos}</span>
              <span class="player-overall-rating">${p.rating}</span>
            </div>
            <div class="player-card-name">${p.name}</div>
            <div class="player-card-tier">${p.tier}</div>
          </div>
        `).join('');
      }
    }

    // Subs Row
    if (UI.subsRow) {
      if (squad.subs.length === 0) {
        UI.subsRow.innerHTML = `
          <div style="color: var(--text-muted); font-size: 0.85rem; padding: 0.5rem;">
            No substitute bench players added yet.
          </div>
        `;
      } else {
        UI.subsRow.innerHTML = squad.subs.map((p, idx) => `
          <div class="sub-chip">
            <div>
              <span style="font-family: var(--font-mono); font-weight: 700; color: var(--gold-bright); margin-right: 4px;">${p.pos}</span>
              <span style="font-size: 0.85rem;">${p.name}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.4rem;">
              <span style="font-family: var(--font-mono); font-weight: 800; color: #fff;">${p.rating}</span>
              <button class="btn-icon danger" style="width: 20px; height: 20px; font-size: 0.65rem;" onclick="window.removePlayer('subs', ${idx})">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
        `).join('');
      }
    }

    // Assigned Roles
    if (UI.rolesList && squad.roles) {
      UI.rolesList.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 0.8rem; margin-top: 1rem;">
          <div class="instruction-item"><div class="instruction-type">Captain (C)</div><div class="instruction-value">${squad.roles.captain}</div></div>
          <div class="instruction-item"><div class="instruction-type">Penalty Taker</div><div class="instruction-value">${squad.roles.penalty}</div></div>
          <div class="instruction-item"><div class="instruction-type">Short Free-Kick</div><div class="instruction-value">${squad.roles.shortFK}</div></div>
          <div class="instruction-item"><div class="instruction-type">Long Free-Kick</div><div class="instruction-value">${squad.roles.longFK}</div></div>
        </div>
      `;
    }
  };

  window.removePlayer = (slot, index) => {
    const squad = AppState.squads[0];
    if (squad && squad[slot]) {
      squad[slot].splice(index, 1);
      StorageEngine.saveData('squads', AppState.squads, AppState.currentUser.id);
      renderSquads();
      showToast('Player removed from squad.');
    }
  };

  // =========================================================================
  // SECTION E: STATISTICS & PROGRESS (FRESH ZERO METRICS)
  // =========================================================================
  const renderStatistics = () => {
    const matches = AppState.matches;
    const total = matches.length;
    const wins = matches.filter(m => m.result === 'W').length;
    const draws = matches.filter(m => m.result === 'D').length;
    const losses = matches.filter(m => m.result === 'L').length;
    const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;

    let totalGf = 0;
    let totalGa = 0;
    let cleanSheets = 0;

    matches.forEach(m => {
      totalGf += Number(m.myScore) || 0;
      totalGa += Number(m.oppScore) || 0;
      if (Number(m.oppScore) === 0) cleanSheets++;
    });

    const gd = totalGf - totalGa;

    if (UI.kpiMatches) UI.kpiMatches.textContent = total;
    if (UI.kpiWins) UI.kpiWins.textContent = wins;
    if (UI.kpiDraws) UI.kpiDraws.textContent = draws;
    if (UI.kpiLosses) UI.kpiLosses.textContent = losses;
    if (UI.kpiWinRate) UI.kpiWinRate.textContent = `${winRate}%`;
    if (UI.kpiGoalsScored) UI.kpiGoalsScored.textContent = totalGf;
    if (UI.kpiGoalsConceded) UI.kpiGoalsConceded.textContent = totalGa;
    if (UI.kpiGoalDiff) UI.kpiGoalDiff.textContent = (gd >= 0 ? `+${gd}` : gd);
    if (UI.kpiCleanSheets) UI.kpiCleanSheets.textContent = cleanSheets;

    if (UI.formStreakContainer) {
      if (matches.length === 0) {
        UI.formStreakContainer.innerHTML = `<span style="color: var(--text-muted); font-size: 0.85rem;">No matches yet</span>`;
      } else {
        const recent = matches.slice(0, 5);
        UI.formStreakContainer.innerHTML = recent.map(m => `
          <span class="form-badge ${m.result}">${m.result}</span>
        `).join('');
      }
    }

    drawTrajectoryChart(matches);
    drawResultsDoughnut(wins, draws, losses);
    drawGoalsBarChart(matches);
  };

  const drawTrajectoryChart = (matches) => {
    const canvas = UI.chartTrajectory;
    if (!canvas || !canvas.parentElement) return;
    const width = canvas.parentElement.clientWidth;
    const height = canvas.parentElement.clientHeight || 260;
    if (width <= 0 || height <= 0) return;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);

    if (matches.length === 0) {
      ctx.fillStyle = '#626473';
      ctx.font = '14px Outfit';
      ctx.textAlign = 'center';
      ctx.fillText('Record matches to generate your points trajectory curve.', width / 2, height / 2);
      return;
    }

    const reversed = [...matches].reverse();
    let pts = 0;
    const pointsData = reversed.map(m => {
      if (m.result === 'W') pts += 3;
      else if (m.result === 'D') pts += 1;
      return pts;
    });

    const maxPts = Math.max(...pointsData, 10);
    const padding = 40;
    const stepX = (width - padding * 2) / Math.max(pointsData.length - 1, 1);

    ctx.strokeStyle = 'rgba(212, 175, 55, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      const y = padding + (i * (height - padding * 2) / 3);
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
    gradient.addColorStop(0, 'rgba(255, 215, 0, 0.35)');
    gradient.addColorStop(1, 'rgba(212, 175, 55, 0.0)');

    ctx.beginPath();
    pointsData.forEach((val, i) => {
      const x = padding + i * stepX;
      const y = height - padding - (val / maxPts) * (height - padding * 2);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.lineTo(padding + (pointsData.length - 1) * stepX, height - padding);
    ctx.lineTo(padding, height - padding);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.beginPath();
    pointsData.forEach((val, i) => {
      const x = padding + i * stepX;
      const y = height - padding - (val / maxPts) * (height - padding * 2);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 3;
    ctx.stroke();

    pointsData.forEach((val, i) => {
      const x = padding + i * stepX;
      const y = height - padding - (val / maxPts) * (height - padding * 2);
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  };

  const drawResultsDoughnut = (w, d, l) => {
    const canvas = UI.chartResultsDoughnut;
    if (!canvas || !canvas.parentElement) return;
    const width = canvas.parentElement.clientWidth;
    const height = canvas.parentElement.clientHeight || 260;
    if (width <= 0 || height <= 0) return;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);

    const total = w + d + l;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.max(10, Math.min(centerX, centerY) - 30);
    const innerRadius = radius * 0.6;

    if (total === 0) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.arc(centerX, centerY, innerRadius, Math.PI * 2, 0, true);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.fill();
      ctx.fillStyle = '#626473';
      ctx.font = '12px Outfit';
      ctx.textAlign = 'center';
      ctx.fillText('0 Matches', centerX, centerY);
      return;
    }

    const slices = [
      { val: w, color: '#ffd700', label: 'Wins' },
      { val: d, color: '#f1c40f', label: 'Draws' },
      { val: l, color: '#e74c3c', label: 'Losses' }
    ];

    let currentAngle = -Math.PI / 2;
    slices.forEach(slice => {
      const sliceAngle = (slice.val / total) * (Math.PI * 2);
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.arc(centerX, centerY, innerRadius, currentAngle + sliceAngle, currentAngle, true);
      ctx.closePath();
      ctx.fillStyle = slice.color;
      ctx.fill();
      currentAngle += sliceAngle;
    });

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 22px Rajdhani';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${Math.round((w / total) * 100)}%`, centerX, centerY - 6);
    ctx.fillStyle = '#d4af37';
    ctx.font = '600 12px Outfit';
    ctx.fillText('WIN RATE', centerX, centerY + 14);
  };

  const drawGoalsBarChart = (matches) => {
    const canvas = UI.chartGoalsBar;
    if (!canvas || !canvas.parentElement) return;
    const width = canvas.parentElement.clientWidth;
    const height = canvas.parentElement.clientHeight || 200;
    if (width <= 0 || height <= 0) return;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);

    if (matches.length === 0) {
      ctx.fillStyle = '#626473';
      ctx.font = '14px Outfit';
      ctx.textAlign = 'center';
      ctx.fillText('Goals scored and conceded will appear here after matches are played.', width / 2, height / 2);
      return;
    }

    const recent = matches.slice(0, 7).reverse();
    const barWidth = 24;
    const gap = (width - 60) / recent.length;

    recent.forEach((m, i) => {
      const x = 30 + i * gap;
      const scoredH = (m.myScore / 6) * (height - 60);
      const concededH = (m.oppScore / 6) * (height - 60);

      ctx.fillStyle = '#ffd700';
      ctx.fillRect(x, height - 30 - scoredH, barWidth / 2 - 2, scoredH);

      ctx.fillStyle = '#e74c3c';
      ctx.fillRect(x + barWidth / 2, height - 30 - concededH, barWidth / 2 - 2, concededH);

      ctx.fillStyle = '#a0a2b0';
      ctx.font = '11px Rajdhani';
      ctx.textAlign = 'center';
      ctx.fillText(`M${i+1}`, x + barWidth / 2, height - 12);
    });
  };

  // =========================================================================
  // SECTION F: TOURNAMENT CENTRE WITH FRIENDS (CREATOR, KNOCKOUT & RECORDINGS)
  // =========================================================================

  // Helper: Recalculate standings table from match history log
  const recalculateTournamentStandings = (tourney) => {
    if (!tourney) return;
    tourney.standings = tourney.standings || [];
    tourney.matchLog = tourney.matchLog || [];

    // Ensure all participants exist in standings
    const statsMap = {};
    const participants = (tourney.participants && tourney.participants.length > 0)
      ? tourney.participants.map(p => p.name)
      : tourney.standings.map(s => s.team);

    participants.forEach(name => {
      statsMap[name] = {
        rank: 1,
        team: name,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        gf: 0,
        ga: 0,
        gd: 0,
        pts: 0
      };
    });

    // Tally up every match in tournament matchLog
    tourney.matchLog.forEach(m => {
      if (m.score1 === null || m.score2 === null || m.score1 === undefined || m.score2 === undefined || isNaN(m.score1) || isNaN(m.score2)) return;

      if (!statsMap[m.team1]) {
        statsMap[m.team1] = { rank: 1, team: m.team1, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 };
      }
      if (!statsMap[m.team2]) {
        statsMap[m.team2] = { rank: 1, team: m.team2, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 };
      }

      const t1 = statsMap[m.team1];
      const t2 = statsMap[m.team2];

      t1.played += 1;
      t2.played += 1;
      t1.gf += m.score1;
      t1.ga += m.score2;
      t2.gf += m.score2;
      t2.ga += m.score1;

      if (m.score1 > m.score2) {
        t1.won += 1;
        t1.pts += 3;
        t2.lost += 1;
      } else if (m.score2 > m.score1) {
        t2.won += 1;
        t2.pts += 3;
        t1.lost += 1;
      } else {
        t1.drawn += 1;
        t1.pts += 1;
        t2.drawn += 1;
        t2.pts += 1;
      }
    });

    tourney.standings = Object.values(statsMap).map(s => {
      s.gd = s.gf - s.ga;
      return s;
    });

    tourney.standings.sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
    tourney.standings.forEach((s, idx) => { s.rank = idx + 1; });
  };

  // Helper: Record a tournament match into history & sync with studio recordings
  const recordTournamentMatch = (tourney, stageName, matchKey, team1, score1, team2, score2, winner, customDate) => {
    if (!tourney) return;
    tourney.matchLog = tourney.matchLog || [];

    const existingIdx = tourney.matchLog.findIndex(m => m.matchKey === matchKey);
    const dateStr = customDate || new Date().toISOString().slice(0, 10);
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const matchRecord = {
      id: existingIdx >= 0 ? tourney.matchLog[existingIdx].id : 'tm_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      matchKey: matchKey || ('m_' + Date.now()),
      stageName: stageName || 'Tournament Match',
      team1: team1,
      score1: parseInt(score1, 10),
      team2: team2,
      score2: parseInt(score2, 10),
      winner: winner,
      date: dateStr,
      timestamp: timeStr
    };

    if (existingIdx >= 0) {
      tourney.matchLog[existingIdx] = matchRecord;
    } else {
      tourney.matchLog.unshift(matchRecord);
    }

    // Recalculate standings
    recalculateTournamentStandings(tourney);

    // Sync with AppState.matches (Match Recordings archive) if the active user participated!
    const myGamerTag = AppState.currentUser ? (AppState.currentUser.gamerTag || 'NONCHALANT JR') : 'NONCHALANT JR';
    const isTeam1Me = team1.toLowerCase() === myGamerTag.toLowerCase() || team1.toLowerCase() === 'nonchalant jr';
    const isTeam2Me = team2.toLowerCase() === myGamerTag.toLowerCase() || team2.toLowerCase() === 'nonchalant jr';

    if (isTeam1Me || isTeam2Me) {
      const myScore = isTeam1Me ? matchRecord.score1 : matchRecord.score2;
      const oppScore = isTeam1Me ? matchRecord.score2 : matchRecord.score1;
      const opponent = isTeam1Me ? team2 : team1;
      const result = myScore > oppScore ? 'W' : (myScore === oppScore ? 'D' : 'L');
      const recordingId = `tourney_rec_${tourney.id}_${matchRecord.matchKey}`;

      const recIdx = AppState.matches.findIndex(m => m.id === recordingId);
      const recItem = {
        id: recordingId,
        opponent: opponent,
        myScore: myScore,
        oppScore: oppScore,
        result: result,
        competition: `Tournament: ${tourney.name}`,
        teamUsed: 'NONCHALANT JR XI',
        date: matchRecord.date,
        tags: ['Tournament', tourney.name, stageName],
        notes: `Official ${stageName} tournament match against ${opponent}. Final score: ${myScore}-${oppScore}.`,
        videoUrl: 'assets/bg.jpg',
        thumbUrl: 'assets/bg.jpg'
      };

      if (recIdx >= 0) {
        AppState.matches[recIdx] = recItem;
      } else {
        AppState.matches.unshift(recItem);
      }

      StorageEngine.saveData('matches', AppState.matches, AppState.currentUser.id);
      renderMatchRecordings();
      renderHeroStats();
      renderStatistics();
    }

    StorageEngine.saveData('tournament', tourney, AppState.currentUser.id);
  };

  // Helper: Crown Champion and record into tournament champions archive & Trophy Room
  const crownTournamentChampion = (tourney, championName, runnerUp, scoreline) => {
    if (!tourney) return;
    tourney.champion = championName;
    tourney.championsHistory = tourney.championsHistory || [];

    const champEntry = {
      id: 'champ_' + Date.now(),
      tournamentId: tourney.id,
      tournamentName: tourney.name,
      champion: championName,
      runnerUp: runnerUp || 'Finalist',
      scoreline: scoreline || 'Won Grand Final',
      date: new Date().toISOString().slice(0, 10),
      formattedDate: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    };

    const existingChampIdx = tourney.championsHistory.findIndex(c => c.tournamentId === tourney.id);
    if (existingChampIdx >= 0) {
      tourney.championsHistory[existingChampIdx] = champEntry;
    } else {
      tourney.championsHistory.unshift(champEntry);
    }

    // Also record in Trophy Room!
    const trophyId = 'trophy_tourney_' + tourney.id;
    const existingTrophyIdx = AppState.trophies.findIndex(t => t.id === trophyId);
    const myGamerTag = AppState.currentUser ? (AppState.currentUser.gamerTag || 'NONCHALANT JR') : 'NONCHALANT JR';
    const isUserWinner = championName.toLowerCase() === myGamerTag.toLowerCase() || championName.toLowerCase() === 'nonchalant jr';

    const newTrophy = {
      id: trophyId,
      title: tourney.name,
      placement: isUserWinner ? 'champion' : 'runner_up',
      placementLabel: isUserWinner ? `Champion / 1st Place (Winner: ${championName})` : `Runner-Up / 2nd Place (Winner: ${championName})`,
      date: champEntry.date,
      finalOpponent: isUserWinner ? runnerUp : championName,
      finalScore: scoreline || '3 - 1',
      trophyType: isUserWinner ? 'gold' : 'silver',
      iconEmoji: isUserWinner ? '🏆' : '🥈',
      notes: `Official Tournament: ${tourney.name}. Champion crowned: ${championName}. Runner-Up: ${runnerUp}.`
    };

    if (existingTrophyIdx >= 0) {
      AppState.trophies[existingTrophyIdx] = newTrophy;
    } else {
      AppState.trophies.unshift(newTrophy);
    }

    StorageEngine.saveData('trophies', AppState.trophies, AppState.currentUser.id);
    StorageEngine.saveData('tournament', tourney, AppState.currentUser.id);

    renderTrophyRoom();
    renderHeroStats();
    renderTournament();
  };

  // Helper: Render recorded matches & tournament champions archive panel
  const renderTournamentMatchesLog = (tourney) => {
    if (!UI.tournamentMatchesLogContainer) return;

    if (!tourney) {
      UI.tournamentMatchesLogContainer.innerHTML = `
        <div class="empty-state-box" style="padding: 2rem;">
          <i class="fas fa-clipboard-list empty-state-icon"></i>
          <h4 class="empty-state-title">No Tournament Active</h4>
          <p class="empty-state-desc">Create a tournament above to begin logging tournament matches and crowning champions.</p>
        </div>
      `;
      return;
    }

    const matches = tourney.matchLog || [];
    const champs = tourney.championsHistory || [];
    const currentChamp = tourney.champion || (champs[0] ? champs[0].champion : null);
    const myGamerTag = AppState.currentUser ? (AppState.currentUser.gamerTag || 'NONCHALANT JR') : 'NONCHALANT JR';

    let html = '';

    // 1. Champions Showcase Banner
    if (currentChamp) {
      const champInfo = champs[0] || {
        tournamentName: tourney.name,
        champion: currentChamp,
        runnerUp: 'Finalist',
        scoreline: 'Champion',
        formattedDate: 'Current Cup'
      };

      html += `
        <div class="tournament-champions-banner">
          <div style="display: flex; align-items: center; gap: 1.2rem; flex-wrap: wrap;">
            <div style="font-size: 3rem; filter: drop-shadow(0 0 15px gold); line-height: 1;">👑</div>
            <div>
              <div style="font-size: 0.78rem; font-family: var(--font-mono); color: var(--gold-bright); text-transform: uppercase; letter-spacing: 1.5px;">
                <i class="fas fa-trophy"></i> OFFICIAL TOURNAMENT CHAMPION
              </div>
              <div style="font-family: var(--font-title); font-size: 1.7rem; font-weight: 800; color: #fff; margin: 0.2rem 0;">
                ${champInfo.champion}
              </div>
              <div style="font-size: 0.85rem; color: var(--text-secondary);">
                Tournament: <strong style="color: var(--gold-light);">${tourney.name}</strong> • 
                Final: <span style="font-family: var(--font-mono); color: var(--gold-bright);">${champInfo.scoreline}</span> vs ${champInfo.runnerUp} • 
                Date: ${champInfo.formattedDate || 'Recently'}
              </div>
            </div>
          </div>
          <div style="display: flex; gap: 0.8rem; align-items: center; flex-wrap: wrap;">
            <span class="badge" style="background: var(--gold-gradient); color: #070709; font-weight: 800; padding: 0.5rem 1rem; font-size: 0.9rem; border-radius: 6px;">
              <i class="fas fa-medal"></i> 1ST PLACE WINNER
            </span>
            <button class="btn-secondary" onclick="document.getElementById('nav-trophies').click()" style="font-size: 0.82rem; padding: 0.5rem 0.9rem;">
              <i class="fas fa-award"></i> View Trophy Room
            </button>
          </div>
        </div>
      `;

      // If multiple champions exist in history
      if (champs.length > 1) {
        html += `
          <div style="margin-bottom: 1.5rem; background: rgba(255,255,255,0.02); border: 1px solid rgba(212,175,55,0.2); border-radius: 8px; padding: 0.8rem 1.2rem;">
            <div style="font-size: 0.8rem; font-family: var(--font-mono); color: var(--gold-bright); text-transform: uppercase; margin-bottom: 0.5rem;">
              <i class="fas fa-history"></i> Hall of Champions / Past Winners
            </div>
            <div style="display: flex; gap: 0.8rem; flex-wrap: wrap;">
              ${champs.map(c => `
                <div style="background: rgba(212,175,55,0.1); border: 1px solid rgba(212,175,55,0.3); border-radius: 6px; padding: 0.35rem 0.75rem; font-size: 0.82rem;">
                  🏆 <strong style="color: #fff;">${c.champion}</strong> (${c.tournamentName} • ${c.formattedDate || c.date})
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }
    }

    // 2. Matches Header & Action Bar
    html += `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.8rem;">
        <div style="font-family: var(--font-title); font-size: 1.15rem; color: #fff;">
          <i class="fas fa-clipboard-check gold-text"></i> Recorded Tournament Matches 
          <span style="font-family: var(--font-mono); font-size: 0.85rem; color: var(--gold-bright); margin-left: 0.5rem;">(${matches.length} played)</span>
        </div>
        <div style="display: flex; gap: 0.6rem;">
          <button class="btn-gold" onclick="window.openRecordTourneyMatchModal()" style="font-size: 0.82rem; padding: 0.4rem 0.85rem;">
            <i class="fas fa-plus"></i> Record Match Result
          </button>
        </div>
      </div>
    `;

    // 3. Matches Grid or Empty State
    if (matches.length === 0) {
      html += `
        <div class="empty-state-box" style="padding: 2.2rem; text-align: center;">
          <i class="fas fa-futbol empty-state-icon" style="font-size: 2.5rem; margin-bottom: 0.8rem;"></i>
          <h4 style="font-family: var(--font-title); font-size: 1.1rem; color: #fff; margin-bottom: 0.4rem;">No Tournament Matches Recorded Yet</h4>
          <p style="color: var(--text-muted); font-size: 0.88rem; max-width: 540px; margin: 0 auto 1.2rem;">
            Click on any match fixture in the interactive knockout bracket above, or click <strong>"Record Match Result"</strong> to record match scores between friends. All scores update group standings and permanently preserve tournament history!
          </p>
          <button class="btn-secondary" onclick="window.openRecordTourneyMatchModal()" style="font-size: 0.85rem;">
            <i class="fas fa-plus-circle"></i> Record First Match Result
          </button>
        </div>
      `;
    } else {
      html += `
        <div class="tournament-matches-grid">
          ${matches.map(m => {
            const isTeam1Me = m.team1.toLowerCase() === myGamerTag.toLowerCase() || m.team1.toLowerCase() === 'nonchalant jr';
            const isTeam2Me = m.team2.toLowerCase() === myGamerTag.toLowerCase() || m.team2.toLowerCase() === 'nonchalant jr';
            const isMyMatch = isTeam1Me || isTeam2Me;

            return `
              <div class="tournament-match-card">
                <div class="tournament-match-stage">
                  <span><i class="fas fa-futbol"></i> ${m.stageName}</span>
                  <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span style="font-size: 0.75rem; color: var(--text-secondary);">${m.timestamp || m.date}</span>
                    <button type="button" title="Delete match record" onclick="window.deleteTournamentMatch('${m.id}')" style="background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 0.78rem; padding: 2px;">
                      <i class="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </div>

                <div class="tournament-match-teams">
                  <div class="tournament-match-team ${m.winner === m.team1 ? 'winner' : ''}" title="${m.team1}">
                    ${m.winner === m.team1 ? '<i class="fas fa-crown" style="color: var(--gold-bright); margin-right: 4px;"></i>' : ''}
                    ${m.team1}
                  </div>
                  <div class="tournament-match-score">
                    ${m.score1} - ${m.score2}
                  </div>
                  <div class="tournament-match-team ${m.winner === m.team2 ? 'winner' : ''}" style="text-align: right;" title="${m.team2}">
                    ${m.team2}
                    ${m.winner === m.team2 ? '<i class="fas fa-crown" style="color: var(--gold-bright); margin-left: 4px;"></i>' : ''}
                  </div>
                </div>

                <div class="tournament-match-winner-tag">
                  <span><i class="fas fa-check-circle"></i> Winner: <strong style="color: var(--gold-bright);">${m.winner}</strong></span>
                  ${isMyMatch ? `
                    <span style="margin-left: auto; color: var(--win-color); font-size: 0.75rem;">
                      <i class="fas fa-save"></i> In Studio Records
                    </span>
                  ` : `
                    <span style="margin-left: auto; color: var(--text-muted); font-size: 0.75rem;">
                      <i class="fas fa-users"></i> Friends Match
                    </span>
                  `}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    UI.tournamentMatchesLogContainer.innerHTML = html;
  };

  const renderTournament = () => {
    const tourney = AppState.tournament;

    if (!tourney) {
      if (UI.bracketContainer) {
        UI.bracketContainer.innerHTML = `
          <div class="empty-state-box" style="width: 100%;">
            <i class="fas fa-sitemap empty-state-icon"></i>
            <h3 class="empty-state-title">No Tournament Created Yet</h3>
            <p class="empty-state-desc">
              Create a custom knockout cup or league table with your friends! Set tournament names, add your friends, generate fixtures, and crown the winner.
            </p>
            <div style="display: flex; gap: 0.8rem; justify-content: center; flex-wrap: wrap;">
              <button class="btn-gold" onclick="document.getElementById('modal-create-tournament').classList.add('active')">
                <i class="fas fa-plus-circle"></i> Create Tournament with Friends
              </button>
              <button class="btn-secondary" onclick="window.openTournamentInvite()">
                <i class="fas fa-share-alt"></i> Invite Friends via Link
              </button>
            </div>
          </div>
        `;
      }
      if (UI.leagueStandingsTbody) {
        UI.leagueStandingsTbody.innerHTML = `
          <tr>
            <td colspan="10" style="text-align: center; color: var(--text-muted); padding: 2rem;">
              Create a tournament above to generate your friends' league standings table.
            </td>
          </tr>
        `;
      }
      if (UI.tournamentMatchesLogContainer) {
        UI.tournamentMatchesLogContainer.innerHTML = `
          <div class="empty-state-box" style="padding: 2rem;">
            <i class="fas fa-clipboard-list empty-state-icon"></i>
            <h4 class="empty-state-title">No Tournament Matches Recorded Yet</h4>
            <p class="empty-state-desc">Create a tournament above to record fixtures and view crowned champions.</p>
          </div>
        `;
      }
      return;
    }

    tourney.matchLog = tourney.matchLog || [];
    tourney.championsHistory = tourney.championsHistory || [];

    // Standings Table
    if (UI.leagueStandingsTbody && tourney.standings) {
      const sorted = [...tourney.standings].sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
      UI.leagueStandingsTbody.innerHTML = sorted.map((row, idx) => `
        <tr>
          <td style="font-family: var(--font-mono); font-weight: 700; color: ${idx === 0 ? 'var(--gold-bright)' : '#fff'};">#${idx + 1}</td>
          <td style="font-weight: 700; color: ${row.team === 'NONCHALANT JR' ? 'var(--gold-bright)' : 'inherit'};">
            ${row.team === 'NONCHALANT JR' ? '👑 ' : ''}${row.team}
          </td>
          <td>${row.played}</td>
          <td>${row.won}</td>
          <td>${row.drawn}</td>
          <td>${row.lost}</td>
          <td>${row.gf}</td>
          <td>${row.ga}</td>
          <td style="font-family: var(--font-mono); font-weight: 700; color: ${row.gd >= 0 ? 'var(--win-color)' : 'var(--loss-color)'};">
            ${row.gd >= 0 ? `+${row.gd}` : row.gd}
          </td>
          <td style="font-family: var(--font-mono); font-size: 1.1rem; font-weight: 800; color: var(--gold-bright);">${row.pts}</td>
        </tr>
      `).join('');
    }

    // Bracket Tree
    if (UI.bracketContainer && tourney.bracket) {
      const rounds = tourney.bracket.rounds || [];
      const gf = tourney.bracket.grandFinal;

      let roundsHtml = rounds.map((rnd, rIdx) => `
        <div class="bracket-round">
          <div class="round-header-label">${rnd.name}</div>
          ${rnd.matches.map((m, mIdx) => `
            <div class="bracket-match-node" onclick="window.enterBracketScore(${rIdx}, ${mIdx})" title="Click to enter match score">
              <div class="bracket-team-row ${m.winner === m.team1 ? 'winner' : ''}">
                <span>${m.winner === m.team1 ? '👑 ' : ''}${m.team1 || 'TBD'}</span>
                <span class="bracket-score-val">${(m.score1 !== undefined && m.score1 !== null) ? m.score1 : '-'}</span>
              </div>
              <div class="bracket-team-row ${m.winner === m.team2 ? 'winner' : ''}">
                <span>${m.winner === m.team2 ? '👑 ' : ''}${m.team2 || 'TBD'}</span>
                <span class="bracket-score-val">${(m.score2 !== undefined && m.score2 !== null) ? m.score2 : '-'}</span>
              </div>
            </div>
          `).join('')}
        </div>
      `).join('');

      // Append Grand Final box
      roundsHtml += `
        <div class="bracket-round">
          <div class="round-header-label" style="background: var(--gold-gradient); color: #070709;">👑 GRAND FINAL</div>
          <div class="bracket-match-node" style="border: 2px solid var(--gold-bright); box-shadow: 0 0 25px rgba(255, 215, 0, 0.4);" onclick="window.enterGrandFinalScore()" title="Click to enter Grand Final score and crown Champion">
            <div class="bracket-team-row ${gf.winner === gf.team1 ? 'winner' : ''}">
              <span style="font-weight: 800;">${gf.winner === gf.team1 ? '👑 ' : ''}${gf.team1 || 'Finalist 1'}</span>
              <span class="bracket-score-val">${(gf.score1 !== undefined && gf.score1 !== null) ? gf.score1 : '-'}</span>
            </div>
            <div class="bracket-team-row ${gf.winner === gf.team2 ? 'winner' : ''}">
              <span style="font-weight: 800;">${gf.winner === gf.team2 ? '👑 ' : ''}${gf.team2 || 'Finalist 2'}</span>
              <span class="bracket-score-val">${(gf.score2 !== undefined && gf.score2 !== null) ? gf.score2 : '-'}</span>
            </div>
          </div>
          <div style="text-align: center; margin-top: 1rem;">
            <div style="font-size: 2.2rem; filter: drop-shadow(0 0 10px gold);">🏆</div>
            <div style="font-family: var(--font-title); font-size: 1.1rem; color: var(--gold-bright); font-weight: 800;">
              ${gf.winner ? `CHAMPION: ${gf.winner}` : 'AWAITING FINAL RESULT'}
            </div>
          </div>
        </div>
      `;

      UI.bracketContainer.innerHTML = roundsHtml;
    }

    // Render tournament matches log & champions banner
    renderTournamentMatchesLog(tourney);
  };

  // Interactive Match Score Recording in Bracket
  let activeTourneyMatchContext = null;

  window.enterBracketScore = (roundIdx, matchIdx) => {
    const tourney = AppState.tournament;
    if (!tourney || !tourney.bracket) return;
    const match = tourney.bracket.rounds[roundIdx].matches[matchIdx];
    const roundName = tourney.bracket.rounds[roundIdx].name;

    activeTourneyMatchContext = {
      isBracket: true,
      roundIdx,
      matchIdx,
      roundName,
      matchKey: `R${roundIdx}_M${matchIdx}`,
      isGrandFinal: false
    };

    window.openRecordTourneyMatchModal(match.team1, match.team2, roundName, match.score1, match.score2);
  };

  window.enterGrandFinalScore = () => {
    const tourney = AppState.tournament;
    if (!tourney || !tourney.bracket) return;
    const gf = tourney.bracket.grandFinal;
    if (!gf.team1 || !gf.team2) {
      alert('Grand Finalists have not been decided yet. Play the semi-final rounds first!');
      return;
    }

    activeTourneyMatchContext = {
      isBracket: true,
      roundName: 'Grand Final',
      matchKey: 'GF',
      isGrandFinal: true
    };

    window.openRecordTourneyMatchModal(gf.team1, gf.team2, 'Grand Final', gf.score1, gf.score2);
  };

  // Delete a match record from tournament history
  window.deleteTournamentMatch = (matchId) => {
    const tourney = AppState.tournament;
    if (!tourney || !tourney.matchLog) return;

    if (!confirm('Are you sure you want to delete this tournament match record?')) return;

    const delIdx = tourney.matchLog.findIndex(m => m.id === matchId);
    if (delIdx >= 0) {
      const deletedMatch = tourney.matchLog[delIdx];
      tourney.matchLog.splice(delIdx, 1);

      // Recalculate standings
      recalculateTournamentStandings(tourney);

      // Remove synced match from AppState.matches if exists
      const recId = `tourney_rec_${tourney.id}_${deletedMatch.matchKey}`;
      AppState.matches = AppState.matches.filter(m => m.id !== recId);
      StorageEngine.saveData('matches', AppState.matches, AppState.currentUser.id);
      renderMatchRecordings();
      renderHeroStats();
      renderStatistics();

      StorageEngine.saveData('tournament', tourney, AppState.currentUser.id);
      renderTournament();
      showToast('Tournament match removed and standings updated.');
    }
  };

  // Open modal to record tournament match
  window.openRecordTourneyMatchModal = (prefillTeam1 = null, prefillTeam2 = null, prefillStage = null, prefillScore1 = null, prefillScore2 = null) => {
    // Guard against Click/Pointer event object being passed when triggered by button click
    if (typeof prefillTeam1 !== 'string') prefillTeam1 = null;
    if (typeof prefillTeam2 !== 'string') prefillTeam2 = null;
    if (typeof prefillStage !== 'string') prefillStage = null;
    if (typeof prefillScore1 !== 'number') prefillScore1 = null;
    if (typeof prefillScore2 !== 'number') prefillScore2 = null;

    let tourney = AppState.tournament;
    if (!tourney) {
      const myTag = AppState.currentUser ? (AppState.currentUser.gamerTag || 'NONCHALANT JR') : 'NONCHALANT JR';
      const wantsCreate = confirm(`No active tournament found yet.\n\nWould you like to open the Tournament Creator to build brackets with friends?\n\n(Click 'Cancel' to create an instant Quick Challenge Tournament right now!)`);
      if (wantsCreate) {
        if (UI.modalCreateTournament) UI.modalCreateTournament.classList.add('active');
        return;
      } else {
        // Automatically initialize an active tournament so the user can record immediately
        AppState.tournament = {
          id: 'tourney_' + Date.now(),
          name: `${myTag} Championship Cup`,
          format: 'knockout',
          status: 'In Progress',
          champion: null,
          matchLog: [],
          championsHistory: [],
          participants: [
            { id: 'p0', name: myTag, team: myTag },
            { id: 'p1', name: 'Friend 1', team: 'Friend 1' },
            { id: 'p2', name: 'Friend 2', team: 'Friend 2' },
            { id: 'p3', name: 'Friend 3', team: 'Friend 3' }
          ],
          bracket: {
            rounds: [
              {
                name: 'Quarter-Finals',
                matches: [
                  { team1: myTag, score1: undefined, team2: 'Friend 1', score2: undefined, winner: null },
                  { team1: 'Friend 2', score1: undefined, team2: 'Friend 3', score2: undefined, winner: null }
                ]
              },
              {
                name: 'Semi-Finals',
                matches: [
                  { team1: 'Winner QF 1', score1: undefined, team2: 'Winner QF 2', score2: undefined, winner: null }
                ]
              }
            ],
            grandFinal: { team1: null, score1: undefined, team2: null, score2: undefined, winner: null, completed: false }
          },
          standings: [
            { rank: 1, team: myTag, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
            { rank: 2, team: 'Friend 1', played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
            { rank: 3, team: 'Friend 2', played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
            { rank: 4, team: 'Friend 3', played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 }
          ]
        };
        StorageEngine.saveData('tournament', AppState.tournament, AppState.currentUser ? AppState.currentUser.id : 'default');
        syncTournamentWithServer();
        renderTournament();
        tourney = AppState.tournament;
        showToast('🏆 Tournament initialized! Recording match now.');
      }
    }

    if (!prefillTeam1 && !prefillTeam2) {
      activeTourneyMatchContext = null;
    }

    let participants = (tourney.participants && tourney.participants.length > 0)
      ? tourney.participants.map(p => p.name)
      : (tourney.standings ? tourney.standings.map(s => s.team) : ['NONCHALANT JR', 'Friend 1']);

    if (prefillTeam1 && !participants.includes(prefillTeam1)) {
      participants = [prefillTeam1, ...participants];
    }
    if (prefillTeam2 && !participants.includes(prefillTeam2)) {
      participants = [...participants, prefillTeam2];
    }

    // Ensure at least 2 distinct participants exist
    if (participants.length < 2) {
      participants.push('Challenger');
    }

    if (UI.tourneyMatchTeam1Select) {
      UI.tourneyMatchTeam1Select.innerHTML = participants.map(p => `
        <option value="${p}" ${p === prefillTeam1 ? 'selected' : ''}>${p}</option>
      `).join('');
    }

    if (UI.tourneyMatchTeam2Select) {
      const defaultTeam2 = prefillTeam2 || (participants.length > 1 ? participants[1] : participants[0]);
      UI.tourneyMatchTeam2Select.innerHTML = participants.map((p, idx) => `
        <option value="${p}" ${p === defaultTeam2 ? 'selected' : ''}>${p}</option>
      `).join('');
    }

    if (UI.tourneyMatchStageSelect && prefillStage) {
      UI.tourneyMatchStageSelect.value = prefillStage;
    }

    if (UI.tourneyMatchScore1Input) {
      UI.tourneyMatchScore1Input.value = (prefillScore1 !== null && prefillScore1 !== undefined) ? prefillScore1 : 0;
    }
    if (UI.tourneyMatchScore2Input) {
      UI.tourneyMatchScore2Input.value = (prefillScore2 !== null && prefillScore2 !== undefined) ? prefillScore2 : 0;
    }

    if (UI.tourneyMatchDateInput) {
      UI.tourneyMatchDateInput.value = new Date().toISOString().slice(0, 10);
    }

    if (UI.modalRecordTourneyMatch) {
      UI.modalRecordTourneyMatch.classList.add('active');
    }
  };

  // Crown Champion and Save to Trophy Room (Button)
  if (UI.btnCrownChampion) {
    UI.btnCrownChampion.addEventListener('click', () => {
      const tourney = AppState.tournament;
      if (!tourney) {
        alert('No active tournament found. Please create one with your friends first!');
        return;
      }

      const gf = tourney.bracket ? tourney.bracket.grandFinal : null;
      const defaultWinner = (gf && gf.winner) ? gf.winner : 'NONCHALANT JR';
      const promptWinner = prompt(`Crown Champion for "${tourney.name}". Enter winner's gamer tag:`, defaultWinner);
      if (!promptWinner) return;

      const winnerName = promptWinner.trim();
      const runnerUp = (gf && gf.team1 === winnerName) ? gf.team2 : (gf ? gf.team1 : 'Finalist Friend');
      const scoreline = (gf && gf.score1 !== undefined) ? `${gf.score1} - ${gf.score2}` : '3 - 1';

      if (gf) {
        gf.winner = winnerName;
        gf.completed = true;
      }

      crownTournamentChampion(tourney, winnerName, runnerUp, scoreline);
      showToast(`🏆 "${winnerName}" crowned champion of "${tourney.name}" and saved to Trophy Room!`);
    });
  }

  // --- SERVER TOURNAMENT SYNC ENGINE ---
  const syncTournamentWithServer = async () => {
    try {
      if (AppState.tournament) {
        await fetch('/api/tournament', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(AppState.tournament)
        });
      }
    } catch (e) {}
  };

  const fetchServerTournament = async () => {
    try {
      const res = await fetch('/api/tournament');
      if (res.ok) {
        const data = await res.json();
        if (data && data.name && data.participants && Array.isArray(data.participants) && data.participants.length > 0) {
          if (!AppState.tournament) {
            AppState.tournament = data;
            StorageEngine.saveData('tournament', AppState.tournament, AppState.currentUser ? AppState.currentUser.id : 'default');
            renderTournament();
          } else {
            const localNames = (AppState.tournament.participants || []).map(p => p.name).sort().join(',');
            const serverNames = (data.participants || []).map(p => p.name).sort().join(',');
            const localMatchesCount = (AppState.tournament.matchLog || []).length;
            const serverMatchesCount = (data.matchLog || []).length;

            if (localNames !== serverNames || localMatchesCount !== serverMatchesCount) {
              AppState.tournament = data;
              StorageEngine.saveData('tournament', AppState.tournament, AppState.currentUser ? AppState.currentUser.id : 'default');
              renderTournament();
              showToast(`👥 Tournament updated! Participant roster / scores synced.`);
            }
          }
        }
      }
    } catch (e) {}
  };

  // --- TOURNAMENT FRIENDS PARTICIPANT BUILDER ---
  const renderFriendPills = () => {
    if (!UI.friendsListWrap) return;
    UI.friendsListWrap.innerHTML = AppState.tournamentFriends.map((f, idx) => `
      <span class="friend-pill">
        <i class="fas fa-user"></i> ${f}
        ${idx > 0 ? `<button type="button" class="btn-remove-friend" onclick="window.removeFriendPill(${idx})">&times;</button>` : ''}
      </span>
    `).join('');
  };

  window.removeFriendPill = (idx) => {
    AppState.tournamentFriends.splice(idx, 1);
    renderFriendPills();
  };

  if (UI.btnAddFriendPill && UI.inputFriendName) {
    UI.btnAddFriendPill.addEventListener('click', () => {
      const name = UI.inputFriendName.value.trim();
      if (!name) return;
      if (!AppState.tournamentFriends.includes(name)) {
        AppState.tournamentFriends.push(name);
        renderFriendPills();
        UI.inputFriendName.value = '';
      }
    });
    UI.inputFriendName.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        UI.btnAddFriendPill.click();
      }
    });
  }

  // --- TOURNAMENT INVITE & SHARING HELPERS ---
  const openTournamentInviteModal = async () => {
    const tourney = AppState.tournament;
    const tourneyName = tourney ? tourney.name : (AppState.tournamentFriends.length > 1 ? 'NONCHALANT JR Weekend Cup' : 'NONCHALANT JR Championship');
    const host = AppState.currentUser ? (AppState.currentUser.gamerTag || 'NONCHALANT JR') : 'NONCHALANT JR';

    let publicUrl = '';
    let localWifi = '';
    try {
      const res = await fetch('/api/public-url');
      if (res.ok) {
        const data = await res.json();
        publicUrl = (data && data.url) ? data.url.trim() : '';
        localWifi = (data && data.localWifi) ? data.localWifi.trim() : '';
      }
    } catch (e) {}

    const origin = window.location.origin;
    const pathname = window.location.pathname;

    let baseHost = origin;
    if (publicUrl && publicUrl.startsWith('https://')) {
      baseHost = publicUrl.replace(/\/+$/, '');
    } else if (localWifi && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      baseHost = localWifi.replace(/\/+$/, '');
    }

    const inviteUrl = `${baseHost}${pathname}?invite=tournament&name=${encodeURIComponent(tourneyName)}&host=${encodeURIComponent(host)}`;

    if (UI.inviteTourneyNameDisplay) UI.inviteTourneyNameDisplay.textContent = tourneyName;
    if (UI.inviteTourneyHostDisplay) UI.inviteTourneyHostDisplay.textContent = host;
    if (UI.tournamentInviteUrl) UI.tournamentInviteUrl.value = inviteUrl;

    if (UI.inviteQrImage) {
      UI.inviteQrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(inviteUrl)}`;
    }

    if (UI.btnShareWhatsapp) {
      const waText = `⚔️ eFOOTBALL TOURNAMENT CHALLENGE ⚔️\n\n` +
        `Host: 👑 ${host}\n` +
        `Tournament: 🏆 ${tourneyName}\n\n` +
        `👉 Tap this link to enter your Gamer Tag and join the bracket:\n${inviteUrl}\n\n` +
        `See you on the pitch! ⚽🔥`;
      UI.btnShareWhatsapp.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(waText)}`;
    }

    if (UI.modalInviteTournament) {
      UI.modalInviteTournament.classList.add('active');
    }
  };
  window.openTournamentInvite = openTournamentInviteModal;

  const copyInviteLink = async () => {
    if (!UI.tournamentInviteUrl) return;
    const link = UI.tournamentInviteUrl.value;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(link);
      } else {
        UI.tournamentInviteUrl.select();
        document.execCommand('copy');
      }
      showToast('📋 Tournament invite link copied to clipboard!');
    } catch (err) {
      UI.tournamentInviteUrl.select();
      document.execCommand('copy');
      showToast('📋 Tournament invite link copied!');
    }
  };

  const copyDiscordMessage = async () => {
    const tourneyName = AppState.tournament ? AppState.tournament.name : 'NONCHALANT JR Championship';
    const host = AppState.currentUser ? (AppState.currentUser.gamerTag || 'NONCHALANT JR') : 'NONCHALANT JR';
    const link = UI.tournamentInviteUrl ? UI.tournamentInviteUrl.value : window.location.href;

    const msg = `⚔️ eFOOTBALL TOURNAMENT CHALLENGE ⚔️\n` +
      `Host: 👑 ${host}\n` +
      `Tournament: 🏆 ${tourneyName}\n` +
      `Format: Single Elimination Knockout / Standings\n\n` +
      `👉 Join the bracket & claim your spot:\n${link}\n\n` +
      `See you on the pitch! ⚽🔥`;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(msg);
      } else {
        const ta = document.createElement('textarea');
        ta.value = msg;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }
      showToast('🎮 Challenge message copied! Paste in Discord or chat.');
    } catch (e) {
      showToast('Copied challenge message!');
    }
  };

  const triggerNativeShare = async () => {
    const tourneyName = AppState.tournament ? AppState.tournament.name : 'NONCHALANT JR Championship';
    const host = AppState.currentUser ? (AppState.currentUser.gamerTag || 'NONCHALANT JR') : 'NONCHALANT JR';
    const link = UI.tournamentInviteUrl ? UI.tournamentInviteUrl.value : window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `eFootball Tournament: ${tourneyName}`,
          text: `You've been challenged by ${host} to join the tournament!`,
          url: link
        });
      } catch (err) {}
    } else {
      copyInviteLink();
    }
  };

  const addFriendToActiveTournament = (friendName) => {
    const tourney = AppState.tournament;
    if (!tourney) return;

    if (!tourney.participants.some(p => p.name.toLowerCase() === friendName.toLowerCase())) {
      tourney.participants.push({
        id: 'p_' + Date.now(),
        name: friendName,
        team: friendName
      });
    }

    if (!tourney.standings.some(s => s.team.toLowerCase() === friendName.toLowerCase())) {
      tourney.standings.push({
        rank: tourney.standings.length + 1,
        team: friendName,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        gf: 0,
        ga: 0,
        gd: 0,
        pts: 0
      });
    }

    if (tourney.bracket && tourney.bracket.rounds && tourney.bracket.rounds[0]) {
      const qfMatches = tourney.bracket.rounds[0].matches;
      for (const m of qfMatches) {
        if (!m.team1 || m.team1.startsWith('Friend ') || m.team1 === 'BYE') {
          m.team1 = friendName;
          break;
        } else if (!m.team2 || m.team2.startsWith('Friend ') || m.team2 === 'BYE') {
          m.team2 = friendName;
          break;
        }
      }
    }

    StorageEngine.saveData('tournament', tourney, AppState.currentUser.id);
  };

  const checkIncomingInvite = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('invite') === 'tournament' || urlParams.has('joinTournament')) {
        const tourneyName = urlParams.get('name') || (AppState.tournament ? AppState.tournament.name : 'NONCHALANT JR Championship');
        const host = urlParams.get('host') || 'NONCHALANT JR';
        const directFriend = urlParams.get('friend') || urlParams.get('tag') || '';

        const navTourney = document.getElementById('nav-tournaments');
        if (navTourney) navTourney.click();

        // If friend name is pre-set in link, enter them straight automatically!
        if (directFriend) {
          try {
            await fetch(`/api/join?gamerTag=${encodeURIComponent(directFriend)}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ gamerTag: directFriend })
            });
          } catch (e) {}

          if (!AppState.tournamentFriends.includes(directFriend)) {
            AppState.tournamentFriends.push(directFriend);
          }
          if (AppState.tournament) {
            addFriendToActiveTournament(directFriend);
          }
          renderTournament();
          showToast(`🏆 Welcome ${directFriend}! You are entered straight into the tournament bracket!`);
          return;
        }

        if (UI.joinTourneyName) UI.joinTourneyName.textContent = tourneyName;
        if (UI.joinTourneyInviter) {
          UI.joinTourneyInviter.innerHTML = `You've been challenged by <strong style="color: var(--gold-bright);">${host}</strong> to compete on the pitch!`;
        }
        if (UI.modalJoinTournament) {
          UI.modalJoinTournament.classList.add('active');
          const inputTag = document.getElementById('join-friend-gamertag');
          if (inputTag) setTimeout(() => inputTag.focus(), 300);
        }
      }
    } catch (e) {
      console.warn('Error checking invite URL:', e);
    }
  };

  // --- MODALS & FORMS ---
  const setupModals = () => {
    if (UI.btnNewRecording) {
      UI.btnNewRecording.addEventListener('click', () => {
        if (UI.modalNewMatch) UI.modalNewMatch.classList.add('active');
      });
    }

    if (UI.btnNewTrophy) {
      UI.btnNewTrophy.addEventListener('click', () => {
        if (UI.modalNewTrophy) UI.modalNewTrophy.classList.add('active');
      });
    }

    if (UI.btnCreateTournament) {
      UI.btnCreateTournament.addEventListener('click', () => {
        renderFriendPills();
        if (UI.modalCreateTournament) UI.modalCreateTournament.classList.add('active');
      });
    }

    // Tactics Modal Openers
    if (UI.btnCreateTactic) {
      UI.btnCreateTactic.addEventListener('click', () => {
        if (UI.modalCreateTactic) UI.modalCreateTactic.classList.add('active');
      });
    }

    if (UI.btnEditTactic) {
      UI.btnEditTactic.addEventListener('click', () => {
        if (!AppState.tactics || AppState.tactics.length === 0) return;
        const cur = AppState.tactics[AppState.activeTacticIndex] || AppState.tactics[0];
        const nameIn = document.getElementById('edit-tactic-name-input');
        const styleIn = document.getElementById('edit-tactic-playstyle-input');
        const descIn = document.getElementById('edit-tactic-desc-input');
        const whenIn = document.getElementById('edit-tactic-whentouse-input');
        const atk1In = document.getElementById('edit-tactic-atk1-input');
        const atk2In = document.getElementById('edit-tactic-atk2-input');
        const def1In = document.getElementById('edit-tactic-def1-input');
        const def2In = document.getElementById('edit-tactic-def2-input');

        if (nameIn) nameIn.value = cur.name || '';
        if (styleIn) styleIn.value = cur.playstyle || 'Quick Counter';
        if (descIn) descIn.value = cur.description || '';
        if (whenIn) whenIn.value = cur.whenToUse || '';
        if (atk1In) atk1In.value = cur.instructions ? (cur.instructions.attacking1 || 'None') : 'None';
        if (atk2In) atk2In.value = cur.instructions ? (cur.instructions.attacking2 || 'None') : 'None';
        if (def1In) def1In.value = cur.instructions ? (cur.instructions.defensive1 || 'None') : 'None';
        if (def2In) def2In.value = cur.instructions ? (cur.instructions.defensive2 || 'None') : 'None';

        if (UI.modalEditTactic) UI.modalEditTactic.classList.add('active');
      });
    }

    if (UI.btnDeleteTactic) {
      UI.btnDeleteTactic.addEventListener('click', () => {
        if (!AppState.tactics || AppState.tactics.length === 0) return;
        const cur = AppState.tactics[AppState.activeTacticIndex] || AppState.tactics[0];
        if (confirm(`Are you sure you want to delete game plan "${cur.name}"?`)) {
          AppState.tactics.splice(AppState.activeTacticIndex, 1);
          AppState.activeTacticIndex = 0;
          StorageEngine.saveData('tactics', AppState.tactics, AppState.currentUser.id);
          renderTactics();
          showToast('Game plan removed.');
        }
      });
    }

    // Tournament Invite Button & Handlers
    if (UI.btnInviteTournament) {
      UI.btnInviteTournament.addEventListener('click', openTournamentInviteModal);
    }

    if (UI.btnCopyInviteLink) {
      UI.btnCopyInviteLink.addEventListener('click', copyInviteLink);
    }

    if (UI.btnShareDiscord) {
      UI.btnShareDiscord.addEventListener('click', copyDiscordMessage);
    }

    if (UI.btnShareNative) {
      UI.btnShareNative.addEventListener('click', triggerNativeShare);
    }

    if (UI.btnRecordTourneyMatch) {
      UI.btnRecordTourneyMatch.addEventListener('click', window.openRecordTourneyMatchModal);
    }

    if (UI.btnInviteAddFriend && UI.inviteFriendGamertag) {
      const handleAddFriendToRoster = () => {
        const name = UI.inviteFriendGamertag.value.trim();
        if (!name) return;
        if (!AppState.tournamentFriends.includes(name)) {
          AppState.tournamentFriends.push(name);
        }
        if (AppState.tournament) {
          addFriendToActiveTournament(name);
          syncTournamentWithServer();
        }
        UI.inviteFriendGamertag.value = '';
        renderFriendPills();
        renderTournament();
        showToast(`👤 "${name}" added to tournament roster!`);
      };

      UI.btnInviteAddFriend.addEventListener('click', handleAddFriendToRoster);
      UI.inviteFriendGamertag.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleAddFriendToRoster();
        }
      });
    }

    if (UI.btnEditCoach) {
      UI.btnEditCoach.addEventListener('click', () => {
        const squad = AppState.squads[0];
        if (squad) {
          const cName = document.getElementById('coach-name-input');
          const cStyle = document.getElementById('coach-playstyle-input');
          const cBoost = document.getElementById('coach-boost-input');
          const rCap = document.getElementById('role-captain-input');
          const rPen = document.getElementById('role-penalty-input');
          const rSfk = document.getElementById('role-shortfk-input');
          const rLfk = document.getElementById('role-longfk-input');

          if (cName) cName.value = squad.manager.name === 'No Coach Set' ? '' : squad.manager.name;
          if (cStyle) cStyle.value = squad.manager.playstyle.includes('Quick') ? 'Quick Counter' : 'Possession Game';
          if (cBoost) cBoost.value = squad.manager.boost === 'No Boost' ? '' : squad.manager.boost;
          if (rCap) rCap.value = squad.roles.captain === 'Not Assigned' ? '' : squad.roles.captain;
          if (rPen) rPen.value = squad.roles.penalty === 'Not Assigned' ? '' : squad.roles.penalty;
          if (rSfk) rSfk.value = squad.roles.shortFK === 'Not Assigned' ? '' : squad.roles.shortFK;
          if (rLfk) rLfk.value = squad.roles.longFK === 'Not Assigned' ? '' : squad.roles.longFK;
        }
        if (UI.modalEditCoach) UI.modalEditCoach.classList.add('active');
      });
    }

    if (UI.btnAddPlayer) {
      UI.btnAddPlayer.addEventListener('click', () => {
        if (UI.modalAddPlayer) UI.modalAddPlayer.classList.add('active');
      });
    }

    const avatarBadge = document.getElementById('user-avatar-badge');
    if (avatarBadge) {
      avatarBadge.addEventListener('click', () => {
        const u = AppState.currentUser;
        if (u) {
          const tagInput = document.getElementById('account-gamertag-input');
          const divInput = document.getElementById('account-division-input');
          if (tagInput) tagInput.value = u.gamerTag || 'NONCHALANT JR';
          if (divInput) divInput.value = u.division || 'Division 1';
        }
        if (UI.modalAccount) UI.modalAccount.classList.add('active');
      });
    }

    const btnBackups = document.getElementById('btn-backups-hub');
    if (btnBackups) {
      btnBackups.addEventListener('click', () => {
        if (UI.modalBackups) UI.modalBackups.classList.add('active');
      });
    }

    document.querySelectorAll('.btn-close-modal, .btn-modal-cancel').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
        if (UI.cinemaVideoPlayer) UI.cinemaVideoPlayer.pause();
      });
    });

    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
          if (UI.cinemaVideoPlayer) UI.cinemaVideoPlayer.pause();
        }
      });
    });
  };

  // Setup Forms
  const setupForms = () => {
    if (UI.searchRecordings) UI.searchRecordings.addEventListener('input', renderMatchRecordings);
    if (UI.filterCompetition) UI.filterCompetition.addEventListener('change', renderMatchRecordings);
    if (UI.filterResult) UI.filterResult.addEventListener('change', renderMatchRecordings);
    if (UI.filterTrophyTier) UI.filterTrophyTier.addEventListener('change', renderTrophyRoom);

    // Form: Create Game Plan & Tactics
    const createTacticForm = document.getElementById('form-create-tactic');
    if (createTacticForm) {
      createTacticForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const tName = document.getElementById('tactic-name-input').value.trim();
        const tFormation = document.getElementById('tactic-formation-input').value;
        const tStyle = document.getElementById('tactic-playstyle-input').value;
        const tDesc = document.getElementById('tactic-desc-input').value.trim();
        const tWhen = document.getElementById('tactic-whentouse-input').value.trim();
        const tAtk1 = document.getElementById('tactic-atk1-input').value;
        const tAtk2 = document.getElementById('tactic-atk2-input').value;
        const tDef1 = document.getElementById('tactic-def1-input').value;
        const tDef2 = document.getElementById('tactic-def2-input').value;

        const newTac = {
          id: 'tactic_' + Date.now(),
          name: tName,
          formation: tFormation,
          playstyle: tStyle,
          description: tDesc,
          whenToUse: tWhen,
          instructions: {
            attacking1: tAtk1,
            attacking2: tAtk2,
            defensive1: tDef1,
            defensive2: tDef2
          },
          nodes: getFormationNodes(tFormation)
        };

        AppState.tactics.push(newTac);
        AppState.activeTacticIndex = AppState.tactics.length - 1;
        StorageEngine.saveData('tactics', AppState.tactics, AppState.currentUser.id);

        if (UI.modalCreateTactic) UI.modalCreateTactic.classList.remove('active');
        createTacticForm.reset();
        renderTactics();
        showToast(`⚽ Game plan "${tName}" created! Drag players on pitch to customize positions.`);
      });
    }

    // Form: Edit Game Plan & Strategy
    const editTacticForm = document.getElementById('form-edit-tactic');
    if (editTacticForm) {
      editTacticForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!AppState.tactics || AppState.tactics.length === 0) return;
        const cur = AppState.tactics[AppState.activeTacticIndex] || AppState.tactics[0];

        cur.name = document.getElementById('edit-tactic-name-input').value.trim();
        cur.playstyle = document.getElementById('edit-tactic-playstyle-input').value;
        cur.description = document.getElementById('edit-tactic-desc-input').value.trim();
        cur.whenToUse = document.getElementById('edit-tactic-whentouse-input').value.trim();
        cur.instructions = {
          attacking1: document.getElementById('edit-tactic-atk1-input').value,
          attacking2: document.getElementById('edit-tactic-atk2-input').value,
          defensive1: document.getElementById('edit-tactic-def1-input').value,
          defensive2: document.getElementById('edit-tactic-def2-input').value
        };

        StorageEngine.saveData('tactics', AppState.tactics, AppState.currentUser.id);
        if (UI.modalEditTactic) UI.modalEditTactic.classList.remove('active');
        renderTactics();
        showToast('Tactical strategy updated!');
      });
    }

    // Form: Join Tournament via Invite Link
    const joinTourneyForm = document.getElementById('form-join-tournament');
    if (joinTourneyForm) {
      joinTourneyForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fName = document.getElementById('join-friend-gamertag').value.trim();
        if (!fName) return;

        // Sync with host server
        try {
          await fetch(`/api/join?gamerTag=${encodeURIComponent(fName)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gamerTag: fName })
          });
        } catch (err) {}

        if (!AppState.tournamentFriends.includes(fName)) {
          AppState.tournamentFriends.push(fName);
        }

        if (AppState.tournament) {
          addFriendToActiveTournament(fName);
        }

        if (UI.modalJoinTournament) UI.modalJoinTournament.classList.remove('active');
        renderTournament();
        showToast(`🎉 Welcome ${fName}! You've joined the tournament bracket!`);

        const hostName = AppState.currentUser ? (AppState.currentUser.gamerTag || 'NONCHALANT JR') : 'NONCHALANT JR';
        const confirmMsg = `Hey ${hostName}! I have accepted your tournament challenge and registered as "${fName}"! Ready when you are! ⚽🔥`;
        const waLink = `https://api.whatsapp.com/send?text=${encodeURIComponent(confirmMsg)}`;

        const confirmWa = confirm(`🎉 You are entered as "${fName}" in the tournament!\n\nWould you like to send a quick WhatsApp confirmation to ${hostName}?`);
        if (confirmWa) {
          window.open(waLink, '_blank');
        }

        try {
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (err) {}
      });
    }

    // Form: Create Tournament with Friends
    const tourneyForm = document.getElementById('form-create-tournament');
    if (tourneyForm) {
      tourneyForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const tName = document.getElementById('tournament-name-input').value.trim();
        const tFormat = document.getElementById('tournament-format-input').value;

        // Ensure at least 4 participants for bracket
        let friends = [...AppState.tournamentFriends];
        if (friends.length < 2) {
          friends.push('Friend 1', 'Friend 2', 'Friend 3');
        }

        // Pad to power of 2 (4 or 8)
        while (friends.length < 4) {
          friends.push(`Friend ${friends.length + 1}`);
        }

        // Generate QF matches
        const qf = [];
        for (let i = 0; i < friends.length && i < 8; i += 2) {
          qf.push({
            team1: friends[i],
            score1: undefined,
            team2: friends[i + 1] || 'BYE',
            score2: undefined,
            winner: null
          });
        }

        const semiMatches = [
          { team1: 'Winner QF 1', score1: undefined, team2: 'Winner QF 2', score2: undefined, winner: null }
        ];
        if (qf.length > 2) {
          semiMatches.push({ team1: 'Winner QF 3', score1: undefined, team2: 'Winner QF 4', score2: undefined, winner: null });
        }

        const newTourney = {
          id: 'tourney_' + Date.now(),
          name: tName,
          format: tFormat,
          status: 'In Progress',
          champion: null,
          matchLog: [],
          championsHistory: [],
          participants: friends.map((f, idx) => ({ id: `p${idx}`, name: f, team: f })),
          bracket: {
            rounds: [
              { name: 'Quarter-Finals', matches: qf },
              { name: 'Semi-Finals', matches: semiMatches }
            ],
            grandFinal: {
              team1: null,
              score1: undefined,
              team2: null,
              score2: undefined,
              winner: null,
              completed: false
            }
          },
          standings: friends.map((f, idx) => ({
            rank: idx + 1,
            team: f,
            played: 0,
            won: 0,
            drawn: 0,
            lost: 0,
            gf: 0,
            ga: 0,
            gd: 0,
            pts: 0
          }))
        };

        AppState.tournament = newTourney;
        StorageEngine.saveData('tournament', newTourney, AppState.currentUser.id);
        syncTournamentWithServer();

        if (UI.modalCreateTournament) UI.modalCreateTournament.classList.remove('active');
        tourneyForm.reset();

        renderTournament();
        showToast(`⚔️ Tournament "${tName}" created with your friends!`);
      });
    }

    // Form: Record Tournament Match Result
    const recordTourneyMatchForm = document.getElementById('form-record-tourney-match');
    if (recordTourneyMatchForm) {
      recordTourneyMatchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const tourney = AppState.tournament;
        if (!tourney) return;

        const stage = UI.tourneyMatchStageSelect ? UI.tourneyMatchStageSelect.value : 'Group Stage';
        const team1 = UI.tourneyMatchTeam1Select ? UI.tourneyMatchTeam1Select.value : '';
        const team2 = UI.tourneyMatchTeam2Select ? UI.tourneyMatchTeam2Select.value : '';
        const s1 = parseInt(UI.tourneyMatchScore1Input ? UI.tourneyMatchScore1Input.value : 0, 10);
        const s2 = parseInt(UI.tourneyMatchScore2Input ? UI.tourneyMatchScore2Input.value : 0, 10);
        const mDate = UI.tourneyMatchDateInput ? UI.tourneyMatchDateInput.value : '';

        if (!team1 || !team2) {
          alert('Please select both teams.');
          return;
        }

        if (team1 === team2) {
          alert('Please select two different participants.');
          return;
        }

        const winner = s1 > s2 ? team1 : (s2 > s1 ? team2 : (stage === 'Grand Final' ? team1 : 'Draw'));

        if (activeTourneyMatchContext && activeTourneyMatchContext.isBracket) {
          if (activeTourneyMatchContext.isGrandFinal) {
            const gf = tourney.bracket.grandFinal;
            gf.score1 = s1;
            gf.score2 = s2;
            gf.winner = winner;
            gf.completed = true;

            const runnerUp = winner === team1 ? team2 : team1;
            recordTournamentMatch(tourney, 'Grand Final', 'GF', team1, s1, team2, s2, winner, mDate);
            crownTournamentChampion(tourney, winner, runnerUp, `${s1} - ${s2}`);
            syncTournamentWithServer();
            showToast(`🏆 ${winner} is crowned Champion! Result permanently recorded.`);
          } else {
            const rIdx = activeTourneyMatchContext.roundIdx;
            const mIdx = activeTourneyMatchContext.matchIdx;
            const match = tourney.bracket.rounds[rIdx].matches[mIdx];
            match.score1 = s1;
            match.score2 = s2;
            match.winner = winner;

            recordTournamentMatch(tourney, activeTourneyMatchContext.roundName, activeTourneyMatchContext.matchKey, team1, s1, team2, s2, winner, mDate);

            // Advance winner to next round or Grand Final
            if (tourney.bracket.rounds[rIdx + 1]) {
              const nextMatchIdx = Math.floor(mIdx / 2);
              const isTeam1Slot = (mIdx % 2 === 0);
              const nextMatch = tourney.bracket.rounds[rIdx + 1].matches[nextMatchIdx];
              if (isTeam1Slot) nextMatch.team1 = match.winner;
              else nextMatch.team2 = match.winner;
            } else {
              const isSlot1 = (mIdx === 0);
              if (isSlot1) tourney.bracket.grandFinal.team1 = match.winner;
              else tourney.bracket.grandFinal.team2 = match.winner;
            }

            StorageEngine.saveData('tournament', tourney, AppState.currentUser.id);
            syncTournamentWithServer();
            renderTournament();
            showToast(`Score recorded! ${winner} advances!`);
          }
        } else {
          const matchKey = `custom_${Date.now()}`;
          recordTournamentMatch(tourney, stage, matchKey, team1, s1, team2, s2, winner, mDate);

          if (stage === 'Grand Final') {
            const runnerUp = winner === team1 ? team2 : team1;
            crownTournamentChampion(tourney, winner, runnerUp, `${s1} - ${s2}`);
          } else {
            StorageEngine.saveData('tournament', tourney, AppState.currentUser.id);
          }
          syncTournamentWithServer();
          renderTournament();
          showToast(`⚽ Match recorded: ${team1} ${s1} - ${s2} ${team2}!`);
        }

        activeTourneyMatchContext = null;
        if (UI.modalRecordTourneyMatch) UI.modalRecordTourneyMatch.classList.remove('active');
        recordTourneyMatchForm.reset();
      });
    }

    // Form: Edit Coach & Roles
    const coachForm = document.getElementById('form-edit-coach');
    if (coachForm) {
      coachForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const cName = document.getElementById('coach-name-input').value.trim();
        const cStyle = document.getElementById('coach-playstyle-input').value;
        const cBoost = document.getElementById('coach-boost-input').value.trim();
        const rCap = document.getElementById('role-captain-input').value.trim();
        const rPen = document.getElementById('role-penalty-input').value.trim();
        const rSfk = document.getElementById('role-shortfk-input').value.trim();
        const rLfk = document.getElementById('role-longfk-input').value.trim();

        const squad = AppState.squads[0];
        squad.manager = {
          name: cName || 'Pep Guardiola',
          playstyle: cStyle,
          boost: cBoost || 'Standard Boost'
        };
        squad.roles = {
          captain: rCap || 'Not Assigned',
          penalty: rPen || 'Not Assigned',
          shortFK: rSfk || 'Not Assigned',
          longFK: rLfk || 'Not Assigned'
        };

        StorageEngine.saveData('squads', AppState.squads, AppState.currentUser.id);
        renderSquads();
        if (UI.modalEditCoach) UI.modalEditCoach.classList.remove('active');
        showToast('Coach and assigned roles saved!');
      });
    }

    // Form: Add Player
    const playerForm = document.getElementById('form-add-player');
    if (playerForm) {
      playerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const slot = document.getElementById('player-slot-input').value;
        const pos = document.getElementById('player-pos-input').value;
        const name = document.getElementById('player-name-input').value.trim();
        const rating = parseInt(document.getElementById('player-rating-input').value, 10);
        const tier = document.getElementById('player-tier-input').value;

        const newPlayer = { pos, name, rating, tier };
        const squad = AppState.squads[0];

        if (slot === 'startingXI') {
          if (squad.startingXI.length >= 11) {
            alert('Starting Eleven already has 11 players! Add to Substitutes or remove a player.');
            return;
          }
          squad.startingXI.push(newPlayer);
        } else {
          squad.subs.push(newPlayer);
        }

        StorageEngine.saveData('squads', AppState.squads, AppState.currentUser.id);
        renderSquads();
        if (UI.modalAddPlayer) UI.modalAddPlayer.classList.remove('active');
        playerForm.reset();
        showToast(`⚽ ${name} added to ${slot === 'startingXI' ? 'Starting XI' : 'Substitutes'}!`);
      });
    }

    // Form: New Match Record
    const matchForm = document.getElementById('form-new-match');
    if (matchForm) {
      matchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const opponent = document.getElementById('match-opponent').value.trim();
        const myScore = parseInt(document.getElementById('match-my-score').value, 10);
        const oppScore = parseInt(document.getElementById('match-opp-score').value, 10);
        const competition = document.getElementById('match-competition').value;
        const matchDate = document.getElementById('match-date').value || new Date().toISOString().slice(0, 10);
        const tagsRaw = document.getElementById('match-tags').value;
        const notes = document.getElementById('match-notes').value.trim();
        const videoUrlInput = document.getElementById('match-video-url').value.trim();
        const videoFileInput = document.getElementById('match-video-file').files[0];

        const progressWrap = document.getElementById('upload-progress-wrap');
        const progressFill = document.getElementById('upload-progress-fill');
        const progressText = document.getElementById('upload-progress-text');

        let mediaStorageId = null;
        let finalVideoUrl = videoUrlInput;

        if (videoFileInput) {
          if (progressWrap) progressWrap.style.display = 'block';
          for (let p = 15; p <= 100; p += 20) {
            if (progressFill) progressFill.style.width = `${p}%`;
            if (progressText) progressText.textContent = `Uploading: ${p}%`;
            await new Promise(r => setTimeout(r, 100));
          }
          const fileId = 'vid_' + Date.now();
          await StorageEngine.saveMedia(fileId, videoFileInput, { name: videoFileInput.name });
          mediaStorageId = fileId;
        }

        const result = myScore > oppScore ? 'W' : (myScore === oppScore ? 'D' : 'L');
        const tags = tagsRaw.split(',').map(t => t.trim()).filter(Boolean);

        const newMatch = {
          id: 'match_' + Date.now(),
          opponent,
          myScore,
          oppScore,
          result,
          competition,
          teamUsed: 'NONCHALANT JR XI',
          date: matchDate,
          tags: tags.length ? tags : ['Match Day'],
          notes,
          videoUrl: finalVideoUrl || 'assets/bg.jpg',
          mediaStorageId,
          thumbUrl: 'assets/bg.jpg'
        };

        AppState.matches.unshift(newMatch);
        StorageEngine.saveData('matches', AppState.matches, AppState.currentUser.id);

        if (UI.modalNewMatch) UI.modalNewMatch.classList.remove('active');
        matchForm.reset();
        if (progressWrap) progressWrap.style.display = 'none';

        renderMatchRecordings();
        renderHeroStats();
        renderStatistics();
        showToast('🎬 New match recording saved!');
      });
    }

    // Form: New Trophy
    const trophyForm = document.getElementById('form-new-trophy');
    if (trophyForm) {
      trophyForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('trophy-title-input').value.trim();
        const placement = document.getElementById('trophy-placement-input').value;
        const date = document.getElementById('trophy-date-input').value || new Date().toISOString().slice(0, 10);
        const finalOpponent = document.getElementById('trophy-opponent-input').value.trim();
        const finalScore = document.getElementById('trophy-score-input').value.trim();
        const notes = document.getElementById('trophy-notes-input').value.trim();

        const newTrophy = {
          id: 'trophy_' + Date.now(),
          title,
          placement,
          placementLabel: placement === 'champion' ? 'Champion / 1st Place' : (placement === 'runner_up' ? 'Runner-up / 2nd Place' : 'Achievement'),
          date,
          finalOpponent: finalOpponent || 'Grand Finalist',
          finalScore: finalScore || '1 - 0',
          trophyType: placement === 'champion' ? 'gold' : 'silver',
          iconEmoji: placement === 'champion' ? '🏆' : '🥈',
          notes
        };

        AppState.trophies.unshift(newTrophy);
        StorageEngine.saveData('trophies', AppState.trophies, AppState.currentUser.id);

        if (UI.modalNewTrophy) UI.modalNewTrophy.classList.remove('active');
        trophyForm.reset();

        renderTrophyRoom();
        renderHeroStats();
        showToast('🏆 Tournament honor added to Trophy Room!');
      });
    }

    // Backups
    const btnExport = document.getElementById('btn-export-backup');
    if (btnExport) {
      btnExport.addEventListener('click', () => {
        StorageEngine.exportBackupJSON(AppState.currentUser.id);
        showToast('Backup downloaded successfully!');
      });
    }

    const fileImport = document.getElementById('file-import-backup');
    if (fileImport) {
      fileImport.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
          await StorageEngine.importBackupJSON(file, AppState.currentUser.id);
          loadUserData();
          renderAllSections();
          if (UI.modalBackups) UI.modalBackups.classList.remove('active');
          showToast('Backup restored successfully!');
        } catch (err) {
          alert('Failed to import backup: ' + err.message);
        }
      });
    }

    // Form: Account Profile Identity
    const accountForm = document.getElementById('form-account-profile');
    if (accountForm) {
      accountForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const gamerTag = (document.getElementById('account-gamertag-input') ? document.getElementById('account-gamertag-input').value : '').trim();
        const division = (document.getElementById('account-division-input') ? document.getElementById('account-division-input').value : '').trim();
        const efootballId = (document.getElementById('account-efootball-id') ? document.getElementById('account-efootball-id').value : '').trim();
        const platform = (document.getElementById('account-platform-input') ? document.getElementById('account-platform-input').value : '').trim();

        const updated = AuthEngine.updateProfile({ gamerTag, division, efootballId, platform });
        AppState.currentUser = updated;
        renderUserProfile();
        if (UI.modalAccount) UI.modalAccount.classList.remove('active');
        showToast('Gamer profile updated successfully!');
      });
    }

    // Form: Account Security Recovery
    const recoveryForm = document.getElementById('form-recovery');
    if (recoveryForm) {
      recoveryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const uName = (document.getElementById('recovery-username') ? document.getElementById('recovery-username').value : '').trim();
        const pin = (document.getElementById('recovery-pin') ? document.getElementById('recovery-pin').value : '').trim();
        const newPass = (document.getElementById('recovery-new-pass') ? document.getElementById('recovery-new-pass').value : '');
        try {
          AuthEngine.recoverAccount(uName, pin, newPass);
          if (UI.modalRecovery) UI.modalRecovery.classList.remove('active');
          recoveryForm.reset();
          showToast('Password reset successfully! Access restored.');
        } catch (err) {
          alert(err.message);
        }
      });
    }
  };

  initApp();
});
