// Lucid Lux key: levels 11 and up need it once the shop is on (see /shop.js). Backing out returns to the menu.
const llGate = window.LL && LL.gate ? LL.gate({ what: 'levels 11 and up', back: 'Back to the menu' }) : null;
if (llGate) {
  const beginLevelFree = game.beginLevel.bind(game);
  game.beginLevel = function (idx) {
    const r = beginLevelFree(idx);
    if (idx >= 10 && llGate.locked()) llGate.check().then(function (ok) { if (!ok) location.reload(); });
    return r;
  };
}
