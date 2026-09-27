import { DataSource } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { Movie } from '../movies/entities/movie.entity';
import { Role } from '../roles/entities/role.entity';

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [Movie, User, Role],
  migrations: [__dirname + '/migrations/*.js'],
  synchronize: false,
});