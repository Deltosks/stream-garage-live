import test from 'node:test';import assert from 'node:assert/strict';import {sections} from '../public/view-model.js';import {publicSnapshot} from '../tools/sync.mjs';
test('законченный отбор не выдаётся за текущий; библиотека и три состояния прохождений независимы',()=>{
 const data={round:{mode:'points',phase:'finished'},games:[{id:'g1',title:'Game',status:'approved',weight:5000,chance:1,inWheel:true}],queue:[{id:'a',status:'playing'},{id:'b',status:'queued'},{id:'c',status:'completed'},{id:'d',status:'cancelled'}],history:[{title:'Game'}]};
 for(const phase of ['finished','cancelled']){data.round.phase=phase;const v=sections(data);assert.equal(v.round,null);assert.equal(v.candidates.length,0);assert.equal(v.library[0].weight,undefined);assert.equal(v.library[0].chance,undefined);assert.deepEqual(v.playing.map(q=>q.id),['a']);assert.deepEqual(v.planned.map(q=>q.id),['b']);assert.deepEqual(v.journal.map(q=>q.id),['d','c']);assert.equal(v.history.length,1);}
 for(const phase of ['voting','wheel']){data.round.phase=phase;assert.equal(sections(data).candidates[0].weight,5000);assert.equal(sections(data).library[0].chance,undefined);}
});
test('снимок сбрасывает прежние баллы при отсутствии активного отбора, не удаляя библиотеку и историю',()=>{
 const now=Date.now(),raw={schema:3,serverTime:now,round:{mode:'points',phase:'finished',totalWeight:5000},library:[{id:'g1',title:'Game',weight:5000,chance:1,inWheel:true}],queue:[],archive:[{winner:{title:'Game'},result:{chance:1},candidates:[]}]};
 for(const phase of ['finished','cancelled',null]){raw.round=phase?{phase,totalWeight:5000}:null;const s=publicSnapshot(raw,now);assert.equal(s.round,null);assert.equal(s.games.length,1);assert.equal(s.games[0].weight,0);assert.equal(s.games[0].chance,0);assert.equal(s.games[0].inWheel,false);assert.equal(s.history[0].chance,1);}
 for(const phase of ['voting','wheel']){raw.round={mode:'points',phase,totalWeight:5000};const s=publicSnapshot(raw,now);assert.equal(s.games[0].weight,5000);assert.equal(s.games[0].chance,1);assert.equal(s.round.totalWeight,5000);}
});
