/* Copy to personal.js (gitignored) and rebuild. personal.js ends up inside the IPK on the TV:
 * use a Jellyfin API key made for this TV alone, so it can be revoked without touching anything else. */
window.TV_PERSONAL = {
  language: 'he',
  jellyfin: {url: 'https://jellyfin.example.org', userId: '', token: ''},
  weather: {latitude: 31.25, longitude: 34.79},
  // Untouched Home: photos after afterMs, power off after offAfterMs. 0 turns either off.
  saver: {afterMs: 60000, offAfterMs: 300000, photos: ['personal-saver/01.jpg']}
};
window.CONFIG.dockApps = ['io.strem.tv', 'org.jellyfin.webos'];
