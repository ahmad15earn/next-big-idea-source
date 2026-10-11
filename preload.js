const {contextBridge,ipcRenderer:r}=require('electron');
contextBridge.exposeInMainWorld('api',{desk:true,sttModels:()=>r.invoke('sttModels'),transcribe:o=>r.invoke('transcribe',o),onQuick:cb=>r.on('quick',()=>cb()),cfg:c=>r.invoke('cfg',c),recSize:()=>r.invoke('recSize'),recDel:n=>r.invoke('recDel',n),openFolder:()=>r.invoke('openFolder'),load:()=>r.invoke('load'),save:d=>r.invoke('save',d),saveSync:d=>r.sendSync('savesync',d),
 recChunk:(n,b)=>r.invoke('recChunk',n,b),recEnd:n=>r.invoke('recEnd',n),recGet:n=>r.invoke('recGet',n)});
