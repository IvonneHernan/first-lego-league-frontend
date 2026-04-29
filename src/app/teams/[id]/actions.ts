"use server";

import { TeamsService, UpdateMemberPayload } from "@/api/teamApi";
import { UsersService } from "@/api/userApi";
import { serverAuthProvider } from "@/lib/authProvider";
import { isAdmin } from "@/lib/authz";
import { AuthenticationError } from "@/types/errors";

export async function updateTeamMember(
    teamId: string,
    memberUri: string,
    data: UpdateMemberPayload
): Promise<void> {
    const auth = await serverAuthProvider.getAuth();
    if (!auth) throw new AuthenticationError();

    const usersService = new UsersService(serverAuthProvider);
    const teamsService = new TeamsService(serverAuthProvider);

    const [currentUser, coaches] = await Promise.all([
        usersService.getCurrentUser(),
        teamsService.getTeamCoach(teamId),
    ]);

    const currentEmail = currentUser?.email?.trim().toLowerCase();
    const userIsAdmin = isAdmin(currentUser);
    const userIsCoach =
        !!currentEmail &&
        coaches.some(c => c.emailAddress?.trim().toLowerCase() === currentEmail);

    if (!userIsAdmin && !userIsCoach) {
        throw new AuthenticationError("You are not allowed to edit team members.", 403);
    }

    await teamsService.updateTeamMember(memberUri, data);
}