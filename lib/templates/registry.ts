import { CardTemplate } from "./types";

export const DEFAULT_TEMPLATES: CardTemplate[] = [
  {
    id: "google-review-v1",
    name: "Google Review Card (Reference Design)",
    description: "Vertical CR80 PVC card with authentic Google branding, Review Us On script, 5 golden stars, Tap or Scan, NFCFlow logo, and flowing 4-color waves.",
    category: "google_review",
    version: "1.0.0",
    status: "active",
    dimensions: {
      width: 53.98,
      height: 85.60,
      unit: "mm",
      dpi: 300,
      bleed: 2.0,
      cornerRadius: 3.18,
      orientation: "portrait",
    },
    elements: {
      qr: {
        type: "qr",
        x: 10.99, // Centered horizontally: (53.98 - 32) / 2
        y: 37.5,
        width: 32.0,
        height: 32.0,
        errorCorrection: "H",
        margin: 1,
        darkColor: "#000000",
        lightColor: "#ffffff",
      },
      nfcIcon: {
        x: 45.5,
        y: 4.5,
        size: 4.2,
      },
      scriptText: {
        text: "Review Us On",
        y: 11.5,
        fontSize: 16,
      },
      googleWordmark: {
        y: 20.0,
        height: 8.5,
      },
      stars: {
        y: 31.0,
        count: 5,
        color: "#FBBC05",
      },
      actionSection: {
        text: "Tap or Scan",
        y: 72.0,
      },
      branding: {
        tagline: "TAP. CONNECT. GROW.",
        y: 76.5,
      },
      bottomWaves: {
        height: 9.0,
        colors: ["#4285F4", "#EA4335", "#FBBC05", "#34A853"],
      },
    },
    created_at: "2026-03-01T00:00:00.000Z",
    updated_at: "2026-03-01T00:00:00.000Z",
  },
  {
    id: "google-review-v2-dark",
    name: "Google Review Card (Matte Obsidian Dark)",
    description: "Vertical CR80 dark luxury PVC card with deep black background, luminous Google logo, gold stars, and high contrast QR code.",
    category: "google_review",
    version: "1.1.0",
    status: "active",
    dimensions: {
      width: 53.98,
      height: 85.60,
      unit: "mm",
      dpi: 300,
      bleed: 2.0,
      cornerRadius: 3.18,
      orientation: "portrait",
    },
    elements: {
      qr: {
        type: "qr",
        x: 10.99,
        y: 37.5,
        width: 32.0,
        height: 32.0,
        errorCorrection: "H",
        margin: 1,
        darkColor: "#000000",
        lightColor: "#ffffff",
      },
      theme: "dark",
      cardBg: "#0d0f12",
    },
    created_at: "2026-03-01T00:00:00.000Z",
    updated_at: "2026-03-01T00:00:00.000Z",
  },
  {
    id: "whatsapp-smart-v1",
    name: "WhatsApp Direct Chat Card",
    description: "Vertical CR80 smart card optimized for WhatsApp customer messaging, prefilled inquiries, and customer support.",
    category: "whatsapp",
    version: "1.0.0",
    status: "active",
    dimensions: {
      width: 53.98,
      height: 85.60,
      unit: "mm",
      dpi: 300,
      bleed: 2.0,
      cornerRadius: 3.18,
      orientation: "portrait",
    },
    elements: {
      qr: {
        type: "qr",
        x: 10.99,
        y: 37.5,
        width: 32.0,
        height: 32.0,
        errorCorrection: "H",
        margin: 1,
        darkColor: "#075E54",
        lightColor: "#ffffff",
      },
      brandColor: "#25D366",
    },
    created_at: "2026-03-01T00:00:00.000Z",
    updated_at: "2026-03-01T00:00:00.000Z",
  },
  {
    id: "instagram-smart-v1",
    name: "Instagram Follower Card",
    description: "Vertical CR80 social growth card with official Instagram gradient accents, profile handle placement, and instant tap-to-follow.",
    category: "instagram",
    version: "1.0.0",
    status: "active",
    dimensions: {
      width: 53.98,
      height: 85.60,
      unit: "mm",
      dpi: 300,
      bleed: 2.0,
      cornerRadius: 3.18,
      orientation: "portrait",
    },
    elements: {
      qr: {
        type: "qr",
        x: 10.99,
        y: 37.5,
        width: 32.0,
        height: 32.0,
        errorCorrection: "H",
        margin: 1,
        darkColor: "#833AB4",
        lightColor: "#ffffff",
      },
      brandColor: "#E1306C",
    },
    created_at: "2026-03-01T00:00:00.000Z",
    updated_at: "2026-03-01T00:00:00.000Z",
  },
];

// In-memory or persisted template repository
let dynamicTemplates: CardTemplate[] = [...DEFAULT_TEMPLATES];

export function getAllTemplates(): CardTemplate[] {
  return dynamicTemplates;
}

export function getTemplateById(id: string): CardTemplate | undefined {
  return dynamicTemplates.find((t) => t.id === id) || DEFAULT_TEMPLATES.find((t) => t.id === id);
}

export function saveTemplate(template: CardTemplate): CardTemplate {
  const existingIdx = dynamicTemplates.findIndex((t) => t.id === template.id);
  const updated: CardTemplate = {
    ...template,
    updated_at: new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    dynamicTemplates[existingIdx] = updated;
  } else {
    dynamicTemplates.push(updated);
  }
  return updated;
}

export function duplicateTemplate(sourceId: string, newName?: string): CardTemplate | null {
  const source = getTemplateById(sourceId);
  if (!source) return null;

  const newVersion = `${source.version.split(".")[0] || "1"}.${Date.now().toString().slice(-3)}.0`;
  const newId = `${source.id}-custom-${Date.now().toString().slice(-4)}`;

  const duplicated: CardTemplate = {
    ...JSON.parse(JSON.stringify(source)),
    id: newId,
    name: newName || `${source.name} (Custom Copy)`,
    version: newVersion,
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  dynamicTemplates.push(duplicated);
  return duplicated;
}
