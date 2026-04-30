import { MatchesService } from "./src/api/matchesApi.js";
import { HalClient } from "./src/api/halClient.js";

async function fetchMatches() {
    try {
        const response = await fetch("http://localhost:8080/api/matches");
        if (response.ok) {
            const json = await response.json();
            console.log(JSON.stringify(json._embedded?.matches?.[0], null, 2));
        } else {
            console.log("Failed to fetch:", response.status);
        }
    } catch (e) {
        console.log("Error:", e.message);
    }
}
fetchMatches();
