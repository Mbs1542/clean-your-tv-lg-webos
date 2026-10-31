/* Copy to personal.js (gitignored) and rebuild. personal.js ends up inside the IPK on the TV:
 * use a Jellyfin API key made for this TV alone, so it can be revoked without touching anything else. */
window.TV_PERSONAL = {
  language: 'he',
  jellyfin: {url: 'https://jellyfin.example.org', userId: '', token: ''},
  // Device-link key from link.stremio.com. Empty leaves out the continue-watching row.
  stremio: {authKey: ''},
  weather: {latitude: 32.08, longitude: 34.78},
  // Optional photo shown once after a power-on. Leave out for none.
  // intro: 'personal-intro.jpg',
  // Untouched Home: photos after afterMs, power off after offAfterMs. 0 turns either off.
  saver: {afterMs: 60000, offAfterMs: 300000, photos: ['personal-saver/01.jpg']}
};
window.CONFIG.dockApps = ['io.strem.tv', 'org.jellyfin.webos'];
