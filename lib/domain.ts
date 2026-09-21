export const categories = ['Original serial','Site before','Site after','Test results','Commissioning','Customer acknowledgement'];
export const statuses = ['Allocated','Scheduled','In progress','Awaiting review','Verified','Exception'];
export type Campaign = {id:string; name:string; manufacturer:string; equipment:string; procedure:string; fee:number; fieldCost:number; version:number};
export type Partner = {id:string; name:string; region:string; capacity:number; expiry:string; approved:boolean; version:number};
export type Job = {id:string; campaignId:string; customer:string; postcode:string; region:string; serial:string; replacement:string; status:string; priority:string; partnerId:string; appointment:string; disposition:string; returnRef:string; note:string; exception:string; contactStage:string; slaDue:string; version:number};
export type Evidence = {id:string; job_id:string; category:string; filename:string; mime:string; created:string};
export type Audit = {id:string; job_id:string; action:string; created:string};
export type Data = {campaigns:Campaign[]; partners:Partner[]; jobs:Job[]; evidence:Evidence[]; events:Audit[]};
export const regions = ['Midlands','South East','South West','North','Scotland','Wales'];
export function gaps(j:Job, files:Evidence[]) {return [...categories.filter(c=>!files.some(e=>e.job_id===j.id&&e.category===c)), ...(!j.replacement?['Replacement serial']:[]), ...(!j.disposition||!j.returnRef?['Return disposition and reference']:[]), ...(!j.partnerId?['Approved installer']:[]), ...(!j.appointment?['Appointment']:[]), ...(j.exception?['Unresolved exception']:[])];}
