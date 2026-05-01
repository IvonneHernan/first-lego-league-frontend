"use server";

import { MatchesService } from "@/api/matchesApi";
import { UsersService } from "@/api/userApi";
import { serverAuthProvider } from "@/lib/authProvider";
import { isAdmin, isReferee } from "@/lib/authz";
import { parseErrorMessage } from "@/types/errors";
import {
    RegisterMatchScoreRequest,
    RegisterMatchScoreResponse,
} from "@/types/matchResult";

interface UpdateMatchResultScoresRequest {
    readonly teamAResultUri: string;
    readonly teamBResultUri: string;
    readonly teamAScore: number;
    readonly teamBScore: number;
}

function validateScores(teamAScore: number, teamBScore: number) {
    if (
        !Number.isInteger(teamAScore) ||
        !Number.isInteger(teamBScore) ||
        teamAScore < 0 ||
        teamBScore < 0
    ) {
        throw new Error("Scores must be non-negative whole numbers.");
    }
}

async function assertCanManageMatchResults() {
    const auth = await serverAuthProvider.getAuth();

    if (!auth) {
        throw new Error("You must be logged in to manage match results.");
    }

    const currentUser = await new UsersService(serverAuthProvider).getCurrentUser();

    if (!isAdmin(currentUser) && !isReferee(currentUser)) {
        throw new Error("You are not allowed to manage match results.");
    }
}

export async function registerMatchResult(
    data: RegisterMatchScoreRequest,
): Promise<RegisterMatchScoreResponse> {
    await assertCanManageMatchResults();

    const { teamAScore, teamBScore } = data.score;
    validateScores(teamAScore, teamBScore);

    try {
        return await new MatchesService(serverAuthProvider).registerMatchResult(data);
    } catch (e) {
        throw new Error(parseErrorMessage(e));
    }
}

export async function updateMatchResultScores({
    teamAResultUri,
    teamBResultUri,
    teamAScore,
    teamBScore,
}: UpdateMatchResultScoresRequest): Promise<void> {
    await assertCanManageMatchResults();
    validateScores(teamAScore, teamBScore);

    try {
        const service = new MatchesService(serverAuthProvider);

        await Promise.all([
            service.updateMatchResult(teamAResultUri, teamAScore),
            service.updateMatchResult(teamBResultUri, teamBScore),
        ]);
    } catch (e) {
        throw new Error(parseErrorMessage(e));
    }
}
