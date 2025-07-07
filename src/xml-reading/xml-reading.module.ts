import { Module } from '@nestjs/common';
import { XmlReadingController } from './xml-reading.controller';
import { XmlReadingService } from './xml-reading.service';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { PrismaClient } from '@prisma/client';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(xml)$/)) {
          return callback(new Error('Solo se permiten archivos XML'), false);
        }
        callback(null, true);
      },
    }),
  ],
  controllers: [XmlReadingController],
  providers: [XmlReadingService, PrismaClient],
})
export class XmlReadingModule {}
