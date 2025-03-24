import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { Tournament } from '../tournaments/tournament.entity';
import { Team } from 'src/teams/team.entity';
import { MatchTeam } from 'src/match-team/match-team.entity';
import { MatchResult } from 'src/match-results/match-result.entity';

@Entity()
export class Match {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Tournament)
    @JoinColumn({ name: 'tournament_id' })
    tournament: Tournament;

    @OneToMany(() => MatchTeam, matchTeam => matchTeam.match)  // Relation inverse avec MatchTeam
    matchTeams: MatchTeam[];

    @OneToMany(() => MatchResult, (matchResult) => matchResult.match)
    matchResults: MatchResult[];

    @Column()
    round: number;

    @Column({ default: false })
    isClosed: boolean;

    @CreateDateColumn()
    creation_date: Date;
}
