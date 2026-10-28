(function patchReg() {
  if (window._hookPriorityPatched) return;
  window._hookPriorityPatched = true;

  const _hooks = new Map();

  Reg.on = function (hook, fn, opts = {}) {
    if (!_hooks.has(hook)) _hooks.set(hook, []);
    const list = _hooks.get(hook);
    list.push({ fn, priority: opts.priority ?? 50, order: list.length });
    list.sort((a, b) => a.priority - b.priority || a.order - b.order);
  };

  Reg.fire = function (hook, ...args) {
    const list = _hooks.get(hook);
    if (!list) return;
    for (const h of list) {
      try { h.fn(...args); }
      catch (e) { console.error(`[Reg.fire ${hook}]`, e); }
    }
  };
  
  console.log('[Architecture] Приоритеты хуков активированы.');
})();
