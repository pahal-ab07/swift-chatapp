# 🎵 Ringtone Feature Documentation

## Overview
The ringtone feature provides customizable audio notifications for incoming video calls. It includes both programmatically generated ringtones and support for custom audio files.

## Features

### 🎼 Built-in Ringtones
- **Classic Phone Ring**: Traditional phone ringtone pattern (800Hz/600Hz alternating)
- **Simple Beep**: Basic beeping sound for minimal audio
- **Custom File**: Upload your own audio file

### 🔊 Volume Control
- Adjustable volume from 0% to 100%
- Real-time volume preview
- Settings persist during the session

### ⚙️ Settings Interface
- Easy-to-use modal interface
- Test ringtone functionality
- Download sample ringtone option

## Implementation Details

### Core Files

#### 1. `frontend/src/utils/ringtone.js`
**Main ringtone utility using Web Audio API**

```javascript
// Key features:
- Web Audio API integration
- Volume control support
- Multiple ringtone patterns
- Automatic cleanup
```

**Methods:**
- `play()` - Start classic ringtone
- `playSimpleBeep()` - Start simple beep pattern
- `stop()` - Stop current ringtone
- `setVolume(volume)` - Adjust volume (0-1)

#### 2. `frontend/src/components/video/RingtoneSettings.jsx`
**Settings interface component**

```javascript
// Features:
- Ringtone selection
- Volume slider
- Test functionality
- File upload support
- Download option
```

#### 3. `frontend/src/components/video/IncomingCall.jsx`
**Incoming call modal with ringtone integration**

```javascript
// Integration:
- Automatic ringtone start on incoming call
- Ringtone stop on accept/reject
- 30-second auto-reject with ringtone
```

### Audio Generation

#### Classic Phone Ring Pattern
```
Tone 1: 800Hz for 0.5s
Pause: 0.2s
Tone 2: 600Hz for 0.5s
Pause: 0.2s
Repeat...
```

#### Simple Beep Pattern
```
Beep: 800Hz for 0.1s
Pause: 0.1s
Repeat...
```

## Usage

### For Users

1. **Access Settings**: Click the settings icon in the navigation
2. **Choose Ringtone**: Select from available options
3. **Adjust Volume**: Use the slider to set preferred volume
4. **Test**: Click "Test Ringtone" to preview
5. **Save**: Click "Save Settings" to apply changes

### For Developers

#### Basic Usage
```javascript
import ringtone from '../utils/ringtone';

// Start ringtone
ringtone.play();

// Stop ringtone
ringtone.stop();

// Set volume
ringtone.setVolume(0.7);
```

#### Integration with Video Calls
```javascript
// In incoming call component
useEffect(() => {
  if (isOpen) {
    ringtone.play(); // Start ringtone
  } else {
    ringtone.stop(); // Stop ringtone
  }
}, [isOpen]);
```

## Browser Compatibility

### Web Audio API Support
- ✅ Chrome 14+
- ✅ Firefox 23+
- ✅ Safari 6+
- ✅ Edge 12+

### Fallback Support
- Audio file playback for older browsers
- Graceful degradation for unsupported features

## Customization

### Adding New Ringtone Patterns

1. **Extend the Ringtone class**:
```javascript
// Add new method
playCustomPattern() {
  // Your custom pattern logic
}
```

2. **Update settings component**:
```javascript
const ringtoneOptions = [
  // ... existing options
  { id: 'custom-pattern', name: 'Custom Pattern', description: 'Your description' }
];
```

### Custom Audio Files

Supported formats:
- MP3
- WAV
- OGG
- AAC

File size limit: 5MB

## Performance Considerations

### Memory Management
- Automatic cleanup of audio contexts
- Proper disposal of oscillators and gain nodes
- Memory leak prevention

### Audio Context Handling
- Lazy initialization
- User interaction requirement compliance
- Browser autoplay policy adherence

## Troubleshooting

### Common Issues

1. **No Sound on Incoming Call**
   - Check browser permissions
   - Ensure user has interacted with page
   - Verify audio context is initialized

2. **Volume Not Working**
   - Check if volume is set to 0
   - Verify browser volume settings
   - Test with different browsers

3. **Custom File Not Playing**
   - Check file format compatibility
   - Verify file size limits
   - Ensure proper file upload

### Debug Mode
```javascript
// Enable debug logging
localStorage.setItem('ringtone-debug', 'true');
```

## Future Enhancements

### Planned Features
- [ ] Multiple ringtone themes
- [ ] Ringtone scheduling
- [ ] Contact-specific ringtones
- [ ] Vibration support
- [ ] Advanced audio effects

### Technical Improvements
- [ ] WebAssembly audio processing
- [ ] Audio worklet integration
- [ ] Spatial audio support
- [ ] Audio compression optimization

## Security Considerations

### Audio Permissions
- User consent required for audio playback
- Secure context requirements
- Privacy protection measures

### File Upload Security
- File type validation
- Size limit enforcement
- Malicious file prevention

## Testing

### Manual Testing Checklist
- [ ] Ringtone plays on incoming call
- [ ] Volume control works
- [ ] Settings persist correctly
- [ ] Custom file upload functions
- [ ] Test button works
- [ ] Auto-reject stops ringtone
- [ ] Multiple browser compatibility

### Automated Testing
```javascript
// Example test structure
describe('Ringtone Feature', () => {
  test('should play ringtone on incoming call', () => {
    // Test implementation
  });
  
  test('should stop ringtone on call end', () => {
    // Test implementation
  });
});
```

## Deployment Notes

### Production Considerations
- Minify audio processing code
- Optimize bundle size
- CDN for audio files
- Fallback mechanisms

### Environment Variables
```bash
# Optional: Custom ringtone settings
RINGTONE_DEFAULT_VOLUME=0.5
RINGTONE_AUTO_REJECT_TIMEOUT=30000
```

---

## Support

For issues or questions about the ringtone feature:
1. Check browser console for errors
2. Verify browser compatibility
3. Test with different audio settings
4. Review this documentation

**Happy Ringing! 🎵📞** 