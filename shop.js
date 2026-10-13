// Lucid Lux shop: one key for every game on this site. Loaded by each game and by /key/.
// Turn the shop on by filling SHOP.pay (Stripe Payment Link) and SHOP.api (worker origin, no trailing slash); both empty = everything free.
// A key is base64url(payload).base64url(Ed25519 signature), minted by the worker after a paid checkout and verified here with /pubkey.
window.LL=(()=>{
  const SHOP={ pay:'', api:'' };
  const K={ tok:null, pub:null, ok:false, age:null };
  const b64u={ enc:b=>btoa(String.fromCharCode(...new Uint8Array(b))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''), dec:s=>Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0)) };
  const on=()=>!!(SHOP.pay&&SHOP.api)&&location.hostname==='lucidlux.fyi';
  const ls={ get:k=>{ try{ return localStorage.getItem(k); }catch(_){ return null; } }, set:(k,v)=>{ try{ localStorage.setItem(k,v); }catch(_){} } };
  async function pubkey(){ if(K.pub) return K.pub; let raw=ls.get('ll_pub'); if(!raw){ const r=await fetch(SHOP.api+'/pubkey'); raw=(await r.json()).pub; ls.set('ll_pub',raw); } K.pub=await crypto.subtle.importKey('raw',b64u.dec(raw),{name:'Ed25519'},true,['verify']); return K.pub; }
  async function verify(tok){ try{ const [p,sig]=String(tok).trim().split('.'); if(!p||!sig) return false; const ok=await crypto.subtle.verify({name:'Ed25519'},await pubkey(),b64u.dec(sig),new TextEncoder().encode(p)); if(!ok) return false; return JSON.parse(new TextDecoder().decode(b64u.dec(p))).k==='lucidlux'; }catch(e){ return false; } }
  let ui=null, justPaid=false;
  async function init(){ if(!on()){ K.ok=true; return K.ok; } K.tok=ls.get('ll_key');
    const cs=new URLSearchParams(location.search).get('cs');
    if(cs){ justPaid=true; history.replaceState(null,'',location.pathname); try{ const r=await fetch(SHOP.api+'/unlock?session='+encodeURIComponent(cs)); const j=await r.json(); if(j.token){ K.tok=j.token; ls.set('ll_key',j.token); } }catch(e){} }
    if(K.tok) K.ok=await verify(K.tok); return K.ok; }
  function say(m,bad){ if(!ui) return; const el=ui.gate.querySelector('.msg'); el.textContent=m; el.classList.toggle('bad',!!bad); }
  function show(){ if(!ui) return; ui.onShow&&ui.onShow(); ui.gate.classList.add('show'); const pay=ui.gate.querySelector('.pay[data-pay]'); pay.href=SHOP.pay||'#'; pay.setAttribute('aria-disabled',String(!K.age||K.age==='u13')); }
  function hide(){ ui&&ui.gate.classList.remove('show'); }
  // mount wires a gate element: buttons[data-age], a.pay[data-pay], .msg, .keybox with a textarea, [data-go], [data-have], [data-back]
  function mount(o){ ui=o; const g=o.gate; const q=s=>g.querySelector(s);
    g.querySelectorAll('[data-age]').forEach(b=>b.addEventListener('click',()=>{ K.age=b.dataset.age; g.querySelectorAll('[data-age]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
      q('.pay[data-pay]').setAttribute('aria-disabled',String(K.age==='u13')); say(K.age==='u13'?'Ask an adult to get the key; it works on any phone once you paste it in.':'');
      if(on()) try{ fetch(SHOP.api+'/age',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({age:K.age})}); }catch(_){} }));
    q('[data-have]').onclick=()=>{ const box=q('.keybox'); box.style.display=box.style.display==='none'?'block':'none'; if(K.tok) q('textarea').value=K.tok; };
    q('[data-go]').onclick=async()=>{ const t=q('textarea').value.trim(); if(!t) return; K.ok=await verify(t); if(K.ok){ K.tok=t; ls.set('ll_key',t); say('Unlocked.'); o.onUnlock&&o.onUnlock(); } else say('That key did not verify.',true); };
    q('[data-back]').onclick=()=>{ o.onBack?o.onBack():hide(); }; }
  return { SHOP, K, on, ok:()=>K.ok, init, verify, mount, show, hide, say, get justPaid(){ return justPaid; }, get key(){ return K.tok; } };
})();
