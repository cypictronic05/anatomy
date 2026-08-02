export const organIds = [
  "heart",
  "brain",
  "lungs",
  "liver",
  "kidneys",
  "eyeball",
  "intestine",
  "pancreas",
  "skin",
] as const;

export type OrganId = (typeof organIds)[number];

export type HotspotBase = {
  id: string;
  position: [number, number, number];
  color: string;
};

export type Hotspot = HotspotBase & {
  label: string;
  detail: string;
};

export type OrganBase = {
  id: OrganId;
  scientificName: string;
  model: string;
  icon: string;
  accent: string;
  illustrated: boolean;
  hotspots: HotspotBase[];
};

export type Organ = OrganBase & {
  name: string;
  system: string;
  description: string;
  poetic: string;
  size: string;
  weight: string;
  location: string;
  function: string;
  dailyFact: string;
  medical: string;
  bloodSupply: string;
  funFact: string;
  tissue: string;
  comparison: string;
  conditions: string[];
  hotspots: Hotspot[];
};

export const organBases: OrganBase[] = [
  {
    id: "heart",
    scientificName: "Cor",
    model: "/models/heart.glb",
    icon: "♥",
    accent: "#ee7c6a",
    illustrated: true,
    hotspots: [
      { id: "aorta", position: [-0.35, 1.65, 0.55], color: "#ee7c6a" },
      { id: "leftAtrium", position: [0.82, 0.65, 0.5], color: "#f2a33b" },
      { id: "rightAtrium", position: [-0.9, 0.35, 0.55], color: "#6393d8" },
      { id: "leftVentricle", position: [0.7, -0.75, 0.65], color: "#f2a33b" },
      { id: "rightVentricle", position: [-0.65, -0.68, 0.66], color: "#ee7c6a" },
      { id: "mitral", position: [0.18, -1.35, 0.48], color: "#d89bc4" },
    ],
  },
  {
    id: "brain",
    scientificName: "Encephalon",
    model: "/models/brain.glb",
    icon: "◉",
    accent: "#c58696",
    illustrated: true,
    hotspots: [
      { id: "frontal", position: [-0.7, 0.65, 0.8], color: "#ee7c6a" },
      { id: "parietal", position: [0.15, 1.1, 0.65], color: "#f2a33b" },
      { id: "temporal", position: [0.75, -0.1, 0.82], color: "#6393d8" },
      { id: "cerebellum", position: [0.72, -0.9, 0.55], color: "#d89bc4" },
    ],
  },
  {
    id: "lungs",
    scientificName: "Pulmones",
    model: "/models/lungs.glb",
    icon: "◍",
    accent: "#dd8f8b",
    illustrated: true,
    hotspots: [
      { id: "trachea", position: [0, 1.6, 0.2], color: "#6393d8" },
      { id: "rightLung", position: [-1.2, 0.1, 0.7], color: "#ee7c6a" },
      { id: "leftLung", position: [1.2, 0.1, 0.7], color: "#f2a33b" },
      { id: "bronchus", position: [-0.03, 0.3, 0.35], color: "#d89bc4" },
      { id: "base", position: [-1.14, -1.2, 1], color: "#7fa88a" },
    ],
  },
  {
    id: "liver",
    scientificName: "Hepar",
    model: "/models/liver.glb",
    icon: "≈",
    accent: "#b86858",
    illustrated: true,
    hotspots: [
      { id: "rightLobe", position: [-0.75, 0.35, 0.75], color: "#ee7c6a" },
      { id: "leftLobe", position: [0.85, 0.25, 0.75], color: "#f2a33b" },
      { id: "portal", position: [0.1, -0.3, 0.82], color: "#6393d8" },
    ],
  },
  {
    id: "kidneys",
    scientificName: "Renes",
    model: "/models/kidneys.glb",
    icon: "∞",
    accent: "#c96963",
    illustrated: true,
    hotspots: [
      { id: "cortex", position: [-0.9, 0.55, 0.7], color: "#ee7c6a" },
      { id: "medulla", position: [0.85, 0.2, 0.7], color: "#f2a33b" },
      { id: "ureter", position: [0.4, -1.1, 0.5], color: "#6393d8" },
    ],
  },
  {
    id: "eyeball",
    scientificName: "Oculus",
    model: "/models/eyeball.glb",
    icon: "⊙",
    accent: "#7294b9",
    illustrated: true,
    hotspots: [
      { id: "cornea", position: [-0.94, 0.05, 1.47], color: "#6393d8" },
      { id: "iris", position: [-1.22, -0.53, 1.15], color: "#f2a33b" },
      { id: "optic", position: [1.61, -0.18, 0.54], color: "#d89bc4" },
    ],
  },
  {
    id: "intestine",
    scientificName: "Intestinum",
    model: "/models/intestine.glb",
    icon: "§",
    accent: "#d78b77",
    illustrated: true,
    hotspots: [
      { id: "duodenum", position: [0.6, 0.8, 0.75], color: "#f2a33b" },
      { id: "jejunum", position: [-0.45, 0.1, 0.82], color: "#ee7c6a" },
      { id: "colon", position: [0.75, -0.55, 0.72], color: "#6393d8" },
    ],
  },
  {
    id: "pancreas",
    scientificName: "Pancreas",
    model: "/models/pancreas.glb",
    icon: "◈",
    accent: "#c69a5e",
    illustrated: true,
    hotspots: [
      { id: "head", position: [-1.32, -0.36, 0.55], color: "#ee7c6a" },
      { id: "body", position: [0.05, 0.25, 0.45], color: "#f2a33b" },
      { id: "tail", position: [1.55, 0.3, 0.35], color: "#6393d8" },
      { id: "duct", position: [-0.61, 0.39, 0.5], color: "#d89bc4" },
    ],
  },
  {
    id: "skin",
    scientificName: "Integumentum",
    model: "/models/skin.glb",
    icon: "▦",
    accent: "#c99277",
    illustrated: true,
    hotspots: [
      { id: "epidermis", position: [-0.05, 0.88, 1.4], color: "#ee7c6a" },
      { id: "dermis", position: [0.29, 0.05, 1.4], color: "#f2a33b" },
      { id: "hypodermis", position: [-0.39, -1.15, 1.4], color: "#6393d8" },
      { id: "follicle", position: [0.89, -0.44, 1.4], color: "#d89bc4" },
    ],
  },
];

export const organBaseById = Object.fromEntries(
  organBases.map((organ) => [organ.id, organ]),
) as Record<OrganId, OrganBase>;
