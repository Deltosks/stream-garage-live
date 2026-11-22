export function currentRound(data){return data.round&&['voting','wheel'].includes(data.round.phase)?data.round:null;}
export function sections(data){const round=currentRound(data),queue=data.queue||[];return {round,
 library:(data.games||[]).map(g=>({id:g.id,title:g.title,status:g.status,reason:g.reason})).sort((a,b)=>a.title.localeCompare(b.title,'ru')),
 candidates:round?(data.games||[]).filter(g=>g.weight>0&&!['blocked','archived','played'].includes(g.status)).sort((a,b)=>b.weight-a.weight||a.id.localeCompare(b.id)):[],
 playing:queue.filter(q=>q.status==='playing'),planned:queue.filter(q=>q.status==='queued'),journal:queue.filter(q=>['completed','cancelled'].includes(q.status)).slice().reverse(),history:(data.history||[]).slice().reverse()};}
