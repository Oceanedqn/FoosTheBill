// src/tournaments/tournament.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class Tournament {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 100 })
    name: string;

    @Column()
    start_date: Date;

    @Column()
    end_date: Date;

    @Column('text')
    description: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'admin_id' })
    admin: User;
}
