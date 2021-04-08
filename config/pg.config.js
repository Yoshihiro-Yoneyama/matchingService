const dbConfig = {
  database:"database",
  user: "postgres",
  password: "postgres",
  host: "localhost",
  port: 5432
};

const pool = new pg.Pool(dbConfig);
