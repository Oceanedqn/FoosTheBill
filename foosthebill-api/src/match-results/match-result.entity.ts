import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Match } from '../matches/match.entity';

@Entity()
export class MatchResult {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Match)
    @JoinColumn({ name: 'match_id' })
    match: Match;

    @Column()
    score_team_1: number;

    @Column()
    score_team_2: number;

    @Column()
    recorded_date: Date;
}