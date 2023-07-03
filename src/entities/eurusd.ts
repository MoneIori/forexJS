import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity('eur')
export class Eurusd {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: 'double', name: 'Close' })
  close: number;
  @Column({ name: 'Date' })
  date: Date;
  @Column({ type: 'double', name: 'High' })
  high: number;
  @Column({ type: 'double', name: 'Low' })
  low: number;
  @Column({ type: 'double', name: 'Open' })
  open: number;
}
