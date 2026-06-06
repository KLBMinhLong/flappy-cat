// ==================== ADMOB INTEGRATION ====================
// AdMob for Flappy Cat - Capacitor Plugin
// Test IDs will be replaced with real ones before production

const ADMOB = {
  // Test ad unit IDs (Google provides these for development)
  banner: 'ca-app-pub-3940256099942544/6300978111',
  interstitial: 'ca-app-pub-3940256099942544/1033173712',
  rewarded: 'ca-app-pub-3940256099942544/5224354917',
  
  // Production IDs (replace before publishing)
  // banner: 'ca-app-pub-XXXX/XXXX',
  // interstitial: 'ca-app-pub-XXXX/XXXX',
  // rewarded: 'ca-app-pub-XXXX/XXXX',
};

let admobReady = false;
let gamesSinceLastAd = 0;
const SHOW_INTERSTITIAL_EVERY = 3; // Show interstitial every 3 games
let rewardedCallback = null;

// Initialize AdMob
async function initAdMob() {
  try {
    if (typeof AdMob === 'undefined') {
      console.log('AdMob plugin not available (running in browser)');
      return;
    }
    
    await AdMob.initialize({
      testingDevices: [],
      initializeForTesting: true, // Set to false in production
    });
    
    admobReady = true;
    console.log('AdMob initialized successfully');
    
    // Pre-load interstitial and rewarded ads
    await loadInterstitial();
    await loadRewarded();
    
    // Show banner
    await showBanner();
  } catch (err) {
    console.error('AdMob init error:', err);
  }
}

// Show banner ad at bottom
async function showBanner() {
  if (!admobReady) return;
  try {
    await AdMob.showBanner({
      adId: ADMOB.banner,
      position: 'bottom',
      margin: 0,
      // Don't overlap game content
    });
  } catch (err) {
    console.error('Banner error:', err);
  }
}

// Hide banner
async function hideBanner() {
  if (!admobReady) return;
  try {
    await AdMob.hideBanner();
  } catch (err) {
    console.error('Hide banner error:', err);
  }
}

// Load interstitial ad
async function loadInterstitial() {
  if (!admobReady) return;
  try {
    await AdMob.prepareInterstitial({
      adId: ADMOB.interstitial,
    });
  } catch (err) {
    console.error('Interstitial load error:', err);
  }
}

// Show interstitial (call after game over)
async function showInterstitial() {
  if (!admobReady) return;
  try {
    gamesSinceLastAd++;
    if (gamesSinceLastAd >= SHOW_INTERSTITIAL_EVERY) {
      await AdMob.showInterstitial();
      gamesSinceLastAd = 0;
      // Pre-load next one
      setTimeout(() => loadInterstitial(), 1000);
    }
  } catch (err) {
    console.error('Interstitial show error:', err);
  }
}

// Load rewarded ad
async function loadRewarded() {
  if (!admobReady) return;
  try {
    await AdMob.prepareRewardVideoAd({
      adId: ADMOB.rewarded,
    });
  } catch (err) {
    console.error('Rewarded load error:', err);
  }
}

// Show rewarded ad (watch to continue after death)
async function showRewarded(callback) {
  if (!admobReady) {
    // If no AdMob, just call callback (for browser testing)
    if (callback) callback();
    return;
  }
  
  rewardedCallback = callback;
  
  try {
    // Set up event listener for reward
    AdMob.addListener('onRewardedVideoAdCompleted', () => {
      console.log('User earned reward!');
      if (rewardedCallback) {
        rewardedCallback();
        rewardedCallback = null;
      }
    });
    
    AdMob.addListener('onRewardedVideoAdClosed', () => {
      // User closed without watching fully
      rewardedCallback = null;
      loadRewarded(); // Pre-load next
    });
    
    await AdMob.showRewardVideoAd();
  } catch (err) {
    console.error('Rewarded show error:', err);
    // Fallback: still allow continue
    if (callback) callback();
  }
}

// Export for use in game
window.AdMobIntegration = {
  init: initAdMob,
  showBanner,
  hideBanner,
  showInterstitial,
  showRewarded,
  loadRewarded,
};
