const {chromium}=require('/var/tmp/sand-playwright-runtime/1559ea9737be96a4c634df9122b45c65/node_modules/playwright-core');
(async()=>{
 const b=await chromium.launch({executablePath:'/opt/google/chrome/chrome',args:['--no-sandbox','--headless=new']});const p=await b.newPage({viewport:{width:1440,height:900}});
 const errs=[];p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});p.on('pageerror',e=>errs.push(e.message));
 p.on('requestfailed',r=>errs.push('fail '+r.url()));
 const base='http://127.0.0.1:8795/';
 const routes=[['#/','dashboard'],['#/launch/wayfair/hypercare','wayfair-hypercare'],['#/launch/target/build','target-build'],['#/people','people'],['#/playbook','playbook'],['#/assets'],['#/risks'],['#/asks'],['#/links'],['#/launch/bestbuy/deal'],['#/launch/chewy/deal']];
 for(const ph of ['deal','build','readiness','enablement','recruit','steady'])routes.push(['#/launch/wayfair/'+ph]);
 for(const ph of ['deal','readiness','enablement','recruit','hypercare','steady'])routes.push(['#/launch/target/'+ph]);
 await p.goto(base+'#/');await p.waitForSelector('table');
 for(const [r,s] of routes){await p.goto(base+r);await p.waitForTimeout(250);const t=await p.textContent('main');if(/Could not load|Unknown/.test(t))errs.push('bad '+r);if(s)await p.screenshot({path:'shots/'+s+'.png'});}
 console.log('routes',routes.length,'errors',JSON.stringify(errs));await b.close();
})();
