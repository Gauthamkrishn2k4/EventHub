import { useId } from 'react';

/** Labelled form control with inline error. `as` = 'input' | 'select' | 'textarea'. */
export default function Field({ label, error, as: Tag = 'input', children, ...props }) {
  const id = useId();
  return (
    <div className={`field${error ? ' field--invalid' : ''}`}>
      <label htmlFor={id}>{label}</label>
      <Tag id={id} aria-invalid={Boolean(error)} {...props}>
        {children}
      </Tag>
      {error && <span className="field__error">{error}</span>}
    </div>
  );
}
