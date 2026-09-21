import {categories, Data, Evidence, gaps, Job, regions} from './domain';

const KEY='stratford-energy-response-v1';
const clean=(value:unknown,max=500)=>typeof value==='string'?value.trim().slice(0,max):'';
const now=()=>new Date().toISOString();
const uid=()=>crypto.randomUUID();

function seed():Data {
  const campaigns=[
    {id:'c-battery',name:'Battery assurance programme',manufacturer:'Example Energy OEM',equipment:'Residential battery system',procedure:'SER-BAT-01 · controlled replacement',fee:95,fieldCost:550,version:1},
    {id:'c-inverter',name:'Inverter warranty programme',manufacturer:'Example Solar OEM',equipment:'Hybrid inverter',procedure:'SER-INV-02 · warranty exchange',fee:75,fieldCost:350,version:1}
  ];
  const partners=regions.map((region,i)=>({id:`p-${i}`,name:['Stratford Energy Field Team','South Coast Electrical','West Energy Services','Northern Energy Partners','Caledonia Electrical','Cymru Renewables'][i],region,capacity:[24,18,14,20,12,10][i],expiry:'2027-12-31',approved:i!==5,version:1}));
  const names=['Oak House','Willow Lodge','The Orchard','Cedar Cottage','Maple House','Meadow View','Brook House','The Cedars','Ash Lodge','Elm Cottage','Birch House','Rose Cottage','Hawthorn Lodge','The Paddock','Lime House','Yew Cottage','Pine Lodge','Hill View'];
  const stages=['Exception','Verified','Scheduled','In progress','Awaiting review','Allocated'];
  const jobs:Job[]=names.map((name,i)=>({id:`SER-${String(1001+i)}`,campaignId:i<13?'c-battery':'c-inverter',customer:`${name} (sample)`,postcode:['CV37 9AA','BN1 1AA','BS1 1AA','LS1 1AA','EH1 1AA','CF10 1AA'][i%6],region:regions[i%6],serial:`DEMO-${87000+i}`,replacement:['Verified','Awaiting review'].includes(stages[i%6])?`NEW-${99000+i}`:'',status:stages[i%6],priority:i%7===0?'High':'Standard',partnerId:i%6===5?'':`p-${i%6}`,appointment:i%6===5?'':`2026-10-${String(2+i%8).padStart(2,'0')}T09:00`,disposition:['Verified','Awaiting review'].includes(stages[i%6])?'Received at depot':'',returnRef:['Verified','Awaiting review'].includes(stages[i%6])?`RMA-${4100+i}`:'',note:'Fictional site for workflow demonstration.',exception:stages[i%6]==='Exception'?'Site access requires programme-manager review.':'',contactStage:i%3===0?'Appointment confirmed':i%3===1?'Contacted':'Not contacted',slaDue:`2026-10-${String(10+i%9).padStart(2,'0')}`,version:1}));
  const evidence:Evidence[]=[];
  for(const job of jobs.filter(j=>['Verified','Awaiting review'].includes(j.status))) for(const category of categories) evidence.push({id:uid(),job_id:job.id,category,filename:`${job.id}-${category.toLowerCase().replaceAll(' ','-')}.txt`,mime:'text/plain',created:now()});
  return {campaigns,partners,jobs,evidence,events:jobs.slice(0,8).map((job,i)=>({id:uid(),job_id:job.id,action:['Programme record created','Customer appointment confirmed','Field evidence captured','Completion reviewed'][i%4],created:new Date(Date.now()-i*42*60*1000).toISOString()}))};
}

export function loadWorkspace():Data {
  const raw=localStorage.getItem(KEY);
  if(raw){try{return JSON.parse(raw)}catch{/* restore a clean workspace */}}
  const data=seed(); saveWorkspace(data); return data;
}

export function saveWorkspace(data:Data){localStorage.setItem(KEY,JSON.stringify(data));}
function event(data:Data,jobId:string,action:string){data.events.unshift({id:uid(),job_id:jobId,action,created:now()});data.events=data.events.slice(0,500);}
function findJob(data:Data,id?:string){const j=data.jobs.find(x=>x.id===id);if(!j)throw new Error('Work order not found.');return j;}
function bump(job:Job){job.version+=1;}

export function performAction(data:Data,op:string,v:any={},id?:string,version?:number):Data {
  const next=structuredClone(data) as Data;
  if(op==='campaign'){
    if(!clean(v.name)||!clean(v.manufacturer)||!clean(v.equipment))throw new Error('Name, manufacturer and equipment are required.');
    next.campaigns.push({id:uid(),name:clean(v.name),manufacturer:clean(v.manufacturer),equipment:clean(v.equipment),procedure:clean(v.procedure),fee:Number(v.fee)||0,fieldCost:Number(v.fieldCost)||0,version:1});
  } else if(op==='partner'){
    if(!clean(v.name)||!regions.includes(v.region)||!v.expiry||Number(v.capacity)<1)throw new Error('Enter a name, region, expiry and weekly capacity.');
    next.partners.push({id:uid(),name:clean(v.name),region:v.region,capacity:Number(v.capacity),expiry:v.expiry,approved:false,version:1});
  } else if(op==='partner-approve'){
    const p=next.partners.find(x=>x.id===id);if(!p)throw new Error('Installer not found.');p.approved=!p.approved;p.version+=1;event(next,p.id,p.approved?'Installer approved':'Installer approval suspended');
  } else if(op==='job'){
    if(!next.campaigns.some(c=>c.id===v.campaignId)||!clean(v.customer)||!clean(v.serial)||!clean(v.postcode)||!regions.includes(v.region))throw new Error('Select a programme and enter site, postcode, region and original serial.');
    if(next.jobs.some(j=>j.serial.toLowerCase()===clean(v.serial).toLowerCase()))throw new Error('This original serial is already registered.');
    const job:Job={id:`SER-${uid().slice(0,8).toUpperCase()}`,campaignId:v.campaignId,customer:clean(v.customer),postcode:clean(v.postcode,20).toUpperCase(),serial:clean(v.serial,100),region:v.region,priority:v.priority==='High'?'High':'Standard',status:'Allocated',partnerId:'',appointment:'',replacement:'',disposition:'',returnRef:'',exception:'',note:'',contactStage:'Not contacted',slaDue:'',version:1};next.jobs.unshift(job);event(next,job.id,'Work order created');
  } else {
    const job=findJob(next,id);if(version!==undefined&&job.version!==version)throw new Error('This work order changed. Refresh before saving.');
    if(op==='update'){
      if(['Verified','Awaiting review'].includes(job.status))throw new Error('Return this work order for rework before editing.');
      const partner=next.partners.find(p=>p.id===v.partnerId);if(v.partnerId&&(!partner?.approved||partner.expiry<(v.appointment||now()).slice(0,10)))throw new Error('Choose an approved installer with valid accreditation.');
      Object.assign(job,{partnerId:v.partnerId||'',appointment:clean(v.appointment),replacement:clean(v.replacement,100),disposition:clean(v.disposition),returnRef:clean(v.returnRef),note:clean(v.note,3000)});if(job.status==='Allocated'&&job.appointment)job.status='Scheduled';bump(job);event(next,job.id,'Work pack updated');
    } else if(op==='start'){if(job.status!=='Scheduled')throw new Error('Schedule the work order first.');job.status='In progress';bump(job);event(next,job.id,'Field work started');
    } else if(op==='exception'){if(!clean(v.reason))throw new Error('Describe the exception.');job.status='Exception';job.exception=clean(v.reason,2000);bump(job);event(next,job.id,`Exception raised: ${job.exception}`);
    } else if(op==='resolve'){if(job.status!=='Exception'||!clean(v.reason))throw new Error('A resolution note is required.');job.status=job.appointment?'Scheduled':'Allocated';job.exception='';bump(job);event(next,job.id,`Exception resolved: ${clean(v.reason,2000)}`);
    } else if(op==='submit'||op==='approve'){
      if(op==='submit'&&!['In progress','Scheduled'].includes(job.status)||op==='approve'&&job.status!=='Awaiting review')throw new Error('This action is not available at the current stage.');
      const missing=gaps(job,next.evidence);if(missing.length)throw new Error(`Required before close-out: ${missing.join(', ')}`);job.status=op==='submit'?'Awaiting review':'Verified';bump(job);event(next,job.id,op==='submit'?'Evidence submitted for programme review':'Completion verified');
    } else if(op==='reject'){if(job.status!=='Awaiting review'||!clean(v.reason))throw new Error('A rework reason is required.');job.status='In progress';bump(job);event(next,job.id,`Returned for rework: ${clean(v.reason,2000)}`);
    } else if(op==='contact'){job.contactStage=clean(v.stage)||'Contacted';bump(job);event(next,job.id,`Customer communication: ${job.contactStage}`);}
    else throw new Error('Unknown action.');
  }
  saveWorkspace(next); return next;
}

export async function addEvidence(data:Data,jobId:string,category:string,file:File):Promise<Data>{
  const next=structuredClone(data) as Data;const job=findJob(next,jobId);if(['Verified','Awaiting review'].includes(job.status))throw new Error('Evidence is locked during review and after verification.');if(!categories.includes(category)||!file.size||file.size>8*1024*1024||!['image/jpeg','image/png','application/pdf','text/plain'].includes(file.type))throw new Error('Upload a JPEG, PNG, PDF or text file up to 8 MB.');
  const evidence={id:uid(),job_id:jobId,category,filename:file.name.slice(0,200),mime:file.type,created:now()};next.evidence.unshift(evidence);event(next,jobId,`Evidence added: ${category}`);saveWorkspace(next);
  try{const db=await openFiles();const tx=db.transaction('files','readwrite');tx.objectStore('files').put(file,evidence.id);}catch{/* metadata still provides a durable audit entry */}
  return next;
}
function openFiles():Promise<IDBDatabase>{return new Promise((resolve,reject)=>{const req=indexedDB.open('stratford-energy-response-files',1);req.onupgradeneeded=()=>req.result.createObjectStore('files');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
export async function downloadEvidence(file:Evidence){let blob:Blob|undefined;try{const db=await openFiles();blob=await new Promise((resolve,reject)=>{const req=db.transaction('files').objectStore('files').get(file.id);req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}catch{}if(!blob)blob=new Blob([`Stratford Energy Response\n${file.category}\n${file.job_id}\n${file.created}\n\nDemonstration evidence register entry.`],{type:'text/plain'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=file.filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
export function resetWorkspace(){localStorage.removeItem(KEY);return loadWorkspace();}
