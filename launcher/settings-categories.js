/* Shared settings navigation. Service actions remain owned by each edition. */
(function (root) {
 'use strict';
 var views=[];
 var labels={
  de:['Darstellung','Erweitert'],es:['Apariencia','Avanzado'],'pt-BR':['Aparência','Avançado'],fr:['Apparence','Avancé'],it:['Aspetto','Avanzate'],
  ko:['화면 꾸미기','고급'],hi:['दिखावट','उन्नत'],pl:['Wygląd','Zaawansowane'],ru:['Внешний вид','Дополнительно'],'zh-Hans':['外观','高级'],'zh-Hant':['外觀','進階']
 };
 function t(source){
  var language=root.HomeI18n&&HomeI18n.language(),pair=labels[language];
  if(pair&&source==='Appearance')return pair[0];
  if(pair&&source==='Advanced')return pair[1];
  return root.HomeI18n?HomeI18n.t(source):source;
 }
 var paths=[
  'M3 11L12 3l9 8M5 10v11h14V10M9 21v-7h6v7',
  'M12 3a9 9 0 1 0 0 18h2a2 2 0 0 0 0-4h-1a2 2 0 0 1 0-4h4a4 4 0 0 0 4-4c0-4-5-6-9-6zM7 10h.01M10 6h.01M16 7h.01',
  'M3 5h12M9 3v2M5 5c0 6 4 10 9 12M13 5c0 6-4 10-10 13M14 21l4-10 4 10M16 17h4',
  'M20 8a8 8 0 1 0 0 8M20 3v5h-5M12 8v5l3 2',
  'M4 5h16v12H4zM8 21h8M12 17v4',
  'M8 5L2 12l6 7M16 5l6 7-6 7M14 3l-4 18'
 ];
 function attach(panel,card,groups){
  var nav=document.createElement('div'),workspace=document.createElement('div'),content=document.createElement('div');
  var heading=card.querySelector('.settings-heading'),footer=card.querySelector('.settings-footer'),tabs=[],panes=[],current=0,updateTab;
  card.classList.add('settings-workspace');workspace.className='settings-columns';nav.className='settings-categories renewal-actions';
  nav.setAttribute('role','tablist');nav.setAttribute('aria-orientation','vertical');nav.setAttribute('aria-label',t('Home settings'));
  content.className='settings-content';workspace.appendChild(nav);workspace.appendChild(content);
  card.insertBefore(workspace,heading.nextSibling);
  function actions(){return Array.prototype.filter.call(panes[current].querySelectorAll('button,[tabindex="0"]'),function(el){return !el.disabled&&!el.hidden&&el.offsetHeight>0;});}
  function enter(){var list=actions();if(list.length)list[0].focus();}
  function select(index){
   current=index;
   tabs.forEach(function(tab,i){tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;panes[i].hidden=i!==index;});
  }
  groups.forEach(function(group,i){
   var tab=document.createElement('button'),pane=document.createElement('section'),title=document.createElement('h3');
   tab.type='button';tab.setAttribute('role','tab');tab.setAttribute('data-category',group.id);tab.id='settings-tab-'+group.id;
   tab.setAttribute('aria-controls','settings-pane-'+group.id);
   var svg=document.createElementNS('http://www.w3.org/2000/svg','svg'),path=document.createElementNS('http://www.w3.org/2000/svg','path');
   svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');path.setAttribute('d',paths[i]);svg.appendChild(path);tab.appendChild(svg);
   var text=document.createElement('span');text.textContent=t(group.label);tab.appendChild(text);
   if(group.id==='updates'){
    updateTab=tab;var dot=document.createElement('span');dot.className='settings-update-dot';dot.setAttribute('aria-hidden','true');tab.appendChild(dot);
   }
   pane.className='settings-pane renewal-actions';pane.id='settings-pane-'+group.id;pane.setAttribute('role','tabpanel');pane.setAttribute('aria-labelledby',tab.id);
   title.textContent=t(group.label);pane.appendChild(title);
   group.elements.forEach(function(el){if(el)pane.appendChild(el);});
   tab.addEventListener('focusin',function(){if(document.activeElement===tab)select(i);});tab.onclick=function(){select(i);tab.focus();};
   nav.appendChild(tab);content.appendChild(pane);tabs.push(tab);panes.push(pane);
  });
  // Empty grouping wrappers have no meaning once their controls move to categories.
  Array.prototype.forEach.call(card.children,function(el){if(el!==heading&&el!==workspace&&el!==footer)el.style.display='none';});
  select(0);
  var view={panel:panel,card:card,nav:nav,setUpdateAvailable:function(available){
   if(!updateTab)return;
   updateTab.setAttribute('data-update-available',String(available));
   updateTab.setAttribute('aria-label',t(available?'Software updates. Update available.':'Software updates'));
  },open:function(){select(0);tabs[0].focus();},key:function(e){
   var key=e.keyCode,active=document.activeElement,inNav=nav.contains(active),list=actions();
   if(key===27||key===461){if(!inNav){tabs[current].focus();return true;}return false;}
   if(key===37){tabs[current].focus();return true;}
   if(key===39){if(inNav)enter();return true;}
   if(footer.contains(active)&&(key===38||key===40)){
    if(key===38&&list.length)list[list.length-1].focus();else tabs[0].focus();return true;
   }
   if(inNav){
    if(key===38||key===40){var menu=tabs.concat([footer.querySelector('button')]);menu[(current+(key===38?-1:1)+menu.length)%menu.length].focus();return true;}
    if(key===13){enter();return true;}
   }else if(key===38||key===40){var index=list.indexOf(active),targets=list.concat([footer.querySelector('button')]);targets[(index+(key===38?-1:1)+targets.length)%targets.length].focus();return true;}
   if(key===9){
    var all=tabs.concat(list).concat(Array.prototype.slice.call(footer.querySelectorAll('button'))),position=all.indexOf(active);
    all[(position+(e.shiftKey?-1:1)+all.length)%all.length].focus();return true;
   }
   // Native button activation works for both existing controls and the footer.
   if(key===13){if(!e.repeat&&active&&active.click)active.click();return true;}
   return false;
  }};
  views.push(view);return view;
 }
 document.addEventListener('keydown',function(e){
  views.forEach(function(view){if(view.panel.offsetHeight&&view.card.offsetHeight&&view.panel.contains(document.activeElement)&&view.key(e)){e.preventDefault();e.stopImmediatePropagation();}});
 },true);
 root.SettingsCategories={attach:attach};
}(window));
