import { Tournament } from 'src/tournaments/tournament.entity';

/**
 * Calculate the number of participants in a tournament.
 * @param tournament - The tournament entity.
 * @returns number - The total number of participants (including duplicates).
 */
export const calculateParticipantsCount = (tournament: Tournament): number => {
    let participantsCount = 0;

    tournament.teams.forEach(team => {
        participantsCount += team.players.length;
    });

    return participantsCount;
};
