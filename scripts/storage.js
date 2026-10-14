/**
 * NONCHALANT JR STUDIO - Storage Engine
 * Handles IndexedDB for high-capacity gameplay video & media storage,
 * plus localStorage synchronization and JSON cloud backup/export.
 */

const StorageEngine = (() => {
  const DB_NAME = 'NonchalantStudioDB';
  const DB_VERSION = 1;
  const STORE_MEDIA = 'media_files';

  let dbInstance = null;

  // Initialize IndexedDB
  const initDB = () => {
    return new Promise((resolve, reject) => {
      if (dbInstance) return resolve(dbInstance);

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_MEDIA)) {
          db.createObjectStore(STORE_MEDIA, { keyPath: 'id' });
        }
      };

      request.onsuccess = (e) => {
        dbInstance = e.target.result;
        resolve(dbInstance);
      };

      request.onerror = (e) => {
        console.error('IndexedDB init error:', e);
        reject(e);
      };
    });
  };

  // Save Media (Blob / File)
  const saveMedia = async (id, fileOrBlob, metadata = {}) => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_MEDIA, 'readwrite');
      const store = tx.objectStore(STORE_MEDIA);

      const record = {
        id: id,
        name: metadata.name || 'recording.mp4',
        type: fileOrBlob.type,
        size: fileOrBlob.size,
        blob: fileOrBlob,
        uploadedAt: new Date().toISOString(),
        ...metadata
      };

      const req = store.put(record);
      req.onsuccess = () => resolve(record);
      req.onerror = (e) => reject(e);
    });
  };

  // Retrieve Media by ID (returns Object URL for video tag playback)
  const getMediaUrl = async (id) => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_MEDIA, 'readonly');
      const store = tx.objectStore(STORE_MEDIA);
      const req = store.get(id);

      req.onsuccess = () => {
        if (req.result && req.result.blob) {
          const url = URL.createObjectURL(req.result.blob);
          resolve({ url, record: req.result });
        } else {
          resolve(null);
        }
      };
      req.onerror = (e) => reject(e);
    });
  };

  // Delete Media by ID
  const deleteMedia = async (id) => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_MEDIA, 'readwrite');
      const store = tx.objectStore(STORE_MEDIA);
      const req = store.delete(id);
      req.onsuccess = () => resolve(true);
      req.onerror = (e) => reject(e);
    });
  };

  // LocalStorage Helpers with Account Scoping
  const getStorageKey = (key, userId = 'default') => `njr_studio_${userId}_${key}`;

  const loadData = (key, defaultValue = [], userId = 'default') => {
    try {
      const raw = localStorage.getItem(getStorageKey(key, userId));
      return raw ? JSON.parse(raw) : defaultValue;
    } catch (err) {
      console.error(`Error loading ${key}:`, err);
      return defaultValue;
    }
  };

  const saveData = (key, data, userId = 'default') => {
    try {
      localStorage.setItem(getStorageKey(key, userId), JSON.stringify(data));
      return true;
    } catch (err) {
      console.error(`Error saving ${key}:`, err);
      return false;
    }
  };

  // Export full studio backup as JSON file
  const exportBackupJSON = (userId = 'default') => {
    const keys = ['matches', 'trophies', 'tactics', 'squads', 'tournament', 'tournaments', 'profile'];
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      studio: 'NONCHALANT JR STUDIO',
      userId: userId,
      data: {}
    };

    keys.forEach(k => {
      backupData.data[k] = loadData(k, null, userId);
    });

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NONCHALANT_JR_STUDIO_BACKUP_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON backup
  const importBackupJSON = (file, userId = 'default') => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          if (!parsed.data) {
            throw new Error('Invalid backup file format');
          }
          Object.keys(parsed.data).forEach(k => {
            if (parsed.data[k] !== null) {
              saveData(k, parsed.data[k], userId);
            }
          });
          resolve(parsed);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsText(file);
    });
  };

  return {
    initDB,
    saveMedia,
    getMediaUrl,
    deleteMedia,
    getStorageKey,
    loadData,
    saveData,
    exportBackupJSON,
    importBackupJSON
  };
})();
