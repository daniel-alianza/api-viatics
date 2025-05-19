import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';

export const createDataSources = (configService: ConfigService) => ({
  dbAlianza: new DataSource({
    type: 'mssql',
    host: configService.get<string>('DB_ALIANZA_HOST') || '',
    port: +(configService.get<number>('DB_ALIANZA_PORT') || 1433),
    database: configService.get<string>('DB_ALIANZA_NAME') || '',
    username: configService.get<string>('DB_ALIANZA_USERNAME') || '',
    password: configService.get<string>('DB_ALIANZA_PASSWORD') || '',
    synchronize: false,
    options: {
      encrypt: true,
      trustServerCertificate: true,
      enableArithAbort: true,
      cryptoCredentialsDetails: {
        minVersion: 'TLSv1',
      },
    },
    connectionTimeout: 30000,
    requestTimeout: 30000,
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000,
    },
  }),

  dbIntranet: new DataSource({
    type: 'mssql',
    host: configService.get<string>('DB_INTRANET_HOST') || '',
    port: +(configService.get<number>('DB_INTRANET_PORT') || 1433),
    database: configService.get<string>('DB_INTRANET_NAME') || '',
    username: configService.get<string>('DB_INTRANET_USERNAME') || '',
    password: configService.get<string>('DB_INTRANET_PASSWORD') || '',
    synchronize: false,
    options: {
      encrypt: true,
      trustServerCertificate: true,
      enableArithAbort: true,
      cryptoCredentialsDetails: {
        minVersion: 'TLSv1',
      },
    },
    connectionTimeout: 30000,
    requestTimeout: 30000,
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000,
    },
  }),
});
