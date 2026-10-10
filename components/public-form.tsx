'use client';
import {useState} from 'react';
import Link from 'next/link';
import {Button} from './ui/button';
export function PublicForm({kind}:{kind:'visit'|'prayer'|'newsletter'|'ministry'}){const [status,setStatus]=useState('');const [busy,setBusy]=useState(false);return <form className="public-form" onSubmit={async e=>{e.preventDefault();setBusy(true);setStatus('');const form=e.currentTarget;const payload=Object.fromEntries(new FormData(form));try{const r=await fetch('/api/enquiries',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...payload,kind})});const data=await r.json();setStatus(data.message);if(r.ok)form.reset();}catch{setStatus('Unable to send. Please try again later.');}finally{setBusy(false);}}}>
  <h3>{kind==='prayer'?'How can we pray with you?':kind==='newsletter'?'Church updates':kind==='ministry'?'Find your next step':'Let’s get acquainted'}</h3>
  {kind!=='newsletter'&&<label>Your name<input name="name" required maxLength={100} autoComplete="name"/></label>}
  <label>Email address<input type="email" name="email" required maxLength={254} autoComplete="email"/></label>
  {kind!=='newsletter'&&<label>{kind==='prayer'?'Your prayer request':'Your message'}<textarea name="message" required maxLength={2000} rows={5}/></label>}
  <label className="honeypot" aria-hidden="true">Leave this blank<input name="website" tabIndex={-1} autoComplete="off"/></label>
  <label className="check"><input name="consent" type="checkbox" value="yes" required/><span>I agree to the church using this information to respond to my request{kind==='newsletter'?' and send church updates':''}. <Link href="/privacy">Privacy notice</Link>.</span></label>
  <Button disabled={busy}>{busy?'Sending…':kind==='newsletter'?'Keep me updated':'Send securely ↗'}</Button><p role="status">{status}</p>
</form>;}
