// Runs synchronously in <head> (no defer) so the saved theme is applied before first paint.
// Pages load it as: <script src="js/theme-init.js"></script>
// DEFAULT_THEME: 'light' | 'dark' | 'auto' (auto follows the operating system).
(function () {
  var DEFAULT_THEME = 'auto';
  var stored = null;
  try { stored = localStorage.getItem('theme'); } catch (error) { /* storage blocked: use default */ }
  document.documentElement.dataset.theme = stored === 'light' || stored === 'dark' ? stored : DEFAULT_THEME;
})();
