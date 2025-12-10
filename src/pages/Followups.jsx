import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { CalendarDays, Phone, AlertCircle, Clock } from 'lucide-react';
import { db } from '../services/database';

const DAYS_90 = 90;
const DAYS_180 = 180;

function daysBetween(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = d2.getTime() - d1.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

export default function Followups() {
  const patients = useLiveQuery(() => db.patients.toArray(), []);
  const appointments = useLiveQuery(() => db.appointments.toArray(), []);
  const treatments = useLiveQuery(() => db.treatmentRecords.toArray(), []);

  const suggestions = useMemo(() => {
    if (!patients || !appointments || !treatments) return [];

    const today = new Date();
    const result = [];

    patients.forEach((patient) => {
      const patientAppointments = appointments
        .filter((a) => a.patientId === patient.id)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      const lastAppt = patientAppointments[0];
      const daysSinceLastVisit = lastAppt
        ? daysBetween(lastAppt.date, today)
        : null;

      const patientTreatments = treatments.filter(
        (t) => t.patientId === patient.id
      );
      const pendingTreatments = patientTreatments.filter(
        (t) => t.status !== 'completed'
      );

      let reasonParts = [];
      let priority = 0;

      if (pendingTreatments.length > 0) {
        reasonParts.push(
          `${pendingTreatments.length} pending treatment${
            pendingTreatments.length > 1 ? 's' : ''
          }`
        );
        priority += 2;
      }

      if (daysSinceLastVisit !== null) {
        if (daysSinceLastVisit > DAYS_180) {
          reasonParts.push('Overdue follow-up (> 6 months)');
          priority += 3;
        } else if (daysSinceLastVisit > DAYS_90) {
          reasonParts.push('Due for check-up (> 3 months)');
          priority += 2;
        }
      } else {
        reasonParts.push('No recorded visit');
        priority += 1;
      }

      // Only suggest if there is some reason
      if (reasonParts.length > 0) {
        result.push({
          patient,
          daysSinceLastVisit,
          pendingCount: pendingTreatments.length,
          reason: reasonParts.join(' · '),
          priority,
        });
      }
    });

    // Sort by priority and recency
    return result
      .filter((s) => s.priority > 0)
      .sort((a, b) => b.priority - a.priority);
  }, [patients, appointments, treatments]);

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" />
            Follow-ups
          </h1>
          <p className="text-sm text-muted-foreground">
            Patients who are due or overdue for follow-up, or have pending treatment.
          </p>
        </div>
      </header>

      {(!suggestions || suggestions.length === 0) && (
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-foreground">No follow-ups found</p>
            <p className="text-sm text-muted-foreground">
              Once patients have visits and planned treatments, they will appear here when they are due.
            </p>
          </div>
        </div>
      )}

      {suggestions && suggestions.length > 0 && (
        <div className="bg-card border border-border rounded-xl">
          <div className="border-b border-border px-4 py-2.5 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Showing {suggestions.length} patient{suggestions.length === 1 ? '' : 's'} needing attention
            </p>
          </div>
          <ul className="divide-y divide-border">
            {suggestions.map((s) => (
              <li key={s.patient.id} className="px-4 py-3 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">
                      {s.patient.name || 'Unnamed patient'}
                    </p>
                    {s.daysSinceLastVisit !== null && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-[11px] text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {s.daysSinceLastVisit} days since last visit
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{s.reason}</p>
                  {s.patient.phone && (
                    <p className="text-xs text-muted-foreground mt-1">
                      📞 {s.patient.phone}
                    </p>
                  )}
                </div>
                {s.patient.phone && (
                  <div className="flex flex-col gap-2">
                    <a
                      href={`tel:${s.patient.phone}`}
                      className="inline-flex items-center justify-center px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs"
                    >
                      <Phone className="w-3 h-3 mr-1" />
                      Call
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        const msg = `Dear ${s.patient.name || 'patient'}, this is Abdullah Dental Care. You are due for your dental follow-up. Please contact us to book an appointment.`;
                        navigator.clipboard
                          .writeText(msg)
                          .catch(() => {});
                        alert('Follow-up WhatsApp message copied to clipboard.');
                      }}
                      className="inline-flex items-center justify-center px-3 py-1.5 rounded-full border border-border text-xs text-muted-foreground"
                    >
                      Copy WhatsApp text
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
