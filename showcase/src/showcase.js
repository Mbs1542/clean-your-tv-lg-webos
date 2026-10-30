(function () {
  'use strict';
  var search = document.getElementById('search');
  if (search) {
    var grid = document.getElementById('themes');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-theme]'));
    var style = document.getElementById('style'), api = document.getElementById('api'), sort = document.getElementById('sort');
    function filter() {
      var query = search.value.trim().toLowerCase(), count = 0;
      cards.slice().sort(function (a, b) {
        var field = sort.value === 'recent' ? 'data-added' : 'data-updated';
        return sort.value === 'curated' ? cards.indexOf(a) - cards.indexOf(b) : b.getAttribute(field).localeCompare(a.getAttribute(field));
      }).forEach(function (card, index) {
        card.hidden = !(card.getAttribute('data-title').indexOf(query) >= 0 && (!style.value || card.getAttribute('data-tags').split(' ').indexOf(style.value) >= 0) && (!api.value || card.getAttribute('data-api') === api.value));
        if (!card.hidden) count++;
        // Preserve a pending click when search change fires on input blur.
        if (grid.children[index] !== card) grid.insertBefore(card, grid.children[index] || null);
      });
      document.getElementById('result-count').textContent = count + (count === 1 ? ' theme' : ' themes');
      document.getElementById('no-results').hidden = count !== 0;
    }
    [search,style,api,sort].forEach(function (control) { control.addEventListener('input',filter); control.addEventListener('change',filter); });
    document.querySelector('.filters').addEventListener('submit',function (event) { event.preventDefault(); });
  }
  var copy = document.querySelector('[data-copy]');
  if (copy) copy.addEventListener('click',function () {
    var input = document.querySelector('.tv-link'), status = document.querySelector('[data-copy-status]');
    input.focus(); input.select();
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(input.value).then(function () { status.textContent = 'Copied the reviewed TV link.'; },function () { status.textContent = 'Select the URL above and copy it manually.'; });
    else status.textContent = 'Select the URL above and copy it manually.';
  });
}());
