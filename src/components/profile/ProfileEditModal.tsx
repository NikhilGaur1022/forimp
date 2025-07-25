import React, { useState } from 'react';
import TagInput from './TagInput';
import PhoneInput from './PhoneInput';

interface ProfileEditModalProps {
  profile: any;
  onSave: (data: any) => Promise<void>;
  onClose: () => void;
}

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({ profile, onSave, onClose }) => {
  const [form, setForm] = useState({ ...profile });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSave(form);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
        <h2 className="text-2xl font-bold mb-4 px-8 pt-8">Edit Profile</h2>
        {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-2 mx-8">{error}</div>}
        <div className="space-y-4 px-8 pb-4 overflow-y-auto" style={{ maxHeight: '60vh' }}>
          <input name="full_name" value={form.full_name || ''} onChange={handleChange} className="w-full p-2 border rounded" placeholder="Full Name" required />
          <input name="email" value={form.email || ''} onChange={handleChange} className="w-full p-2 border rounded" placeholder="Email" type="email" required />
          <PhoneInput
            value={form.phone || ''}
            onChange={val => setForm((prev: any) => ({ ...prev, phone: val }))}
            label="Phone Number"
          />
          <input name="specialty" value={form.specialty || ''} onChange={handleChange} className="w-full p-2 border rounded" placeholder="Specialty" />
          <input name="clinic_name" value={form.clinic_name || ''} onChange={handleChange} className="w-full p-2 border rounded" placeholder="Clinic/Practice Name" />
          <input name="institution" value={form.institution || ''} onChange={handleChange} className="w-full p-2 border rounded" placeholder="Institution" />
          <input name="university" value={form.university || ''} onChange={handleChange} className="w-full p-2 border rounded" placeholder="University" />
          <input name="position" value={form.position || ''} onChange={handleChange} className="w-full p-2 border rounded" placeholder="Position/Title" />
          <input name="years_of_experience" value={form.years_of_experience || ''} onChange={handleChange} className="w-full p-2 border rounded" placeholder="Years of Experience" type="number" min="0" max="50" />
          <input name="location" value={form.location || ''} onChange={handleChange} className="w-full p-2 border rounded" placeholder="Location" />
          <input name="website_url" value={form.website_url || ''} onChange={handleChange} className="w-full p-2 border rounded" placeholder="Website URL" />
          <input name="avatar_url" value={form.avatar_url || ''} onChange={handleChange} className="w-full p-2 border rounded" placeholder="Avatar URL" />
          <input name="education" value={form.education || ''} onChange={handleChange} className="w-full p-2 border rounded" placeholder="Education" />
          <input name="certifications" value={form.certifications || ''} onChange={handleChange} className="w-full p-2 border rounded" placeholder="Certifications" />
          <textarea name="bio" value={form.bio || ''} onChange={handleChange} className="w-full p-2 border rounded" placeholder="Bio" rows={3} />
          {/* Professional Interests (tag input) */}
          <TagInput
            label="Professional Interests"
            values={Array.isArray(form.research_interests) ? form.research_interests : (form.research_interests ? [form.research_interests] : [])}
            onChange={vals => setForm((prev: any) => ({ ...prev, research_interests: vals }))}
            placeholder="Type and press Enter..."
          />
        </div>
        <div className="flex justify-end gap-2 mt-6 px-8 pb-8">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Cancel</button>
          <button type="submit" disabled={saving} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300">
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileEditModal;
