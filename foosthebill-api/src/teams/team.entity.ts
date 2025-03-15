import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Tournament } from '../tournaments/tournament.entity';
import { User } from '../users/user.entity';

@Entity()
export class Team {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100 })
    name: string;

    @ManyToOne(() => Tournament)
    @JoinColumn({ name: 'tournament_id' })
    tournament: Tournament;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'participant_1_id' })
    participant1: User;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'participant_2_id' })
    participant2: User;
}
