import React from 'react';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

const COUNTRY_CODES = [
  { code: '+91', flag: '🇮🇳', label: 'IN' },
  { code: '+1', flag: '🇺🇸', label: 'US' },
  { code: '+44', flag: '🇬🇧', label: 'UK' },
  { code: '+61', flag: '🇦🇺', label: 'AU' },
  { code: '+971', flag: '🇦🇪', label: 'AE' },
  // Add more as needed
];

function formatPhoneNumber(phone: string, code: string) {
  // For India, format as +91 99999 99999
  if (code === '+91') {
    const digits = phone.replace(/\D/g, '').slice(0, 10);
    if (digits.length <= 5) return digits;
    return `${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  // For US, format as +1 (999) 999-9999
  if (code === '+1') {
    const digits = phone.replace(/\D/g, '').slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  // Default: just group by 4
  return phone.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
}

const PhoneInput: React.FC<PhoneInputProps> = ({ value, onChange, label }) => {
  const [countryCode, setCountryCode] = React.useState('+91');
  const [local, setLocal] = React.useState('');

  React.useEffect(() => {
    // Parse value into code and local
    if (value) {
      const match = COUNTRY_CODES.find(c => value.startsWith(c.code));
      if (match) {
        setCountryCode(match.code);
        setLocal(value.replace(match.code, '').trim());
      } else {
        setCountryCode('+91');
        setLocal(value.replace('+91', '').trim());
      }
    }
  }, [value]);

  const handleCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCountryCode(e.target.value);
    onChange(`${e.target.value} ${local}`.trim());
  };

  const handleLocalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    setLocal(raw);
    onChange(`${countryCode} ${raw}`.trim());
  };

  return (
    <div>
      {label && <label className="block text-sm font-medium mb-1">{label}</label>}
      <div className="flex gap-2">
        <select
          className="p-2 border rounded bg-white min-w-[60px] font-sans text-lg"
          value={countryCode}
          onChange={handleCodeChange}
        >
          {COUNTRY_CODES.map(c => (
            <option key={c.code} value={c.code}>
              {c.flag} {c.code}
            </option>
          ))}
        </select>
        <input
          type="tel"
          className="flex-1 p-2 border rounded"
          placeholder="Phone number"
          value={formatPhoneNumber(local, countryCode)}
          onChange={handleLocalChange}
          maxLength={countryCode === '+91' ? 12 : 20}
        />
      </div>
    </div>
  );
};

export default PhoneInput;
