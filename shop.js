// Lucid Lux shop: one key for every game on this site. Loaded by each game and by /key/.
// Games without their own gate markup call LL.gate({what, back}) and await .check() where the paid part begins.
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
  // gate(o): a self-contained overlay for games that do not carry their own gate markup.
  //   o.what  = what the key opens here, read after "Unlock" ("levels 11 and up")   o.back = label for the way out ("Back to the menu")
  // Returns { check(), locked() }. check() resolves true when play may go on (shop off, or a valid key, now or after
  // unlocking in the overlay) and false when the player backs out. One gate per page.
  let ready=null, waiting=null;
  function gate(o){ o=o||{}; ready=ready||init();
    function build(){ if(document.getElementById('llgate')) return document.getElementById('llgate');
      const st=document.createElement('style'); st.textContent=`
#llgate{position:fixed;inset:0;z-index:2147483000;display:none;place-items:center;padding:16px;background:rgba(8,7,12,.94);overflow:auto;
 font:16px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;color:#F3F1F7;-webkit-text-size-adjust:100%}
#llgate.show{display:grid}
#llgate .pl{width:100%;max-width:380px;background:#17161D;border:1px solid #2A2833;border-radius:22px;padding:20px;text-align:left}
#llgate h2{margin:0 0 8px;font-size:22px;line-height:1.2;letter-spacing:-.01em}
#llgate p{margin:0 0 10px;color:#A9A5B5;font-size:15px} #llgate p b{color:#F3F1F7}
#llgate .q{font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:#A9A5B5;margin:12px 0 8px;font-weight:600}
#llgate .ages{display:flex;gap:8px;margin-bottom:14px}
#llgate .ages button{flex:1;min-height:44px;border:1px solid #2A2833;border-radius:14px;background:#0E0D12;color:#A9A5B5;font:600 15px/1 inherit;cursor:pointer;white-space:nowrap}
#llgate .ages button[aria-pressed="true"]{border-color:#6cf3ff;color:#6cf3ff}
#llgate .pay{display:grid;place-items:center;width:100%;min-height:52px;border:0;border-radius:16px;background:#FF5A4E;color:#fff;font:800 18px/1 inherit;text-decoration:none;cursor:pointer}
#llgate .pay[aria-disabled="true"]{opacity:.35;pointer-events:none}
#llgate .msg{min-height:20px;margin-top:10px;color:#6cf3ff;font-size:15px} #llgate .msg.bad{color:#ff5a3c}
#llgate textarea{width:100%;height:84px;margin-top:8px;background:#0E0D12;border:1px solid #2A2833;border-radius:12px;color:#F3F1F7;font:13px ui-monospace,Menlo,monospace;padding:10px;resize:none;box-sizing:border-box}
#llgate .row{display:flex;justify-content:space-between;gap:10px;margin-top:14px}
#llgate .row button{background:none;border:0;color:#A9A5B5;font:600 15px/1 inherit;cursor:pointer;padding:10px 0;min-height:44px}
#llgate .row button:hover{color:#F3F1F7}`;
      document.head.appendChild(st);
      const g=document.createElement('div'); g.id='llgate'; g.setAttribute('role','dialog'); g.setAttribute('aria-modal','true'); g.setAttribute('aria-label','The Lucid Lux key');
      const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
      g.innerHTML='<div class="pl"><h2>Unlock '+esc(o.what||'the rest')+'</h2>'
        +'<p>The <b>Lucid Lux key</b> unlocks the paid parts of every Lucid Lux game, on any device, for good. Pay what you like from $3.</p>'
        +'<p>Everything before this point stays free.</p>'
        +'<div class="q">How old are you? (counted, never stored with you)</div>'
        +'<div class="ages"><button type="button" data-age="u13" aria-pressed="false">Under 13</button><button type="button" data-age="13-17" aria-pressed="false">13 – 17</button><button type="button" data-age="18+" aria-pressed="false">18 +</button></div>'
        +'<a class="pay" data-pay aria-disabled="true" href="#" rel="noopener">Get the key</a><div class="msg" aria-live="polite"></div>'
        +'<div class="keybox" style="display:none"><textarea placeholder="Paste your key" spellcheck="false" aria-label="Your key"></textarea><button type="button" class="pay" data-go style="margin-top:8px;min-height:44px">Check this key</button></div>'
        +'<div class="row"><button type="button" data-have>I have a key</button><button type="button" data-back>'+esc(o.back||'Not now')+'</button></div></div>';
      document.body.appendChild(g);
      mount({ gate:g,
        onUnlock:()=>{ setTimeout(()=>{ hide(); const w=waiting; waiting=null; w&&w(true); },900); },
        onBack:()=>{ hide(); const w=waiting; waiting=null; w&&w(false); } });
      return g; }
    return {
      locked:()=>on()&&!K.ok,
      check:()=>ready.then(()=>{ if(!on()||K.ok) return true; build(); show(); return new Promise(res=>{ waiting=res; }); })
    };
  }
  // Remember where the buyer was, so /key/ can send them back after paying.
  document.addEventListener('click',e=>{ const a=e.target&&e.target.closest&&e.target.closest('a.pay[data-pay]'); if(a&&on()) ls.set('ll_return',location.pathname); },true);
  return { SHOP, K, on, ok:()=>K.ok, init, verify, mount, show, hide, say, gate, get justPaid(){ return justPaid; }, get key(){ return K.tok; } };
})();
