'use client';

import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BatteryCharging,
  CheckCheck,
  ClipboardCheck,
  FileCheck2,
  LockKeyhole,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  Truck,
  Users,
} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Progress} from '@/components/ui/progress';
import {categories, Data, gaps, regions} from '@/lib/domain';

type Props = {
  data: Data;
  onNavigate: (view: string) => void;
  onOpenJob: (id: string) => void;
  onReset: () => void;
};

const percent = (value: number, total: number) => total ? Math.round(value / total * 100) : 0;

export function OemCommandCentre({data, onNavigate, onOpenJob, onReset}: Props) {
  const total = data.jobs.length;
  const verified = data.jobs.filter(job => job.status === 'Verified').length;
  const contacted = data.jobs.filter(job => job.contactStage !== 'Not contacted').length;
  const scheduled = data.jobs.filter(job => Boolean(job.appointment)).length;
  const fieldComplete = data.jobs.filter(job => ['Awaiting review', 'Verified'].includes(job.status)).length;
  const returned = data.jobs.filter(job => job.returnRef && job.disposition === 'Received at depot').length;
  const completePacks = data.jobs.filter(job => gaps(job, data.evidence).length === 0).length;
  const safety = data.jobs.filter(job => job.status === 'Safety escalation' || /safety/i.test(job.exception)).length;
  const reviewJob = data.jobs.find(job => job.status === 'Awaiting review') || data.jobs.find(job => job.status === 'In progress') || data.jobs[0];
  const uncovered = regions.filter(region => !data.partners.some(partner => partner.approved && partner.region === region));

  const stages = [
    ['Affected assets', total],
    ['Customer contacted', contacted],
    ['Scheduled', scheduled],
    ['Field complete', fieldComplete],
    ['Verified', verified],
  ] as const;

  return <div className="oem-command">
    <section className="oem-hero">
      <div className="oem-hero-copy">
        <div className="oem-kicker"><span className="pulse-dot"/> OEM PILOT DEMONSTRATION</div>
        <h2>One accountable route from affected asset to verified resolution.</h2>
        <p>A live operational model for a national residential-battery corrective-action programme: identify, mobilise, intervene, assure and report.</p>
        <div className="oem-actions">
          <Button onClick={() => reviewJob && onOpenJob(reviewJob.id)}><FileCheck2 size={17}/>Open evidence gate</Button>
          <Button variant="outline" onClick={() => onNavigate('field')}><Smartphone size={17}/>Installer experience</Button>
          <Button variant="ghost" onClick={onReset}><RotateCcw size={16}/>Reset pilot</Button>
        </div>
      </div>
      <div className="control-proof" aria-label="Programme control statement">
        <ShieldCheck size={28}/>
        <span>CONTROL PRINCIPLE</span>
        <strong>Incomplete work cannot be closed.</strong>
        <p>Serials, safety evidence, tests, commissioning, customer acknowledgement and removed-unit custody are checked before review.</p>
      </div>
    </section>

    <div className="oem-mode-strip" aria-label="Demonstration perspectives">
      <span>View the workflow as</span>
      <button className="active" aria-current="page"><BarChart3 size={16}/>OEM programme lead</button>
      <button onClick={() => onNavigate('overview')}><ClipboardCheck size={16}/>Programme control</button>
      <button onClick={() => onNavigate('field')}><Smartphone size={16}/>Field installer</button>
    </div>

    <div className="oem-metrics">
      <Metric icon={<BatteryCharging/>} label="Affected population" value={total} note="controlled sample assets"/>
      <Metric icon={<CheckCheck/>} label="Verified resolution" value={`${percent(verified, total)}%`} note={`${verified} evidence-approved records`} accent/>
      <Metric icon={<FileCheck2/>} label="Complete evidence packs" value={completePacks} note={`${categories.length} mandatory controls per pack`}/>
      <Metric icon={<Truck/>} label="Returns reconciled" value={returned} note="received with custody reference"/>
    </div>

    <div className="oem-primary-grid">
      <section className="panel oem-progress-panel">
        <div className="panel-heading">
          <div><span className="eyebrow">LIVE PROGRAMME</span><h2>Population control</h2><p>Every stage reconciles to an identifiable asset.</p></div>
          <span className="small-tag">UNIT LEVEL</span>
        </div>
        <div className="oem-stage-list">
          {stages.map(([label, value], index) => <button key={label} onClick={() => onNavigate(index === 4 ? 'reports' : 'orders')} className="oem-stage-row">
            <span className="stage-index">0{index + 1}</span>
            <span className="stage-name">{label}</span>
            <Progress value={percent(value, total)}/>
            <strong>{value}</strong>
            <span className="stage-percent">{percent(value, total)}%</span>
          </button>)}
        </div>
        <div className="reconciliation-note"><LockKeyhole size={18}/><span><strong>{total - verified} records remain open.</strong> No unit disappears between intake, field delivery and assurance.</span></div>
      </section>

      <section className="panel demo-runbook">
        <div className="panel-heading"><div><span className="eyebrow">7-MINUTE WALKTHROUGH</span><h2>Prove the operating model</h2></div></div>
        <ol>
          <RunbookStep number="1" title="Control the population" text="Show serial-level intake, duplicate prevention and regional demand." action="Open work orders" onClick={() => onNavigate('orders')}/>
          <RunbookStep number="2" title="Mobilise qualified capacity" text="Show approval, credentials, expiry and weekly capacity." action="Open network" onClick={() => onNavigate('network')}/>
          <RunbookStep number="3" title="Block incomplete close-out" text="Open a record and demonstrate the evidence gate." action="Open record" onClick={() => reviewJob && onOpenJob(reviewJob.id)}/>
          <RunbookStep number="4" title="Reconcile the removed asset" text="Trace disposition, return reference and depot receipt." action="Open returns" onClick={() => onNavigate('returns')}/>
          <RunbookStep number="5" title="Give the OEM one truth" text="Export programme results and the decision trail." action="Open reports" onClick={() => onNavigate('reports')}/>
        </ol>
      </section>
    </div>

    <section className="panel assurance-chain">
      <div className="panel-heading"><div><span className="eyebrow">CONTROLLED DELIVERY</span><h2>The assurance chain</h2><p>A single responsibility model across programme, field and review.</p></div></div>
      <div className="assurance-chain-grid">
        <ChainStep icon={<BatteryCharging/>} number="01" title="Identify" text="Affected serial population, eligibility and priority."/>
        <ChainStep icon={<Users/>} number="02" title="Mobilise" text="Customer contact, accredited capacity and scheduling."/>
        <ChainStep icon={<Smartphone/>} number="03" title="Intervene" text="Controlled work pack, safety stop and field evidence."/>
        <ChainStep icon={<BadgeCheck/>} number="04" title="Assure" text="Independent review, rework control and audit export."/>
      </div>
    </section>

    <div className="oem-lower-grid">
      <section className="panel risk-register">
        <div className="panel-heading"><div><h2>Programme risk radar</h2><p>Exceptions surface before delivery performance slips.</p></div><AlertTriangle size={20}/></div>
        <RiskRow label="Safety escalations" value={safety} tone={safety ? 'critical' : 'clear'} action={() => onNavigate('service')}/>
        <RiskRow label="Evidence awaiting review" value={data.jobs.filter(job => job.status === 'Awaiting review').length} tone="review" action={() => onNavigate('evidence')}/>
        <RiskRow label="Regions without approved cover" value={uncovered.length} tone={uncovered.length ? 'critical' : 'clear'} action={() => onNavigate('network')}/>
        <RiskRow label="Units awaiting parts" value={data.jobs.filter(job => job.status === 'Awaiting parts').length} tone="review" action={() => onNavigate('service')}/>
      </section>

      <section className="panel pilot-boundary">
        <div className="panel-heading"><div><h2>Pilot readiness boundary</h2><p>What this live environment proves—and what a contracted pilot configures.</p></div><ShieldCheck size={20}/></div>
        <div className="boundary-group">
          <span className="boundary-label demonstrated">DEMONSTRATED NOW</span>
          <div className="boundary-tags"><span>Serial traceability</span><span>Evidence gates</span><span>Installer controls</span><span>Returns custody</span><span>Audit exports</span><span>SLA visibility</span></div>
        </div>
        <div className="boundary-group">
          <span className="boundary-label pilot">CONFIGURED FOR PILOT</span>
          <div className="boundary-tags muted-tags"><span>Named accounts & SSO</span><span>OEM API / SFTP</span><span>Secure cloud records</span><span>SMS & email</span><span>Carrier integration</span><span>Security acceptance</span></div>
        </div>
        <Button variant="outline" onClick={() => onNavigate('governance')}>Review governance controls<ArrowRight size={16}/></Button>
      </section>
    </div>

    <div className="oem-disclaimer"><ShieldCheck size={15}/><span>Proposed Stratford Energy service model using fictional sample records. No OEM appointment, live product connection or confirmed UK corrective-action programme is represented.</span></div>
  </div>;
}

function Metric({icon, label, value, note, accent = false}: {icon: React.ReactNode; label: string; value: string | number; note: string; accent?: boolean}) {
  return <section className={`oem-metric ${accent ? 'accent' : ''}`}><div>{icon}<span>{label}</span></div><strong>{value}</strong><p>{note}</p></section>;
}

function RunbookStep({number, title, text, action, onClick}: {number: string; title: string; text: string; action: string; onClick: () => void}) {
  return <li><span className="runbook-number">{number}</span><div><strong>{title}</strong><p>{text}</p><button onClick={onClick}>{action}<ArrowRight size={14}/></button></div></li>;
}

function ChainStep({icon, number, title, text}: {icon: React.ReactNode; number: string; title: string; text: string}) {
  return <div className="chain-step"><div className="chain-icon">{icon}</div><span>{number}</span><h3>{title}</h3><p>{text}</p></div>;
}

function RiskRow({label, value, tone, action}: {label: string; value: number; tone: string; action: () => void}) {
  return <button className="risk-row" onClick={action}><span className={`risk-dot ${tone}`}/><span>{label}</span><strong>{value}</strong><ArrowRight size={15}/></button>;
}
