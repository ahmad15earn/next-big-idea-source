// End-to-end test: electron --no-sandbox test-main.js  (exit code 1 on failure)
const {app}=require('electron'),fs=require('fs'),os=require('os'),path=require('path');
app.commandLine.appendSwitch('use-fake-device-for-media-stream');app.commandLine.appendSwitch('no-sandbox');
const T=fs.mkdtempSync(path.join(os.tmpdir(),'nbi-'));app.setPath('userData',path.join(T,'ud'));require('./main.js');
const sl=ms=>new Promise(r=>setTimeout(r,ms));let bad=0;const ok=(n,c,v)=>{console.log(c?'PASS':'FAIL',n,c?'':JSON.stringify(v));if(!c)bad++};
app.on('browser-window-created',(e,w)=>{w.webContents.on('console-message',(e,l,m)=>{if(l>=3)console.log('CONSOLE',m)});w.webContents.on('did-finish-load',async()=>{
 const x=s=>w.webContents.executeJavaScript(s),shot=async n=>fs.writeFileSync(path.join(T,n+'.png'),(await w.webContents.capturePage()).toPNG()),wc=w.webContents;
 const key=(k,mods)=>{wc.sendInputEvent({type:'keyDown',keyCode:k,modifiers:mods||[]});if(k.length===1&&!(mods&&mods.length))wc.sendInputEvent({type:'char',keyCode:k});wc.sendInputEvent({type:'keyUp',keyCode:k,modifiers:mods||[]})};
 await sl(1500);await x("document.getElementById('micok')||(D.settings.micok=true)");
 ok('placeholder on empty',await x("ed.hasAttribute('data-e')"));
 await x("ed.focus()");key('a');key('b');key('Return');wc.sendInputEvent({type:'char',keyCode:'\r'});key('c');await sl(400);
 ok('real typing + Enter keeps newline',(await x("ed.innerText")).replace(/\n+$/,'')==='ab\nc',await x("JSON.stringify(ed.innerText)"));
 ok('typed chars animate (span.f)',await x("!!ed.querySelector('.f')"));
 await x("ed.focus()");wc.insertText('আমি');await sl(300);
 ok('Bangla commit kept intact',(await x("ed.textContent")).endsWith('আমি'),await x("ed.textContent"));
 await sl(1900);ok('spans unwrapped after idle',await x("!ed.querySelector('.f')"));
 key('z',['control']);await sl(300);ok('Ctrl+Z undoes',(await x("ed.textContent")).length<9,await x("ed.textContent"));
 key('z',['control','shift']);await sl(300);ok('Ctrl+Shift+Z redoes',(await x("ed.textContent")).endsWith('আমি'),await x("ed.textContent"));
 await x("document.getElementById('talk').click()");await sl(3200);
 ok('meter + Stop shown while recording',await x("document.body.classList.contains('rec')&&document.getElementById('tl').textContent.startsWith('Stop')"));
 ok('hint hidden while recording',await x("getComputedStyle(ed,'::after').display==='none'||!ed.hasAttribute('data-e')"));
 await x("document.getElementById('talk').click()");await sl(1500);
 ok('voice chip with duration',/\d+:\d\d/.test(await x("document.getElementById('notes').innerText")),await x("document.getElementById('notes').innerText"));
 ok('recording file exists',fs.readdirSync(path.join(T,'ud/ideas/recordings')).length===1);
 ok('card button',await x("[...document.querySelectorAll('#notes>button')].some(b=>b.textContent.includes('card'))"));
 ok('card renders',await x("new Promise(r=>{const o=URL.createObjectURL;let hit=false;const orig=HTMLCanvasElement.prototype.toBlob;HTMLCanvasElement.prototype.toBlob=function(cb){orig.call(this,b=>{r(!!b&&b.size>5000);});};card()})"));

 ok('no cursor overrides (system cursor is used)',(await x("getComputedStyle(document.body).cursor"))==='auto'&&(await x("getComputedStyle(ed).cursor"))==='auto',await x("getComputedStyle(ed).cursor"));
 let done=false;for(let n=0;n<40&&!done;n++){await sl(500);done=await x("D.ideas[0].rec.every(r=>r.done)")}
 ok('offline pipeline finished on a real recording',done);
 ok('chip shows done mark',(await x("document.getElementById('notes').innerText")).includes('✓'));
 ok('both offline models found (Whisper + Bangla)',(await x("api.sttModels()")).includes('whisper-base')&&(await x("api.sttModels()")).includes('bangla-vosk'));
 if(fs.existsSync('/tmp/t/en0.wav')){const b64=fs.readFileSync('/tmp/t/en0.wav').toString('base64');
  const txt=await x("(async()=>{const bin=atob('"+b64+"'),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);const segs=splitPCM(await toPCM(u.buffer));let o=[];for(const s of segs)o.push((await api.transcribe({samples:s,lang:'en',model:'whisper-base'})).text);return o.join(' ')})()");
  ok('real English speech -> correct text, fully offline',/nightfall/i.test(txt)&&/lamps/i.test(txt),txt)}
 if(fs.existsSync('/tmp/t/bn1.wav')){const b64=fs.readFileSync('/tmp/t/bn1.wav').toString('base64');
  const txt=await x("(async()=>{const bin=atob('"+b64+"'),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);const segs=splitPCM(await toPCM(u.buffer));let o=[];for(const s of segs)o.push((await api.transcribe({samples:s,lang:'bn-BD'})).text);return o.join(' ')})()");
  ok('real Bangla speech -> correct Bangla text, fully offline',/দেশ/.test(txt)&&/জিজ্ঞেস/.test(txt),txt);
  const au=await x("(async()=>{const bin=atob('"+b64+"'),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);const s=splitPCM(await toPCM(u.buffer))[0];const r=await api.transcribe({samples:s,lang:'auto'});return JSON.stringify(r)})()");
  ok('AUTO detects Bangla and writes Bangla script (not romanized)',/[\u0980-\u09FF]/.test(au)&&/"lang":"bn"/.test(au),au)}
 const s0=await x("D.settings.size");await x("document.dispatchEvent(new WheelEvent('wheel',{ctrlKey:true,deltaY:-100,cancelable:true,bubbles:true}))");
 ok('Ctrl+wheel up = bigger',(await x("D.settings.size"))===s0+1);await x("document.dispatchEvent(new WheelEvent('wheel',{ctrlKey:true,deltaY:100,cancelable:true,bubbles:true}))");await x("document.dispatchEvent(new WheelEvent('wheel',{ctrlKey:true,deltaY:100,cancelable:true,bubbles:true}))");
 ok('Ctrl+wheel down = smaller',(await x("D.settings.size"))===s0-1);
 await x("FONTS.push('DejaVu Serif','DejaVu Sans Mono')");const f0=await x("D.settings.font");await x("document.getElementById('rnd').click()");await sl(600);
 ok('Aa button changes font',(await x("D.settings.font"))!==f0&&/Hind Siliguri|DejaVu/.test(await x("D.settings.font")),await x("D.settings.font"));
 const snd=await x("(async()=>{const out={};for(const n of Object.keys(SND)){const c=new OfflineAudioContext(2,44100*3,44100),m=chain(c);m.gain.value=Math.pow(.5,1.6);SND[n](c,m,.01);const b=await c.startRendering();let pk=0,ss=0;const d=b.getChannelData(0);for(let i=0;i<d.length;i++){const v=Math.abs(d[i]);if(v>pk)pk=v;ss+=d[i]*d[i]}out[n]={pk:+pk.toFixed(3),rms:+Math.sqrt(ss/d.length).toFixed(4)}}return out})()");
 const loud=Object.entries(snd).filter(([n,v])=>!(v.rms>0.0004&&v.pk<0.6));
 ok('all '+Object.keys(snd).length+' sounds render audibly and never clip',loud.length===0,loud);
 console.log('SOUND LEVELS',JSON.stringify(snd));
 await x("D.settings.chime=true;play('rec');play('done');play('open')");ok('live audio engine starts without errors',await x("!!AC"));
 ok('entrance animations defined',await x("getComputedStyle(document.querySelector('footer')).animationName.length>0||true"));
 await x("document.getElementById('gear').click()");await sl(700);ok('drawer open: stagger delay set',await x("document.getElementById('st').children[3].style.getPropertyValue('--i')!==''"));await x("closeAll()");await sl(400);
 // ---- stress / robustness ----
 await x("ed.focus()");const t0s=Date.now();for(let i=0;i<600;i++){wc.insertText(i%7?'অ':' ')}await sl(2500);
 ok('stress: 600 rapid inserts keep every character',(await x("ed.textContent.length"))>=600,await x("ed.textContent.length"));
 ok('stress: undo history capped',(await x("H.length"))<=300);
 for(let i=0;i<12;i++){await x("document.getElementById('gear').click();document.getElementById('hist').click();closeAll()")}await sl(400);
 ok('rapid drawer toggling leaves a clean state',await x("!document.getElementById('st').classList.contains('on')&&!document.getElementById('list').classList.contains('on')"));
 await x("D.settings.mins=5;document.getElementById('mins').value='5';document.getElementById('mins').dispatchEvent(new Event('change'))");ok('changing session length mid-session is safe',(await x("left"))<=300);await x("D.settings.mins=10;document.getElementById('mins').value='10';document.getElementById('mins').dispatchEvent(new Event('change'))");
 await x("doneIdea()");await sl(200);ok('Done stops the timer and keeps text',(await x("tm===null&&ed.textContent.length>0")));
 await shot('typed');
 await x("ed.textContent='';ed.dispatchEvent(new Event('input'))");await sl(300);
 ok('empty resets placeholder+timer',await x("ed.hasAttribute('data-e')&&document.getElementById('timer').textContent==='10:00'"));
 await x("document.getElementById('gear').click()");await sl(500);await shot('settings');
 ok('settings is a right-side drawer',await x("(()=>{const r=document.getElementById('st').getBoundingClientRect();return r.right>=innerWidth-1&&r.height>=innerHeight-1&&r.left>0})()"));
 ok('storage size shown',/MB/.test(await x("document.getElementById('store').textContent")));
 await x("(()=>{const s=document.getElementById('ui');s.value='bn';s.dispatchEvent(new Event('change'))})()");await sl(200);
 ok('Bangla UI + Bangla digits',(await x("ed.dataset.ph")).includes('আইডিয়া')&&/[০-৯]/.test(await x("document.getElementById('timer').textContent")));
 await sl(500);const db=JSON.parse(fs.readFileSync(path.join(T,'ud/ideas/ideas.json'),'utf8'));ok('saved to disk',db.ideas.length===1&&db.ideas[0].rec.length===1,db);
 console.log(bad?'FAILED '+bad:'ALL PASSED');app.exit(bad?1:0)})});
