import React, { useState } from 'react';
import useStore, { IMAGES } from '../../store/store';
import { X, Check, Camera, Sparkles } from 'lucide-react';

const TASTE_OPTIONS = [
  'Spicy & Hot',
  'Smoked BBQ',
  'Ramen & Noodles',
  'Rooftop Terrace',
  'Artisanal Coffee',
  'Pastries & Desserts',
  'Luxury Stays',
  'Boutique Motels',
  'Scenic Resthouses'
];

const EditProfileModal = ({ isOpen, onClose }) => {
  const { currentUser, updateUserProfile } = useStore();

  const [name, setName] = useState(currentUser.name || '');
  const [handle, setHandle] = useState(currentUser.handle || '');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [avatar, setAvatar] = useState(currentUser.avatar || IMAGES.alexAvatar);
  const [selectedTastes, setSelectedTastes] = useState(
    currentUser.taste_profile ? Object.keys(currentUser.taste_profile) : ['Spicy & Hot', 'Ramen & Noodles', 'Artisanal Coffee']
  );
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const toggleTaste = (taste) => {
    if (selectedTastes.includes(taste)) {
      setSelectedTastes(selectedTastes.filter((t) => t !== taste));
    } else {
      setSelectedTastes([...selectedTastes, taste]);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const tasteObj = {};
    selectedTastes.forEach((t) => {
      tasteObj[t] = 0.9;
    });

    await updateUserProfile({
      name,
      handle: handle.startsWith('@') ? handle : `@${handle}`,
      bio,
      avatar,
      taste_profile: tasteObj
    });

    setIsSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-lg w-full p-6 animate-modal border border-zinc-200"
      >
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 mb-5">
          <h3 className="font-bold text-base text-zinc-900">Edit Profile</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {/* Avatar selector */}
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#FF5A5F] shadow-xs">
              <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <label className="block font-bold text-zinc-700 uppercase tracking-wider text-[10px] mb-1">
                Avatar Image URL
              </label>
              <input
                type="text"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://..."
                className="w-full p-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-zinc-400 font-medium text-xs truncate"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-zinc-700 uppercase tracking-wider text-[10px] mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-zinc-400 font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-zinc-700 uppercase tracking-wider text-[10px] mb-1">
                Username / Handle
              </label>
              <input
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-zinc-400 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-zinc-700 uppercase tracking-wider text-[10px] mb-1">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full p-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-zinc-400 font-medium resize-none"
            />
          </div>

          {/* Taste Preferences for AI Recommendations */}
          <div>
            <div className="flex items-center gap-1 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#FF5A5F]" />
              <label className="font-bold text-zinc-700 uppercase tracking-wider text-[10px]">
                Taste Profile (AI Feed & Chat Matching)
              </label>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {TASTE_OPTIONS.map((taste) => {
                const selected = selectedTastes.includes(taste);
                return (
                  <button
                    type="button"
                    key={taste}
                    onClick={() => toggleTaste(taste)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                      selected
                        ? 'bg-[#FF5A5F] text-white shadow-xs'
                        : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                    }`}
                  >
                    {taste}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-bold py-3 rounded-xl shadow-md transition-transform hover:scale-[1.01] cursor-pointer"
            >
              {isSaving ? 'Saving to Database...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
