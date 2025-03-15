import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Tournament } from '../tournaments/tournament.entity';
import { Team } from '../teams/team.entity';

@Entity()
export class Ranking {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Tournament)
    @JoinColumn({ name: 'tournament_id' })
    tournament: Tournament;

    @ManyToOne(() => Team)
    @JoinColumn({ name: 'team_id' })
    team: Team;

    @Column()
    position: number;

    @Column()
    points: number;
}