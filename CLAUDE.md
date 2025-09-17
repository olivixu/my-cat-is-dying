# Claude Code Session Notes

## Common Transition Issues and Fixes

### Scene 3 to 4: Navy to Black Fade Issue
**Problem:** Scene 3 instantly jumps from navy gradient to black instead of smoothly fading.

**Root Cause:** CSS gradients cannot animate to solid colors. When trying to transition from `linear-gradient(180deg, #0a0a1f 0%, #050510 100%)` to solid `#000000`, browsers jump instantly.

**Solution:** Use overlay technique for smooth fade
1. Create a black overlay div that starts at `opacity: 0`
2. Fade the overlay to `opacity: 1` over 1.5 seconds
3. This creates a smooth transition from navy gradient to black

**Implementation:**
```javascript
// In scene3.js startTransitionToScene4():
const blackOverlay = document.createElement('div');
blackOverlay.className = 'scene3-black-overlay';
blackOverlay.style.position = 'absolute';
blackOverlay.style.background = '#000000';
blackOverlay.style.opacity = '0';
blackOverlay.style.transition = 'opacity 1.5s ease-out';
this.element.appendChild(blackOverlay);
// Force reflow then fade in
blackOverlay.offsetHeight;
blackOverlay.style.opacity = '1';
```

### General Transition Best Practices
1. **Avoid animating between gradients and solid colors** - Use overlay techniques instead
2. **Be careful with double-fade effects** - Check if both container and content have fade animations
3. **Scene 6 approach works well** - No fade on container, transparent background, let content fade in separately

## Code Locations

### Scene 3 (/Users/oliviaxu/my-cat-is-dying/js/scenes/scene3.js)
- Lines 395-413: Black overlay fade implementation in `startTransitionToScene4()`

### SceneManager (/Users/oliviaxu/my-cat-is-dying/js/sceneManager.js)
- Added transition queue system to prevent race conditions
- Lines 258-264: Special handling for Scene 3 to 4 transition

## Testing Checklist
After making transition changes, verify:
- [ ] Scene 3 fades smoothly from navy to black (no instant jump)
- [ ] Scene 4 fades in properly from black
- [ ] No double-fade effects in scene transitions
- [ ] Navigation dots work without showing black screens