'use strict';
module.exports=function(apps){
 var previous=null,gapSince=null,backSince=null,backUntil=0,backConsumed=false;
 // apps.json is a snapshot from setup. An app installed later must not strand the viewer in LG Home:
 // only LG's own screens, such as an HDMI input, rely on the list.
 function watched(id){
  if(apps.indexOf(id)!==-1)return true;
  return !!id&&!/^com\.(webos|palm|lge)\./.test(id)&&id!=='com.gathin.tvhome'&&id!=='com.local.nativehome';
 }
 function clearBack(){backSince=null;backUntil=0;backConsumed=false;}
 return {
  reset:function(){previous=null;gapSince=null;clearBack();},
  clearBack:clearBack,
  back:function(down,now){
   if(down){if(backSince===null){backSince=now;backUntil=0;backConsumed=false;}}
   else {if(backSince!==null&&!backConsumed&&now-backSince>=700&&now-backSince<=10000)backUntil=now+2500;backSince=null;}
  },
  next:function(id,now){
   // webOS briefly reports no foreground app between app exit and LG Home.
   // Keep that origin only for a bounded gap; any real intermediate app resets it.
   if(id===''){
    if(gapSince===null)gapSince=now;
    return false;
   }
   if(id==='com.gathin.tvhome')clearBack();
   var intentionalHome=id==='com.webos.app.home'&&!backConsumed&&
    ((backSince!==null&&now-backSince>=700&&now-backSince<=10000)||(backUntil>0&&now<=backUntil));
   if(intentionalHome){backConsumed=true;backUntil=0;}
   var redirect=!intentionalHome&&id==='com.webos.app.home'&&watched(previous)&&
    (gapSince===null||now-gapSince<=2500);
   previous=id;gapSince=null;return redirect;
  }
 };
};
