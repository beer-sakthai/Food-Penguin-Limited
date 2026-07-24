// Saksee · 2026-07-24 · feat/new-design-system
import { useEffect, useState, type FormEvent } from "react";
import { Save, X } from "lucide-react";
import type { DailyOperationalLog } from "../../types";

type Day = DailyOperationalLog["day"];
interface OperationalLogFormProps {
  isOpen: boolean;
  onClose: () => void;
  weeklyLogs: DailyOperationalLog[];
  onSave: (log: DailyOperationalLog) => void;
}

const days: Day[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const fields = ["sales", "waste", "hours", "productionTarget", "productionMade", "tazaki", "sysco", "bulza", "sticker", "others"] as const;
type Field = (typeof fields)[number];

export function OperationalLogForm({ isOpen, onClose, weeklyLogs, onSave }: OperationalLogFormProps) {
  const [day, setDay] = useState<Day>("Sun");
  const [date, setDate] = useState("2026-06-21");
  const [values, setValues] = useState<Record<Field, string>>({
    sales: "14820", waste: "412.50", hours: "124", productionTarget: "11500", productionMade: "11240",
    tazaki: "4890", sysco: "1100", bulza: "820", sticker: "240", others: "380"
  });
  const [supplierName, setSupplierName] = useState<DailyOperationalLog["supplierName"]>("Others");

  useEffect(() => {
    const log = weeklyLogs.find(item => item.day === day);
    if (!log) return;
    setDate(log.date);
    setSupplierName(log.supplierName);
    setValues({
      sales: String(log.sales), waste: String(log.waste), hours: String(log.hours),
      productionTarget: String(log.productionTarget), productionMade: String(log.productionMade),
      tazaki: String(log.cogs.tazaki), sysco: String(log.cogs.sysco), bulza: String(log.cogs.bulza),
      sticker: String(log.cogs.sticker), others: String(log.cogs.others)
    });
  }, [day, weeklyLogs]);

  if (!isOpen) return null;

  const update = (field: Field, value: string) => setValues(current => ({ ...current, [field]: value }));

  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSave({
      day, date, supplierName,
      sales: Number(values.sales) || 0, waste: Number(values.waste) || 0, hours: Number(values.hours) || 0,
      productionTarget: Number(values.productionTarget) || 0, productionMade: Number(values.productionMade) || 0,
      cogs: {
        tazaki: Number(values.tazaki) || 0, sysco: Number(values.sysco) || 0, bulza: Number(values.bulza) || 0,
        sticker: Number(values.sticker) || 0, others: Number(values.others) || 0
      }
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 p-0 sm:p-4" role="dialog" aria-modal="true" aria-labelledby="operational-log-title">
      <form onSubmit={submit} className="flex h-full w-full max-w-2xl flex-col overflow-y-auto bg-[var(--bg)] p-6 shadow-2xl sm:rounded-2xl border-l border-[var(--border)]">
        <div className="flex items-start justify-between border-b border-[var(--border)] pb-5">
          <div>
            <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--accent)]">Data entry</p>
            <h2 id="operational-log-title" className="mt-1 text-xl font-semibold text-[var(--text)]">Log daily figures</h2>
            <p className="mt-1 text-xs text-[var(--muted)]">Save operational and COGS figures for one audited day.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--panel)]" aria-label="Close data entry">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-4 py-5 sm:grid-cols-2">
          <label className="text-xs font-bold text-[var(--text)]">
            Day
            <select className="input mt-1" value={day} onChange={e => setDay(e.target.value as Day)}>
              {days.map(item => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="text-xs font-bold text-[var(--text)]">
            Date
            <input className="input mt-1" type="date" value={date} onChange={e => setDate(e.target.value)} />
          </label>
          {fields.slice(0, 5).map(field => (
            <label key={field} className="text-xs font-bold capitalize text-[var(--text)]">
              {field.replace(/([A-Z])/g, " $1")}
              <input className="input mt-1" type="number" min="0" step="any" value={values[field]} onChange={e => update(field, e.target.value)} />
            </label>
          ))}
        </div>

        <div className="border-t border-[var(--border)] py-5">
          <h3 className="text-sm font-semibold text-[var(--text)]">COGS suppliers</h3>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {fields.slice(5).map(field => (
              <label key={field} className="text-xs font-bold capitalize text-[var(--text)]">
                {field}
                <input className="input mt-1" type="number" min="0" step="any" value={values[field]} onChange={e => update(field, e.target.value)} />
              </label>
            ))}
          </div>
        </div>

        <div className="mt-auto border-t border-[var(--border)] pt-4 flex items-center justify-end gap-2">
          <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
          <button type="submit" className="btn btn-primary">
            <Save className="h-4 w-4" /> Save log
          </button>
        </div>
      </form>
    </div>
  );
}
