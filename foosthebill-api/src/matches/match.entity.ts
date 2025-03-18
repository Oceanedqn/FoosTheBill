import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Tournament } from '../tournaments/tournament.entity';
import { Team } from 'src/teams/team.entity';

@Entity()
export class Match {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Tournament)
    @JoinColumn({ name: 'tournament_id' })
    tournament: Tournament;

    @ManyToOne(() => Team)
    @JoinColumn({ name: 'team_1_id' })
    team1: Team;

    @ManyToOne(() => Team)
    @JoinColumn({ name: 'team_2_id' })
    team2: Team;

    @Column()
    date_match: Date;

    @Column()
    score_team_1: number;

    @Column()
    score_team_2: number;

    @CreateDateColumn()
    creation_date: Date;
}