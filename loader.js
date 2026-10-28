(async function boot() {
  try {
    // Добавляем ?v=Дата, чтобы браузер не кэшировал список модов
    const assetManifest = await (await fetch('assets/manifest.json?v=' + Date.now())).json();
    Reg.loadAssets(assetManifest);

    const modManifest = await (await fetch('mods/manifest.json?v=' + Date.now())).json();
    for (const mod of modManifest.mods) {
      await loadScript('mods/' + mod + '?v=' + Date.now());
    }

    await loadScript('core.js?v=' + Date.now());
    
    if (window.BootGame) window.BootGame();
  } catch (e) {
    document.body.innerHTML = '<pre style="color:#ff5555;padding:20px;font-size:12px;">Ошибка загрузки:\n' + e.message + '</pre>';
    console.error(e);
  }
})();

function loadScript(src) {
  return new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = res;
    s.onerror = () => rej(new Error('Не загрузился файл: ' + src));
    document.head.appendChild(s);
  });
}
