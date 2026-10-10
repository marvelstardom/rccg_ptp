import {cva,type VariantProps} from 'class-variance-authority';
import type {ButtonHTMLAttributes} from 'react';
import {clsx} from 'clsx';
const styles=cva('button',{variants:{variant:{default:'',outline:'outline',secondary:'secondary'}},defaultVariants:{variant:'default'}});
export function Button({className,variant,...props}:ButtonHTMLAttributes<HTMLButtonElement>&VariantProps<typeof styles>){return <button className={clsx(styles({variant}),className)} {...props}/>;}
