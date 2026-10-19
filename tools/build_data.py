import json,csv,re
B='/workspace/launch-playbook-mock/'
raw=json.load(open(B+'tools/linear_raw.json'))['issues']
def ph(i):
    m=(i['projectMilestone'] or {}).get('name')
    if m is None: return 'hypercare' if i['createdAt']>='2026-10-05' else 'build'
    if m=='Post-GA': return 'hypercare'
    if m.startswith('P6') or m.startswith('P7'): return 'readiness'
    return 'build'
iss=[dict(id=i['id'],title=i['title'],status=i['status'],statusType=i['statusType'],owner=i['assignee'] or None,
  due=i['dueDate'],milestone=(i['projectMilestone'] or {}).get('name'),phase=ph(i),created=i['createdAt'][:10],
  completed=(i['completedAt'] or '')[:10] or None,url=i['url']) for i in raw]
json.dump(dict(project=dict(id='P-LEV-405',uuid='5cdfc679-6333-4a8a-93d6-c67b5ff0f6f9',name='Wayfair Integration',
  url='https://linear.app/levanta/project/wayfair-integration-2c2584956a32',lead='Neehar Swali'),
  snapshot='2026-10-19',count=len(iss),issues=iss),open(B+'data/wayfair_linear.json','w'),indent=1)
pm={'P1':'deal','P2':'build','P3':'readiness','P4':'enablement','P5':'recruit','P6':'hypercare','P7':'steady'}
rows=[]
for r in csv.DictReader(open('/workspace/marketplace-playbook/marketplace_launch_linear_template.csv')):
    rows.append(dict(title=r['Title'],phase=pm[r['Milestone'][:2]],milestone=r['Milestone'],label=r['Labels'],
      owner=r['Assignee'],due=r['Due (relative to L)'],doneWhen=r['Description'].replace('Done when: ','')))
json.dump(rows,open(B+'data/template.json','w'),indent=1)
h=open(B+'data/playbook.html').read()
h=h.replace('<img />','<img src="assets/marketplace_launch_swimlane.png" alt="Swimlane: 7 phases across 7 lanes, with exit gates">',1)
h=h.replace('<img />','<img src="assets/marketplace_launch_onepager.png" alt="One-page summary">',1)
open(B+'data/playbook.html','w').write(h)
print(len(iss),len(rows))
