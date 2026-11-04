export type ProductType = "deskmat" | "playmat";
export type EdgeId = "black" | "white" | "custom" | "none";
export type Corners = "square" | "rounded";
export type Thickness = 3 | 4 | 5;
export type KeyboardId = "100" | "96" | "tkl" | "75" | "65" | "60" | "40";
export type PeripheralId = "keyboard" | "numpad" | "mouse" | "wristrest" | "monitor";
export type ViewMode = "product" | "scene";

export interface Point { x: number; y: number }
export interface Size { w: number; h: number }

/** Transformations de l'image importée. x/y en cm depuis le centre du tapis. */
export interface ImageTransform { x: number; y: number; scale: number; rotation: number }

export interface UploadedImage {
  dataUrl: string;
  name: string;
  width: number;
  height: number;
  sizeBytes: number;
}

export interface SetupState {
  keyboard: KeyboardId;
  /** Dimensions exactes saisies par le client (cm), sinon valeurs du catalogue. */
  keyboardCustom: Size | null;
  show: Record<PeripheralId, boolean>;
  /** Position haut-gauche en cm dans le repère du tapis. Absent = position par défaut. */
  pos: Partial<Record<PeripheralId, Point>>;
}

export interface PlaymatState {
  layoutId: string;
  zonesVisible: boolean;
  zoneColor: string;
  /** true : les zones font partie du fichier imprimé. false : simple aide visuelle. */
  printZones: boolean;
  showCards: boolean;
  cardPos: Record<string, Point>;
  customCols: number;
  customRows: number;
  text: string;
  /** true : le texte est imprimé sur le tapis. */
  printText: boolean;
  textPos: Point | null;
  textColor: string;
}

export interface ConfigState {
  product: ProductType;
  presetId: string; // id de preset ou "custom"
  width: number;
  depth: number;
  thickness: Thickness;
  corners: Corners;
  edge: EdgeId;
  edgeColor: string;
  rgb: boolean;
  wristRest: boolean;
  /** Largeur choisie du repose-poignet (cm) ; null = suit le clavier du setup. */
  wristRestW: number | null;
  designSource: "preset" | "upload";
  designId: string;
  upload: UploadedImage | null;
  imageTransform: ImageTransform;
  setup: SetupState;
  playmat: PlaymatState;
}

export interface CartItem {
  id: string;
  schemaVersion: 1;
  createdAt: string;
  product: ProductType;
  dimensions: { widthCm: number; depthCm: number; thicknessMm: Thickness };
  design: {
    source: "preset" | "upload";
    presetId: string | null;
    upload: null | { fileName: string; pixelWidth: number; pixelHeight: number; effectiveDpi: number | null; transform: ImageTransform };
  };
  finishes: { edge: EdgeId; edgeColor: string | null; corners: Corners };
  options: { rgb: boolean; wristRest: boolean; wristRestWidthCm: number | null };
  price: { currency: string; total: number; lines: { id: string; label: string; amount: number }[] };
  playmat: null | {
    layoutId: string;
    printedZones: boolean;
    zoneColor: string;
    zones: { id: string; label: string; xCm: number; yCm: number; wCm: number; hCm: number }[];
    printedText: { value: string; xCm: number; yCm: number; color: string } | null;
  };
  /** Réservé au futur fichier de production : volontairement non renseigné. */
  production: { status: "not_generated"; bleedMm: null; colorProfile: null; resolutionDpi: null };
}

export interface SavedProject { id: string; name: string; savedAt: string; config: ConfigState }
