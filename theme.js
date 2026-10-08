// Restore the chosen appearance before styles paint; light is the default.
try {
  if (localStorage.getItem('nei-theme') === 'dark') {
    document.documentElement.dataset.theme = 'dark';
    document.querySelector('meta[name="theme-color"]').content = '#211e1e';
  }
} catch { /* The toggle still works when browser storage is unavailable. */ }
