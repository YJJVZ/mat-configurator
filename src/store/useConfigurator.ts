"use client";
import { create } from "zustand";
import { DEFAULT_EDGE_COLOR, KEYBOARDS, SIZE_PRESETS } from "@/config/catalog";
import { DESIGNS } from "@/config/designs";
import { sanitize } from "@/lib/compat";
import { buildCartItem } from "@/lib/cart";
import { readSharedConfig } from "@/lib/share";
import { uid } from "@/lib/utils";
import type {
  CartItem, ConfigState, ImageTransform, PeripheralId, PlaymatState, Point, ProductType, SavedProject, SetupState, UploadedImage, ViewMode,
} from "@/types/config";

const CART_KEY = "matcfg.cart.v1";
const PROJECTS_KEY = "matcfg.projects.v1";

export const IDENTITY: ImageTransform = { x: 0, y: 0, scale: 1, rotation: 0 };

const initialSetup = (): SetupState => ({
  keyboard: "tkl",
  keyboardCustom: null,
  show: { keyboard: true, numpad: false, mouse: true, wristrest: false, monitor: true },
  pos: {},
});

const initialPlaymat = (): PlaymatState => ({
  layoutId: "blank", zonesVisible: true, zoneColor: "#ffffff", printZones: false, showCards: false, cardPos: {},
  customCols: 4, customRows: 1, text: "", printText: false, textPos: null, textColor: "#ffffff",
});

export const initialConfig = (): ConfigState => ({
  product: "deskmat",
  presetId: "xl",
  width: 90,
  depth: 40,
  thickness: 3,
  corners: "rounded",
  edge: "black",
  edgeColor: DEFAULT_EDGE_COLOR,
  rgb: false,
  wristRest: false,
  wristRestW: null,
  designSource: "preset",
  designId: DESIGNS[0].id,
  upload: null,
  imageTransform: IDENTITY,
  setup: initialSetup(),
  playmat: initialPlaymat(),
});

interface UiState {
  view: ViewMode;
  setupMode: boolean; // visualiseur (setup PC ou cartes) actif
  showPrintArea: boolean;
  /** Mode « Cadrer mon image » : l'image se déplace sur l'aperçu, zone d'impression visible. */
  framing: boolean;
  notices: string[];
  uploadError: string | null;
  cart: CartItem[];
  projects: SavedProject[];
  cartOpen: boolean;
  /** Récapitulatif affiché avant l'ajout au panier. */
  recapOpen: boolean;
  lastAddedId: string | null;
}

interface Actions {
  patch: (p: Partial<ConfigState>) => void;
  setProduct: (p: ProductType) => void;
  setPreset: (id: string) => void;
  setSize: (w: number, d: number) => void;
  patchSetup: (p: Partial<SetupState>) => void;
  toggleDevice: (id: PeripheralId, on: boolean) => void;
  setDevicePos: (id: PeripheralId, p: Point) => void;
  patchPlaymat: (p: Partial<PlaymatState>) => void;
  setCardPos: (id: string, p: Point) => void;
  setUpload: (img: UploadedImage) => void;
  setTransform: (t: Partial<ImageTransform>) => void;
  resetTransform: () => void;
  ui: (p: Partial<UiState>) => void;
  dismissNotices: () => void;
  resetPreview: () => void;
  addToCart: () => CartItem;
  removeFromCart: (id: string) => void;
  saveProject: (name: string) => boolean;
  loadProject: (id: string) => void;
  deleteProject: (id: string) => void;
  hydrate: () => void;
}

export type Store = { config: ConfigState } & UiState & Actions;

const read = <T,>(key: string, fallback: T): T => {
  try { const v = localStorage.getItem(key); return v ? (JSON.parse(v) as T) : fallback; } catch { return fallback; }
};
const write = (key: string, value: unknown): boolean => {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; }
};

export const useConfigurator = create<Store>((set, get) => {
  /** Applique un changement de config en le validant. */
  const apply = (fn: (c: ConfigState) => ConfigState) => {
    const prev = get().config;
    let { config: next, notices } = sanitize(fn(prev));
    // L'option « Repose-poignet séparé » pilote son affichage dans l'aperçu setup.
    const wristChanged = next.wristRest !== prev.wristRest;
    if (wristChanged) {
      next = { ...next, setup: { ...next.setup, show: { ...next.setup.show, wristrest: next.wristRest }, pos: { ...next.setup.pos, keyboard: undefined, wristrest: undefined } } };
    }
    set((s) => ({ config: next, notices: notices.length ? notices : s.notices, ...(wristChanged && next.wristRest ? { setupMode: true, view: "scene" as const } : {}) }));
  };

  return {
    config: initialConfig(),
    view: "scene",
    setupMode: true,
    showPrintArea: false,
    framing: false,
    notices: [],
    uploadError: null,
    cart: [],
    projects: [],
    cartOpen: false,
    recapOpen: false,
    lastAddedId: null,

    patch: (p) => apply((c) => ({ ...c, ...p })),

    setProduct: (product) =>
      apply((c) => {
        const preset = SIZE_PRESETS[product][0];
        return {
          ...c, product, presetId: preset.id, width: preset.w, depth: preset.d,
          wristRest: product === "deskmat" ? c.wristRest : false,
        };
      }),

    setPreset: (id) =>
      apply((c) => {
        const p = SIZE_PRESETS[c.product].find((s) => s.id === id);
        return p ? { ...c, presetId: id, width: p.w, depth: p.d, setup: { ...c.setup, pos: {} }, playmat: { ...c.playmat, cardPos: {}, textPos: null } } : { ...c, presetId: "custom" };
      }),

    // Les périphériques reprennent leur place sur le bureau de référence quand la taille change
    setSize: (width, depth) => apply((c) => ({ ...c, presetId: "custom", width, depth, setup: { ...c.setup, pos: {} } })),

    patchSetup: (p) => apply((c) => ({ ...c, setup: { ...c.setup, ...p } })),
    toggleDevice: (id, on) => apply((c) => ({ ...c, setup: { ...c.setup, show: { ...c.setup.show, [id]: on } } })),
    setDevicePos: (id, p) => apply((c) => ({ ...c, setup: { ...c.setup, pos: { ...c.setup.pos, [id]: p } } })),

    patchPlaymat: (p) => apply((c) => ({ ...c, playmat: { ...c.playmat, ...p } })),
    setCardPos: (id, p) => apply((c) => ({ ...c, playmat: { ...c.playmat, cardPos: { ...c.playmat.cardPos, [id]: p } } })),

    // Juste après l'import : on propose directement de cadrer l'image sur la zone d'impression.
    setUpload: (img) => {
      apply((c) => ({ ...c, upload: img, designSource: "upload", imageTransform: IDENTITY }));
      set({ framing: true, view: "product" });
    },
    setTransform: (t) => apply((c) => ({ ...c, imageTransform: { ...c.imageTransform, ...t } })),
    resetTransform: () => apply((c) => ({ ...c, imageTransform: IDENTITY })),

    ui: (p) => set(p),
    dismissNotices: () => set({ notices: [] }),

    resetPreview: () => {
      set({ view: "scene", setupMode: true, showPrintArea: false, framing: false });
      apply((c) => ({ ...c, imageTransform: IDENTITY, setup: { ...c.setup, pos: {} }, playmat: { ...c.playmat, cardPos: {}, textPos: null } }));
    },

    addToCart: () => {
      const item = buildCartItem(get().config);
      const cart = [item, ...get().cart];
      write(CART_KEY, cart);
      set({ cart, cartOpen: true, lastAddedId: item.id });
      return item;
    },
    removeFromCart: (id) => {
      const cart = get().cart.filter((i) => i.id !== id);
      write(CART_KEY, cart);
      set({ cart });
    },

    saveProject: (name) => {
      const cfg = get().config;
      const project: SavedProject = { id: uid(), name: name.trim() || "Sans titre", savedAt: new Date().toISOString(), config: cfg };
      let projects = [project, ...get().projects];
      let ok = write(PROJECTS_KEY, projects);
      if (!ok && cfg.upload) {
        // Quota dépassé : on retente sans l'image importée (le cadrage est conservé).
        project.config = { ...cfg, upload: null, designSource: "preset" };
        projects = [project, ...get().projects];
        ok = write(PROJECTS_KEY, projects);
        if (ok) set({ notices: ["Projet sauvegardé sans l'image importée (trop volumineuse pour le stockage local)."] });
      }
      if (ok) set({ projects });
      return ok;
    },
    loadProject: (id) => {
      const p = get().projects.find((p) => p.id === id);
      if (!p) return;
      const base = initialConfig();
      const { config } = sanitize({ ...base, ...p.config, setup: { ...base.setup, ...p.config.setup }, playmat: { ...base.playmat, ...p.config.playmat, text: "", printText: false } });
      set({ config, view: "scene", setupMode: true });
    },
    deleteProject: (id) => {
      const projects = get().projects.filter((p) => p.id !== id);
      write(PROJECTS_KEY, projects);
      set({ projects });
    },
    hydrate: () => {
      set({ cart: read<CartItem[]>(CART_KEY, []), projects: read<SavedProject[]>(PROJECTS_KEY, []) });
      // Lien de partage (#c=…) : on charge la configuration reçue.
      const shared = readSharedConfig();
      if (shared) {
        const base = initialConfig();
        const { config } = sanitize({ ...base, ...shared, upload: null, setup: { ...base.setup, ...shared.setup }, playmat: { ...base.playmat, ...shared.playmat, text: "", printText: false } });
        set({ config, view: "scene" });
      }
    },
  };
});

export { KEYBOARDS };
