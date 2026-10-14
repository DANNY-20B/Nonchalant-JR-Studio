/**
 * NONCHALANT JR STUDIO — Configuration
 * Supabase project credentials and environment settings.
 * 
 * You can set your Supabase Project URL and Public Anon Key below,
 * or configure them dynamically through the studio settings modal.
 */

window.NJR_CONFIG = {
  // Replace with your Supabase Project URL (e.g., https://xyzcompany.supabase.co)
  SUPABASE_URL: window.__ENV_SUPABASE_URL || 'https://nonchalant-jr-studio.supabase.co',

  // Replace with your Supabase Public Anon Key (Project Settings -> API -> anon public key)
  SUPABASE_ANON_KEY: window.__ENV_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder',

  // Studio Details
  STUDIO_NAME: 'NONCHALANT JR STUDIO',
  DEFAULT_DIVISION: 'Division 1 (Top 100)',
  DEFAULT_GAMERTAG: 'NONCHALANT JR',
  APP_VERSION: '3.0.0-PRO'
};
