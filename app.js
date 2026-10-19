(function(){
'use strict';
var AS_OF='2026-10-19';
var D={};
var MKTS=[
 {key:'wayfair',name:'Wayfair',L:'2026-10-05',mktLaunch:'2026-10-13',phase:'hypercare',source:'linear',note:'Live since Oct 5. Marketing launch Oct 13.'},
 {key:'target',name:'Target',L:null,phase:'deal',source:'template',note:'Seeded from the playbook task template. Go-live date not set.'},
 {key:'bestbuy',name:'Best Buy',L:null,phase:null,source:'placeholder',note:'Not started / placeholder'},
 {key:'chewy',name:'Chewy',L:null,phase:null,source:'placeholder',note:'Not started / placeholder'}
];
var NAV=[['#/','Dashboard'],['#/people','People'],['#/assets','Assets'],['#/risks','Decisions & risks'],['#/asks','Partner asks'],['#/links','Links'],['#/playbook','Playbook']];
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function addDays(d,n){var t=new Date(d+'T12:00:00Z');t.setUTCDate(t.getUTCDate()+n);return t.toISOString().slice(0,10);}
function days(a,b){return Math.round((new Date(b+'T12:00:00Z')-new Date(a+'T12:00:00Z'))/864e5);}
function fmt(d){if(!d)return 'TBD';var t=new Date(d+'T12:00:00Z');return t.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'});}
function mkt(k){return MKTS.filter(function(m){return m.key===k;})[0];}
function phase(k){return D.pb.phases.filter(function(p){return p.key===k;})[0];}
function linearFor(ph){return D.lin.issues.filter(function(i){return i.phase===ph;});}
var ACTIVE=function(i){return i.statusType!=='canceled'&&i.statusType!=='duplicate';};
function readiness(m){
  if(m.source!=='linear')return null;
  var a=D.lin.issues.filter(ACTIVE);var d=a.filter(function(i){return i.statusType==='completed';});
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
  if(r.pct<70||o>=3||(g&&g.days!==null&&g.days<0))return {c:'r',t:'Red'};
  if(r.pct<85||o>0)return {c:'a',t:'Amber'};
  return {c:'g',t:'Green'};
}
function syncNote(){
  return '<div class="sync"><span>&#8635;</span><div><b>Synced from Linear</b> — tasks shown here are a read-only snapshot of the Linear project “'+esc(D.lin.project.name)+'” taken '+fmt(D.lin.snapshot)+'; to change a task, edit it in Linear (the team’s task tracker) and the next snapshot will pick it up.</div></div>';
}
function setNav(h){document.getElementById('nav').innerHTML=NAV.map(function(n){var on=(h===n[0]||(n[0]==='#/'&&/^#\/launch/.test(h)));return '<a href="'+n[0]+'"'+(on?' class="on"':'')+'>'+n[1]+'</a>';}).join('');}

function dashboard(){
  var rows=MKTS.map(function(m){
    var p=m.phase?phase(m.phase):null,g=nextGate(m),r=readiness(m),o=overdueAsks(m),s=rag(m);
    var ph=m.source==='placeholder'?'<span class="pill ph">Not started / placeholder</span>':esc(p.n+'. '+p.name)+(m.source==='template'?' <span class="muted">(not started)</span>':'');
    return '<tr class="click" data-href="#/launch/'+m.key+'/'+(m.phase||'deal')+'"><td><b>'+esc(m.name)+'</b><div class="muted">'+esc(m.note)+'</div></td><td>'+ph+'</td><td>'+fmt(m.L)+(m.mktLaunch?'<div class="muted">Marketing launch '+fmt(m.mktLaunch)+'</div>':'')+'</td><td>'+(g?(g.days!==null?'<span class="stat">'+g.days+'</span> <span class="muted">days to '+g.gate+' '+esc(g.name)+' ('+fmt(g.due)+')</span>':'TBD <span class="muted">('+g.gate+' '+esc(g.name)+')</span>'):'TBD')+'</td><td><span class="dot '+s.c+'"></span>'+s.t+'</td><td>'+(r?'<span class="stat">'+r.pct+'%</span><div class="muted">'+r.done+' of '+r.total+' tasks done</div>':'TBD')+'</td><td>'+(o===null?'TBD':'<span class="stat">'+o+'</span><div class="muted">of '+D.pb.asks.length+' open past 48h</div>')+'</td></tr>';
  }).join('');
  return '<h1>Marketplace <em>launches</em> at a glance</h1><p class="helper">One row per marketplace. Click a row to open its launch page. Status as of '+fmt(AS_OF)+'.</p>'+syncNote()+
  '<table><thead><tr><th>Marketplace</th><th>Current phase</th><th>Go-live (L)</th><th>Next gate</th><th>Status</th><th>Readiness</th><th>Overdue partner asks</th></tr></thead><tbody>'+rows+'</tbody></table>'+
  '<p class="muted" style="margin-top:12px"><b>How these are computed.</b> Readiness = tasks marked Done ÷ all tasks still in play (canceled and duplicate tasks excluded) in the Linear snapshot. Status: <span class="dot g"></span>Green = readiness 85%+ and no overdue asks · <span class="dot a"></span>Amber = readiness 70–84% or 1–2 overdue asks · <span class="dot r"></span>Red = readiness under 70%, 3+ overdue asks, or the next gate is past due. Overdue partner ask = open item older than the playbook’s 48-hour reply window (source: Emily’s Oct 14 list, status as of playbook v1.0 on Oct 16; reply times are not recorded, so open items count as overdue). Gate dates = L + the phase’s end week from the playbook.</p>';
}

function launch(mk,pk){
  var m=mkt(mk);if(!m)return '<p>Unknown marketplace.</p>';
  pk=pk||m.phase||'deal';var p=phase(pk);
  var curN=m.phase?phase(m.phase).n:0;
  var tl=D.pb.phases.map(function(x){var cls=x.n<curN?'past':x.n===curN?'cur':'';var gd=x.n<curN?'Past phase':(m.L?'Target '+fmt(addDays(m.L,x.end*7)):'Date TBD');
    return '<a class="tl '+cls+'" href="#/launch/'+mk+'/'+x.key+'"><b>'+x.n+'. '+esc(x.name)+'</b>'+esc(x.timing)+'<div class="gate">'+x.gate+' '+esc(x.gateName)+'</div><div>'+gd+'</div></a>';}).join('');
  var tabs=D.pb.phases.map(function(x){return '<a href="#/launch/'+mk+'/'+x.key+'"'+(x.key===pk?' class="on"':'')+'>'+esc(x.name)+'</a>';}).join('');
  var head='<p class="muted"><a href="#/">Dashboard</a> / '+esc(m.name)+'</p><h1>'+esc(m.name)+' <em>launch</em></h1><p class="helper">'+esc(m.note)+' L = go-live day; phase timing is in weeks before or after L. Gates (G1–G7) are the checkpoints that close each phase.</p>';
  if(m.source==='placeholder'){
    return head+'<div class="card sand"><span class="pill ph">Not started / placeholder</span><p>No deal, dates, owners or tasks exist in the sources for '+esc(m.name)+'. When a deal starts, the launch is seeded from the playbook task template (61 tasks across 7 phases), like Target.</p><a class="btn" href="#/launch/target/deal">See the Target example</a></div><div class="timeline">'+tl+'</div>';
  }
  var body=head+(m.source==='linear'?syncNote():'<div class="sync"><span>&#9776;</span><div><b>Seeded from the playbook template</b> — these tasks come from marketplace_launch_linear_template.csv. No Linear project exists for '+esc(m.name)+' yet, so owners and dates show TBD until kickoff.</div></div>')+
   '<div class="timeline">'+tl+'</div><div class="tabs">'+tabs+'</div>';
  var tasks,rowsHtml,next=[],gateStates,owner;
  if(m.source==='linear'){
    owner=p.accountable+' — Wayfair: '+p.wfOwner;
    tasks=linearFor(pk);gateStates=p.wfGate;
    var act=tasks.filter(ACTIVE),hidden=tasks.length-act.length;
    var order={started:0,unstarted:1,backlog:2,completed:3};
    act.sort(function(a,b){return (order[a.statusType]-order[b.statusType])||(a.id<b.id?1:-1);});
    if(act.length){
      rowsHtml='<table><thead><tr><th>Task</th><th>Owner</th><th>Due</th><th>Status</th></tr></thead><tbody>'+act.map(function(i){return '<tr><td><a href="'+esc(i.url)+'" target="_blank" rel="noopener">'+esc(i.id)+'</a> '+esc(i.title)+(i.milestone?'<div class="muted">Linear milestone: '+esc(i.milestone)+'</div>':'<div class="muted">No Linear milestone</div>')+'</td><td>'+esc(i.owner||'TBD (unassigned)')+'</td><td>'+fmt(i.due)+'</td><td><span class="pill'+(i.statusType==='completed'?' done':'')+'">'+esc(i.status)+'</span></td></tr>';}).join('')+'</tbody></table><p class="muted">'+act.length+' tasks shown'+(hidden?' · '+hidden+' canceled or duplicate tasks hidden':'')+'.</p>';
      next=act.filter(function(i){return i.statusType!=='completed';}).slice(0,3).map(function(i){return esc(i.id+' '+i.title)+' — '+esc(i.owner||'owner TBD');});
    } else {
      rowsHtml='<div class="card sand">For Wayfair, this phase’s work was not tracked in Linear (it lived in Asana, Drive and Slack — see Playbook section 14). Nothing to sync. The template tasks below show what the next launch will track.</div>'+tplTable(pk,true);
    }
    if(!next.length)next=p.checklist.filter(function(c,ix){return gateStates[ix]!=='done';}).slice(0,3).map(function(c){return 'Close gate item: '+esc(c);});
  } else {
    owner=p.accountable+' — name TBD at kickoff';gateStates=p.checklist.map(function(){return 'open';});
    rowsHtml=tplTable(pk,false);
    next=D.tpl.filter(function(t){return t.phase===pk&&t.label!=='type:gate';}).slice(0,3).map(function(t){return esc(t.title)+' — '+esc(own(t.owner))+' (due '+esc(t.due)+')';});
  }
  var gl={done:'Met',open:'Open',unknown:'Unconfirmed'};
  var chk='<ul class="chk">'+p.checklist.map(function(c,ix){var s=gateStates[ix];return '<li><span class="box '+s+'">'+(s==='done'?'&#10003;':'')+'</span><span>'+esc(c)+' <span class="muted">· '+gl[s]+'</span></span></li>';}).join('')+'</ul>';
  body+='<div class="grid2"><div><h2>'+p.n+'. '+esc(p.full)+'</h2><p class="helper">'+esc(p.timing)+'. Ends at gate '+p.gate+' '+esc(p.gateName)+'.</p><div class="card sand"><h3 style="margin-top:0">Accountable owner</h3>'+esc(owner)+'</div><h3>Tasks</h3>'+rowsHtml+'</div><div><div class="card"><h3 style="margin-top:0">Next three actions</h3><ol class="next">'+(next.length?next.map(function(n){return '<li>'+n+'</li>';}).join(''):'<li>None open</li>')+'</ol></div><div class="card"><h3 style="margin-top:0">Gate '+p.gate+' checklist</h3><p class="muted">The phase is done when every line is true.</p>'+chk+'</div>'+(m.source==='linear'?'<div class="card sand"><h3 style="margin-top:0">What happened on Wayfair</h3><p class="muted" style="font-size:13px">'+esc(p.wf)+'</p><p class="muted">[C] confirmed in sources · [I] inferred, check it.</p></div>':'')+'</div></div>';
  return body;
}
function own(o){return /^</.test(o)?'TBD ('+o.replace(/[<>]/g,'')+')':o;}
function tplTable(pk,ref){
  var t=D.tpl.filter(function(x){return x.phase===pk;});
  return '<table><thead><tr><th>Task</th><th>Owner</th><th>Due</th><th>Status</th></tr></thead><tbody>'+t.map(function(x){return '<tr><td>'+(x.label==='type:gate'?'<b>'+esc(x.title)+'</b>':esc(x.title))+'<div class="muted">Done when: '+esc(x.doneWhen)+' · '+esc(x.label)+'</div></td><td>'+esc(own(x.owner))+'</td><td>'+esc(x.due)+'<div class="muted">date TBD (L not set)</div></td><td><span class="pill">'+(ref?'Template only':'Not started')+'</span></td></tr>';}).join('')+'</tbody></table>';
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
  return '<h1>Partner <em>asks</em></h1><p class="helper">Every ask from a partner should become a Linear task within 24 hours and get a reply within 48 hours. Wayfair’s current list is Emily Proulx’s Oct 14 follow-up list (status as of playbook v1.0, Oct 16). These are not yet Linear tasks.</p><table><thead><tr><th>#</th><th>Ask</th><th>Owner</th><th>Opened</th><th>Status</th><th>48-hour window</th></tr></thead><tbody>'+D.pb.asks.map(function(a){var od=days(a.opened,AS_OF)>2;return '<tr><td>'+a.n+'</td><td>'+esc(a.item)+'</td><td>'+esc(a.owner)+'</td><td>'+fmt(a.opened)+'</td><td>'+esc(a.status)+'</td><td>'+(od?'<span class="dot r"></span>Open past 48h':'Within window')+'</td></tr>';}).join('')+'</tbody></table><p class="muted">Target, Best Buy, Chewy: no partner asks yet.</p>';
}
function links(){
  var L=[['#project-wayfair','Private internal launch channel','link TBD'],['#levanta-x-wayfair','Slack Connect with the partner business team','link TBD'],['#levanta-x-wayfair-eng','Slack Connect, engineering (hosted in Wayfair’s workspace)','link TBD'],['#new-wayfair-brands','Internal alert: first brand per team, CS replies with rank','link TBD']];
  var tr=function(r){return '<tr><td><b>'+esc(r[0])+'</b></td><td>'+esc(r[1])+'</td><td>'+(r[2].indexOf('http')===0?'<a href="'+esc(r[2])+'" target="_blank" rel="noopener">Open</a>':'<span class="muted">'+esc(r[2])+'</span>')+'</td></tr>';};
  return '<h1>Where things <em>live</em></h1><p class="helper">Slack is for talking, Drive is for files, Linear is for tasks and decisions. Links show “link TBD” where the sources don’t include a URL.</p><h2>Wayfair</h2><table><thead><tr><th>Name</th><th>What it’s for</th><th>Link</th></tr></thead><tbody>'+L.map(tr).join('')+
  [['Linear: Wayfair Integration (P-LEV-405)','Engineering tracker, 175 tasks in the snapshot',D.lin.project.url],['Drive: Marketplace Launches / Wayfair','Files only (01 Contract … 07 Reporting, Archive)','link TBD'],['Signed SOW (MSA + 2 SOWs, May 19–20)','In 01 Contract & Commercial','link TBD'],['Hex onboarding and revenue dashboard','Activation and GMV data (TJ, Oct 7)','link TBD']].map(tr).join('')+'</tbody></table>'+
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
  Array.prototype.forEach.call(app.querySelectorAll('tr[data-href]'),function(tr){tr.addEventListener('click',function(){location.hash=tr.getAttribute('data-href');});});
}
Promise.all([fetch('data/wayfair_linear.json').then(function(r){return r.json();}),fetch('data/template.json').then(function(r){return r.json();}),fetch('data/playbook.json').then(function(r){return r.json();}),fetch('data/playbook.html').then(function(r){return r.text();})]).then(function(a){D.lin=a[0];D.tpl=a[1];D.pb=a[2];D.doc=a[3];window.addEventListener('hashchange',render);render();}).catch(function(e){document.getElementById('app').innerHTML='<p>Could not load data: '+esc(e.message)+'</p>';});
})();
