const currency = import.meta.env.VITE_CURRENCY || 'INR';
const money = new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 2 });

export const formatMoney = (n) => (n === 0 ? 'Free' : money.format(n));
export const formatTotal = (n) => money.format(n);
export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
export const formatDateTime = (iso) =>
  new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
export const dayParts = (iso) => {
  const d = new Date(iso);
  return { day: d.getDate(), month: d.toLocaleDateString('en-IN', { month: 'short' }) };
};

/** Local "YYYY-MM-DD" and "HH:mm" from an ISO instant (for form inputs). */
export const toDateInput = (iso) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
export const toTimeInput = (iso) => new Date(iso).toTimeString().slice(0, 5);

/** Instant for a local date + start time, as ISO (UTC). */
export const toEventInstant = (date, time) => new Date(`${date}T${time || '00:00'}`).toISOString();
export const dayRange = (date) => ({
  from: new Date(`${date}T00:00:00`).toISOString(),
  to: new Date(`${date}T23:59:59.999`).toISOString(),
});
