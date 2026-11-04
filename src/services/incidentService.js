/**
 * Incident Service for RootIQ
 * Queries real incidents table from Supabase.
 * No mock data. Returns { data, error } for every call.
 */

import { getSupabase } from './supabaseClient';

/**
 * Fetch list of incidents ordered by start_time descending.
 */
export async function fetchIncidents() {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('incidents')
      .select('incident_id, title, affected_service, environment, severity, incident_type, start_time, end_time, baseline_window_start, baseline_window_end, incident_window_start, incident_window_end, summary, synthetic_only, human_review_required, automated_remediation_allowed, created_at')
      .order('start_time', { ascending: false });

    if (error) {
      console.error('[RootIQ] Error fetching incidents from Supabase:', error);
      return { data: null, error };
    }

    // Runtime discovery log
    if (data && data.length > 0) {
      console.log('[RootIQ Discovery] Sample incidents row:', data[0]);
    } else {
      console.log('[RootIQ Discovery] incidents table returned empty array');
    }

    return { data, error: null };
  } catch (err) {
    console.error('[RootIQ] Failed to execute fetchIncidents:', err);
    return { data: null, error: err };
  }
}

/**
 * Fetch a single full incident row by incident_id.
 */
export async function fetchIncidentById(incidentId) {
  if (!incidentId) {
    return { data: null, error: new Error('Incident ID is required') };
  }

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .eq('incident_id', incidentId)
      .maybeSingle();

    if (error) {
      console.error(`[RootIQ] Error fetching incident ${incidentId}:`, error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err) {
    console.error(`[RootIQ] Failed to execute fetchIncidentById(${incidentId}):`, err);
    return { data: null, error: err };
  }
}
