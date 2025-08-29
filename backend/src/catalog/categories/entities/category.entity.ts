import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('categories')
@Index(['slug'], { unique: true })
@Index(['parentId'])
@Index(['isActive'])
@Index(['sortOrder'])
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string = uuidv4();

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  imageUrl: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  metaTitle: string;

  @Column({ type: 'text', nullable: true })
  metaDescription: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  // Relación auto-referencial para jerarquía
  @Column({ type: 'uuid', nullable: true })
  parentId: string;

  @ManyToOne(() => Category, (category) => category.children, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parentId' })
  parent: Category;

  @OneToMany(() => Category, (category) => category.parent)
  children: Category[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Métodos de utilidad
  get isRoot(): boolean {
    return !this.parentId;
  }

  get hasChildren(): boolean {
    return this.children && this.children.length > 0;
  }

  // Método para obtener la ruta completa (breadcrumb)
  getBreadcrumb(): string[] {
    const breadcrumb: string[] = [];
    let current: Category = this;
    
    while (current) {
      breadcrumb.unshift(current.name);
      current = current.parent;
    }
    
    return breadcrumb;
  }

  // Método para obtener el nivel de profundidad
  getDepth(): number {
    let depth = 0;
    let current: Category = this;
    
    while (current.parent) {
      depth++;
      current = current.parent;
    }
    
    return depth;
  }
}