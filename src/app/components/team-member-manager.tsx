'use client';

import { useState } from 'react';
import { Button } from '@/app/components/button';
import { AddMemberForm } from './add-member-form';
import { DeleteMemberDialog } from './delete-member-dialog';
import { useTeamMembers } from '@/hooks/useTeamMembers';

export function TeamMembersManager({
    teamId,
    initialMembers = [],
    isCoach,
    isAdmin
}: any) {

    const isAuthorized = isCoach || isAdmin;

    const {
        members,
        addMember,
        removeMember,
        isFull
    } = useTeamMembers(teamId, initialMembers);

    const [showForm, setShowForm] = useState(false);
    const [selected, setSelected] = useState<any>(null);

    // 🔥 seguridad extra: evita null/undefined/arrays rotos
    const safeMembers = (members ?? []).filter(
        (m: any) => m && typeof m === 'object'
    );

    return (
        <div className="space-y-4">

            {/* ADD MEMBER */}
            {isAuthorized && !isFull && (
                <Button
                    onClick={() => setShowForm(true)}
                    disabled={isFull}
                >
                    Add Member
                </Button>
            )}

            {isFull && (
                <p className="text-yellow-600">
                    Max members reached
                </p>
            )}

            {/* FORM */}
            {showForm && (
                <AddMemberForm
                    onSubmit={async (name, role) => {
                        const success = await addMember(name, role);
                        if (success) setShowForm(false);
                    }}
                    onCancel={() => setShowForm(false)}
                />
            )}

            {/* LIST */}
            <ul>
                {safeMembers.map((m: any, index: number) => (
                    <li
                        key={
                            m?._links?.self?.href ||
                            m?.uri ||
                            m?.id ||
                            `${m?.name ?? 'member'}-${index}`
                        }
                        className="flex justify-between border p-2 rounded"
                    >
                        <span>
                            {m.name ?? "Unnamed member"}
                        </span>

                        {isAuthorized && (
                            <Button onClick={() => setSelected(m)}>
                                Delete
                            </Button>
                        )}
                    </li>
                ))}
            </ul>

            {/* DELETE DIALOG */}
            <DeleteMemberDialog
                isOpen={!!selected}
                onCancel={() => setSelected(null)}
                onConfirm={async () => {
                    if (!selected?._links?.self?.href) return;

                    await removeMember(selected._links.self.href);
                    setSelected(null);
                }}
            />
        </div>
    );
}