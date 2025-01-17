import { promises as fs } from 'fs';
import path from 'path';
import { Migrator, FileMigrationProvider, MigrationResult } from 'kysely';
import { pgDb } from './db';

async function migrateToLatest() {
  const migrator = new Migrator({
    db: pgDb,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: path.join(__dirname, 'migrations'),
    }),
  });

  const command = process.argv[2] ?? 'up';

  if (command === 'up') {
    const { error, results } = await migrator.migrateToLatest();
    handleResults(error, results);
  } else if (command === 'down') {
    const { error, results } = await migrator.migrateDown();
    handleResults(error, results);
  }

  await pgDb.destroy();
}

function handleResults(error: any, results: MigrationResult[] | undefined) {
  results?.forEach((it: any) => {
    if (it.status === 'Success') {
      console.log(`migration "${it.migrationName}" was executed successfully`);
    } else if (it.status === 'Error') {
      console.error(`failed to execute migration "${it.migrationName}"`);
    }
  });

  if (error) {
    console.error('failed to migrate');
    console.error(error);
    process.exit(1);
  }
}

migrateToLatest();
