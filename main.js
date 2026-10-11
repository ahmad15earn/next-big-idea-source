const {app,BrowserWindow,ipcMain,session,Menu,shell,Tray,nativeImage,globalShortcut,utilityProcess}=require('electron');
const fs=require('fs'),path=require('path');
const gotLock=app.requestSingleInstanceLock();if(!gotLock)app.quit();
app.setAppUserModelId('com.boimama.nextbigidea');
const root=()=>{const d=path.join(app.getPath('userData'),'ideas');fs.mkdirSync(path.join(d,'recordings'),{recursive:true});return d};
const dbp=()=>path.join(root(),'ideas.json');
const DEF=()=>({ideas:[],settings:{anim:'char',font:'Georgia',size:20}});
function load(){try{return JSON.parse(fs.readFileSync(dbp(),'utf8'))}catch(e){
 if(e.code!=='ENOENT'){try{fs.renameSync(dbp(),dbp()+'.corrupt-'+Date.now())}catch{}}return DEF()}}
function save(d){const t=dbp()+'.tmp';fs.writeFileSync(t,JSON.stringify(d));fs.renameSync(t,dbp())}
const rp=n=>path.join(root(),'recordings',path.basename(String(n)));
ipcMain.handle('load',()=>load());
ipcMain.handle('save',(e,d)=>{save(d);return true});
ipcMain.on('savesync',(e,d)=>{try{save(d)}catch{}e.returnValue=true});
ipcMain.handle('recChunk',(e,n,b)=>{fs.appendFileSync(rp(n),Buffer.from(b));return true});
ipcMain.handle('recDel',(e,n)=>{try{fs.unlinkSync(rp(n))}catch{}return true});
ipcMain.handle('openFolder',()=>{fs.mkdirSync(path.join(app.getPath('userData'),'models'),{recursive:true});return shell.openPath(app.getPath('userData'))});
let cfg={},bgOn=false,quitting=false,tray=null,win=null;
try{cfg=JSON.parse(fs.readFileSync(path.join(root(),'cfg.json'),'utf8'));bgOn=!!cfg.bg}catch{}
const wcfg=()=>{try{fs.writeFileSync(path.join(root(),'cfg.json'),JSON.stringify(cfg))}catch{}};
const showWin=q=>{if(!win)return;win.show();if(win.isMinimized())win.restore();win.focus();if(q)win.webContents.send('quick')};
function ensureTray(){if(bgOn&&!tray){tray=new Tray(nativeImage.createFromPath(path.join(__dirname,'icon.png')).resize({width:16}));tray.setToolTip('Find the Next Big Idea');tray.on('click',()=>showWin());
 tray.setContextMenu(Menu.buildFromTemplate([{label:'Open',click:()=>showWin()},{label:'New idea (Ctrl+Alt+I)',click:()=>showWin(true)},{type:'separator'},{label:'Quit',click:()=>{quitting=true;app.quit()}}]))}else if(!bgOn&&tray){tray.destroy();tray=null}}
ipcMain.handle('cfg',(e,c)=>{bgOn=!!c.bg;cfg.bg=bgOn;wcfg();app.setLoginItemSettings({openAtLogin:!!c.login,args:['--hidden']});ensureTray();return true});
ipcMain.handle('recSize',()=>{try{const d=path.join(root(),'recordings');return fs.readdirSync(d).reduce((s,f)=>s+fs.statSync(path.join(d,f)).size,0)}catch{return 0}});
const udm=()=>path.join(app.getPath('userData'),'models');
const mbases=()=>[path.join(process.resourcesPath||'','models'),path.join(__dirname,'models'),udm()];
function listModels(){const o=new Set();for(const b of mbases()){try{for(const n of fs.readdirSync(b))if(fs.statSync(path.join(b,n)).isDirectory())o.add(n)}catch{}}return[...o]}
function modelDir(n){for(const b of mbases()){const d=path.join(b,n);if(fs.existsSync(d))return d}return null}
const isBn=n=>/bn|bangla|bengali/i.test(n);
function pickModel(o){const ms=listModels();if(!ms.length)return null;if(/^bn/.test(o.lang||'')){const b=ms.find(isBn);if(b)return b}if(o.model&&ms.includes(o.model))return o.model;return ms.find(n=>!isBn(n))||ms[0]}
let sw=null,seq=0;const pend=new Map();
function worker(){if(sw)return sw;sw=utilityProcess.fork(path.join(__dirname,'stt-worker.js'));
 sw.on('message',m=>{const p=pend.get(m.id);if(!p)return;pend.delete(m.id);m.err?p.rej(new Error(m.err)):p.res({text:m.text,lang:m.lang||''})});
 sw.on('exit',()=>{sw=null;for(const p of pend.values())p.rej(new Error('STT_EXIT'));pend.clear()});return sw}
ipcMain.handle('sttModels',()=>listModels());
ipcMain.handle('transcribe',(e,o)=>{const name=pickModel(o),dir=name&&modelDir(name);if(!dir)throw new Error('NO_MODEL');const lang=(o.lang&&o.lang!=='auto')?String(o.lang).slice(0,2):'';
 const bn=listModels().find(isBn),bnDir=bn&&modelDir(bn);return new Promise((res,rej)=>{const id=++seq;pend.set(id,{res,rej});worker().postMessage({id,dir,lang,bnDir,samples:o.samples})})});
app.on('will-quit',()=>{try{sw&&sw.kill()}catch{}});
ipcMain.handle('recEnd',()=>true);
ipcMain.handle('recGet',(e,n)=>{try{const b=fs.readFileSync(rp(n));return b.buffer.slice(b.byteOffset,b.byteOffset+b.length)}catch{return null}});
app.whenReady().then(()=>{if(!gotLock)return;
 Menu.setApplicationMenu(null);
 const ok=(wc,p)=>p==='media'&&/^file:/.test(wc?.getURL?.()||'');
 session.defaultSession.setPermissionRequestHandler((wc,p,cb)=>cb(ok(wc,p)));
 session.defaultSession.setPermissionCheckHandler((wc,p)=>ok(wc,p));
 const B=cfg.bounds||{};
 const w=new BrowserWindow({width:B.width||1000,height:B.height||720,x:B.x,y:B.y,minWidth:560,minHeight:420,show:false,titleBarStyle:'hidden',titleBarOverlay:{color:'#FFFCF7',symbolColor:'#240F00',height:46},title:'Find the Next Big Idea',backgroundColor:'#FFFCF7',icon:path.join(__dirname,'icon.png'),autoHideMenuBar:true,webPreferences:{preload:path.join(__dirname,'preload.js'),contextIsolation:true,nodeIntegration:false,sandbox:true}});
 w.webContents.setWindowOpenHandler(()=>({action:'deny'}));
 w.webContents.on('will-navigate',e=>e.preventDefault());
 w.webContents.on('context-menu',(e,p)=>Menu.buildFromTemplate([{role:'cut',enabled:p.editFlags.canCut},{role:'copy',enabled:p.editFlags.canCopy},{role:'paste',enabled:p.editFlags.canPaste},{type:'separator'},{role:'selectAll'}]).popup());
 win=w;w.once('ready-to-show',()=>{if(!(process.argv.includes('--hidden')&&bgOn))w.show()});
 w.on('close',e=>{cfg.bounds=w.getBounds();wcfg();if(bgOn&&!quitting){e.preventDefault();w.hide()}});
 app.on('before-quit',()=>{quitting=true});ensureTray();globalShortcut.register('Control+Alt+I',()=>showWin(true));
 w.loadFile('app.html');
 app.on('second-instance',()=>{if(w.isMinimized())w.restore();w.focus()});
});
app.on('will-quit',()=>globalShortcut.unregisterAll());
app.on('window-all-closed',()=>app.quit());
