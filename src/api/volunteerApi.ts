import type { AuthStrategy } from "@/lib/authProvider";
import { Volunteer } from "@/types/volunteer";
import { fetchHalCollection, patchHal } from "./halClient";

export class VolunteersService {
    constructor(private readonly authStrategy: AuthStrategy) {}

    async getVolunteers(): Promise<{ judges: Volunteer[], referees: Volunteer[], floaters: Volunteer[] }> {
        const [judges, referees, floaters] = await Promise.all([
            fetchHalCollection<any>('/judges', this.authStrategy, 'judges'),
            fetchHalCollection<any>('/referees', this.authStrategy, 'referees'),
            fetchHalCollection<any>('/floaters', this.authStrategy, 'floaters')
        ]);

        const mapV = (v: any, type: 'Judge' | 'Referee' | 'Floater'): Volunteer => ({
            uri: v.uri || '',
            name: v.name || '',
            emailAddress: v.emailAddress || '',
            phoneNumber: v.phoneNumber || '',
            expert: !!v.expert,
            type
        } as Volunteer);

        return {
            judges: judges.map(v => mapV(v, 'Judge')),
            referees: referees.map(v => mapV(v, 'Referee')),
            floaters: floaters.map(v => mapV(v, 'Floater'))
        };
    }

    async updateVolunteer(uri: string, data: Partial<Volunteer>): Promise<void> {
        const payload = {
            name: data.name,
            emailAddress: data.emailAddress,
            phoneNumber: data.phoneNumber,
            expert: data.expert // ✅ Enviamos el estado del checkbox
        };
        await patchHal(uri, payload, this.authStrategy);
    }
}