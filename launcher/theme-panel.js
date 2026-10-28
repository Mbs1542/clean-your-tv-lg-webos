/* Standard trusted theme settings and a Home-visible trial confirmation. */
(function(root){
 'use strict';var panel,card,previous,signal=null,busy=false,mode='list',tick,view=0,settingsOwner=false;
 function t(s,p){return root.HomeI18n?HomeI18n.t(s,p):s;}
 function openNow(){return !!panel&&!panel.hidden;}
 function node(tag,text){var el=document.createElement(tag);if(text!==undefined)el.textContent=t(text);return el;}
 function button(label,fn,id){var b=node('button',label);b.type='button';if(id)b.id=id;b.onclick=fn;card.appendChild(b);return b;}
 function heading(title,description){card.textContent='';card.appendChild(node('h2',title));if(description)card.appendChild(node('p',description));}
 function message(text){var e=document.getElementById('themeMessage');if(!e){e=node('p');e.id='themeMessage';e.setAttribute('role','status');card.appendChild(e);}e.textContent=t(text);}
 function focusFirst(){var b=card.querySelector('button:not([disabled]),input');if(b)b.focus();}
 function parentVisible(visible){['#renewalPanel','.root-settings'].forEach(function(id){var el=document.querySelector(id);if(el)el.style.visibility=visible?'':'hidden';});}
 function standard(){clearInterval(tick);panel.classList.remove('theme-trial');parentVisible(true);if(root.ThemeRuntime){ThemeRuntime.suspend('themes');if(settingsOwner)ThemeRuntime.suspend('settings');}}
 function close(){var version=++view;if(signal){signal.cancelled=true;if(signal.cancel)signal.cancel();signal=null;}busy=false;root.ThemeManager.cancel().then(function(){if(version!==view)return;standard();panel.hidden=true;if(root.ThemeRuntime)ThemeRuntime.resume('themes');if(previous)previous.focus();});}

 function failed(e){if(!openNow())return;view++;busy=false;standard();heading('Themes');message(e.message);button('Restore Classic',function(){root.ThemeManager.reset();render();});button('Back',close);focusFirst();}
 function trial(item){busy=true;mode='preparing';heading('Preparing theme…');var version=++view;button('Cancel',revert);root.ThemeManager.begin(item).then(function(){if(version!==view)return;busy=false;mode='trial';panel.classList.add('theme-trial');parentVisible(false);root.ThemeRuntime.resume('themes');root.ThemeRuntime.resume('settings');heading('Keep this theme?');var timer=node('p');timer.id='themeCountdown';card.appendChild(timer);
   function count(){timer.textContent=t('Reverting in {count} seconds',{count:root.ThemeManager.remaining()});}count();tick=setInterval(count,250);
   button('Keep theme',function(){root.ThemeManager.confirm().then(render,failed);},'themeKeep');button('Revert',revert,'themeRevert');focusFirst();
  },function(e){if(version===view)failed(e);});}
 function revert(){var version=++view;mode='rollback';heading('Reverting…');button('Restore Classic',function(){root.ThemeManager.reset();render();});button('Back',close);focusFirst();root.ThemeManager.cancel().then(function(){if(version===view)render();},function(e){if(version===view)failed(e);});}
 function render(){if(!openNow())return;standard();mode='list';busy=true;var version=++view;heading('Themes','Choose a theme for Home. Settings stay standard.');message('Loading themes…');button('Restore Classic',function(){root.ThemeManager.reset();render();});button('Back',close);
  root.ThemeManager.list().then(function(items){if(version!==view)return;busy=false;heading('Themes','Choose a theme for Home. Settings stay standard.');var current=root.ThemeManager.current();if(current.notice)message(current.notice);
   items.forEach(function(item){var row=node('div');row.className='theme-option';card.appendChild(row);var b=node('button');b.type='button';b.textContent=item.title+(item.version?' · '+item.version:'')+(item.id===current.id&&(!item.digest||item.digest===current.digest)?' · '+t('Selected'):'');b.onclick=function(){trial(item);};row.appendChild(b);row.appendChild(node('small',item.builtin?'Built-in': 'Downloaded'));if(!item.builtin){var meta=node('p',item.author+' · '+item.license);meta.className='theme-meta';row.appendChild(meta);}
    if(!item.builtin){var remove=node('button','Remove');remove.onclick=function(){var requestView=view;root.ThemeManager.remove(item).then(function(){if(requestView===view)render();},function(e){if(requestView===view)message(e.message);});};row.appendChild(remove);}
   });
   button('Add by URL',urlForm,'themeAddUrl');button('Restore Classic',function(){root.ThemeManager.reset();render();},'themeReset');button('Clear downloaded themes',function(){view++;mode='clear';heading('Clear downloaded themes','Classic will be restored. Downloaded themes will be removed.');button('Clear',function(){var requestView=++view;root.ThemeManager.reset();root.ThemeStore.clear().then(function(){if(requestView===view)render();},function(e){if(requestView===view)failed(e);});});button('Cancel',render);focusFirst();});button('Back',close);focusFirst();
  },function(e){if(version===view)failed(e);});
 }
 function urlForm(){view++;mode='url';heading('Add by URL','Paste a public GitHub repository or a commit-pinned theme link.');var label=node('label','Theme URL');var input=node('input');input.id='themeUrl';input.type='url';input.maxLength=1000;input.autocomplete='off';label.appendChild(input);card.appendChild(label);button('Load',function(){loadUrl(input.value);},'themeLoad');button('Back',render);input.focus();}
 function loadUrl(url){busy=true;mode='download';signal={cancelled:false};var version=++view;heading('Add by URL');message('Checking theme source…');button('Cancel',function(){if(signal){signal.cancelled=true;if(signal.cancel)signal.cancel();}view++;busy=false;render();});
  root.ThemeManager.resolve(url,signal).then(function(entries){if(version!==view)return;busy=false;mode='collection';heading('Choose a theme');if(!entries.length)message('This collection is empty');entries.forEach(function(entry){button(entry.title+' · '+entry.version,function(){download(entry);});});button('Back',render);focusFirst();},function(e){if(version===view)failed(e);});}
 function download(entry){busy=true;mode='download';signal={cancelled:false};var version=++view;heading('Add by URL');message('Downloading theme…');button('Cancel',function(){signal.cancelled=true;if(signal.cancel)signal.cancel();view++;busy=false;render();});
  root.ThemeManager.install(entry,signal,function(i,total){if(version===view)message(t('Downloading file {count} of {total}',{count:i,total:total}));}).then(function(){if(version!==view)return;busy=false;render();},function(e){if(version===view)failed(e);});
 }
 function build(){panel=node('section');panel.id='homeThemePanel';panel.hidden=true;panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-label',t('Themes'));card=node('div');card.className='theme-settings-card';panel.appendChild(card);document.body.appendChild(panel);}
 document.addEventListener('keydown',function(e){if(!openNow())return;var key=e.keyCode;if([9,13,27,37,38,39,40,461].indexOf(key)<0)return;
  if(e.target.tagName==='INPUT'&&[13,37,39].indexOf(key)>=0){e.stopImmediatePropagation();return;}
  e.preventDefault();e.stopImmediatePropagation();if(key===27||key===461){if(mode==='trial'||mode==='preparing')revert();else if(mode==='rollback')close();else if(mode==='list')close();else{if(signal){signal.cancelled=true;if(signal.cancel)signal.cancel();}view++;render();}return;}
  var controls=Array.prototype.slice.call(card.querySelectorAll('button:not([disabled]),input')),index=controls.indexOf(document.activeElement);
  if(key===13){if(e.repeat)return;if(e.target.tagName==='INPUT')loadUrl(e.target.value);else if(controls[index])controls[index].click();return;}
  if(controls.length)controls[(index+(key===37||key===38||key===9&&e.shiftKey?-1:1)+controls.length)%controls.length].focus();
 },true);
 document.addEventListener('keyup',function(e){if(openNow()&&e.target.tagName==='INPUT'&&e.keyCode===13){e.stopImmediatePropagation();return;}if(openNow()&&[13,27,37,38,39,40,461].indexOf(e.keyCode)>=0){e.preventDefault();e.stopImmediatePropagation();}},true);
 document.addEventListener('focusin',function(e){if(openNow()&&!panel.contains(e.target))focusFirst();},true);
 document.addEventListener('home-theme-change',function(){if(openNow()&&mode==='trial'&&!root.ThemeManager.current().trial)render();});
 document.addEventListener('visibilitychange',function(){if(document.hidden&&root.ThemeManager.current().trial)root.ThemeManager.cancel();});
 root.HomeThemePanel={isOpen:openNow,open:function(){if(openNow())return;if(!panel)build();previous=document.activeElement;settingsOwner=!!(root.RenewalPanel&&root.RenewalPanel.isOpen());panel.hidden=false;render();}};
}(this));
