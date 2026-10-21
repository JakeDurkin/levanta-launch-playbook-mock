(function(){
'use strict';
var AS_OF='2026-10-19';
var D={};
var MKTS=[
 {key:'wayfair',name:'Wayfair',L:'2026-10-05',mktLaunch:'2026-10-13',phase:'hypercare',source:'linear',note:'Live since Oct 5. Marketing launch Oct 13.'},
 {key:'target',name:'Target',L:null,phase:'deal',source:'template',note:'Seeded from the playbook task template. Go-live date not set.'}
];
var NAV=[['#/','Dashboard'],['#/risks','Decisions & risks'],['#/launch/wayfair/hypercare','Launches'],['#/people','People'],['#/assets','Assets'],['#/asks','Partner asks'],['#/playbook','Playbook'],['#/links','Links']];
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function addDays(d,n){var t=new Date(d+'T12:00:00Z');t.setUTCDate(t.getUTCDate()+n);return t.toISOString().slice(0,10);}
function days(a,b){return Math.round((new Date(b+'T12:00:00Z')-new Date(a+'T12:00:00Z'))/864e5);}
function fmt(d){if(!d)return 'TBD';var t=new Date(d+'T12:00:00Z');return t.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'});}
function mkt(k){return MKTS.filter(function(m){return m.key===k;})[0];}
function phase(k){return D.pb.phases.filter(function(p){return p.key===k;})[0];}
function linearFor(ph){return D.lin.issues.filter(function(i){return i.phase===ph;});}
var ACTIVE=function(i){return i.statusType!=='canceled'&&i.statusType!=='duplicate';};
var ISV2=function(i){return ACTIVE(i)&&i.statusType!=='completed';};
function v2(){return D.lin.issues.filter(ISV2);}
function readiness(m){
  if(m.source!=='linear')return null;
  var a=D.lin.issues.filter(function(i){return ACTIVE(i)&&!ISV2(i);});var d=a.filter(function(i){return i.statusType==='completed';});
  return {pct:Math.round(100*d.length/a.length),done:d.length,total:a.length};
}
function overdueAsks(m){
  if(m.key!=='wayfair')return null;
  return D.pb.asks.filter(function(a){return days(a.opened,AS_OF)>2;}).length;
}
function nextGate(m){
  if(!m.phase)return null;var p=phase(m.phase);
  var due=m.L?addDays(m.L,p.end*7):null;
  return {gate:p.gate,name:p.gateName,due:due,days:due?days(AS_OF,due):null};
}
function rag(m){
  var r=readiness(m),o=overdueAsks(m),g=nextGate(m);
  if(!r)return {c:'n',t:'Not scored'};
  if(m.key==='wayfair')return {c:'g',t:'Green',why:'Live, SOW scope delivered'};
  var why=[];
  if(o>=3)why.push(o+' partner asks past 48h; reply times not logged');
  if(r.pct<70)why.push('readiness '+r.pct+'%');
  if(g&&g.days!==null&&g.days<0)why.push(g.gate+' past due');
  if(why.length)return {c:'r',t:'Red',why:why.join(', ')};
  if(r.pct<85||o>0)return {c:'a',t:'Amber',why:o>0?o+' partner asks past 48h':'readiness '+r.pct+'%'};
  return {c:'g',t:'Green',why:''};
}
function syncNote(){
  return '<div class="sync"><span>&#8635;</span><div><b>Synced from Linear.</b> Read-only snapshot of “'+esc(D.lin.project.name)+'” taken '+fmt(D.lin.snapshot)+'. To change a task, edit it in Linear (the team’s task tracker).</div></div>';
}
function setNav(h){document.getElementById('nav').innerHTML=NAV.map(function(n){var on=(h===n[0]||(n[1]==='Launches'&&/^#\/launch/.test(h)));return '<a href="'+n[0]+'"'+(on?' class="on"':'')+'>'+n[1]+'</a>';}).join('');}

function dashboard(){
  var rows=MKTS.map(function(m){
    var p=m.phase?phase(m.phase):null,g=nextGate(m),r=readiness(m),o=overdueAsks(m),s=rag(m);
    var ph=m.source==='placeholder'?'<span class="pill ph">Not started / placeholder</span>':esc(p.n+'. '+p.name)+(m.source==='template'?' <span class="muted">(not started)</span>':'');
    return '<tr class="click" data-href="#/launch/'+m.key+'/'+(m.phase||'deal')+'"><td><b>'+esc(m.name)+'</b><div class="muted">'+esc(m.note)+'</div></td><td>'+ph+'</td><td>'+fmt(m.L)+(m.mktLaunch?'<div class="muted">Marketing launch '+fmt(m.mktLaunch)+'</div>':'')+'</td><td>'+(g?(g.days!==null?'<span class="days">'+g.days+'</span> <span class="muted">days to '+g.gate+' '+esc(g.name)+' ('+fmt(g.due)+')</span>':'TBD <span class="muted">('+g.gate+' '+esc(g.name)+')</span>'):'TBD')+'</td><td><span class="status"><span class="dot '+s.c+'"></span><b>'+s.t+'</b>'+(s.why?' · '+esc(s.why):'')+'</span></td><td>'+(r?'<span class="stat">'+r.pct+'%</span><div class="muted">'+r.done+' of '+r.total+' SOW tasks done</div><div class="muted"><a href="#/launch/wayfair/v2">V2 backlog: '+v2().length+' tickets</a></div>':'TBD')+'</td><td>'+(o===null?'TBD':'<span class="stat">'+o+'</span><div class="muted">of '+D.pb.asks.length+' open past 48h</div><div class="muted">Listed only, not used for status</div>')+'</td></tr>';
  }).join('');
  return '<h1>Marketplace <em>launches</em> at a glance</h1><p class="helper">One row per marketplace. Click a row to open its launch page. Status as of '+fmt(AS_OF)+'.</p>'+syncNote()+
  '<table><thead><tr><th>Marketplace</th><th>Current phase</th><th>Go-live (L)</th><th>Next gate</th><th>Status</th><th>Readiness</th><th>Overdue partner asks</th></tr></thead><tbody>'+rows+'</tbody></table>'+
  '<p class="muted nextup">Next up: Best Buy, Chewy</p>'+
  '<details class="foot muted"><summary>How status and readiness are computed</summary>Readiness = Done tasks / V1 (SOW) tasks still in play; canceled and duplicate excluded. Open or future Linear tickets count as V2 backlog and do not affect readiness. Wayfair is live with the SOW delivered, so it shows Green. For launches before go-live: Green = 85%+ readiness and the next gate on time. Amber = 70 to 84%. Red = under 70% or the next gate past due. Partner asks are listed with their 48-hour window but do not drive status. Gate dates = L + the phase’s end week.</details>';
}

function launch(mk,pk){
  var m=mkt(mk);if(!m)return '<p>Unknown marketplace.</p>';
  pk=pk||m.phase||'deal';var p=phase(pk==='v2'?m.phase:pk);
  var curN=m.phase?phase(m.phase).n:0;
  var tl=D.pb.phases.map(function(x){var cls=x.n<curN?'past':x.n===curN?'cur':'';var gd=x.n<curN?'Past phase':(m.L?'Target '+fmt(addDays(m.L,x.end*7)):'Date TBD');
    return '<a class="tl '+cls+'" href="#/launch/'+mk+'/'+x.key+'"><b>'+x.n+'. '+esc(x.name)+'</b>'+esc(x.timing)+'<div class="gate">'+x.gate+' '+esc(x.gateName)+'</div><div>'+gd+'</div></a>';}).join('');
  var tabs=D.pb.phases.map(function(x){return '<a href="#/launch/'+mk+'/'+x.key+'"'+(x.key===pk?' class="on"':'')+'>'+esc(x.name)+'</a>';}).join('')+(m.source==='linear'?'<a href="#/launch/'+mk+'/v2"'+(pk==='v2'?' class="on"':'')+'>V2 backlog ('+v2().length+')</a>':'');
  if(pk==='v2'&&m.source==='linear')return v2page(m,tl,tabs);
  var head='<p class="muted"><a href="#/">Dashboard</a> / '+esc(m.name)+'</p><h1>'+esc(m.name)+' <em>launch</em></h1><p class="helper">'+esc(m.note)+' L = go-live day; phase timing is in weeks before or after L. Gates (G1 to G7) are the checkpoints that close each phase.</p>';
  if(m.source==='placeholder'){
    return head+'<div class="card sand"><span class="pill ph">Not started / placeholder</span><p>No deal, dates, owners or tasks exist in the sources for '+esc(m.name)+'. When a deal starts, the launch is seeded from the playbook task template (61 tasks across 7 phases), like Target.</p><a class="btn" href="#/launch/target/deal">See the Target example</a></div><div class="timeline">'+tl+'</div>';
  }
  var body=head+(m.source==='linear'?syncNote():'<div class="sync"><span>&#9776;</span><div><b>Dates and owners get set at kickoff.</b> Tasks come from the playbook template; due dates are relative to go-live (L) and owners are shown by role.</div></div>')+
   '<div class="tlwrap"><div class="timeline">'+tl+'</div></div><div class="tabs">'+tabs+'</div>';
  var tasks,rowsHtml,next=[],gateStates,owner;
  if(m.source==='linear'){
    owner=p.accountable+'. On Wayfair: '+p.wfOwner;
    tasks=linearFor(pk);gateStates=p.wfGate;
    var pri={'In Progress':0,'In Review':1,'Needs Reqs':2,'Todo':3,'Backlog':4};
    var open=[];var v2n=tasks.filter(ISV2).length;tasks=tasks.filter(function(i){return !ISV2(i);});
    open.sort(function(a,b){return ((pri[a.status]==null?5:pri[a.status])-(pri[b.status]==null?5:pri[b.status]))||(a.id<b.id?1:-1);});
    var shown=[],rest=tasks.filter(function(i){return shown.indexOf(i)<0;});
    var row=function(i){return '<tr><td><a href="'+esc(i.url)+'" target="_blank" rel="noopener" title="'+esc(i.id)+' in Linear">'+esc(i.title)+'</a></td><td>'+esc(i.owner||'Unassigned')+'</td><td>'+fmt(i.due)+'</td><td><span class="pill'+(i.statusType==='completed'?' done':'')+'">'+esc(i.status)+'</span></td></tr>';};
    var th='<thead><tr><th>Task</th><th>Owner</th><th>Due</th><th>Status</th></tr></thead>';
    if(tasks.length){
      rowsHtml=(shown.length?'<table>'+th+'<tbody>'+shown.map(row).join('')+'</tbody></table>':'<div class="card sand">All V1 (SOW) tasks in this phase are done.'+(v2n?' '+v2n+' open ticket'+(v2n===1?' is':'s are')+' in the <a href="#/launch/wayfair/v2">V2 backlog</a>.':'')+'</div>')+
       (rest.length?'<details class="showall"><summary>Show all '+tasks.length+' V1 tasks</summary><table>'+th+'<tbody>'+rest.map(row).join('')+'</tbody></table></details>':'');
      next=open.slice(0,3).map(function(i){return esc(i.title)+', '+esc(i.owner||'owner TBD');});
    } else {
      rowsHtml='<div class="card sand">For Wayfair, this phase’s work was not tracked in Linear (it lived in Asana, Drive and Slack; see Playbook section 14). Nothing to sync. The template tasks below show what the next launch will track.</div>'+tplTable(pk,true);
    }
    if(!next.length)next=p.checklist.filter(function(c,ix){return gateStates[ix]!=='done';}).slice(0,3).map(function(c){return 'Close gate item: '+esc(c);});
  } else {
    owner=p.accountable+'. Named at kickoff.';gateStates=p.checklist.map(function(){return 'open';});
    rowsHtml=tplTable(pk,false);
    next=D.tpl.filter(function(t){return t.phase===pk&&t.label!=='type:gate';}).slice(0,3).map(function(t){return esc(t.title)+', '+esc(own(t.owner))+' (due '+esc(t.due)+')';});
  }
  var gl={done:'Met',open:'Open',unknown:'Unconfirmed'};
  var chk='<ul class="chk">'+p.checklist.map(function(c,ix){var s=gateStates[ix];return '<li><span class="box '+s+'">'+(s==='done'?'&#10003;':'')+'</span><span>'+esc(c)+' <span class="muted">· '+gl[s]+'</span></span></li>';}).join('')+'</ul>';
  body+='<div class="grid2"><div><h2>'+p.n+'. '+esc(p.full)+'</h2><p class="helper">'+esc(p.timing)+'. Ends at gate '+p.gate+' '+esc(p.gateName)+'.</p><div class="card sand"><h3 style="margin-top:0">Accountable owner</h3>'+esc(owner)+'</div><h3>Tasks</h3>'+rowsHtml+'</div><div><div class="card"><h3 style="margin-top:0">Next three actions</h3><ol class="next">'+(next.length?next.map(function(n){return '<li>'+n+'</li>';}).join(''):'<li>None open</li>')+'</ol></div><div class="card"><h3 style="margin-top:0">Gate '+p.gate+' checklist</h3><p class="muted">The phase is done when every line is true.</p>'+chk+'</div>'+(m.source==='linear'?'<div class="card sand"><h3 style="margin-top:0">What happened on Wayfair</h3><p class="muted" style="font-size:13px">'+esc(p.wf)+'</p><p class="muted">[C] confirmed in sources · [I] inferred, check it.</p></div>':'')+'</div></div>';
  return body;
}
function v2page(m,tl,tabs){
  var pri={'In Progress':0,'In Review':1,'Needs Reqs':2,'Todo':3,'Backlog':4};
  var t=v2().slice().sort(function(a,b){return ((pri[a.status]==null?5:pri[a.status])-(pri[b.status]==null?5:pri[b.status]))||(a.id<b.id?1:-1);});
  return '<p class="muted"><a href="#/">Dashboard</a> / '+esc(m.name)+'</p><h1>'+esc(m.name)+' <em>launch</em></h1><p class="helper">'+esc(m.note)+'</p>'+syncNote()+'<div class="tlwrap"><div class="timeline">'+tl+'</div></div><div class="tabs">'+tabs+'</div>'+
   '<h2>V2 backlog</h2><p class="helper">Not required for launch. Scoped for a possible V2; some may not move forward. Every open or future Linear ticket on this project lands here.</p>'+
   '<table><thead><tr><th>Ticket</th><th>Owner</th><th>Due</th><th>Status</th></tr></thead><tbody>'+t.map(function(i){return '<tr><td><a href="'+esc(i.url)+'" target="_blank" rel="noopener" title="'+esc(i.id)+' in Linear">'+esc(i.title)+'</a></td><td>'+esc(i.owner||'Unassigned')+'</td><td>'+fmt(i.due)+'</td><td><span class="pill">'+esc(i.status)+'</span></td></tr>';}).join('')+'</tbody></table><p class="muted">'+t.length+' tickets.</p>';
}
function own(o){if(/^Stacey/.test(o))return 'Stacey';return /^</.test(o)?o.replace(/[<>]/g,''):o;}
function tplTable(pk,ref){
  var t=D.tpl.filter(function(x){return x.phase===pk;});
  return '<table><thead><tr><th>Task</th><th>Owner</th><th>Due</th><th>Status</th></tr></thead><tbody>'+t.map(function(x){return '<tr><td>'+(x.label==='type:gate'?'<b>'+esc(x.title)+'</b>':esc(x.title))+'<div class="muted">Done when: '+esc(x.doneWhen)+'</div></td><td>'+esc(own(x.owner))+'</td><td>'+esc(x.due)+'</td><td><span class="pill">'+(ref?'Template only':'Not started')+'</span></td></tr>';}).join('')+'</tbody></table>';
}
function people(){
  var t=D.pb.teams;
  return '<h1>Who does <em>what</em></h1><p class="helper">RACI by team. R = does the work · A = accountable (one per row) · C = consulted · I = informed. Rule: a row with no A is not ready to start.</p>'+
  '<table class="raci"><thead><tr><th>Activity</th>'+t.map(function(x){return '<th>'+esc(x)+'</th>';}).join('')+'</tr></thead><tbody>'+D.pb.raci.map(function(r){return '<tr><td>'+esc(r.activity)+'</td>'+r.cells.map(function(c){return '<td class="c '+c+'">'+c+'</td>';}).join('')+'</tr>';}).join('')+'</tbody></table>'+
  '<h2>Named owners</h2><p class="helper">Who did each job on Wayfair, and the placeholder for the next launch. TBD roles are named at kickoff.</p><table><thead><tr><th>Role</th><th>Wayfair</th><th>Next launch</th></tr></thead><tbody>'+D.pb.roles.map(function(r){return '<tr><td>'+esc(r.role)+'</td><td>'+esc(r.wayfair)+'</td><td>'+esc(own(r.next))+'</td></tr>';}).join('')+'</tbody></table>';
}
function assets(){
  return '<h1>The 24-piece <em>asset</em> kit</h1><p class="helper">Every launch ships the same kit. Each asset is one Linear task labeled type:asset; final files live in “03 Assets Final” in Drive. Due dates are relative to go-live (L).</p><table><thead><tr><th>#</th><th>Asset</th><th>Owner</th><th>Due</th><th>Languages</th><th>Wayfair reference</th></tr></thead><tbody>'+D.pb.assets.map(function(a){return '<tr><td>'+a.id+'</td><td>'+esc(a.name)+'</td><td>'+esc(a.owner)+'</td><td>'+esc(a.due)+'</td><td>'+esc(a.lang)+'</td><td class="muted">'+esc(a.wf)+'</td></tr>';}).join('')+'</tbody></table>';
}
function risks(){
  return '<h1>Decisions and <em>risks</em></h1><p class="helper">Open decisions from the playbook (section 15), then the risk register (section 9). Every risk actually happened on Wayfair.</p><div class="card sand"><h3 style="margin-top:0">Decisions Jake needs to make</h3><ol>'+D.pb.decisions.map(function(d){return '<li>'+esc(d)+'</li>';}).join('')+'</ol><p class="muted">Decision owner: Jake Durkin · due date TBD.</p></div><table><thead><tr><th>#</th><th>Risk</th><th>Prevention</th><th>Owner</th><th>Phase</th></tr></thead><tbody>'+D.pb.risks.map(function(r){return '<tr><td>'+r.id+'</td><td>'+esc(r.risk)+'</td><td>'+esc(r.prevention)+'</td><td>'+esc(own(r.owner))+'</td><td>'+esc(r.phase)+'</td></tr>';}).join('')+'</tbody></table>';
}
function asks(){
  return '<h1>Partner <em>asks</em></h1><p class="helper">Every ask from a partner should become a Linear task within 24 hours and get a reply within 48 hours. Wayfair’s current list is Emily Proulx’s Oct 14 follow-up list (status as of playbook v1.0, Oct 16). These are not yet Linear tasks.</p><table><thead><tr><th>#</th><th>Ask</th><th>Owner</th><th>Opened</th><th>Status</th><th>48-hour window</th></tr></thead><tbody>'+D.pb.asks.map(function(a){var od=days(a.opened,AS_OF)>2;return '<tr><td>'+a.n+'</td><td>'+esc(a.item)+'</td><td>'+esc(a.owner)+'</td><td>'+fmt(a.opened)+'</td><td>'+esc(a.status)+'</td><td>'+(od?'<span class="dot r"></span>Open past 48h':'Within window')+'</td></tr>';}).join('')+'</tbody></table><p class="muted">Target: no partner asks yet.</p>';
}
function links(){
  var L=[['#project-wayfair','Private internal launch channel','https://levantagroup.slack.com/archives/C0B4N3CR14Z'],['#levanta-x-wayfair','Slack Connect with the partner business team','https://levantagroup.slack.com/archives/C0AAS2W66F6'],['#levanta-x-wayfair-eng','Slack Connect, engineering (hosted in Wayfair’s workspace)','https://levantagroup.slack.com/archives/C0B5EK6K4LR'],['#new-wayfair-brands','Internal alert: first brand per team, CS replies with rank','https://levantagroup.slack.com/archives/C0C5CHYJGSW']];
  var tr=function(r){return '<tr><td><b>'+esc(r[0])+'</b></td><td>'+esc(r[1])+'</td><td>'+(r[2].indexOf('http')===0?'<a href="'+esc(r[2])+'" target="_blank" rel="noopener">Open</a>':'<span class="muted">'+esc(r[2])+'</span>')+'</td></tr>';};
  return '<h1>Where things <em>live</em></h1><p class="helper">Slack is for talking, Drive is for files, Linear is for tasks and decisions. Links show “link TBD” where the sources don’t include a URL.</p><h2>Wayfair</h2><table><thead><tr><th>Name</th><th>What it’s for</th><th>Link</th></tr></thead><tbody>'+L.map(tr).join('')+
  [['Linear: Wayfair Integration (P-LEV-405)','Engineering tracker, 175 tasks in the snapshot',D.lin.project.url],['Drive: Marketplace Launches / Wayfair','Files only (01 Contract … 07 Reporting, Archive)','https://drive.google.com/drive/folders/1iB6LbQtEFWDnRxOKySy_2rOyJ__IVC3l'],['Signed SOW (MSA + 2 SOWs, May 19–20)','In 01 Contract & Commercial','https://drive.google.com/file/d/1eJHPjqe9tpoyqKE6eznvKmKYFg-kqlRt/view'],['Hex onboarding and revenue dashboard','Activation and GMV data (TJ, Oct 7)','https://app.hex.tech/019c7c98-14d6-700d-8f8c-1a5f5ca82d17/app/Wayfair-Account-Onboarding-Performance-034bwa3ATTOazB3gzPVJX5/latest']].map(tr).join('')+'</tbody></table>'+
  '<h2>Target <span class="muted" style="font-family:Inter">(proposed names from the playbook)</span></h2><table><thead><tr><th>Name</th><th>What it’s for</th><th>Link</th></tr></thead><tbody>'+[['#project-target','Private internal','link TBD'],['#levanta-x-target','Slack Connect, business','link TBD'],['#levanta-x-target-eng','Slack Connect, engineering','link TBD'],['#new-target-brands','First-brand alerts','link TBD'],['Linear: Marketplace Launch: Target','Not created yet','link TBD'],['Drive: Marketplace Launches / Target','Not created yet','link TBD'],['SOW','Not signed yet','link TBD'],['Hex dashboard','Not built yet','link TBD']].map(tr).join('')+'</tbody></table>';
}
function playbook(){
  return '<h1>The launch <em>playbook</em></h1><p class="helper">Marketplace Integration Launch Playbook v1.0 (drafted Oct 16, 2026), rendered from the source doc. The swimlane shows who does what in each phase.</p><div class="card"><img src="assets/marketplace_launch_swimlane.png" alt="Swimlane: 7 phases across 7 lanes" style="width:100%"></div><div class="doc">'+D.doc+'</div>';
}
function render(){
  var h=location.hash||'#/';setNav(h.split('?')[0]);
  var p=h.replace(/^#\//,'').split('/'),html;
  if(p[0]==='launch')html=launch(p[1],p[2]);
  else html=({'people':people,'assets':assets,'risks':risks,'asks':asks,'links':links,'playbook':playbook}[p[0]]||dashboard)();
  var app=document.getElementById('app');app.innerHTML=html;window.scrollTo(0,0);
  Array.prototype.forEach.call(app.querySelectorAll('table'),function(t){var hs=Array.prototype.map.call(t.querySelectorAll('thead th'),function(x){return x.textContent;});Array.prototype.forEach.call(t.querySelectorAll('tbody tr'),function(tr){Array.prototype.forEach.call(tr.children,function(td,ix){if(hs[ix])td.setAttribute('data-label',hs[ix]);});});});
  document.body.classList.remove('menu-open');
  Array.prototype.forEach.call(app.querySelectorAll('tr[data-href]'),function(tr){tr.addEventListener('click',function(){location.hash=tr.getAttribute('data-href');});});
}
document.getElementById('menuBtn').addEventListener('click',function(){var o=document.body.classList.toggle('menu-open');this.setAttribute('aria-expanded',o);});
Promise.all([fetch('data/wayfair_linear.json').then(function(r){return r.json();}),fetch('data/template.json').then(function(r){return r.json();}),fetch('data/playbook.json').then(function(r){return r.json();}),fetch('data/playbook.html').then(function(r){return r.text();})]).then(function(a){D.lin=a[0];D.tpl=a[1];D.pb=a[2];D.doc=a[3];window.addEventListener('hashchange',render);render();}).catch(function(e){document.getElementById('app').innerHTML='<p>Could not load data: '+esc(e.message)+'</p>';});
})();
