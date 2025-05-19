import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createDataSources } from '../config';

@Module({
  providers: [
    {
      provide: 'DB_ALIANZA_DATASOURCE',
      useFactory: (configService: ConfigService) =>
        createDataSources(configService).dbAlianza.initialize(),
      inject: [ConfigService],
    },
    {
      provide: 'DB_INTRANT_DATASOURCE',
      useFactory: (configService: ConfigService) =>
        createDataSources(configService).dbIntranet.initialize(),
      inject: [ConfigService],
    },
  ],
  exports: ['DB_ALIANZA_DATASOURCE', 'DB_INTRANT_DATASOURCE'],
})
export class DatabaseModule {}
