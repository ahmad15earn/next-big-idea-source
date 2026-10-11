// Runs the offline speech engine in its own process, so the app never freezes while it listens.
const path=require('path'),fs=require('fs'),os=require('os');let so=null,rec=null,key='';
const pick=(fl,re)=>fl.find(f=>re.test(f)&&f.includes('int8'))||fl.find(f=>re.test(f));
function build(dir,lang){so=so||require('sherpa-onnx-node');const fl=fs.readdirSync(dir),th=Math.max(2,Math.min(4,os.cpus().length-1)),tok=path.join(dir,fl.find(f=>/tokens\.txt$/.test(f))),j=f=>path.join(dir,f);
 if(fl.some(f=>/^joiner/.test(f)))return{online:true,r:new so.OnlineRecognizer({featConfig:{sampleRate:16000,featureDim:80},modelConfig:{transducer:{encoder:j(pick(fl,/^encoder.*\.onnx$/)),decoder:j(pick(fl,/^decoder.*\.onnx$/)),joiner:j(pick(fl,/^joiner.*\.onnx$/))},tokens:tok,numThreads:th,provider:'cpu',debug:false},decodingMethod:'greedy_search',maxActivePaths:4,enableEndpoint:false})};
 return{online:false,r:new so.OfflineRecognizer({featConfig:{sampleRate:16000,featureDim:80},modelConfig:{whisper:{encoder:j(pick(fl,/encoder.*\.onnx$/)),decoder:j(pick(fl,/decoder.*\.onnx$/)),language:lang,task:'transcribe',tailPaddings:-1},tokens:tok,numThreads:th,provider:'cpu',debug:false}})}}
const cache=new Map();
const get=(dir,lang)=>{const k=dir+'|'+lang;if(!cache.has(k)){if(cache.size>=2)cache.delete(cache.keys().next().value);cache.set(k,build(dir,lang))}return cache.get(k)};
async function dec(rec,x){const s=rec.r.createStream();s.acceptWaveform({sampleRate:16000,samples:x});
 if(rec.online){s.acceptWaveform({sampleRate:16000,samples:new Float32Array(8000)});s.inputFinished();while(rec.r.isReady(s))rec.r.decode(s)}else await rec.r.decodeAsync(s);
 const r=rec.r.getResult(s);return{text:r.text||'',lang:r.lang||''}}
process.parentPort.on('message',async e=>{const m=e.data;try{const x=m.samples instanceof Float32Array?m.samples:new Float32Array(m.samples);
 let out=await dec(get(m.dir,m.lang),x);
 if(!m.lang&&/^bn/.test(out.lang)&&m.bnDir){out=await dec(get(m.bnDir,'bn'),x);out.lang='bn'}
 process.parentPort.postMessage({id:m.id,text:out.text,lang:out.lang})}catch(err){process.parentPort.postMessage({id:m.id,err:String(err&&err.message||err)})}});
