import React, { useState } from 'react';
import ringtone from '../../utils/ringtone';
import { downloadRingtone } from '../../utils/createRingtone';

const RingtoneSettings = ({ isOpen, onClose }) => {
  const [selectedRingtone, setSelectedRingtone] = useState('default');
  const [volume, setVolume] = useState(0.5);
  const [isTestPlaying, setIsTestPlaying] = useState(false);

  const ringtoneOptions = [
    { id: 'default', name: 'Classic Phone Ring', description: 'Traditional phone ringtone' },
    { id: 'simple', name: 'Simple Beep', description: 'Simple beeping sound' },
    { id: 'custom', name: 'Custom File', description: 'Upload your own ringtone' }
  ];

  const handleTestRingtone = () => {
    setIsTestPlaying(true);
    
    if (selectedRingtone === 'simple') {
      ringtone.playSimpleBeep();
    } else {
      ringtone.play();
    }
    
    // Stop after 3 seconds
    setTimeout(() => {
      ringtone.stop();
      setIsTestPlaying(false);
    }, 3000);
  };

  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
    ringtone.setVolume(newVolume);
  };

  const handleDownloadRingtone = async () => {
    try {
      await downloadRingtone();
    } catch (error) {
      console.error('Failed to download ringtone:', error);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('audio/')) {
      // Handle custom ringtone file
      console.log('Custom ringtone uploaded:', file.name);
      setSelectedRingtone('custom');
    } else {
      alert('Please select a valid audio file');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-white text-xl font-semibold">Ringtone Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Ringtone Selection */}
        <div className="mb-6">
          <h3 className="text-white font-medium mb-3">Choose Ringtone</h3>
          <div className="space-y-2">
            {ringtoneOptions.map((option) => (
              <label key={option.id} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="ringtone"
                  value={option.id}
                  checked={selectedRingtone === option.id}
                  onChange={(e) => setSelectedRingtone(e.target.value)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="text-white font-medium">{option.name}</div>
                  <div className="text-gray-400 text-sm">{option.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Custom File Upload */}
        {selectedRingtone === 'custom' && (
          <div className="mb-6">
            <label className="block text-white font-medium mb-2">
              Upload Custom Ringtone
            </label>
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
            />
            <p className="text-gray-400 text-xs mt-1">
              Supported formats: MP3, WAV, OGG
            </p>
          </div>
        )}

        {/* Volume Control */}
        <div className="mb-6">
          <label className="block text-white font-medium mb-2">
            Volume: {Math.round(volume * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

        {/* Test Button */}
        <div className="mb-6">
          <button
            onClick={handleTestRingtone}
            disabled={isTestPlaying}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {isTestPlaying ? 'Playing...' : 'Test Ringtone'}
          </button>
        </div>

        {/* Download Button */}
        <div className="mb-6">
          <button
            onClick={handleDownloadRingtone}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Download Sample Ringtone
          </button>
        </div>

        {/* Save Button */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              // Save settings logic here
              console.log('Settings saved:', { selectedRingtone, volume });
              onClose();
            }}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default RingtoneSettings; 