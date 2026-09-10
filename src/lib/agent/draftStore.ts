import { AgentDraft } from "./types";

// Almacén en memoria volátil para drafts pendientes de confirmación
// (Opcionalmente persiste en Supabase si se desea retención prolongada)
const globalDrafts = new Map<string, AgentDraft>();

export function saveDraft(draft: AgentDraft) {
  globalDrafts.set(draft.id, draft);
  // Limpieza automática tras 1 hora
  setTimeout(() => globalDrafts.delete(draft.id), 3600000);
}

export function getDraft(id: string): AgentDraft | undefined {
  return globalDrafts.get(id);
}

export function deleteDraft(id: string) {
  globalDrafts.delete(id);
}
