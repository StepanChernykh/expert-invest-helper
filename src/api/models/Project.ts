import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Project {

    @PrimaryGeneratedColumn()
    public id: number;

    @Column('text', { name: 'project_name', unique: true, nullable: false })
    public projectName: string;

}
