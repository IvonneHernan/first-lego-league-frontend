import { TeamsService } from "@/api/teamApi";
import ErrorAlert from "@/app/components/error-alert";
import EmptyState from "@/app/components/empty-state";
import { serverAuthProvider } from "@/lib/authProvider";
import { Team } from "@/types/team";
import { User } from "@/types/user";
import { parseErrorMessage } from "@/types/errors";
import { TeamMembersManager } from "@/app/components/team-member-manager";

function extractTeamMembers(data: any): any[] {
    return (
        data?._embedded?.teamMembers ??
        data?.teamMembers ??
        data ??
        []
    );
}

export default async function TeamDetailPage(props: any) {
    const { id } = await props.params;

    const service = new TeamsService(serverAuthProvider);

    let team: Team | null = null;
    let coaches: User[] = [];
    let members: any[] = [];
    let error: string | null = null;
    let membersError: string | null = null;

    try {
        team = await service.getTeamById(id);
    } catch (e) {
        error = parseErrorMessage(e);
    }

    if (team) {
        try {
            const [coachesData, membersData] = await Promise.all([
                service.getTeamCoach(id),
                service.getTeamMembers(id),
            ]);

            coaches = coachesData ?? [];
            members = extractTeamMembers(membersData);

        } catch (e) {
            membersError = parseErrorMessage(e);
        }
    }

    const coachName =
        coaches.length > 0
            ? (coaches[0].username ?? coaches[0].email ?? "Unnamed coach")
            : "No coach assigned";

    if (!team) {
        return <ErrorAlert message={error ?? "Team not found"} />;
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50">
            <div className="w-full max-w-3xl px-4 py-10">

                <div className="w-full rounded-lg border bg-white p-6 shadow-sm dark:bg-black">

                    <h1 className="mb-2 text-2xl font-semibold">
                        {team.name}
                    </h1>

                    <div className="mb-6 text-sm text-zinc-600 space-y-1">
                        {team.city && <p><strong>City:</strong> {team.city}</p>}
                        {team.category && <p><strong>Category:</strong> {team.category}</p>}
                        {team.educationalCenter && (
                            <p><strong>Educational Center:</strong> {team.educationalCenter}</p>
                        )}
                        <p><strong>Coach:</strong> {coachName}</p>
                    </div>

                    <h2 className="mt-8 mb-4 text-xl font-semibold">
                        Team Members
                    </h2>

                    {membersError && (
                        <ErrorAlert message={membersError} />
                    )}

                    {!membersError && members.length === 0 && (
                        <EmptyState
                            title="No members found"
                            description="This team has no members yet."
                        />
                    )}

                    {!membersError && (
                        <TeamMembersManager
                            teamId={id}
                            initialMembers={members}
                            isCoach={true}
                            isAdmin={true}
                        />
                    )}

                </div>
            </div>
        </div>
    );
}