'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Volunteer } from '@/types/volunteer';

interface Props {
    volunteer: Volunteer;
    updateAction: (uri: string, data: Partial<Volunteer>) => Promise<{ success: boolean; error?: string }>;
}

export default function EditVolunteerModal({ volunteer, updateAction }: Readonly<Props>) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isOpen = searchParams.get('edit') === 'true';
    
    const [formData, setFormData] = useState({
        name: volunteer?.name || '',
        emailAddress: volunteer?.emailAddress || '',
        phoneNumber: volunteer?.phoneNumber || '',
        expert: volunteer?.expert || false,
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const closeModal = () => router.replace(`/volunteers/${encodeURIComponent(volunteer.uri!)}`);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const result = await updateAction(volunteer.uri!, formData);
        if (result.success) {
            closeModal();
            router.refresh(); 
        } else {
            setError(result.error || 'Failed to update');
        }
        setLoading(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 text-zinc-900 dark:text-zinc-100">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-zinc-900 border dark:border-zinc-800">
                <h2 className="text-xl font-semibold mb-4 text-center">Edit Volunteer</h2>
                {error && <div className="mb-4 text-sm text-red-500 bg-red-50 p-2 rounded">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input className="w-full border rounded px-3 py-2 dark:bg-zinc-800" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Name" required />
                    <input className="w-full border rounded px-3 py-2 dark:bg-zinc-800" value={formData.emailAddress} onChange={e => setFormData({...formData, emailAddress: e.target.value})} placeholder="Email" required type="email" />
                    <input className="w-full border rounded px-3 py-2 dark:bg-zinc-800" value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} placeholder="Phone" />
                    
                    {volunteer.type === 'Judge' && (
                        <label className="flex items-center space-x-2 cursor-pointer pt-2">
                            <input type="checkbox" checked={formData.expert} onChange={e => setFormData({...formData, expert: e.target.checked})} className="h-4 w-4" />
                            <span className="text-sm font-medium">Is Expert Judge</span>
                        </label>
                    )}

                    <div className="mt-6 flex justify-end space-x-3 border-t pt-4">
                        <button type="button" onClick={closeModal} className="px-4 py-2 text-sm">Cancel</button>
                        <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded text-sm disabled:opacity-50">
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}