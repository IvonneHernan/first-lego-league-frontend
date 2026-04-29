import { Resource } from "halfred";
import type { VolunteerEntity } from "./volunteer";
import type { ScientificProjectEntity } from "./scientificProject";

export interface ProjectRoomEntity {
    uri?: string;
    roomNumber?: number;
    judge?: VolunteerEntity;
    panelists?: VolunteerEntity[];
    scientificProjects?: ScientificProjectEntity[];
}

export type ProjectRoom = ProjectRoomEntity & Resource;