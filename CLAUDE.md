# Claude Code Session Notes

## Deployment Instructions

### Building and Deploying to GitHub Pages

1. **Build the project:**
   ```bash
   npm run build
   ```
   This creates optimized files in the `dist/` folder.

2. **Copy build files to docs folder:**
   ```bash
   cp -r dist/* docs/
   ```
   GitHub Pages serves from the `docs/` folder.

3. **Commit and push changes:**
   ```bash
   git add -A
   git commit -m "Build and deploy latest changes"
   git push origin main
   ```

4. **Wait for deployment:**
   - GitHub Pages takes 1-3 minutes to update after pushing
   - Check deployment status at: https://github.com/[username]/my-cat-is-dying/actions

### Important Notes:
- Always run `npm run build` before deploying
- The `docs/` folder contains the production files served by GitHub Pages
- Don't edit files directly in `docs/` - they get overwritten on build
- Test locally with `npm run dev` before deploying

## Common Transition Issues and Fixes

### Scene 3 to 4: Background to Black Fade Issue
**Problem:** Scene 3 instantly jumps from background to black instead of smoothly fading.

**Root Cause:** Background colors need proper overlay transitions. When trying to transition from `#050510` to `#050510`, a smooth overlay technique is required.

**Solution:** Use overlay technique for smooth fade
1. Create a black overlay div that starts at `opacity: 0`
2. Fade the overlay to `opacity: 1` over 1.5 seconds
3. This creates a smooth transition from background to black

**Implementation:**
```javascript
// In scene3.js startTransitionToScene4():
const blackOverlay = document.createElement('div');
blackOverlay.className = 'scene3-black-overlay';
blackOverlay.style.position = 'absolute';
blackOverlay.style.background = '#050510';
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