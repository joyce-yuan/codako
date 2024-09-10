import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user";

@Entity({ name: "worlds" })
export class World {
  @PrimaryGeneratedColumn("uuid")
  id: number;

  @Column({ type: "text" })
  name: string;

  @Column({ type: "text", nullable: true })
  data: string | null;

  @Column({ type: "text" })
  thumbnail: string;

  @Column({ type: "int8" })
  playCount: number;

  @Column({ type: "int8" })
  forkCount: number;

  @CreateDateColumn({ type: "timestamptz", default: () => "NOW()" })
  createdAt: Date;

  @CreateDateColumn({ type: "timestamptz", default: () => "NOW()" })
  updatedAt: Date;

  @ManyToOne(() => User, { persistence: false })
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => World, { persistence: false, nullable: true })
  forkParent: World | null;

  @Column()
  forkParentId: number | null;

  serialize(): any {
    return {
      name: this.name,
      id: this.id,
      userId: this.userId,
      playCount: this.playCount,
      forkCount: this.forkCount,
      forkParent: this.forkParent ? this.forkParent.serialize() : null,
      user: this.user ? this.user.serialize() : null,
      thumbnail: this.thumbnail ? this.thumbnail.toString() : null,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
