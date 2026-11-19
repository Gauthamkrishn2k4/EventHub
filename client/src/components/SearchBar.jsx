export default function SearchBar({ value, onChange, placeholder = 'Search by title' }) {
  return (
    <input className="input grow" type="search" value={value} placeholder={placeholder} aria-label={placeholder} onChange={(e) => onChange(e.target.value)} />
  );
}
