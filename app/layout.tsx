import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:{default:'Peculiar Treasures Parish · A place to belong',template:'%s · Peculiar Treasures Parish'},description:'Welcome to RCCG Peculiar Treasures Parish  in Ado-Ekiti. Plan your visit, discover programmes and connect.',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>;}
