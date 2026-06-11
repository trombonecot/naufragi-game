import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { buildFullDeck, shuffle, type DrawnCard } from '../lib/cards';
import { downloadJSON, loadJSON, readJSONFile, removeKey, saveJSON } from '../lib/storage';

export type FieldValue = string | boolean;

/** Full serialized shape of one character sheet. Persisted verbatim to localStorage / JSON files. */
export interface SheetState {
  /** Flat key → value map for every simple input (text + checkbox). */
  fields: Record<string, FieldValue>;
  /** Card IDs still in the adventure pile. */
  deck: string[];
  /** Cards currently on the play surface. */
  drawnCards: DrawnCard[];
  /** Page-specific blobs (freehand map data URL, hex territories, …). */
  extra: Record<string, unknown>;
}

function createInitialState(): SheetState {
  return { fields: {}, deck: shuffle(buildFullDeck()), drawnCards: [], extra: {} };
}

function normalize(state: unknown): SheetState {
  const base = createInitialState();
  if (!state || typeof state !== 'object') return base;
  const obj = state as Record<string, unknown>;

  // Current nested shape.
  if ('fields' in obj) {
    const s = obj as Partial<SheetState>;
    return {
      fields: s.fields ?? base.fields,
      deck: s.deck ?? base.deck,
      drawnCards: s.drawnCards ?? base.drawnCards,
      extra: s.extra ?? base.extra,
    };
  }

  // Legacy flat shape (old vanilla-JS sheets): top-level field keys + `_`-prefixed blobs.
  const fields: Record<string, FieldValue> = {};
  const extra: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (k.startsWith('_')) {
      if (k === '_mapData') extra.mapData = v;
      else if (k === '_territoris') extra.territoris = v;
    } else if (typeof v === 'string' || typeof v === 'boolean') {
      fields[k] = v;
    }
  }
  return {
    fields,
    deck: Array.isArray(obj._deck) ? (obj._deck as string[]) : base.deck,
    drawnCards: Array.isArray(obj._drawnCards) ? (obj._drawnCards as SheetState['drawnCards']) : [],
    extra,
  };
}

export interface SheetContextValue {
  /* fields */
  getField: (key: string) => FieldValue | undefined;
  getText: (key: string) => string;
  getBool: (key: string) => boolean;
  setField: (key: string, value: FieldValue) => void;
  /* extra (page-specific state) */
  getExtra: <T>(key: string) => T | undefined;
  setExtra: (key: string, value: unknown) => void;
  /* cards */
  deck: string[];
  drawnCards: DrawnCard[];
  drawCard: (position: { x: number; y: number }) => void;
  returnCard: (id: string) => void;
  returnAllCards: () => void;
  shuffleDeck: () => void;
  updateDrawnCard: (id: string, patch: Partial<DrawnCard>) => void;
  raiseCard: (id: string) => number;
  /* persistence */
  save: () => void;
  clear: () => void;
  exportJSON: () => void;
  importJSON: (file: File) => Promise<void>;
  saveFlash: string | null;
}

const SheetContext = createContext<SheetContextValue | null>(null);

interface SheetProviderProps {
  storageKey: string;
  /** Field key whose value becomes the export filename (defaults to "nom"). */
  exportNameField?: string;
  /** Fallback filename when the name field is empty. */
  exportFallbackName: string;
  children: ReactNode;
}

const BASE_Z = 300;

export function SheetProvider({
  storageKey,
  exportNameField = 'nom',
  exportFallbackName,
  children,
}: SheetProviderProps) {
  const [state, setState] = useState<SheetState>(() => normalize(loadJSON<SheetState>(storageKey)));
  const [saveFlash, setSaveFlash] = useState<string | null>(null);
  const flashTimer = useRef<number | undefined>(undefined);
  const saveTimer = useRef<number | undefined>(undefined);
  // Skip the very first autosave so loading a sheet doesn't immediately rewrite it.
  const hydrated = useRef(false);

  const flash = useCallback((msg = 'Desat!') => {
    setSaveFlash(msg);
    window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setSaveFlash(null), 1500);
  }, []);

  // Debounced autosave whenever state changes.
  useEffect(() => {
    if (!hydrated.current) {
      hydrated.current = true;
      return;
    }
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      saveJSON(storageKey, state);
      flash();
    }, 600);
    return () => window.clearTimeout(saveTimer.current);
  }, [state, storageKey, flash]);

  /* ---- fields ---- */
  const setField = useCallback((key: string, value: FieldValue) => {
    setState((s) => ({ ...s, fields: { ...s.fields, [key]: value } }));
  }, []);
  const getField = useCallback((key: string) => state.fields[key], [state.fields]);
  const getText = useCallback((key: string) => {
    const v = state.fields[key];
    return typeof v === 'string' ? v : '';
  }, [state.fields]);
  const getBool = useCallback((key: string) => state.fields[key] === true, [state.fields]);

  /* ---- extra ---- */
  const setExtra = useCallback((key: string, value: unknown) => {
    setState((s) => ({ ...s, extra: { ...s.extra, [key]: value } }));
  }, []);
  const getExtra = useCallback(
    <T,>(key: string) => state.extra[key] as T | undefined,
    [state.extra],
  );

  /* ---- cards ---- */
  const nextZ = useCallback(
    (cards: DrawnCard[]) => cards.reduce((m, c) => Math.max(m, c.zIndex), BASE_Z) + 1,
    [],
  );

  const drawCard = useCallback(
    (position: { x: number; y: number }) => {
      setState((s) => {
        if (s.deck.length === 0) return s;
        const deck = s.deck.slice();
        const id = deck.pop()!;
        const drawnCards = [
          ...s.drawnCards,
          { id, x: position.x, y: position.y, zIndex: nextZ(s.drawnCards) },
        ];
        return { ...s, deck, drawnCards };
      });
    },
    [nextZ],
  );

  const returnCard = useCallback((id: string) => {
    setState((s) => {
      if (!s.drawnCards.some((c) => c.id === id)) return s;
      return {
        ...s,
        drawnCards: s.drawnCards.filter((c) => c.id !== id),
        deck: [...s.deck, id],
      };
    });
  }, []);

  const returnAllCards = useCallback(() => {
    setState((s) => {
      if (s.drawnCards.length === 0) return s;
      return { ...s, deck: [...s.deck, ...s.drawnCards.map((c) => c.id)], drawnCards: [] };
    });
  }, []);

  const shuffleDeck = useCallback(() => {
    setState((s) => ({ ...s, deck: shuffle(s.deck) }));
  }, []);

  const updateDrawnCard = useCallback((id: string, patch: Partial<DrawnCard>) => {
    setState((s) => ({
      ...s,
      drawnCards: s.drawnCards.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
  }, []);

  const raiseCard = useCallback(
    (id: string) => {
      const z = nextZ(state.drawnCards);
      setState((s) => ({
        ...s,
        drawnCards: s.drawnCards.map((c) => (c.id === id ? { ...c, zIndex: z } : c)),
      }));
      return z;
    },
    [nextZ, state.drawnCards],
  );

  /* ---- persistence ---- */
  const save = useCallback(() => {
    saveJSON(storageKey, state);
    flash();
  }, [state, storageKey, flash]);

  const clear = useCallback(() => {
    if (!window.confirm('Segur que vols esborrar totes les dades? Aquesta acció no es pot desfer.'))
      return;
    removeKey(storageKey);
    setState(createInitialState());
    flash('Esborrat!');
  }, [storageKey, flash]);

  const exportJSON = useCallback(() => {
    const name = getText(exportNameField) || exportFallbackName;
    downloadJSON(state, name);
    flash('Exportat!');
  }, [state, getText, exportNameField, exportFallbackName, flash]);

  const importJSON = useCallback(
    async (file: File) => {
      try {
        const parsed = await readJSONFile<Partial<SheetState>>(file);
        setState(normalize(parsed));
        flash('Carregat!');
      } catch (err) {
        window.alert('Error llegint el fitxer: ' + (err as Error).message);
      }
    },
    [flash],
  );

  const value = useMemo<SheetContextValue>(
    () => ({
      getField,
      getText,
      getBool,
      setField,
      getExtra,
      setExtra,
      deck: state.deck,
      drawnCards: state.drawnCards,
      drawCard,
      returnCard,
      returnAllCards,
      shuffleDeck,
      updateDrawnCard,
      raiseCard,
      save,
      clear,
      exportJSON,
      importJSON,
      saveFlash,
    }),
    [
      getField, getText, getBool, setField, getExtra, setExtra,
      state.deck, state.drawnCards,
      drawCard, returnCard, returnAllCards, shuffleDeck, updateDrawnCard, raiseCard,
      save, clear, exportJSON, importJSON, saveFlash,
    ],
  );

  return <SheetContext.Provider value={value}>{children}</SheetContext.Provider>;
}

export function useSheet(): SheetContextValue {
  const ctx = useContext(SheetContext);
  if (!ctx) throw new Error('useSheet must be used within a SheetProvider');
  return ctx;
}
