'use client';
import Image from 'next/image';
import * as Dialog from '@radix-ui/react-dialog';
import {photos} from '@/lib/config';
export function Gallery(){return <div className="gallery-grid">{photos.map(p=><Dialog.Root key={p.src}><Dialog.Trigger asChild><button className="gallery-item" aria-label={`Enlarge: ${p.alt}`}><Image src={p.src} alt={p.alt} width={800} height={900} sizes="(max-width:760px) 100vw,33vw"/><span>View moment ↗</span></button></Dialog.Trigger><Dialog.Portal><Dialog.Overlay className="dialog-overlay"/><Dialog.Content className="dialog-content"><Dialog.Title>{p.alt}</Dialog.Title><Dialog.Description>October Thanksgiving 2026 · RCCG Peculiar Treasures Parish</Dialog.Description><Image src={p.src} alt={p.alt} width={1400} height={1000} style={{objectFit:'contain',maxHeight:'70vh',width:'100%'}}/><Dialog.Close className="button">Close</Dialog.Close></Dialog.Content></Dialog.Portal></Dialog.Root>)}</div>;}
