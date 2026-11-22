import {writeFile,mkdir} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
export const SOURCE='https://stream-garage-auction-lab.deltosks.chatgpt.site/api/state?audience=viewer';
const str=(v,max=200)=>typeof v==='string'?v.slice(0,max):'';
const num=v=>typeof v==='number'&&Number.isFinite(v)?v:0;
const url=v=>{try{const u=new URL(v);return u.protocol==='https:'&&!u.username&&!u.password?u.href:'';}catch{return '';}};
export function publicSnapshot(raw,now=Date.now()){
 if(raw?.schema!==3||!Array.isArray(raw.library)||!Array.isArray(raw.queue)||!Array.isArray(raw.archive)||!Number.isFinite(raw.serverTime)||Math.abs(now-raw.serverTime)>600000)throw Error('Public state is invalid or stale; preserving the previous deployment.');
 const r=raw.round,active=r?.mode==='points'&&['voting','wheel'].includes(r.phase);
 return {format:'garage-public-monitor-v1',updatedAt:raw.serverTime,fetchedAt:now,revision:num(raw.revision),channel:'deltosks',
  bankShow:raw.bankShow&&!raw.bankShow.demo?{id:str(raw.bankShow.id),status:str(raw.bankShow.status),total:num(raw.bankShow.total),remaining:num(raw.bankShow.remaining),distributed:num(raw.bankShow.distributed),twitchTotal:num(raw.bankShow.twitchTotal),manualTotal:num(raw.bankShow.manualTotal),proposalCount:num(raw.bankShow.proposalCount),participantCount:num(raw.bankShow.participantCount),cursor:num(raw.bankShow.cursor),format:str(raw.bankShow.settings?.format),source:str(raw.bankShow.settings?.source),target:num(raw.bankShow.settings?.target),max:raw.bankShow.settings?.max===null?null:num(raw.bankShow.settings?.max),proposalOpen:raw.bankShow.proposalOpen===true,deadline:num(raw.bankShow.settings?.deadline),winner:str(raw.bankShow.winner),ranking:(raw.bankShow.ranking||[]).map(g=>({id:str(g.id),title:str(g.title),points:num(g.points),chance:num(g.chance),rank:num(g.rank)})),games:(raw.bankShow.games||[]).filter(g=>g.status==='approved'&&!g.mergedInto).map(g=>({id:str(g.id),title:str(g.title)})),notices:(raw.bankShow.notices||[]).map(n=>({at:num(n.at),text:str(n.text,1000)}))}:null,
  connection:{connected:raw.connection?.connected===true,revoked:raw.connection?.revoked===true},
  round:active?{id:str(r.id),number:num(r.number),phase:str(r.phase),mode:str(r.mode),top:num(r.top),min:num(r.min),maxUserPoints:num(r.maxUserPoints),totalWeight:num(r.totalWeight),voters:num(r.voters),invalidated:r.invalidated===true}:null,
  games:raw.library.slice(0,2000).map(g=>({id:str(g.id),title:str(g.title),status:str(g.status),progressResultId:str(g.progressResultId),completedBefore:g.completedBefore===true,weight:active?num(g.weight):0,points:active?num(g.points):0,supporters:active?num(g.supporters):0,chance:active?Math.max(0,Math.min(1,num(g.chance))):0,inWheel:active&&g.inWheel===true,reason:str(g.reason,300)})),
  queue:raw.queue.map(q=>({id:str(q.id),title:str(q.title),goal:str(q.goal),status:str(q.status),outcome:str(q.outcome),minutesPlayed:num(q.minutesPlayed),startBy:num(q.startBy),progress:str(q.progress,500),reason:str(q.reason,300),vodUrl:url(q.vodUrl),milestones:(q.milestones||[]).slice(-100).map(m=>({at:num(m.at),goal:str(m.goal),status:str(m.status),outcome:str(m.outcome),minutesPlayed:num(m.minutesPlayed)}))})),
  history:raw.archive.slice(-30).map(h=>({id:str(h.id),number:num(h.number),at:num(h.at),title:str(h.winner?.title),chance:num(h.result?.chance),games:Array.isArray(h.candidates)?h.candidates.length:0}))};
}
export async function sync({fetcher=fetch,output=new URL('../public/state.json',import.meta.url),now=Date.now()}={}){
 const response=await fetcher(SOURCE,{redirect:'error',signal:AbortSignal.timeout(30000),headers:{Accept:'application/json'}});
 if(!response.ok)throw Error('Public source returned HTTP '+response.status);
 const text=await response.text();if(text.length>2500000)throw Error('Public source is too large');
 const snapshot=publicSnapshot(JSON.parse(text),now);await mkdir(new URL('.',output),{recursive:true});await writeFile(output,JSON.stringify(snapshot));return snapshot;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){const s=await sync();console.log(JSON.stringify({games:s.games.length,revision:s.revision,updatedAt:s.updatedAt}));}
