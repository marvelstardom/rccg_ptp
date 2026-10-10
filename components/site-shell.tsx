import Link from 'next/link';
import Image from 'next/image';
import {ArrowUpRight} from 'lucide-react';
import {church,demoMode} from '@/lib/config';
export function SiteShell({children}:{children:React.ReactNode}){return <>
  <a href="#main" className="skip-link">Skip to content</a>
  {demoMode()&&<div className="demo-bar">Local preview · programme dates, time and venue are demonstration content <Link href="/dashboard">Explore dashboard ↗</Link></div>}
  <header className="site-header"><Link href="/" className="brand"><Image src="/images/brand/rccg.png" alt="RCCG" width={48} height={48}/><span>Peculiar Treasures Parish<small>{church.assembly}</small></span></Link><nav aria-label="Main navigation"><Link href="/about">Our church</Link><Link href="/programmes">What’s on</Link><Link href="/sermons">Watch & listen</Link><Link href="/gallery">Our moments</Link></nav><Link href="/visit" className="button small">Plan a visit <ArrowUpRight size={16}/></Link><details className="mobile-menu"><summary>Menu</summary><nav><Link href="/about">Our church</Link><Link href="/programmes">What’s on</Link><Link href="/sermons">Watch & listen</Link><Link href="/gallery">Our moments</Link><Link href="/ministries">Get involved</Link><Link href="/contact">Contact</Link></nav></details></header>
  <main id="main">{children}</main>
  <footer><div><span className="eyebrow">YOU BELONG HERE</span><h2>Let’s do life.<br/>Together.</h2><Link className="button light" href="/visit">See you on Sunday <ArrowUpRight size={18}/></Link></div><div><h3>{church.name}</h3><p>{church.assembly}<br/>{church.city}, Nigeria</p><div className="footer-links"><Link href="/contact">Prayer & contact</Link><Link href="/ministries">Get involved</Link><Link href="/privacy">Privacy</Link><Link href="/login">Team sign in</Link></div></div><p className="copyright">© {new Date().getFullYear()} {church.name}. A place to grow in faith and friendship.</p></footer>
</>;}
