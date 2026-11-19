import { useState } from 'react';
import { toDateInput, toEventInstant, toTimeInput } from '../utils/format.js';
import { validateEventForm } from '../utils/validation.js';
import ErrorMessage from './ErrorMessage.jsx';
import Field from './Field.jsx';

const empty = { title: '', description: '', category: '', location: '', date: '', startTime: '', endTime: '', ticketPrice: '0', totalTickets: '100', imageUrl: '', status: 'Draft' };

const fromEvent = (e) => ({
  title: e.title, description: e.description, category: e.category, location: e.location,
  date: toDateInput(e.eventDate), startTime: e.startTime || toTimeInput(e.eventDate), endTime: e.endTime || '',
  ticketPrice: String(e.ticketPrice), totalTickets: String(e.totalTickets), imageUrl: e.imageUrl || '', status: e.status,
});

export default function EventForm({ initial, onSubmit }) {
  const isEdit = Boolean(initial);
  const [values, setValues] = useState(initial ? fromEvent(initial) : empty);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [saving, setSaving] = useState(false);

  const set = (name) => (e) => setValues((v) => ({ ...v, [name]: e.target.value }));
  const sold = initial ? initial.totalTickets - initial.availableTickets : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validateEventForm(values, { isEdit });
    setErrors(found);
    if (Object.keys(found).length) return;

    const payload = {
      title: values.title, description: values.description, category: values.category, location: values.location,
      eventDate: toEventInstant(values.date, values.startTime),
      ticketPrice: Number(values.ticketPrice), totalTickets: Number(values.totalTickets),
      ...(values.startTime && { startTime: values.startTime }),
      ...(values.endTime && { endTime: values.endTime }),
      imageUrl: values.imageUrl,
      ...(!isEdit && { status: values.status }),
    };
    setSaving(true);
    setSubmitError(null);
    try {
      await onSubmit(payload);
    } catch (err) {
      setSubmitError(err);
      setSaving(false);
    }
  };

  return (
    <form className="panel" onSubmit={handleSubmit} noValidate>
      <ErrorMessage error={submitError} />
      <Field label="Title" value={values.title} onChange={set('title')} error={errors.title} />
      <Field label="Description" as="textarea" rows={4} value={values.description} onChange={set('description')} error={errors.description} />
      <div className="grid-2">
        <Field label="Category" value={values.category} onChange={set('category')} error={errors.category} />
        <Field label="Location" value={values.location} onChange={set('location')} error={errors.location} />
        <Field label="Date" type="date" value={values.date} onChange={set('date')} error={errors.date} />
        <Field label="Start time" type="time" value={values.startTime} onChange={set('startTime')} error={errors.startTime} />
        <Field label="End time" type="time" value={values.endTime} onChange={set('endTime')} error={errors.endTime} />
        <Field label="Ticket price" type="number" min="0" step="0.01" value={values.ticketPrice} onChange={set('ticketPrice')} error={errors.ticketPrice} />
        <Field label={isEdit ? `Total tickets (${sold} sold)` : 'Total tickets'} type="number" min={Math.max(sold, 1)} step="1" value={values.totalTickets} onChange={set('totalTickets')} error={errors.totalTickets} />
        <Field label="Image URL (optional)" value={values.imageUrl} onChange={set('imageUrl')} error={errors.imageUrl} />
      </div>
      {!isEdit && (
        <Field label="Status" as="select" value={values.status} onChange={set('status')}>
          <option value="Draft">Draft (hidden from customers)</option>
          <option value="Published">Published</option>
        </Field>
      )}
      <button className="btn" disabled={saving}>{saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create event'}</button>
    </form>
  );
}
