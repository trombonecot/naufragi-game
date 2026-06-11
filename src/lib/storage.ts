// localStorage helpers + JSON file export/import, shared by every sheet.

export function loadJSON<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch (e) {
    console.error('Error loading state:', e);
    return null;
  }
}

export function saveJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Error saving state:', e);
  }
}

export function removeKey(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.error('Error clearing state:', e);
  }
}

/** Trigger a download of `value` as a pretty-printed JSON file. */
export function downloadJSON(value: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.replace(/\s+/g, '_') + '.json';
  a.click();
  URL.revokeObjectURL(url);
}

/** Read a user-picked .json file and resolve its parsed contents. */
export function readJSONFile<T>(file: File): Promise<T> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        resolve(JSON.parse(String(e.target?.result)) as T);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}
