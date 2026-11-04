/**
 * Evidence Service for RootIQ
 * Queries real canonical_evidence and raw_telemetry tables from Supabase.
 * No mock data. Returns { data, error } for every call.
 */

import { getSupabase } from './supabaseClient';

/**
 * Fetch all canonical_evidence rows for an incident, ordered by event_timestamp.
 */
export async function fetchEvidenceForIncident(incidentId) {
  if (!incidentId) {
    return { data: [], error: null };
  }

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('canonical_evidence')
      .select('evidence_id, incident_id, source_record_id, source_type, service, event_timestamp, observation, quality_status, limitations, created_at')
      .eq('incident_id', incidentId)
      .order('event_timestamp', { ascending: true, nullsFirst: false });

    if (error) {
      console.error(`[RootIQ] Error fetching canonical_evidence for ${incidentId}:`, error);
      return { data: null, error };
    }

    // Runtime discovery log
    if (data && data.length > 0) {
      console.log('[RootIQ Discovery] Sample canonical_evidence row:', data[0]);
      const uniqueTypes = Array.from(new Set(data.map(d => d.source_type)));
      console.log('[RootIQ Discovery] canonical_evidence distinct source_types:', uniqueTypes);
      console.log('[RootIQ Discovery] canonical_evidence observation keys:', data[0].observation ? Object.keys(data[0].observation) : []);
      console.log('[RootIQ Discovery] canonical_evidence limitations:', data[0].limitations);
    } else {
      console.log(`[RootIQ Discovery] No canonical_evidence rows found for incident ${incidentId}`);
    }

    return { data: data || [], error: null };
  } catch (err) {
    console.error(`[RootIQ] Exception in fetchEvidenceForIncident(${incidentId}):`, err);
    return { data: null, error: err };
  }
}

/**
 * Fetch summary counts for an incident (total count and count grouped per real source_type).
 * Computes dynamically from real rows; never hardcodes category names.
 */
export async function fetchEvidenceSummary(incidentId) {
  if (!incidentId) {
    return { data: { total: 0, bySourceType: {} }, error: null };
  }

  const { data: rows, error } = await fetchEvidenceForIncident(incidentId);
  if (error) {
    return { data: null, error };
  }

  const bySourceType = {};
  (rows || []).forEach(row => {
    const st = row.source_type || 'Unknown';
    bySourceType[st] = (bySourceType[st] || 0) + 1;
  });

  return {
    data: {
      total: (rows || []).length,
      bySourceType
    },
    error: null
  };
}

/**
 * Fetch raw telemetry payload rows for a specific source_record_id in an incident.
 */
export async function fetchRawTelemetryBySourceRecord(incidentId, sourceRecordId) {
  if (!incidentId || !sourceRecordId) {
    return { data: [], error: null };
  }

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('raw_telemetry')
      .select('id, incident_id, source_record_id, source_type, service, event_timestamp, raw_payload, ingested_at')
      .eq('incident_id', incidentId)
      .eq('source_record_id', sourceRecordId);

    if (error) {
      console.error(`[RootIQ] Error fetching raw_telemetry for ${sourceRecordId}:`, error);
      return { data: null, error };
    }

    if (data && data.length > 0) {
      console.log('[RootIQ Discovery] Sample raw_telemetry row:', data[0]);
      console.log('[RootIQ Discovery] raw_telemetry payload keys:', data[0].raw_payload ? Object.keys(data[0].raw_payload) : []);
    }

    return { data: data || [], error: null };
  } catch (err) {
    console.error(`[RootIQ] Exception in fetchRawTelemetryBySourceRecord:`, err);
    return { data: null, error: err };
  }
}

/**
 * Fetch raw telemetry rows for the entire incident to compute summary counts.
 */
export async function fetchRawTelemetryForIncident(incidentId) {
  if (!incidentId) {
    return { data: [], error: null };
  }

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('raw_telemetry')
      .select('id, incident_id, source_record_id, source_type, service, event_timestamp, ingested_at')
      .eq('incident_id', incidentId);

    if (error) {
      console.error(`[RootIQ] Error fetching all raw_telemetry for ${incidentId}:`, error);
      return { data: null, error };
    }

    return { data: data || [], error: null };
  } catch (err) {
    console.error(`[RootIQ] Exception in fetchRawTelemetryForIncident(${incidentId}):`, err);
    return { data: null, error: err };
  }
}
