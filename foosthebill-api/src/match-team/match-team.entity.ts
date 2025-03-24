import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column } from 'typeorm';
import { Team } from 'src/teams/team.entity';  // Assure-toi que le chemin est correct
import { Match } from 'src/matches/match.entity';

@Entity()
export class MatchTeam {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Match)
    @JoinColumn({ name: 'match_id' })
    match: Match;

    @ManyToOne(() => Team)
    @JoinColumn({ name: 'team_id' })
    team: Team;

    @Column({ type: 'int', default: 0 })  // Default score is 0
    score: number;
}
