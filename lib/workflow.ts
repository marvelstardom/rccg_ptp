export type Programme = {id:string; title:string; starts_at:string; ends_at:string; venue:string; description:string; approved:boolean; revision:number};
export type ContentVersion = {programme_id:string; source_revision:number; caption:string; status:'draft'|'pending'|'approved'|'canceled'; approved_by?:string};
export type DeliveryState = 'Pending'|'Accepted'|'Published'|'Failed'|'Unknown'|'Canceled';
export function validateProgramme(p:Programme) {
  if(!p.approved) throw new Error('Programme requires approval.');
  if(!p.title.trim() || !p.venue.trim()) throw new Error('Title and confirmed venue are required.');
  if(!Number.isFinite(Date.parse(p.starts_at)) || Date.parse(p.ends_at)<=Date.parse(p.starts_at)) throw new Error('A valid start and end time are required.');
  return p;
}
export function canSchedule(c:ContentVersion,p:Programme) {
  return c.status==='approved' && !!c.approved_by && p.approved && c.programme_id===p.id && c.source_revision===p.revision;
}
export function captionFor(p:Programme) {
  validateProgramme(p);
  return `You are warmly invited to ${p.title}.\n\n${dateLabel(p.starts_at)} · ${timeLabel(p.starts_at)}\n${p.venue}\n\n${p.description}\n\nCome as you are. There is a place for you.\n#RCCGPeculiarTreasures #EarlyRiserAssembly`;
}
export const dateLabel=(iso:string)=>new Intl.DateTimeFormat('en-NG',{timeZone:'Africa/Lagos',weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date(iso));
export const timeLabel=(iso:string)=>new Intl.DateTimeFormat('en-NG',{timeZone:'Africa/Lagos',hour:'numeric',minute:'2-digit'}).format(new Date(iso));
export function sundayTheme(day:number){return ['Celebration Service','Prophetic Sunday','Elevation Service','Love Sunday'][Math.floor((day-1)/7)] ?? null;}
export function deliveryKey(contentId:string,revision:number,channel:string){return `${contentId}:${revision}:${channel}`;}
export function retryAllowed(state:DeliveryState){return state==='Failed' || state==='Pending';}
export const demoProgrammes:Programme[] = [11,18,25].map((day,index)=>({id:`demo-${day}`,title:['Prophetic Sunday','Elevation Service','Love Sunday'][index],starts_at:`2026-10-${day}T06:00:00Z`,ends_at:`2026-10-${day}T07:20:00Z`,venue:'DEMO — venue awaiting church confirmation',description:'A time to worship, learn and connect with one another.',approved:true,revision:1}));
