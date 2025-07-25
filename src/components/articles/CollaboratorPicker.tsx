import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { X, Plus } from 'lucide-react';

interface UserOption {
  id: string;
  full_name: string;
  avatar_url?: string;
  email?: string;
}

interface CollaboratorPickerProps {
  value: UserOption[];
  onChange: (users: UserOption[]) => void;
  excludeIds?: string[];
}

const CollaboratorPicker: React.FC<CollaboratorPickerProps> = ({ value, onChange, excludeIds = [] }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const excludeSet = [...excludeIds, ...value.map(u => u.id)];

    // Only search if query is at least 2 characters
    if (normalizedQuery.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    const fetchUsers = async () => {
      setLoading(true);
      let req = supabase
        .from('profiles')
        .select('id, full_name, avatar_url, email');

      // Simple search: match query in either full_name or email
      req = req.or(`full_name.ilike.%${normalizedQuery}%,email.ilike.%${normalizedQuery}%`);

      if (excludeSet.length > 0) {
        req = req.not('id', 'in', `(${excludeSet.join(',')})`);
      }

      req = req.limit(10);
      const { data, error } = await req;
      if (error) {
        console.error('Search error:', error);
        setResults([]);
      } else {
        setResults(data || []);
      }
      setLoading(false);
    };

    const handler = setTimeout(fetchUsers, 250); // debounce 250ms
    return () => clearTimeout(handler);
  }, [query, excludeIds, value]);

  const addCollaborator = (user: UserOption) => {
    if (!value.find(u => u.id === user.id)) {
      onChange([...value, user]);
      setQuery('');
      setResults([]);
    }
  };

  const removeCollaborator = (id: string) => {
    onChange(value.filter(u => u.id !== id));
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map(user => (
          <div
            key={user.id}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium border border-blue-200 hover:bg-blue-200 transition-colors duration-150 cursor-pointer group"
            onClick={() => navigate(`/dentists/${user.id}`)}
          >
            {user.avatar_url ? (
              <img 
                src={user.avatar_url} 
                alt={user.full_name} 
                className="w-5 h-5 rounded-full object-cover" 
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium">
                {user.full_name.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="group-hover:text-blue-900 transition-colors duration-150">
              {user.full_name}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeCollaborator(user.id);
              }}
              className="ml-1 text-blue-600 hover:text-red-600 hover:bg-red-100 rounded-full p-0.5 transition-colors duration-150"
              title={`Remove ${user.full_name}`}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Search users to add..."
          aria-label="Search users to add as collaborators"
          aria-autocomplete="list"
          aria-controls="collaborator-picker-listbox"
        />
        {loading && <div className="absolute right-2 top-2 text-xs text-gray-400">Loading...</div>}
        {query.trim().length >= 2 && !loading && results.length === 0 && (
          <div className="absolute left-0 right-0 bg-white border border-gray-200 rounded-lg mt-1 z-10 px-4 py-2 text-gray-500 text-sm">No users found.</div>
        )}
        {query.trim().length >= 2 && results.length > 0 && (
          <div
            id="collaborator-picker-listbox"
            role="listbox"
            className="absolute left-0 right-0 bg-white border border-gray-200 rounded-lg mt-1 z-10 max-h-48 overflow-y-auto shadow-lg"
          >
            {results.map(user => (
              <button
                key={user.id}
                type="button"
                role="option"
                aria-selected="false"
                className="w-full text-left px-4 py-2 hover:bg-blue-50 flex items-center gap-3 transition-colors duration-150"
                onClick={() => addCollaborator(user)}
              >
                <div className="flex items-center gap-2 flex-1">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.full_name} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                      {user.full_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">{user.full_name}</span>
                    {user.email && (
                      <span className="text-xs text-gray-500">{user.email}</span>
                    )}
                  </div>
                </div>
                <Plus className="w-4 h-4 text-blue-500 flex-shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CollaboratorPicker;
