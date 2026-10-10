import {serve} from 'inngest/next';
import {inngest,weeklyDrafts} from '@/lib/inngest';
export const {GET,POST,PUT}=serve({client:inngest,functions:[weeklyDrafts]});
