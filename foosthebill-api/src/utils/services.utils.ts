import { Tournament } from 'src/tournaments/tournament.entity';

/**
 * Calculate unique participants in a tournament.
 * @param tournament - The tournament entity.
 * @returns Set<string> - A set of unique participant IDs.
 */
export const calculateParticipants = (tournament: Tournament): Set<string> => {
  const participants = new Set<string>();

  tournament.teams.forEach(team => {
    if (team.participant1) participants.add(team.participant1.id);
    if (team.participant2) participants.add(team.participant2.id);
  });

  return participants;
};
