/* Display-only: keep a number and its unit together in RTL prose. No input/export conversion. */
(function(){
 'use strict';
 var excluded='script,style,textarea,input,select,option,svg,math,code,pre,bdi,.measurement-unit,[contenteditable="true"]';
 var pattern=/[+−-]?[0-9۰-۹]+(?:[.,٫][0-9۰-۹]+)?\s*(?:mm|mil|inch|in)(?![A-Za-z])/g;
 function isolate(root){
  if(!root||root.nodeType!==1||root.closest(excluded))return;
  var walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:function(n){return n.parentElement&&!n.parentElement.closest(excluded)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT}}),nodes=[],n;
  while((n=walker.nextNode()))nodes.push(n);
  nodes.forEach(function(node){var value=node.nodeValue,m,last=0,fragment=document.createDocumentFragment(),found=false;pattern.lastIndex=0;
   while((m=pattern.exec(value))){found=true;fragment.appendChild(document.createTextNode(value.slice(last,m.index)));var group=document.createElement('bdi');group.className='measurement-unit';group.dir='ltr';group.textContent=m[0];fragment.appendChild(group);last=pattern.lastIndex;}
   if(found){fragment.appendChild(document.createTextNode(value.slice(last)));node.replaceWith(fragment)}
  });
 }
 function start(){isolate(document.body);new MutationObserver(function(records){var roots=new Set();records.forEach(function(r){if(r.type==='characterData')roots.add(r.target.parentElement);else{r.addedNodes.forEach(function(n){roots.add(n.nodeType===1?n:n.parentElement)})}});roots.forEach(isolate)}).observe(document.body,{childList:true,subtree:true,characterData:true})}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
