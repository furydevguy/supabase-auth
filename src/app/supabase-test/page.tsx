 'use client';
 
 import { useEffect, useState } from 'react';
 import { Button } from '@/components/ui/button';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Separator } from '@/components/ui/separator';
 
 export default function SupabaseTestPage() {
 	const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
 	const [message, setMessage] = useState<string>('');
 
 	async function checkHealth() {
 		setStatus('loading');
 		setMessage('');
 		try {
 			const res = await fetch('/api/supabase-health', { cache: 'no-store' });
 			const json = await res.json();
 			if (res.ok && json.ok) {
 				setStatus('success');
 				setMessage('Connected to Supabase successfully');
 			} else {
 				setStatus('error');
 				setMessage(json.error ?? 'Unknown error');
 			}
 		} catch (e) {
 			setStatus('error');
 			setMessage(e instanceof Error ? e.message : 'Unknown error');
 		}
 	}
 
 	useEffect(() => {
 		// auto-run once on page load to verify quickly
 		checkHealth();
 		// eslint-disable-next-line react-hooks/exhaustive-deps
 	}, []);
 
 	return (
 		<div className="mx-auto max-w-xl p-4">
 			<Card>
 				<CardHeader>
 					<CardTitle>Supabase Connection Test</CardTitle>
 				</CardHeader>
 				<CardContent>
 					<div className="flex items-center gap-3">
 						<Button onClick={checkHealth} disabled={status === 'loading'}>
 							{status === 'loading' ? 'Checking…' : 'Re-check'}
 						</Button>
 						<span className={
 							status === 'success' ? 'text-green-600' : status === 'error' ? 'text-red-600' : 'text-muted-foreground'
 						}>
 							{status === 'success' && 'OK'}
 							{status === 'error' && 'Failed'}
 							{status === 'idle' && 'Idle'}
 							{status === 'loading' && 'Loading'}
 						</span>
 					</div>
 					<Separator className="my-4" />
 					<p className="text-sm text-muted-foreground break-all">{message}</p>
 				</CardContent>
 			</Card>
 		</div>
 	);
 }

