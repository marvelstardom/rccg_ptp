import type {DeliveryState,Programme} from './workflow';
export interface CaptionProvider {draft(source:Pick<Programme,'id'|'title'|'starts_at'|'ends_at'|'venue'|'description'|'revision'>):Promise<{caption:string;sourceId:string;revision:number}>;}
export interface Publisher {capabilities():Promise<{channel:string;formats:string[]}[]>;publish(input:{contentId:string;channel:string;caption:string;imageUrl:string;idempotencyKey:string}):Promise<{state:DeliveryState;providerId?:string}>;reconcile(providerId:string):Promise<DeliveryState>;}
// Deliberately fail closed. No mock success or unverified third-party endpoints.
export class UnconfiguredPublisher implements Publisher {
 async capabilities(){return [];}
 async publish():Promise<never>{throw new Error('No social account is connected. Export for manual posting.');}
 async reconcile():Promise<never>{throw new Error('Publishing provider reconciliation is not configured.');}
}
