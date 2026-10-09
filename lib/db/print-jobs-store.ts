import { PrintJob, PrintJobStatus, SheetLayoutConfig, CsvCardRow } from "@/lib/templates/types";
import fs from "fs";
import path from "path";
import os from "os";

function getStorePaths() {
  try {
    const localDir = path.join(process.cwd(), "data");
    const localFile = path.join(localDir, "print_jobs.json");
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    const testFile = path.join(localDir, `.test_${Date.now()}`);
    fs.writeFileSync(testFile, "1");
    fs.unlinkSync(testFile);
    return { dir: localDir, file: localFile };
  } catch {
    const tmpDir = path.join(os.tmpdir(), "nfcflow_data");
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
    return { dir: tmpDir, file: path.join(tmpDir, "print_jobs.json") };
  }
}

let inMemoryPrintJobs: PrintJob[] = [];

function loadPrintJobs(): PrintJob[] {
  try {
    const { file } = getStorePaths();
    if (fs.existsSync(file)) {
      const raw = fs.readFileSync(file, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        inMemoryPrintJobs = parsed;
        return inMemoryPrintJobs;
      }
    }
  } catch (err) {
    console.warn("Failed loading print jobs file:", err);
  }
  return inMemoryPrintJobs;
}

function savePrintJobs(): void {
  try {
    const { file } = getStorePaths();
    fs.writeFileSync(file, JSON.stringify(inMemoryPrintJobs, null, 2), "utf-8");
  } catch (err) {
    console.warn("Failed saving print jobs file:", err);
  }
}

export function getAllPrintJobs(): PrintJob[] {
  return loadPrintJobs().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function getPrintJobById(id: string): PrintJob | undefined {
  loadPrintJobs();
  return inMemoryPrintJobs.find((j) => j.id === id);
}

export function createPrintJob(data: {
  job_name?: string;
  batch_id?: string;
  template_id: string;
  card_data: CsvCardRow[];
  sheet_config: SheetLayoutConfig;
  export_options: {
    generatePdf: boolean;
    generateCardsZip: boolean;
    generateQrZip: boolean;
    generateManifest: boolean;
  };
}): PrintJob {
  loadPrintJobs();
  const id = `PJ-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const newJob: PrintJob = {
    id,
    batch_id: data.batch_id,
    job_name: data.job_name || `Bulk Print Batch #${id.slice(-6)} (${data.card_data.length} cards)`,
    template_id: data.template_id,
    status: "pending",
    total_cards: data.card_data.length,
    processed_cards: 0,
    progress_percent: 0,
    card_data: data.card_data,
    sheet_config: data.sheet_config,
    export_options: data.export_options,
    created_at: new Date().toISOString(),
  };

  inMemoryPrintJobs.unshift(newJob);
  savePrintJobs();
  return newJob;
}

export function updatePrintJob(
  id: string,
  updates: Partial<PrintJob>
): PrintJob | undefined {
  loadPrintJobs();
  const jobIdx = inMemoryPrintJobs.findIndex((j) => j.id === id);
  if (jobIdx === -1) return undefined;

  const updated: PrintJob = {
    ...inMemoryPrintJobs[jobIdx],
    ...updates,
  };

  if (updates.status === "completed" || updates.status === "failed") {
    updated.completed_at = new Date().toISOString();
  }

  inMemoryPrintJobs[jobIdx] = updated;
  savePrintJobs();
  return updated;
}

export function deletePrintJob(id: string): boolean {
  loadPrintJobs();
  const initialLen = inMemoryPrintJobs.length;
  inMemoryPrintJobs = inMemoryPrintJobs.filter((j) => j.id !== id);
  if (inMemoryPrintJobs.length !== initialLen) {
    savePrintJobs();
    return true;
  }
  return false;
}
