import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Match } from '../matches/match.entity';
import { Team } from 'src/teams/team.entity';

@Entity()
export class MatchResult {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Match)
    @JoinColumn({ name: 'match_id' })
    match: Match;

    @ManyToOne(() => Team)
    @JoinColumn({ name: 'team_id' })
    team: Team;

    @Column()
    score: number;

    @Column()
    recorded_date: Date;

    @CreateDateColumn()
    creation_date: Date;
}
