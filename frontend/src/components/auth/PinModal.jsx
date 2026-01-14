import React, { useState } from 'react';

const PinModal = ({ mode = 'verify', onConfirm, onCancel }) => {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const title = mode === 'verify' ? 'Enter PIN to access archived chats' : 'Set a PIN to protect archived chats';
  const placeholder = '4-8 digits';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!/^[0-9]{4,8}$/.test(pin)) {
      setError('PIN must be 4-8 digits');
      return;
    }

    setLoading(true);
    try {
      await onConfirm(pin);
    } catch (err) {
      setError(err?.message || 'Failed to verify PIN');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-gray-800 p-6 rounded-lg w-96">
        <h3 className="text-lg font-semibold text-white mb-3">{title}</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            inputMode="numeric"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder={placeholder}
            className="w-full p-2 rounded bg-gray-700 text-white mb-2"
          />
          {error && <div className="text-sm text-red-400 mb-2">{error}</div>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onCancel} className="px-3 py-2 bg-gray-600 text-white rounded">Cancel</button>
            <button type="submit" disabled={loading} className="px-3 py-2 bg-blue-500 text-white rounded">{loading ? 'Please wait...' : (mode === 'verify' ? 'Verify PIN' : 'Set PIN')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PinModal;
