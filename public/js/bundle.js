!function(e){var t={};function n(s){if(t[s])return t[s].exports;var o=t[s]={i:s,l:!1,exports:{}};return e[s].call(o.exports,o,o.exports,n),o.l=!0,o.exports}n.m=e,n.c=t,n.d=function(e,t,s){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:s})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var s=Object.create(null);if(n.r(s),Object.defineProperty(s,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)n.d(s,o,function(t){return e[t]}.bind(null,o));return s},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=0)}([function(e,t,n){const s=io("/"),{handleParticipants:o,handleMessages:r,handleMicrophone:a,handleVideo:i,handleSidebar:c}=n(1);let d="3001",l=!1,u="/";"3000"!==location.port&&(u="peerjs-server.herokuapp.com",l=!0,d="443");const m=new Peer(void 0,{host:u,secure:l,port:d}),p=document.querySelector("#chat-message"),h=document.querySelector("#send-btn"),v=document.querySelector("#messages"),f=document.querySelector(".mute-btn"),g=document.querySelector(".video-btn"),{username:b,room:y}=Qs.parse(location.search,{ignoreQueryPrefix:!0}),L=document.getElementById("video-grid"),E=document.createElement("video");E.muted=!0;const S={};let M,T="";navigator.mediaDevices.getUserMedia({video:!0,audio:!0}).then(e=>{x(E,e),M=e,m.on("call",t=>{t.answer(e);const n=document.createElement("video");t.on("stream",e=>{x(n,e)})}),s.on("user-connected",t=>{k(t,e)})}),s.on("user-disconnected",e=>{S[e]&&S[e].close()}),m.on("open",e=>{s.emit("join",{username:b,room:y,peerId:e},e=>{e&&(alert(e),location.href="/")}),T=e});const k=(e,t)=>{const n=m.call(e,t),s=document.createElement("video");n.on("stream",e=>{x(s,e)}),n.on("close",()=>{s.remove()}),S[e]=n},x=(e,t)=>{e.srcObject=t,e.addEventListener("loadedmetadata",()=>{e.play()}),L.append(e)};document.querySelector(".leave-btn").addEventListener("click",(function(){window.location.href="/"}));const H=e=>{s.emit("sendMessage",e,e=>{if(h.removeAttribute("disabled"),p.value="",p.focus(),e)return console.log(e);console.log("message delivered.")})};s.on("message",e=>{r(e,T,v)}),s.on("participants",({room:e,users:t})=>{const n=s.id;o(e,t,n)}),p.addEventListener("keypress",e=>{"Enter"!=e.key||e.shiftKey||(e.preventDefault(),H(p.value))}),h.addEventListener("click",e=>{e.preventDefault(),H(p.value)}),f.addEventListener("click",()=>{const e=M.getAudioTracks()[0].enabled;e?(s.emit("mute-mic"),a(e,M,f)):(s.emit("unmute-mic"),a(e,M,f))}),g.addEventListener("click",()=>{const e=M.getVideoTracks()[0].enabled;e?(s.emit("stop-video"),i(e,M,g)):(s.emit("play-video"),i(e,M,g))}),document.querySelectorAll("[data-toggle-sidebar]").forEach(e=>{c(e)})},function(e,t,n){const s=n(2),o=document.getElementById("chat-side-bar"),r=document.getElementById("room-users-side-bar"),a=()=>{o.classList.remove("screen-hide"),r.classList.remove("screen-hide")};e.exports={handleParticipants:(e,t,n)=>{const s=document.querySelector(".room-users-box"),o=document.getElementById("users");o.innerHTML="",o.textContent="",t.forEach(e=>{const t=document.createElement("li");t.className="user",t.innerHTML=`\n            <div class="user-avatar">${e.username[0].toUpperCase()}</div>\n            <span class="user-name">${e.username}${e.id==n?" (You)":""}</span>\n            <div class="user-media">\n                <i class="fas fa-microphone${!1===e.audio?"-slash":""}"></i>\n                <i class="fas fa-video${!1===e.video?"-slash":""}"></i>\n            </div>\n        `,o.append(t),s.scrollTop=s.scrollHeight})},handleMicrophone:(e,t,n)=>{e?(t.getAudioTracks()[0].enabled=!1,n.children[0].classList.remove("fa-microphone"),n.children[0].classList.add("fa-microphone-slash"),n.children[1].innerHTML="Unmute"):(t.getAudioTracks()[0].enabled=!0,n.children[0].classList.remove("fa-microphone-slash"),n.children[0].classList.add("fa-microphone"),n.children[1].innerHTML="Mute")},handleVideo:(e,t,n)=>{e?(t.getVideoTracks()[0].enabled=!1,n.children[0].classList.remove("fa-video"),n.children[0].classList.add("fa-video-slash"),n.children[1].innerHTML="Play Video"):(t.getVideoTracks()[0].enabled=!0,n.children[0].classList.remove("fa-video-slash"),n.children[0].classList.add("fa-video"),n.children[1].innerHTML="Stop Video")},handleMessages:(e,t,n)=>{const o=document.createElement("li");o.className=e.peerId===t?"message-right":"message-left",o.innerHTML=`\n        ${e.peerId!==t?"<div class='message-avatar'>"+e.username[0].toUpperCase()+"</div>":""}\n        <div class="message-content">\n            ${e.peerId!==t?"<span>"+e.username+"</span>":""}\n            <div class="message-text"><span>${e.text}<span></div>\n        </div>`,n.append(o),s()},handleSidebar:e=>{e.addEventListener("click",t=>{e.classList.contains("chat-btn")?(a(),o.classList.remove("screen-hide"),r.classList.add("screen-hide")):(a(),r.classList.remove("screen-hide"),o.classList.add("screen-hide"));const n=e.dataset.toggleSidebar,s=n?document.getElementById(n):void 0;if(s){let e=s.getAttribute("aria-hidden");s.setAttribute("aria-hidden","true"!=e)}})}}},function(e,t){const n=document.querySelector(".main-chat-box");e.exports=()=>{const e=n.lastElementChild,t=getComputedStyle(e),s=parseInt(t.marginBottom),o=e.offsetHeight+s,r=n.offsetHeight;n.scrollHeight-o<=n.scrollTop+r&&(n.scrollTop=n.scrollHeight)}}]);