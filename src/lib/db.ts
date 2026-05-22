import { supabase } from './supabase';
import type { DaysStore, DayState, Resource } from '../types';

// ── Row shapes ─────────────────────────────────────────────────────────────

interface EntryRow {
  entry_date: string;
  subject_id: string;
  completed: boolean;
  what_i_did: string | null;
  plan_for_tomorrow: string | null;
}

interface ResourceRow {
  id: string;
  resource_type: 'pdf' | 'link';
  title: string;
  file_url: string | null;
  link_url: string | null;
  created_at: string;
  resource_tags: { tag_name: string }[];
}

// ── helpers ────────────────────────────────────────────────────────────────

function rowsToState(rows: EntryRow[]): DayState {
  const state: DayState = { checked: {}, notes: {} };
  for (const row of rows) {
    state.checked[row.subject_id] = row.completed;
    if (row.what_i_did || row.plan_for_tomorrow) {
      state.notes[row.subject_id] = {
        did:  row.what_i_did  ?? '',
        plan: row.plan_for_tomorrow ?? '',
      };
    }
  }
  return state;
}

// ── Single-day fetch (used by day view on every navigation) ───────────────

export async function loadDayEntries(userId: string, dateKey: string): Promise<DayState> {
  const { data, error } = await supabase
    .from('daily_entries')
    .select('subject_id, completed, what_i_did, plan_for_tomorrow')
    .eq('user_id', userId)
    .eq('entry_date', dateKey);

  if (error) { console.error('loadDayEntries:', error.message); return { checked: {}, notes: {} }; }
  return rowsToState((data as EntryRow[]) ?? []);
}

// ── All-days fetch (for week / month heat-map) ────────────────────────────

export async function loadDaysFromDB(userId: string): Promise<DaysStore> {
  const { data, error } = await supabase
    .from('daily_entries')
    .select('entry_date, subject_id, completed, what_i_did, plan_for_tomorrow')
    .eq('user_id', userId);

  if (error) { console.error('loadDaysFromDB:', error.message); return {}; }

  const store: DaysStore = {};
  for (const row of (data as EntryRow[]) ?? []) {
    const k = row.entry_date;
    if (!store[k]) store[k] = { checked: {}, notes: {} };
    store[k].checked[row.subject_id] = row.completed;
    if (row.what_i_did || row.plan_for_tomorrow) {
      store[k].notes[row.subject_id] = {
        did:  row.what_i_did  ?? '',
        plan: row.plan_for_tomorrow ?? '',
      };
    }
  }
  return store;
}

// ── Upsert one entry — returns true on success ────────────────────────────

export async function upsertEntry(
  userId: string,
  dateKey: string,
  subjectId: string,
  subjectName: string,
  subjectPart: string,
  completed: boolean,
  did: string,
  plan: string,
): Promise<boolean> {
  const { error } = await supabase.from('daily_entries').upsert(
    {
      user_id:            userId,
      entry_date:         dateKey,
      subject_id:         subjectId,
      subject_name:       subjectName,
      subject_part:       subjectPart,
      completed,
      what_i_did:         did  || null,
      plan_for_tomorrow:  plan || null,
      updated_at:         new Date().toISOString(),
    },
    { onConflict: 'user_id,entry_date,subject_id' },
  );
  if (error) { console.error('upsertEntry:', error.message); return false; }
  return true;
}

// ── Resources ──────────────────────────────────────────────────────────────

export async function uploadPdfToStorage(userId: string, file: File): Promise<string | null> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `${userId}/${Date.now()}-${safeName}`;
  const { error } = await supabase.storage
    .from('study-pdfs')
    .upload(path, file, { contentType: 'application/pdf', upsert: false });
  if (error) { console.error('uploadPdf:', error.message); return null; }
  const { data } = await supabase.storage.from('study-pdfs').createSignedUrl(path, 60 * 60 * 24 * 365);
  return data?.signedUrl ?? null;
}

export async function loadResourcesFromDB(userId: string): Promise<Resource[]> {
  const { data, error } = await supabase
    .from('resources')
    .select('id, resource_type, title, file_url, link_url, created_at, resource_tags(tag_name)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) { console.error('loadResources:', error.message); return []; }

  return ((data as ResourceRow[]) ?? []).map((r) => ({
    id:      r.id,
    type:    r.resource_type,
    name:    r.title,
    url:     r.link_url ?? r.file_url ?? undefined,
    addedAt: new Date(r.created_at).getTime(),
    tags:    r.resource_tags.map((t) => t.tag_name),
  }));
}

export async function insertResource(userId: string, resource: Resource): Promise<boolean> {
  const { error: rErr } = await supabase.from('resources').insert({
    id:            resource.id,
    user_id:       userId,
    title:         resource.name,
    file_url:      resource.type === 'pdf' ? (resource.url ?? null) : null,
    link_url:      resource.type === 'link' ? (resource.url ?? null) : null,
    resource_type: resource.type,
  });
  if (rErr) { console.error('insertResource:', rErr.message); return false; }

  if (resource.tags.length > 0) {
    const tagRows = resource.tags.map((tag) => ({ resource_id: resource.id, tag_name: tag }));
    const { error: tErr } = await supabase.from('resource_tags').insert(tagRows);
    if (tErr) console.error('insertResourceTags:', tErr.message);
  }
  return true;
}

export async function deleteResourceFromDB(resourceId: string): Promise<boolean> {
  const { error } = await supabase.from('resources').delete().eq('id', resourceId);
  if (error) { console.error('deleteResource:', error.message); return false; }
  return true;
}

export async function updateResourceTags(resourceId: string, tags: string[]): Promise<void> {
  await supabase.from('resource_tags').delete().eq('resource_id', resourceId);
  if (tags.length > 0) {
    const rows = tags.map((tag) => ({ resource_id: resourceId, tag_name: tag }));
    const { error } = await supabase.from('resource_tags').insert(rows);
    if (error) console.error('updateResourceTags:', error.message);
  }
}
