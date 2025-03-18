import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Match } from '../matches/match.entity';

@Entity()
export class MatchResult {
    @PrimaryGeneratedColumn()
    id: string;

    @ManyToOne(() => Match)
    @JoinColumn({ name: 'match_id' })
    match: Match;

    @Column()
    score_team_1: number;

    @Column()
    score_team_2: number;

    @Column()
    recorded_date: Date;

    @CreateDateColumn()
    creation_date: Date;
}