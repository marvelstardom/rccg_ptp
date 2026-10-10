// Next.js may construct req.url with an internal hostname. The incoming Host
// represents the browser destination; browser callers cannot forge this header.
export function sameOrigin(req:Request){
 const origin=req.headers.get('origin');if(!origin)return false;
 try{const url=new URL(origin);if(!['http:','https:'].includes(url.protocol))return false;
  const host=req.headers.get('host');if(host&&url.host.toLowerCase()===host.toLowerCase())return true;
  return url.origin===new URL(req.url).origin;
 }catch{return false;}
}
