import React, { useState } from 'react';

const wallpapers = [
  { id: null, label: 'Default', style: 'bg-gray-900' },
  { id: 'blue-gradient', label: 'Blue gradient', style: 'bg-gradient-to-r from-blue-800 to-cyan-600' },
  { id: 'purple-pink', label: 'Purple / Pink', style: 'bg-gradient-to-r from-purple-500 to-pink-500' },
  { id: 'sunset', label: 'Sunset', style: 'bg-gradient-to-r from-yellow-400 to-orange-500' },
  { id: 'green', label: 'Green', style: 'bg-gradient-to-r from-emerald-400 to-green-600' }
];

const themes = [
  { 
    id: 'default', 
    label: 'Default', 
    description: 'Clean and simple',
    colors: {
      primary: 'bg-blue-500',
      secondary: 'bg-gray-700',
      text: 'text-white',
      bubbleUser: 'bg-blue-600',
      bubbleOther: 'bg-gray-700'
    },
    preview: 'bg-gradient-to-r from-blue-600 to-gray-800'
  },
  { 
    id: 'dark', 
    label: 'Dark Mode', 
    description: 'Deep dark theme',
    colors: {
      primary: 'bg-gray-800',
      secondary: 'bg-gray-900',
      text: 'text-gray-100',
      bubbleUser: 'bg-gray-700',
      bubbleOther: 'bg-gray-800'
    },
    preview: 'bg-gradient-to-r from-gray-900 to-black'
  },
  { 
    id: 'sunrise', 
    label: 'Sunrise', 
    description: 'Warm orange tones',
    colors: {
      primary: 'bg-gray-800', // Keep header dark
      secondary: 'bg-gray-800', // Keep input dark
      text: 'text-white', // Keep text white
      bubbleUser: 'bg-orange-500',
      bubbleOther: 'bg-amber-100',
      textUser: 'text-white',
      textOther: 'text-gray-900'
    },
    preview: 'bg-gradient-to-r from-orange-400 to-yellow-300'
  },
  { 
    id: 'ocean', 
    label: 'Ocean Blue', 
    description: 'Calm blue theme',
    colors: {
      primary: 'bg-gray-800',
      secondary: 'bg-gray-800',
      text: 'text-white',
      bubbleUser: 'bg-blue-500',
      bubbleOther: 'bg-blue-100',
      textUser: 'text-white',
      textOther: 'text-gray-800'
    },
    preview: 'bg-gradient-to-r from-blue-400 to-cyan-300'
  },
  { 
    id: 'forest', 
    label: 'Forest', 
    description: 'Natural green theme',
    colors: {
      primary: 'bg-gray-800',
      secondary: 'bg-gray-800',
      text: 'text-white',
      bubbleUser: 'bg-green-600',
      bubbleOther: 'bg-emerald-100',
      textUser: 'text-white',
      textOther: 'text-gray-800'
    },
    preview: 'bg-gradient-to-r from-green-500 to-emerald-400'
  },
  { 
    id: 'purple-dream', 
    label: 'Purple Dream', 
    description: 'Violet and pink theme',
    colors: {
      primary: 'bg-gray-800',
      secondary: 'bg-gray-800',
      text: 'text-white',
      bubbleUser: 'bg-purple-600',
      bubbleOther: 'bg-purple-100',
      textUser: 'text-white',
      textOther: 'text-gray-800'
    },
    preview: 'bg-gradient-to-r from-purple-500 to-pink-400'
  },
  { 
    id: 'midnight', 
    label: 'Midnight', 
    description: 'Deep purple and blue',
    colors: {
      primary: 'bg-gray-800',
      secondary: 'bg-gray-800',
      text: 'text-gray-100',
      bubbleUser: 'bg-indigo-800',
      bubbleOther: 'bg-gray-800',
      textUser: 'text-white',
      textOther: 'text-gray-100'
    },
    preview: 'bg-gradient-to-r from-indigo-900 to-purple-900'
  },
  { 
    id: 'minimal', 
    label: 'Minimal', 
    description: 'Light and airy',
    colors: {
      primary: 'bg-gray-800',
      secondary: 'bg-gray-800',
      text: 'text-white',
      bubbleUser: 'bg-gray-300',
      bubbleOther: 'bg-gray-100',
      textUser: 'text-gray-900',
      textOther: 'text-gray-900'
    },
    preview: 'bg-gradient-to-r from-gray-100 to-gray-300'
  }
];

const aboutSuggestions = [
  "Hey there! I am using Chat App",
  "Available for a chat",
  "Busy with work",
  "In a meeting",
  "Away from keyboard",
  "Out for a walk",
  "Listening to music",
  "Coding right now",
  "Reading a book",
  "Watching a movie",
  "Feeling productive today",
  "Let's connect!",
  "Making memories",
  "Living the dream",
  "Chasing goals"
];

const SettingsPanel = ({ currentUser, updateUserProfile }) => {
  const [userId, setUserId] = useState(currentUser?.userId || '');
  const [profilePic, setProfilePic] = useState(currentUser?.profilePic || '');
  const [wallpaper, setWallpaper] = useState(currentUser?.wallpaper || null);
  const [theme, setTheme] = useState(currentUser?.messageTheme || 'default');
  const [about, setAbout] = useState(currentUser?.about || 'Hey there! I am using Chat App');
  const [isSaving, setIsSaving] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [isUserIdEditable, setIsUserIdEditable] = useState(false);

  React.useEffect(() => {
    setUserId(currentUser?.userId || '');
    setProfilePic(currentUser?.profilePic || '');
    setWallpaper(currentUser?.wallpaper ?? null);
    setTheme(currentUser?.messageTheme || 'default');
    setAbout(currentUser?.about || 'Hey there! I am using Chat App');
    setCharCount((currentUser?.about || 'Hey there! I am using Chat App').length);
  }, [currentUser]);

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setProfilePic(reader.result);
    reader.readAsDataURL(file);
  };

  const handleAboutChange = (e) => {
    const value = e.target.value;
    if (value.length <= 100) {
      setAbout(value);
      setCharCount(value.length);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setAbout(suggestion);
    setCharCount(suggestion.length);
  };

  const handleUserIdChange = (e) => {
    const value = e.target.value;
    const sanitizedValue = value.replace(/[^a-zA-Z0-9._-]/g, '');
    setUserId(sanitizedValue);
  };

  const handleSave = async () => {
    if (about.trim().length === 0) {
      alert('About section cannot be empty');
      return;
    }

    if (!userId.trim()) {
      alert('User ID is required');
      return;
    }

    if (userId.length < 3 || userId.length > 20) {
      alert('User ID must be between 3 and 20 characters');
      return;
    }

    setIsSaving(true);
    try {
      const res = await updateUserProfile({ 
        userId: userId.trim(),
        profilePic, 
        wallpaper,
        theme,
        about
      });
      if (res.success) {
        setUserId(res.user.userId || '');
        setProfilePic(res.user.profilePic || '');
        setWallpaper(res.user.wallpaper ?? null);
        setTheme(res.user.messageTheme || 'default');
        setAbout(res.user.about || 'Hey there! I am using Chat App');
        setCharCount(res.user.about?.length || 0);
        setIsUserIdEditable(false);
        alert('Profile updated successfully!');
      } else {
        alert('Failed to update profile');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating profile');
    } finally {
      setIsSaving(false);
    }
  };

  const selectedTheme = themes.find(t => t.id === theme) || themes[0];

  const renderThemePreview = () => {
    const currentColors = selectedTheme.colors;
    return (
      <div className="mt-6 p-4 rounded-lg bg-gray-900">
        <h4 className="text-sm font-medium mb-3">Preview (Only message bubbles change)</h4>
        <div className="rounded-lg overflow-hidden bg-gray-900">
          <div className="p-3 bg-gray-800">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-gray-300 mr-3"></div>
              <div>
                <div className="font-medium text-white">John Doe</div>
                <div className="text-xs text-gray-400 opacity-80">Online</div>
              </div>
            </div>
          </div>
          
          <div className="p-4 space-y-3 bg-gray-900">
            <div className="flex justify-start">
              <div className={`max-w-xs p-3 rounded-2xl rounded-tl-none ${currentColors.bubbleOther} ${currentColors.textOther || 'text-white'}`}>
                <p className="text-sm">Hey there! How are you doing?</p>
              </div>
            </div>
            <div className="flex justify-end">
              <div className={`max-w-xs p-3 rounded-2xl rounded-tr-none ${currentColors.bubbleUser} ${currentColors.textUser || 'text-white'}`}>
                <p className="text-sm">I'm doing great! Just testing out this new theme.</p>
              </div>
            </div>
            <div className="flex justify-start">
              <div className={`max-w-xs p-3 rounded-2xl rounded-tl-none ${currentColors.bubbleOther} ${currentColors.textOther || 'text-white'}`}>
                <p className="text-sm">Looks nice! Which theme is this?</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 text-white h-full w-full overflow-y-auto">
      <h2 className="text-xl font-semibold mb-6 text-center">Settings</h2>

      {/* Profile Picture Section - Top Center */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative group">
          <div className="w-32 h-32 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden border-4 border-gray-600">
            {profilePic ? (
              <img 
                src={profilePic} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-4xl font-bold">
                {currentUser?.userId?.charAt(0).toUpperCase() || 'U'}
              </span>
            )}
          </div>
          
          <label className="absolute inset-0 rounded-full bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
            <div className="text-center p-4">
              <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm font-medium">Change Photo</span>
            </div>
            <input type="file" accept="image/*" onChange={onFileChange} className="hidden" />
          </label>
        </div>
        
        <div className="mt-4 text-center">
          <h3 className="text-2xl font-bold">{userId || 'User ID'}</h3>
          <p className="text-gray-400 mt-1">{about}</p>
          <div className="mt-2 text-sm text-gray-500">
            Database ID: {currentUser?._id?.slice(-8) || 'N/A'}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-medium mb-3">Profile Information</h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm text-gray-300">User ID</label>
                {!isUserIdEditable ? (
                  <button
                    onClick={() => setIsUserIdEditable(true)}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Edit
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setIsUserIdEditable(false);
                      setUserId(currentUser?.userId || '');
                    }}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
              {isUserIdEditable ? (
                <div className="space-y-2">
                  <input 
                    value={userId} 
                    onChange={handleUserIdChange}
                    className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none font-mono" 
                    placeholder="Enter your unique user ID"
                    maxLength={20}
                    minLength={3}
                  />
                  <div className="flex items-center text-xs text-gray-400">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    User ID must be 3-20 characters (letters, numbers, . _ -)
                  </div>
                </div>
              ) : (
                <div className="w-full p-3 rounded bg-gray-700 border border-gray-600">
                  <div className="flex items-center justify-between">
                    <code className="font-mono text-lg">{userId || 'No user ID set'}</code>
                    <button
                      onClick={() => navigator.clipboard.writeText(userId)}
                      className="text-gray-400 hover:text-white transition-colors"
                      title="Copy user ID"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="text-sm text-gray-300 block mb-2">About</label>
              <div className="relative">
                <textarea 
                  value={about}
                  onChange={handleAboutChange}
                  maxLength={100}
                  rows={3}
                  className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none resize-none"
                  placeholder="Tell others something about yourself..."
                />
                <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                  {charCount}/100
                </div>
              </div>
              
              {/* About Suggestions */}
              <div className="mt-3">
                <div className="text-sm text-gray-400 mb-2">Quick suggestions:</div>
                <div className="flex flex-wrap gap-2">
                  {aboutSuggestions.slice(0, 6).map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-medium mb-3">Message Theme</h3>
          <p className="text-sm text-gray-400 mb-4">Choose a theme for your message bubbles only</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {themes.map(t => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  theme === t.id 
                    ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-50' 
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="space-y-2">
                  <div className={`w-full h-20 rounded ${t.preview} flex items-center justify-center`}>
                    <div className="flex space-x-1">
                      <div className={`w-6 h-6 rounded-full ${t.colors.bubbleOther}`}></div>
                      <div className={`w-4 h-4 rounded-full ${t.colors.bubbleUser}`}></div>
                      <div className={`w-5 h-5 rounded-full ${t.colors.bubbleOther}`}></div>
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-sm">{t.label}</div>
                    <div className="text-xs text-gray-400 truncate">{t.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {renderThemePreview()}
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-medium mb-3">Chat Wallpaper</h3>
          <p className="text-sm text-gray-400 mb-4">Choose a background for your chat area</p>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {wallpapers.map(w => (
              <button
                key={w.id || 'def'}
                onClick={() => setWallpaper(w.id)}
                className={`relative rounded-lg overflow-hidden h-24 transition-all ${
                  w.id === wallpaper ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-800' : ''
                }`}
                title={w.label}
              >
                <div className={`w-full h-full ${w.style}`}></div>
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 p-2">
                  <div className="text-xs font-medium truncate">{w.label}</div>
                </div>
                {w.id === wallpaper && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-medium mb-3">Current Settings Preview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-900 rounded-lg p-4">
              <h4 className="text-sm font-medium mb-2">Profile Preview</h4>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                  {profilePic ? (
                    <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg font-bold">
                      {userId?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  )}
                </div>
                <div>
                  <div className="font-medium font-mono">{userId || 'User ID'}</div>
                  <div className="text-sm text-gray-400 truncate max-w-[150px]">{about}</div>
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-500">
                Database ID: {currentUser?._id?.slice(-8) || 'N/A'}
              </div>
            </div>
            <div className="bg-gray-900 rounded-lg p-4">
              <h4 className="text-sm font-medium mb-2">Selected Theme</h4>
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded ${selectedTheme.preview}`}></div>
                <div>
                  <div className="font-medium">{selectedTheme.label}</div>
                  <div className="text-sm text-gray-400">{selectedTheme.description}</div>
                </div>
              </div>
            </div>
            <div className="bg-gray-900 rounded-lg p-4">
              <h4 className="text-sm font-medium mb-2">Selected Wallpaper</h4>
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded ${
                  wallpapers.find(w => w.id === wallpaper)?.style || 'bg-gray-900'
                }`}></div>
                <div>
                  <div className="font-medium">
                    {wallpapers.find(w => w.id === wallpaper)?.label || 'Default'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-medium mb-3">Account Information</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Email</span>
              <span className="text-gray-400">{currentUser?.email || 'Not set'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Account Created</span>
              <span className="text-gray-400">
                {currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : 'Unknown'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Database ID</span>
              <div className="flex items-center gap-2">
                <code className="text-xs text-gray-400 font-mono">
                  {currentUser?._id?.slice(-8) || 'N/A'}
                </code>
                {currentUser?._id && (
                  <button
                    onClick={() => navigator.clipboard.writeText(currentUser._id)}
                    className="text-gray-400 hover:text-white transition-colors"
                    title="Copy database ID"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">User Type</span>
              <span className={`px-2 py-1 rounded text-xs ${
                currentUser?.userId 
                  ? 'bg-blue-900 text-blue-300' 
                  : 'bg-gray-700 text-gray-300'
              }`}>
                {currentUser?.userId ? 'Registered User' : 'Guest User'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4">
          <div className="text-sm text-gray-400">
            Your settings will be applied across all your devices
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              isSaving 
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
            }`}
          >
            {isSaving ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : (
              'Save All Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;