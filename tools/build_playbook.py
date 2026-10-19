import json
P=[
 dict(key='deal',n=1,name='Deal and SOW',full='Deal, SOW and Kickoff',timing='L-24 to L-18 weeks',start=-24,end=-18,gate='G1',gateName='Kickoff Ready',
  accountable='Exec sponsor until signature, then the Launch PM',wfOwner='Rob Schab (Exec sponsor) → Jake Durkin (Launch PM)',
  checklist=['SOW signed','Commercial Terms Sheet complete and signed off by Exec, Legal and Finance','Every role named','Linear project and Slack channels live','First partner sync held'],
  wf='SOW signed May 19 and 20, 2026 [C]. Linear project created May 21 from Rob\'s Excel task list [C]. Terms sheet questions answered later and piecemeal [C].',
  wfGate=['done','open','open','done','done']),
 dict(key='build',n=2,name='Build',full='Technical Integration',timing='L-18 to L-6 weeks',start=-18,end=-6,gate='G2',gateName='Build Accepted',
  accountable='Product lead',wfOwner='Neehar Swali',
  checklist=['A real production conversion is attributed end to end','Partner confirms acceptance in writing'],
  wf='First attributed conversion Aug 5 [C]. Go-live slipped from early September to Oct 5 because of partner-side feed and tracking changes [C]. No written acceptance record found [I, confirm with Rob or Neehar].',
  wfGate=['done','unknown']),
 dict(key='readiness',n=3,name='Readiness',full='Product Readiness and UAT',timing='L-8 to L-2 weeks',start=-8,end=-2,gate='G3',gateName='Product Ready',
  accountable='Product lead, with the CS lead for test suppliers',wfOwner='Neehar Swali (Product); Oliver Albee / TJ Spero (CS)',
  checklist=['3 or more test suppliers completed signup, payment and product activation without engineering workarounds','Fee display verified on every account type','Dashboards show real data'],
  wf='Beta stalled on Stripe for test suppliers [C]. "Levanta Fees" and a 3.5% fee showed on Wayfair accounts after launch [C]. Managed account could not pay by Stripe; restriction bypassed Oct 9 [C].',
  wfGate=['open','open','done']),
 dict(key='enablement',n=4,name='Enablement',full='Assets and Enablement',timing='L-10 to L-1 weeks',start=-10,end=-1,gate='G4',gateName='Enablement Ready',
  accountable='GTM Enablement lead',wfOwner='Jake Durkin',
  checklist=['Partner has approved the asset kit','KB is live in all launch languages','Every internal team trained, attendance logged'],
  wf='Sep 29 internal enablement drew feedback: no clear "why", unclear audience, no objection handling, landed at month-end [C]. KB (EN, ZH) published Oct 5 [C]. Wayfair trained SAMs Oct 1 [C].',
  wfGate=['unknown','done','open']),
 dict(key='recruit',n=5,name='Recruitment and Launch',full='Supplier Recruitment and Launch',timing='L-4 to L+1 weeks',start=-4,end=1,gate='G5',gateName='Go/No-Go',
  accountable='Launch PM',wfOwner='Jake Durkin',
  checklist=['Readiness scorecard 85% or higher','No red must-haves','Both launch dates clear of partner code freezes, regional holidays and month-end'],
  wf='Connection opened to all suppliers Oct 5. Marketing launch Oct 13 at 8am ET, Wayfair leading [C]. APAC holiday Oct 1 to 7 ran over the soft launch [C]. Scored on Oct 5, Wayfair would have landed around 55 to 60% [I].',
  wfGate=['open','open','open']),
 dict(key='hypercare',n=6,name='Hypercare',full='Hypercare',timing='L to L+6 weeks',start=0,end=6,gate='G6',gateName='Hypercare Exit',
  accountable='Launch PM, with the CS lead',wfOwner='Jake Durkin (PM), with CS',
  checklist=['2 straight weeks with no Sev1 or Sev2','Partner follow-up list closed or scheduled','Activation on pace against target'],
  wf='Hypercare is live. Emily\'s Oct 14 list is open, 10 to 13% order-feed gap, CJ price corrections blocked by Wayfair code freeze [C]. Oct 13: 151 activations vs October target of 45 [C].',
  wfGate=['unknown','open','done']),
 dict(key='steady',n=7,name='Steady State',full='Steady State',timing='L+6 weeks onward',start=6,end=8,gate='G7',gateName='Running',
  accountable='Account owner',wfOwner='Stacey Georgoulis',
  checklist=['First monthly KPI report delivered and accepted','Invoicing on schedule','Retro done and playbook updated'],
  wf='KPI: at least $7.5M Tracked GMV a month for 2 straight months, first period months 7 to 18 after commencement [C].',
  wfGate=['open','open','open']),
]
teams=['PM','Exec','Legal/Fin','Prod/Eng','GTM','Mktg','CS/APAC','Support/KB','Creator','Partner']
R=[l.split('|') for l in '''SOW, MSA, pricing|C A R C I I C I I R
Commercial Terms Sheet|R A R C C I C I C C
Linear project, channels, cadence|A I I C C I C I I I
Tech requirements and build|C I I A I I I I I R
Network and data-sharing contracts|C A R C I I I I C R
Change orders and milestone billing|R A R C I I I I I C
Partner written acceptance|R A C R I I I I I R
Plan, fees and payments setup|C C R A I I C I I C
UAT with test suppliers|R I I A C I R I I R
Program name, terminology, messaging|C C C I R A I I I R
Asset kit (one-pager, demos, decks)|C I I C A R C C C C
KB articles and translation|I I I C A I C R I C
Internal training|C I I C A C R R R I
Partner and APAC training|C I I C R I A I I R
CSM coverage model and assignment|C C I I C I A I I C
Creator and publisher readiness|C I I C C I I I A C
Landing page, blog, press, social|I C C C C A I I I R
Go/No-Go|A R C R R R R C C C
Hypercare triage and follow-ups|A I I R C I R R C C
Invoicing and collections|I C A C I I I I I C
Monthly KPI and GMV reporting|C A C R I I C I I I'''.split('\n')]
raci=[dict(activity=a,cells=c.split()) for a,c in R]
roles=[l.split('|') for l in '''Exec sponsor / deal owner|Rob Schab (COO). Signed the SOW.|<Exec sponsor>
CEO, signer for network agreements|Ian Brodie|<Signer>
Launch PM (single owner)|Jake Durkin. Early PM work by Tracy Smith.|Stacey (likely default PM, pending Jake's sign-off)
Product lead and partner technical POC|Neehar Swali|<Product lead>
Engineering|Veronica Valenzuela, Jordan Zax, Buck Rivard|<Eng lead> + <Eng>
Design|Reina Pinto [I]|<Designer>
GTM Enablement lead|Jake Durkin|Jake
Marketing and web|Richie Carreon, Isaiah (PMM), Hamid Nawab (web)|<Marketing lead>
CS lead|Oliver Albee; TJ Spero|<CS lead>
APAC CS|Kelton Von, Rocky Liang, Owen Guetschow|<APAC lead>
Support and KB|Angelo Ilagan (EN), Jenny, Emma (ZH)|<Support lead>
Creator and publisher|Jamie Hamerly, Sarah Haege|<Creator lead>
Finance|Jinal (VP Finance)|<Finance>
Legal|Maya Choksi; outside counsel Peter|<Legal>
Revenue data (Hex, HubSpot)|TJ Spero, Neehar Swali|<RevOps>
Managed-account owner|Nobody named (gap)|<Managed account owner>
Partner: program owner|Emily Proulx|<Partner PM> + backup
Partner: commercial lead|Megan Schimmel|<Partner commercial>
Partner: ops|Chloe Doyle|<Partner ops>
Partner: engineering and data|Pranab, Chris F., Sagar|<Partner eng>
Partner: APAC coordinator|Thea|<Partner APAC>'''.split('\n')]
assets=[l.split('|') for l in '''A1|Commercial Terms Sheet (internal)|Exec + PM|L-20|EN|Did not exist
A2|Terminology and messaging guide|PMM|L-12|EN|Supplier not seller, affiliate not creator
A3|Supplier one-pager|GTM|L-6|EN, ZH|One-Pager v3, Oct 13
A4|Partner rep one-pager (CS value)|CS|L-8|EN, ZH|CS Value one-pager, Jul 21
A5|Partner sales deck for their reps|GTM + Partner|L-4|EN|Wayfair GTM Deck and supplier deck
A6|Internal training decks by persona|GTM|L-3|EN|Internal Enablement Sep 29
A7|APAC training deck|APAC lead|L-3|ZH|Rocky's 10-slide Chinese deck, Oct 15
A8|Demo script|GTM|L-4|EN|Wayfair Arcade demo, Sep 25
A9|Demo videos in chapters|GTM|L-3|EN, ZH subtitles|Split into 3 chapters Oct 6
A10|Account setup guide|CS|L-4|EN, ZH|10-step Account Setup Guide
A11|KB article set|Support|L|EN, ZH|Published Oct 5
A12|CSV product upload guide + example file|Product + GTM|L-3|EN, ZH|CSV demo script Oct 15; LEV-5671
A13|FAQ: supplier, creator, internal|GTM + Support|L-3|EN, ZH|FAQ tab in the GTM doc
A14|Commission guidance by category|CS + Creator|L-4|EN|Shared Sep 16
A15|Recommended creator list|Creator|L-2|EN|Item 1 on Emily's list, still open
A16|Landing page + signup link|Marketing + Eng|L-2|EN|Published Oct 13 8am ET
A17|Blog, press, social, employee social kit|Marketing|L-1|EN|Blog and LinkedIn Oct 13
A18|Email templates (4)|CS + GTM|L-2|EN, ZH|Written fresh in playbook
A19|Slack announcement templates (4)|PM|L-1|EN|Written fresh in playbook
A20|Ranked supplier list + handoff tracker|Partner + CS|L-4|EN|Emily's priority list and Handoff Tracker
A21|HubSpot properties + Hex dashboard|RevOps|L-2|EN|Hex dashboard Oct 7
A22|Launch-day runbook|Eng|L-1|EN|Wayfair Release Plan in Notion
A23|Bio templates, screenshots, case studies|GTM|L-3|EN|Aug 19 leadership update
A24|Partner integration value-prop docs (e.g. LTK)|Creator|L+2|EN|Item 7 on Emily's list'''.split('\n')]
risks=[l.split('|') for l in '''R1|CSM coverage expectations do not match|Coverage model written in the terms sheet before kickoff|<CS lead>|P1
R2|GMV or fee definition is ambiguous|Worked examples in the terms sheet, plus a "partnered only" report filter|<Finance>|P1
R3|Partner-managed accounts cannot pay|Payment path tested in P3. Weekly overdue check in P6|<Finance>|P3
R4|Partner POC turnover|Named backups. Decisions logged in Linear|Stacey (likely default PM, pending Jake's sign-off)|P1
R5|Partner data changes push the date|Change-order issues the same day. Buffer between G2 and L|<Product lead>|P2
R6|Data gaps after launch|Reconciliation in G3 and P6. Ask about code freezes at kickoff|<Product lead>|P6
R7|Catalog model mismatch|Discovery questions on brand and ID model in P2|<Product lead>|P2
R8|Wrong fees shown to suppliers|Fee display spec checked on every account type in G3|<Product lead>|P3
R9|Enablement misses the audience|Persona-based training, chapter videos, view tracking|<GTM lead>|P4
R10|Messaging breaks partner rules|A2 terminology guide approved before any asset is built|<PMM>|P4
R11|Regional timing|Holiday check in the terms sheet and the L-12 date lock|<APAC lead>|P4
R12|Tracker sprawl|One tracker, one Drive layout|Stacey (likely default PM, pending Jake's sign-off)|P1
R13|Self-serve legal standing|Legal review of signup terms in P3|<Legal>|P3
R14|Policies that do not agree|All windows written once in the terms sheet and the KB|<Product lead>|P1
R15|Inbound routing is unclear|Sales routing rule set at L-4|Stacey (likely default PM, pending Jake's sign-off)|P5
R16|Billing out of step with build|Monthly milestone check. Variable-fee billing built before L|<Finance>|P2
R17|Partner reopens agreed scope|Terms sheet signed by both sides and pinned in the partner channel|<Exec sponsor>|P1
R18|KPI target missed|Monthly report from L+4. Stacey owns the target|<Account owner>|P7
R19|No owner for open items|No A in the RACI means the work does not start|Stacey (likely default PM, pending Jake's sign-off)|All'''.split('\n')]
decisions=['Approve Linear as the single tracker, and fund Linear seats or guest access for GTM, CS, Support, Marketing and Finance.',
'Retire Asana for launch work, and set a date to move the open Wayfair Asana tasks.',
'Sign off on Stacey as the default Launch PM for future marketplace launches.',
'Name owners for the next launch, starting with the managed-account owner.',
'Set the default CSM coverage model to offer partners.',
'Pick the Tracked GMV stance to propose by default: Levanta-attributed only, or all network GMV.',
'Set the default payment path for partner-managed accounts (invoice or PO, not card).',
'Fix one unclaimed escrow window (60 days or 6 months) and one attribution window (7 or 14 days).',
'Decide how marketplace-only inbound is routed: CS activation only, or a sales upsell path.',
'Approve the channel naming convention and the 85% Go/No-Go bar.']
asks=[l.split('|') for l in '''1|Recommended creator lists|Oliver (interim PDF), Eng (marketplace-specific groups)|Interim explained Oct 14; long-term open
2|Logos: bulk or auto, branded suppliers under one brand|Neehar, Eng|Auto logos for about 70 core brands; brand unification planned for November
3|Supplier enrollment walkthrough video|Oliver|In progress
4|SKU upload errors (Bedsure) and CSV section|Neehar (modal fix), Jake (LEV-5671, demo script)|In progress
5|APAC training|TJ, Kelton, Rocky; Thea at Wayfair|Running Oct 16
6|One-pager, including Chinese for WGS|Jake (v3), TJ (Chinese)|v3 done Oct 13, Chinese pending
7|LTK integration value-prop doc|Jamie|Open; LTK paused its Q4 integration
8|Dedicated managed-account person and weekly working session|TBD (no owner named)|No owner'''.split('\n')]
score=[l.split('|') for l in '''Commercial|Terms Sheet complete and signed off|1
Commercial|Partner written acceptance of the build|1
Commercial|Invoice schedule and PO numbers in Linear|0
Legal|Supplier terms shown at signup or activation|1
Technical|Production conversion attributed end to end|1
Technical|Feed and sync alerts live|1
Technical|Order reconciliation gap under 2%|0
Technical|Launch-day runbook published|0
Product|Fee display correct on every account type|1
Product|Self-serve and managed payment paths both tested|1
Product|CSV upload, logos and bulk activation work|0
Product|3 or more test suppliers fully live|1
Enablement|Asset kit approved by partner|0
Enablement|KB live in every launch language|1
Enablement|Persona training done, attendance logged|0
Enablement|Demo videos in chapters with view tracking|0
CS|CSM coverage model agreed in writing|1
CS|Top-tier suppliers have a named CSM|0
CS|Handoff sheet and rank flow live|0
Creator|Priority publishers connected, creator list ready|0
Ops|Launch dates clear of freezes, holidays and month-end|1
Ops|Every RACI row has an A; every Linear issue has an owner|1
Data|HubSpot fields and Hex dashboard show real data|0
Data|Partnered-only report filter live|0'''.split('\n')]
json.dump(dict(phases=P,teams=teams,raci=raci,roles=[dict(role=a,wayfair=b,next=c) for a,b,c in roles],
 assets=[dict(id=a,name=b,owner=c,due=d,lang=e,wf=f) for a,b,c,d,e,f in assets],
 risks=[dict(id=a,risk=b,prevention=c,owner=d,phase=e) for a,b,c,d,e in risks],decisions=decisions,
 asks=[dict(n=a,item=b,owner=c,status=d,opened='2026-10-14') for a,b,c,d in asks],
 scorecard=[dict(area=a,item=b,mh=c=='1') for a,b,c in score]),open('data/playbook.json','w'),indent=1)
