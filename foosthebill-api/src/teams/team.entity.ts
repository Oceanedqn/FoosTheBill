import { Ranking } from 'src/rankings/ranking.entity';
import { Tournament } from 'src/tournaments/tournament.entity';
import { User } from 'src/users/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, JoinTable, ManyToMany, OneToMany } from 'typeorm';

@Entity()
export class Team {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 100 })
    name: string;

    @ManyToOne(() => Tournament)
    @JoinColumn({ name: 'tournament_id' })
    tournament: Tournament;

    @ManyToMany(() => User)
    @JoinTable({
        name: 'team_users',
        joinColumn: { name: 'team_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
    })
    players: User[];

    @OneToMany(() => Ranking, (ranking) => ranking.team)
    rankings: Ranking[];

    @CreateDateColumn()
    creation_date: Date;
}
