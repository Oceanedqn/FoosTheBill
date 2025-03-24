// src/users/user.entity.ts
import { Team } from 'src/teams/team.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToMany } from 'typeorm';

export enum Role {
    ADMIN = 'admin',
    PARTICIPANT = 'participant',
}

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 100 })
    name: string;

    @Column({ length: 100 })
    firstname: string;

    @Column({ length: 150, unique: true })
    email: string;

    @Column({ length: 255 })
    password: string;

    @Column({ type: 'enum', enum: Role })
    role: Role;

    @ManyToMany(() => Team, (team) => team.players)
    teams: Team[];

    @CreateDateColumn()
    creation_date: Date;
}
