import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Tournament } from '../tournaments/tournament.entity';
import { Team } from '../teams/team.entity';

@Entity()
export class Ranking {
    @PrimaryGeneratedColumn()
    id: string;

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

    @CreateDateColumn()
    creation_date: Date;
}