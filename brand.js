// Stamps the app icon + name into the Windows .exe (works from Linux/macOS, no Wine needed)
const R=require('resedit'),fs=require('fs');const p=process.argv[2];
const exe=R.NtExecutable.from(fs.readFileSync(p),{ignoreCert:true}),res=R.NtExecutableResource.from(exe);
const ico=R.Data.IconFile.from(fs.readFileSync('icon.ico')),g=R.Resource.IconGroupEntry.fromEntries(res.entries)[0];
R.Resource.IconGroupEntry.replaceIconsForResource(res.entries,g.id,g.lang,ico.icons.map(i=>i.data));
const vi=R.Resource.VersionInfo.fromEntries(res.entries)[0];
vi.setStringValues({lang:1033,codepage:1200},{ProductName:'Find the Next Big Idea',FileDescription:'Find the Next Big Idea',CompanyName:'BOIMA MA',OriginalFilename:'NextBigIdea.exe',InternalName:'NextBigIdea',LegalCopyright:'BOIMA MA'});
vi.outputToResourceEntries(res.entries);res.outputResource(exe);fs.writeFileSync(p,Buffer.from(exe.generate()));console.log('branded',p);
