import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/database';
import { Activity, AlignLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Ortho() {
  const patients = useLiveQuery(() => db.patients.toArray(), []);
  const treatments = useLiveQuery(() => db.treatmentRecords.toArray(), []);
  const catalog = useLiveQuery(() => db.treatmentCatalog.toArray(), []);

  const orthoCases = useMemo(() => {
    if (!patients || !treatments || !catalog) return [];

    const orthoTreatmentIds = catalog
      .filter((t) => t.category === 'Orthodontics')
      .map((t) => t.id);

    if (orthoTreatmentIds.length === 0) return [];

    const byPatient = new Map();

    treatments.forEach((rec) => {
      if (!orthoTreatmentIds.includes(rec.treatmentId)) return;

      const existing = byPatient.get(rec.patientId) || {
        patientId: rec.patientId,
        totalAmount: 0,
        visitCount: 0,
        firstDate: null,
        lastDate: null,
      };

      existing.totalAmount += rec.feePKR || 0;
      existing.visitCount += 1;
      const d = new Date(rec.date);
      if (!existing.firstDate || d < new Date(existing.firstDate)) {
        existing.firstDate = rec.date;
      }
      if (!existing.lastDate || d > new Date(existing.lastDate)) {
        existing.lastDate = rec.date;
      }
      byPatient.set(rec.patientId, existing);
    });

    const result = [];
    byPatient.forEach((value, patientId) => {
      const patient = patients.find((p) => p.id === patientId);
      if (!patient) return;
      result.push({
        ...value,
        patient,
      });
    });

    return result.sort((a, b) => (b.totalAmount || 0) - (a.totalAmount || 0));
  }, [patients, treatments, catalog]);

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Orthodontic Cases
        </h1>
        <p className="text-sm text-muted-foreground">
          Overview of patients who have received orthodontic treatments. Use this to help calculate material costs and profit sharing.
        </p>
      </header>

      {(!orthoCases || orthoCases.length === 0) && (
        <div className="bg-card border border-border rounded-xl p-4 text-sm text-muted-foreground flex items-center gap-2">
          <AlignLeft className="w-4 h-4" />
          No orthodontic cases found yet. Once you record orthodontic treatments, they will appear here.
        </div>
      )}

      {orthoCases && orthoCases.length > 0 && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="border-b border-border px-4 py-2.5 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {orthoCases.length} patient{orthoCases.length === 1 ? '' : 's'} with orthodontic treatment
            </p>
          </div>
          <div className="divide-y divide-border">
            {orthoCases.map((c) => (
              <div key={c.patientId} className="px-4 py-3 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">
                      {c.patient.name || 'Unnamed patient'}
                    </p>
                    {c.patient.phone && (
                      <span className="text-xs text-muted-foreground">
                        {c.patient.phone}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    First visit: {c.firstDate ? new Date(c.firstDate).toLocaleDateString() : 'N/A'} · Last visit: {c.lastDate ? new Date(c.lastDate).toLocaleDateString() : 'N/A'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Visits: {c.visitCount}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">
                    ₨ {c.totalAmount.toLocaleString()}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Approx. share (50/50 before materials):<br />
                    You: ₨ {(c.totalAmount / 2).toLocaleString()}<br />
                    Ortho: ₨ {(c.totalAmount / 2).toLocaleString()}
                  </p>
                  <Link
                    to={`/patients/${c.patientId}`}
                    className="inline-flex mt-2 text-xs text-primary hover:underline"
                  >
                    View patient record
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}