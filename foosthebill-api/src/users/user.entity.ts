// src/users/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

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

    @CreateDateColumn()
    creation_date: Date;
}
