export const categories = [
  'Original serial',
  'Site before',
  'Isolation and safety',
  'Electrical test results',
  'Replacement installation',
  'Commissioning',
  'Firmware and status',
  'Site after',
  'Removed unit',
  'Customer acknowledgement',
];

export const statuses = [
  'Allocated',
  'Scheduled',
  'In progress',
  'Awaiting parts',
  'Awaiting review',
  'Verified',
  'Exception',
  'Safety escalation',
];

export type Campaign = {id: string; name: string; manufacturer: string; equipment: string; procedure: string; fee: number; fieldCost: number; version: number};
export type Partner = {id: string; name: string; region: string; capacity: number; expiry: string; approved: boolean; version: number};
export type Job = {id: string; campaignId: string; customer: string; postcode: string; region: string; serial: string; replacement: string; status: string; priority: string; partnerId: string; appointment: string; disposition: string; returnRef: string; note: string; exception: string; contactStage: string; slaDue: string; version: number};
export type Evidence = {id: string; job_id: string; category: string; filename: string; mime: string; created: string};
export type Audit = {id: string; job_id: string; action: string; created: string};
export type Data = {campaigns: Campaign[]; partners: Partner[]; jobs: Job[]; evidence: Evidence[]; events: Audit[]};
export const regions = ['Midlands', 'South East', 'South West', 'North', 'Scotland', 'Wales'];

export function gaps(job: Job, files: Evidence[]) {
  return [
    ...categories.filter(category => !files.some(file => file.job_id === job.id && file.category === category)),
    ...(!job.replacement ? ['Replacement serial'] : []),
    ...(!job.disposition || !job.returnRef ? ['Return disposition and reference'] : []),
    ...(!job.partnerId ? ['Approved installer'] : []),
    ...(!job.appointment ? ['Appointment'] : []),
    ...(job.exception ? ['Unresolved exception'] : []),
  ];
}
