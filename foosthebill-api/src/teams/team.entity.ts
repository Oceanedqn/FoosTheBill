import { Tournament } from 'src/tournaments/tournament.entity';
import { User } from 'src/users/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class Team {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 100 })
    name: string;

    @ManyToOne(() => Tournament)
    @JoinColumn({ name: 'tournament_id' })
    tournament: Tournament;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'participant_1_id' })
    participant1: User;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'participant_2_id' })
    participant2: User | null;

    @CreateDateColumn()
    creation_date: Date;
}
