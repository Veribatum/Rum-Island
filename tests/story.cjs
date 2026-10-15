const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
function setup(){const els=new Map(),storage=new Map();const context=new Proxy({}, {get:(t,k)=>t[k]||(()=>{})});function el(id){if(!els.has(id))els.set(id,{hidden:false,innerHTML:'',style:{setProperty(){}},classList:{add(){},remove(){}},getContext:()=>context,click(){this.onclick?.();}});return els.get(id);}function selectors(selector){const attr=selector.slice(1,-1);return [...el('#panel').innerHTML.matchAll(new RegExp(attr+'="([^"\\n]+)"','g'))].map(m=>{const e=el(selector+m[1]);e.dataset={[attr.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]:m[1]};return e;});}const s={console,Math,JSON,document:{querySelector:el,querySelectorAll:selectors},window:{},addEventListener(){},requestAnimationFrame(){},localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},Image:class{set src(x){}},innerWidth:960,innerHeight:540};vm.createContext(s);vm.runInContext(fs.readFileSync(__dirname+'/../dist/frame-bounds.js','utf8'),s);vm.runInContext(fs.readFileSync(__dirname+'/../dist/adventure.js','utf8'),s);vm.runInContext(fs.readFileSync(__dirname+'/../dist/mission.js','utf8'),s);vm.runInContext(fs.readFileSync(__dirname+'/../dist/polish.js','utf8'),s);vm.runInContext(fs.readFileSync(__dirname+'/../dist/home.js','utf8'),s);vm.runInContext(fs.readFileSync(__dirname+'/../dist/voyages.js','utf8'),s);vm.runInContext(fs.readFileSync(__dirname+'/../dist/refinement.js','utf8'),s);vm.runInContext(fs.readFileSync(__dirname+'/../dist/menu.js','utf8'),s);return{api:s.window.RumIsland,vm:s,el,storage};}
for(const character of ['nova','sylvanas']){
 const {api,vm:s,el,storage}=setup();api.setCharacter(character);api.start(0);let a=api.getState();assert(!a.partner);a.actors.forEach(e=>e.dead=true);
 const portal=a.objects.find(o=>o.type==='portal');a.player.x=portal.x;a.player.y=366;api.interact();assert.equal(api.getState().mode,'play','portal locked until objectives');
 for(const o of a.objects.filter(o=>o.id)){
   const platform=a.solids.filter(p=>o.x>=p.x&&o.x<p.x+p.w&&Math.abs(p.y-o.y)<80).sort((x,y)=>Math.abs(x.y-o.y)-Math.abs(y.y-o.y))[0];assert(platform,'objective has an authored platform');
   const ladder=a.ladders.find(l=>l.y===platform.y&&l.x>=platform.x&&l.x<platform.x+platform.w)||a.ladders.find(l=>l.y+l.h===platform.y&&l.x>=platform.x&&l.x<platform.x+platform.w);assert(ladder);
   // Traverse this ladder from its lower landing (including the stacked tower).
   a.player.x=ladder.x-17;a.player.y=ladder.y+ladder.h-86;a.player.vy=0;a.player.climb=false;a.keys.up=true;
   for(let i=0;i<700;i++){api.update(1/120);if(a.player.y+86<ladder.y+2)break;}
   a.keys.up=false;assert(a.player.y<ladder.y-70,'ladder reaches upper landing');a.player.climb=false;a.player.x=o.x;a.player.y=platform.y-86;api.interact();assert(o.done);

 }
 a.player.x=portal.x;a.player.y=366;api.interact();assert.equal(api.getState().mode,'arrival');assert.equal(api.getState().chapter,0);assert(api.getState().partner,'partner joins at END of intro');
 vm.runInContext('arrivalStep(3.5)',s);assert.equal(api.getState().chapter,1);assert(el('#panel').innerHTML.includes('ship-tour.webp'));
 for(let i=0;i<3;i++)el('#tour-next').click();assert.equal(api.getState().chapter,2);
 a=api.getState();a.player.x=a.actors[0].x-40;api.attack();assert.equal(a.bullets.length,0,'bar fight emits no shots');assert(a.actors[0].hp<3,'punch does damage');a.actors.forEach(e=>e.dead=true);a.player.x=2080;api.interact();el('#continue').click();assert.equal(api.getState().chapter,3);
 a=api.getState();const helm=a.objects.find(o=>o.type==='helm');a.player.x=helm.x;api.interact();assert.equal(api.getState().mode,'play','helm requires tasks');
 for(const o of a.objects.filter(o=>o.type==='bottle'||o.type==='rope')){a.player.x=o.x;a.player.y=o.y-43;api.interact();assert(o.done);}
 a.player.x=helm.x;a.player.y=helm.y-43;api.interact();vm.runInContext('shipEscapeStep(3.1)',s);el('#continue').click();assert.equal(api.getState().chapter,4);
 // Exercise the actual card UI handler with a known winning hand, twice.
 api.cardTable();for(let i=0;i<2;i++){vm.runInContext("hand=[{r:10,s:0},{r:11,s:0},{r:12,s:0},{r:13,s:0},{r:14,s:0}];held=[true,true,true,true,true];dealer=[{r:2,s:0},{r:3,s:1},{r:7,s:2},{r:8,s:3},{r:9,s:0}];drawn=false;cardUI();",s);el('#draw').click();}
 assert.equal(api.getState().save.story,5);assert.equal(api.getState().save.coins,20);el('#continue').click();
 for(let c=5;c<9;c++){api.start(c);a=api.getState();a.actors.forEach(e=>e.dead=true);for(const o of a.objects){a.player.x=o.x-17;a.player.y=o.y-40;if(o.type==='rescue'||o.type==='missionTask'){a.player.x=o.x;api.interact();}else api.update(1/120);}api.complete();}
 assert.equal(a.save.crew.length,4);assert.equal(a.save.scraps.length,4);api.hub();vm.runInContext('repairBench()',s);
 for(let i=0;i<3;i++)el('[data-build]'+i).click();assert.equal(a.save.repairs.length,3);const gold=a.save.coins;el('[data-build]0').click();assert.equal(a.save.coins,gold,'repair not charged twice');
 api.computer();el('[data-destination]9').click();assert(!el('#panel').innerHTML.match(/id="select-mission" disabled/));api.start(9);api.update(.016);vm.runInContext('render()',s);assert(api.getState().actors.some(e=>e.type==='clippy'));assert(JSON.parse(storage.get('rum-island-story-v2')).story===5);
 console.log(character+': opening gates, actual ladder climb, portal, melee, ship tasks, poker deed, all quests, residents, scraps, repairs and Clippy pass');
}
const {api}=setup();const royal=api.rank([10,11,12,13,14].map(r=>({r,s:0})));const four=api.rank([9,9,9,9,14].map((r,s)=>({r,s:s%4})));const low=api.rank([14,2,3,4,5].map((r,s)=>({r,s:s%4})));const high=api.rank([2,3,4,5,6].map((r,s)=>({r,s:s%4})));assert(royal.value>four.value);assert(high.value>low.value);console.log('Poker ranking and wheel-straight tie break pass');
// Damage occurs in an attack window, never simply on body contact.
{
 const {api,vm:s}=setup();api.start(2);vm.runInContext('partner=null',s);let state=api.getState();const enemy=state.actors[0];state.actors.slice(1).forEach(e=>e.dead=true);enemy.x=state.player.x-40;enemy.state='approach';enemy.timer=0;
 const hp=state.player.hp;api.update(.016);assert.equal(state.player.hp,hp);assert.equal(enemy.state,'windup');
 for(let i=0;i<20;i++)api.update(.016);assert.equal(state.player.hp,hp,'windup is harmless');state.player.x+=140;
 for(let i=0;i<28;i++)api.update(.016);assert.equal(state.player.hp,hp,'evading the visible strike avoids damage');assert.equal(enemy.state,'recover');
 enemy.x=state.player.x-40;enemy.face=1;enemy.state='windup';enemy.timer=.01;api.update(.02);assert.equal(state.player.hp,hp);api.update(.016);assert.equal(state.player.hp,hp-1,'only active strike hurts');
 console.log('Brawl: contact safety, harmless windup, evasion, recovery and strike-only damage pass');
}
{
 const {api,vm:s}=setup();s.drawCalls=[];vm.runInContext("ctx.drawImage=(...a)=>drawCalls.push(a);assets.characters={width:400,height:300};assets.extras={width:400,height:300};assets.novaMotion={width:400,height:300};assets.sylMotion={width:400,height:300};assets.brawl={width:400,height:200};",s);
 for(const name of ['nova','sylvanas']){api.setCharacter(name);api.start(0);vm.runInContext(`player.vx=205;clock=.01;sprite(player,'${name}');clock=.18;sprite(player,'${name}');player.attack=.2;sprite(player,'${name}');player.climb=true;sprite(player,'${name}')`,s);const d=s.drawCalls.slice(-4);assert.notEqual(d[0][1],d[1][1]);assert.equal(d[2][2],100);assert.equal(d[3][2],200);}
 console.log('Sprite dispatch: both walk cycles advance, attack frames and ladder frames use dedicated rows');
}
{
 const {api,vm:s,el}=setup();api.start(0);const a=api.getState();a.actors.forEach(e=>e.dead=true);a.objects.filter(o=>o.id).slice(0,3).forEach(o=>o.done=true);a.player.x=4400;api.update(.01);assert.equal(api.getState().section,4);vm.runInContext('player.hp=1;invuln=0;hurt()',s);el('#retry').click();assert(api.getState().player.x>=4300);assert(api.getState().objects.filter(o=>o.id&&o.done).length===3);console.log('Opening checkpoint retry preserves unlocked controls and respawns in the current room');
}
{
 const {api,vm:s}=setup();api.start(0);const a=api.getState();a.actors.forEach(e=>e.dead=true);a.press.down=true;a.keys.down=true;api.update(.016);assert(a.player.crouch);a.keys.down=false;api.update(.016);assert(a.player.crouch,'release leaves crouch toggled');a.press.down=true;api.update(.016);assert(!a.player.crouch,'second press stands');
 const ladder=a.ladders[0];a.player.x=ladder.x-17;a.press.down=true;a.keys.down=true;api.update(.016);assert(!a.player.crouch,'down near a ladder controls descent, not stance');console.log('Crouch toggle release/second press and ladder precedence pass');
}
{
 const {api,vm:s}=setup();api.start(0);const a=api.getState();a.actors.forEach(e=>e.dead=true);const e=a.actors[0];e.dead=false;e.alert=3;a.player.y=194;a.player.x=e.x;let flips=0,lastFace=e.face;for(let i=0;i<120;i++){a.player.x=e.x+(i%2?2:-2);api.update(1/120);if(lastFace!==e.face){flips++;lastFace=e.face;}}assert(flips<3,'inaccessible target must not cause rapid face flipping');
 s.drawCalls=[];vm.runInContext('ctx.drawImage=(...a)=>drawCalls.push(a);assets.facilityPano={width:2172,height:724};camera=1049;bg();camera=1051;bg()',s);assert.equal(s.drawCalls.length,2);assert.equal(s.drawCalls[0].length,5);assert(Math.abs(s.drawCalls[0][1]-s.drawCalls[1][1])<1,'camera moves continuously across old room boundary');console.log('Unreachable target facing stability and single-image boundary scrolling pass');
}
{
 const {api,vm:s}=setup();api.start(0);s.drawCalls=[];vm.runInContext("ctx.drawImage=(...a)=>drawCalls.push(a);assets.characters={width:400,height:300};assets.novaReady={width:400,height:300};player.ground=true;player.attack=0;sprite(player,'nova');player.attack=.3;sprite(player,'nova');player.ground=false;player.vy=-400;sprite(player,'nova')",s);assert.deepEqual(s.drawCalls[0].slice(1,5),s.drawCalls[1].slice(1,5),'idle and shooting share ready pose');assert.equal(s.drawCalls[2][2],100,'airborne uses jump row');console.log('Nova firing retains ready stance; jump uses dedicated airborne pose');
}
{
 const {api,vm:s,el}=setup();api.start(0);api.ability();assert.equal(api.getState().player.cloak,5);assert.equal(api.getState().summons.length,0);api.setCharacter('sylvanas');api.start(0);api.ability();let a=api.getState();assert.equal(a.player.cloak,0);assert.equal(a.summons.length,1);assert.equal(a.bullets.filter(b=>b.spectral).length,5);a.actors.forEach(e=>e.dead=true);const e=a.actors[0];e.dead=false;e.x=a.player.x-75;e.y=a.player.y;const hp=e.hp;api.update(.016);assert(e.hp<hp,'summon attacks nearby enemy');for(let i=0;i<510;i++)api.update(.016);assert.equal(api.getState().summons.length,0,'summon expires');
 api.start(0);a=api.getState();a.actors.forEach(e=>e.dead=true);a.player.y=-216;for(let i=0;i<60;i++)vm.runInContext('focusCamera(1/60)',s);assert(api.getState().cameraY<-300,'camera follows tower ascent');a.player.y=604;for(let i=0;i<60;i++)vm.runInContext('focusCamera(1/60)',s);assert(api.getState().cameraY>300,'camera follows reactor descent');
 api.hub();assert.equal(api.getState().mode,'visit');api.computer();el('[data-destination]7').click();assert(el('#panel').innerHTML.includes('free Mr. Fluffy'));el('#select-mission').click();assert.equal(api.getState().mode,'visit');api.getState().player.x=2850;api.homeInteract();assert.equal(api.getState().chapter,7);console.log('Distinct powers, summon damage/expiry, vertical camera and tavern board selection pass');
}
{
 const {api,vm:s}=setup();s.drawCalls=[];vm.runInContext("ctx.drawImage=(...a)=>drawCalls.push(a);assets.characters={width:1448,height:1086};assets.novaReady={width:1448,height:1086};assets.novaUnarmed={width:1536,height:1024};assets.sylUnarmed={width:1536,height:1024};",s);api.start(0);vm.runInContext("player.crouch=true;sprite(player,'nova')",s);const c=s.drawCalls.at(-1);assert(c[2]>800,'crouch crop excludes feet above row');assert(c[8]<95&&c[8]>50,'crouch scales against standing silhouette');assert.equal(c[6]+c[8],0,'feet anchored at local origin');
 for(const name of ['nova','sylvanas']){api.setCharacter(name);api.start(2);s.drawCalls=[];for(const t of [.01,.14,.27,.4])vm.runInContext(`player.attack=0;player.vx=170;clock=${t};sprite(player,'${name}')`,s);assert.equal(new Set(s.drawCalls.map(c=>c[1])).size,4,'four distinct unarmed walking frames');s.drawCalls=[];for(const t of [.39,.29,.19,.09])vm.runInContext(`player.attack=${t};sprite(player,'${name}')`,s);assert.equal(new Set(s.drawCalls.map(c=>c[1])).size,4,'punch advances four frames');}
 console.log('Crouch frame bounds, feet anchoring and both four-frame unarmed cycles pass');
}
{
 const {vm:s}=setup();s.audioCalls=[];s.Audio=class{constructor(src){this.src=src;this.paused=true;}play(){this.paused=false;s.audioCalls.push(this.src);return Promise.resolve();}pause(){this.paused=true;}};
 vm.runInContext("chapter=0;selected='nova';ensureMusic(true);selected='sylvanas';ensureMusic(true);chapter=2;ensureMusic(true);effect('punch');soundOn=false;ensureMusic();",s);assert.deepEqual(s.audioCalls,['assets/audio/stealth.wav','assets/audio/forest.wav','assets/audio/tavern.wav','assets/audio/punch.wav']);assert(vm.runInContext('musicPlayer.paused',s));vm.runInContext('soundOn=true;audioStart()',s);assert(!vm.runInContext('musicPlayer.paused',s));for(const path of s.audioCalls)assert(fs.existsSync(__dirname+'/../dist/'+path));console.log('Audio scene selection, effects, mute/resume and bundled file existence pass');
}
// Descending every authored ladder must finish with feet on its lower landing.
for(const character of ['nova','sylvanas']){
 const {api,vm:s,el}=setup();api.setCharacter(character);api.start(0);let a=api.getState();a.actors.forEach(e=>e.dead=true);a.objects.filter(o=>o.id).forEach(o=>o.done=true);
 for(const l of a.ladders){a.player.x=l.x-17;a.player.y=l.y-86;a.player.vy=0;a.player.climb=false;a.keys.down=true;for(let i=0;i<800;i++){api.update(1/120);if(a.player.y+86>=l.y+l.h-1)break;}for(let i=0;i<30;i++)api.update(1/120);assert.equal(a.player.y+86,l.y+l.h,character+' ladder bottom '+l.x);assert(a.player.ground);assert(!a.player.climb);a.keys.down=false;}
 // Walk off the main floor into the intended lower chamber; its floor catches us.
 a.player.x=3180;a.player.y=366;a.player.vy=0;a.keys.right=true;for(let i=0;i<90;i++)api.update(1/120);a.keys.right=false;for(let i=0;i<150;i++)api.update(1/120);assert.equal(a.player.y+86,690);assert.equal(a.mode,'play');
 // The return floor's side prevents walking underneath the solid floor.
 a.player.x=4260;a.player.y=604;a.player.vy=0;a.keys.right=true;for(let i=0;i<100;i++)api.update(1/120);a.keys.right=false;assert(a.player.x+34<=4300);
 // A corrupted/out-of-bounds fall cannot remain an endless running game, even cloaked.
 a.player.cloak=5;a.player.y=2000;api.update(.016);assert.equal(api.getState().mode,'menu');assert.equal(a.player.hp,0);assert(el('#panel').innerHTML.includes('Retry checkpoint'));el('#retry').click();a=api.getState();assert.equal(a.mode,'play');const floor=a.solids.find(p=>p.h>=50&&a.player.x>=p.x&&a.player.x<p.x+p.w);assert.equal(a.player.y+86,floor.y);assert(a.player.ground);console.log(character+': all ladder descents, chamber landing, terrain side wall, fall death and checkpoint recovery pass');
}
// The home port is gameplay, with its computer, resident services and beach encounters.
{
 const {api,vm:s,el}=setup();let a=api.getState();a.save.story=5;a.save.coins=100;a.save.crew=['Gary the Goblin','Farmer’s Market Lady One','Farmer’s Market Lady Two','Mr. Fluffy'];api.hub();a=api.getState();assert.equal(a.mode,'visit');a.player.x=2850;api.homeInteract();assert.equal(api.getState().mode,'visit','empty destination cannot depart');
 a.player.x=1460;api.homeInteract();const gold=a.save.coins;el('[data-build]0').click();assert.equal(a.save.coins,gold-20);assert(a.save.repairs.includes(0));el('#service-back').click();
 a.player.x=1850;api.homeInteract();el('#buy-service').click();const after=a.save.coins;el('#buy-service').click();assert.equal(a.save.coins,after,'prepared supplies cannot be bought twice');el('#service-back').click();a.player.x=2160;api.homeInteract();el('#buy-service').click();el('#service-back').click();
 a.player.x=2500;api.homeInteract();assert.equal(api.getState().mode,'menu');assert(el('#panel').innerHTML.includes('Select your next voyage'));el('[data-destination]5').click();el('#select-mission').click();assert.equal(api.getState().mode,'visit');assert.equal(a.save.missionSelected,5);assert.equal(a.chapter,4,'selecting a mission stays in the tavern');
 a.player.x=2879;a.keys.right=true;api.homeStep(.02);a=api.getState();assert.equal(a.chapter,5,'walking through the right door starts selected voyage');assert.equal(a.player.hp,7);assert.equal(a.player.weaponMultiplier,1.2);assert(!a.save.provisioned&&!a.save.weaponTuned);
 api.hub();a=api.getState();a.player.x=500;api.homeStep(.016);assert(vm.runInContext('!!activeEncounter',s));const first=vm.runInContext('activeEncounter.id',s);const total=a.save.coins;api.homeInteract();el('[data-beach-choice]0').click();assert.equal(a.save.coins,total+2);el('#beach-back').click();api.homeInteract();el('[data-beach-choice]1').click();assert.equal(a.save.coins,total+2,'same encounter rewards once');el('#beach-back').click();a.player.x=1100;api.homeStep(.016);a.player.x=500;api.homeStep(.016);assert.notEqual(vm.runInContext('activeEncounter.id',s),first,'returning beach picks a different recent encounter');assert.equal(vm.runInContext('beachEncounters.length',s),24);
 console.log('Physical computer selection, walk-through door, Gary repairs, merchant buffs and beach choices/reward accounting pass');
}
{
 const {api,vm:s}=setup();s.drawCalls=[];vm.runInContext("assets.residents={width:1448,height:1086};ctx.drawImage=(...a)=>drawCalls.push(a)",s);api.hub();for(const row of [0,1,2]){s.drawCalls=[];for(const time of [.01,.35,.68,1.01])vm.runInContext(`clock=${time};atlasFrame('residents',${row},Math.floor(clock*3+${row})%4,1500,452,82)`,s);assert.equal(new Set(s.drawCalls.map(c=>c[1])).size,4,'resident service advances all four frames');}console.log('Gary and both merchants use four distinct working frames');
}
for(let chapter=5;chapter<=8;chapter++){
 const {api,vm:s,el}=setup();api.start(chapter);let a=api.getState();a.actors.forEach(e=>e.dead=true);assert(a.ladders.every(l=>l.h>0));for(const l of a.ladders){a.player.x=l.x-17;a.player.y=l.y-86;a.player.vy=0;a.player.climb=false;a.keys.down=true;for(let i=0;i<900;i++){api.update(1/120);if(a.player.y+86>=l.y+l.h-1)break;}for(let i=0;i<20;i++)api.update(1/120);assert.equal(a.player.y+86,l.y+l.h,'voyage ladder bottom '+chapter+':'+l.x);a.keys.down=false;}
 api.complete();assert.equal(api.getState().mode,'play','unfinished tasks prevent completion');const tasks=a.objects.filter(o=>o.type==='missionTask');for(const o of tasks){a.player.x=o.x;a.player.y=o.y-43;api.interact();assert(o.done);if(o.prop==='bridge')assert(a.solids.some(p=>p.x===1720&&p.w===1180));if(o.prop==='winch')assert(a.solids.some(p=>p.x===2240&&p.w===310));}const rescue=a.objects.find(o=>o.type==='rescue');a.player.x=rescue.x;a.player.y=rescue.y-43;api.interact();assert(rescue.done);api.complete();assert.equal(api.getState().mode,'menu');el('#continue').click();assert.equal(api.getState().mode,'visit','mission completion returns to physical home');console.log('Voyage '+chapter+': all ladder landings, route tasks, rescue and return-home flow pass');
}
for(const name of ['nova','sylvanas']){
 const {api,vm:s}=setup();api.setCharacter(name);api.start(3);let a=api.getState();a.player.x=628;a.partner.x=535;a.keys.up=true;api.update(.02);assert(!a.partner.climb,'companion walks to ladder before climbing');assert(a.partner.y!==a.player.y,'companion height is independent');for(let i=0;i<190;i++)api.update(1/120);a.keys.up=false;for(let i=0;i<190;i++)api.update(1/120);assert.equal(a.partner.y+86,300,'companion reaches deck on own ladder movement');assert(!a.partner.climb);assert(a.partner.x>=600&&a.partner.x<700,'companion stays on deck instead of following off its edge');
 console.log(name+': companion independently approaches ladder, climbs and lands');
}
{
 const {api,vm:s,el}=setup();api.start(3);let a=api.getState();const helm=a.objects.find(o=>o.type==='helm');a.player.x=helm.x;a.player.y=helm.y-43;api.interact();assert.equal(a.mode,'play','helm locked before drinks and lines');for(const o of a.objects.filter(o=>o.type!=='helm')){a.player.x=o.x;a.player.y=o.y-43;api.interact();assert(o.done);}a.player.x=helm.x;a.player.y=helm.y-43;api.interact();assert.equal(api.getState().mode,'escape');vm.runInContext('shipEscapeStep(3.1)',s);assert(el('#panel').innerHTML.includes('morning after'));el('#continue').click();assert.equal(api.getState().chapter,4);
 console.log('Ship theft: sequential prerequisites, boardable decks, escape transition and island arrival pass');
}
{
 const {api,vm:s}=setup();s.calls=[];vm.runInContext("assets.summonMotion={width:1536,height:1024};ctx.drawImage=(...a)=>calls.push(a)",s);api.setCharacter('sylvanas');api.start(0);api.ability();const sum=api.getState().summons[0];sum.vx=100;for(const t of [.01,.16,.3,.44])vm.runInContext(`clock=${t};drawSummons()`,s);assert.equal(new Set(s.calls.map(c=>c[1])).size,4);s.calls=[];for(const t of [.39,.29,.19,.09]){sum.attack=t;vm.runInContext('drawSummons()',s);}assert.equal(new Set(s.calls.map(c=>c[1])).size,4);console.log('Summon uses four walking frames and four sword-attack frames');
}

// Menu workflows preserve legacy campaigns and isolate early-level practice.
{
 const {api,vm:s,el,storage}=setup();
 const key='rum-island-story-v2',legacy={character:'sylvanas',story:5,coins:73,crew:['Gary the Goblin'],repairs:[0],quests:[],scraps:[]};
 storage.set(key,JSON.stringify(legacy));vm.runInContext('title()',s);assert(el('#panel').innerHTML.includes('New Game'));
 el('#load-game').click();el('#load-current').click();assert.equal(api.getState().mode,'visit');assert.equal(api.getState().save.coins,73);
 vm.runInContext('pause()',s);el('#main-menu').click();assert(el('#panel').innerHTML.includes('Test Early Levels'));
 const before=storage.get(key);el('#test-levels').click();
 el('[data-character]nova').click();el('[data-test-level]0').click();assert.equal(api.getState().chapter,0);assert.equal(api.getState().save.character,'nova');
 vm.runInContext('save.coins=999;persist();title()',s);assert.equal(storage.get(key),before);
 for(const chapter of [1,2,3,4]){el('#test-levels').click();el('[data-test-level]'+chapter).click();assert.equal(api.getState().chapter,chapter);vm.runInContext('persist();title()',s);assert.equal(storage.get(key),before);}
 el('#load-game').click();el('#load-current').click();assert.equal(api.getState().save.coins,73);
 vm.runInContext('title()',s);el('#new-game').click();el('[data-character]nova').click();el('#begin-new').click();assert.equal(api.getState().chapter,0);assert.equal(api.getState().save.coins,0);assert.equal(JSON.parse(storage.get(key+'-previous')).coins,73);
 vm.runInContext('title()',s);el('#load-game').click();el('#load-previous').click();assert.equal(api.getState().mode,'visit');assert.equal(api.getState().save.character,'sylvanas');assert.equal(api.getState().save.coins,73);assert.equal(JSON.parse(storage.get(key+'-previous')).character,'nova');
 console.log('Menus: legacy load, pause-to-menu, all five isolated practice chapters, new-game backup and previous-game restore pass');
}
for(const character of ['nova','sylvanas']){
 const {api,vm:s}=setup();api.setCharacter(character);api.start(0);let a=api.getState();for(const e of a.actors){assert(e.support,'opening enemy has a platform');assert.equal(e.y+e.h,e.support.y);}
 for(let i=0;i<500;i++)api.update(1/120);for(const e of api.getState().actors){assert(e.x>=e.support.x+3&&e.x+e.w<=e.support.x+e.support.w-3);assert.equal(e.y+e.h,e.support.y);}
 api.start(2);s.calls=[];vm.runInContext("assets.characters={width:400,height:300};assets.novaMotion={width:400,height:300};assets.sylMotion={width:400,height:300};assets.novaUnarmed={width:400,height:200};assets.sylUnarmed={width:400,height:200};ctx.drawImage=(...a)=>calls.push(a);player.climb=true;keys.up=true",s);
 for(const t of [.01,.18,.35,.52])vm.runInContext(`clock=${t};sprite(player,selected)`,s);assert.equal(new Set(s.calls.map(c=>c[1])).size,4);assert(s.calls.every(c=>c[2]===200),'unarmed ladder uses climbing row');
}
{
 const {api,vm:s}=setup();api.setCharacter('sylvanas');api.start(0);let a=api.getState();a.player.x=750;a.player.y=164;api.ability();vm.runInContext('stepSummons(.01)',s);const summon=api.getState().summons[0],support=summon.support;assert(support);const x=summon.x,y=summon.y;a.actors.forEach(e=>e.dead=true);a.player.y=-216;a.player.climb=true;for(let i=0;i<120;i++)vm.runInContext('stepSummons(1/120)',s);assert.equal(summon.y,y);assert.equal(summon.x,x);assert.equal(summon.support,support);
 s.labels=[];vm.runInContext("label=(...a)=>labels.push(a);chapter=2;drawMissionDetails()",s);assert(s.labels.some(a=>a[0]==='EXIT → HARBOR'));
 console.log('Unarmed climb cycles, supported enemy patrols, stationary summon across player ladders and visible bar exit pass');
}
