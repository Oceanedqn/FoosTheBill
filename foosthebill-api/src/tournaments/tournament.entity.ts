// src/tournaments/tournament.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { UserResponseDTO } from 'src/users/dto/user.dto';
import { User } from 'src/users/user.entity';

@Entity()
export class Tournament {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 100 })
    name: string;

    @Column('text')
    description: string;

    @Column()
    start_date: Date;

    @CreateDateColumn()
    creation_date: Date;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'admin_id' })
    admin_id: string;

}
