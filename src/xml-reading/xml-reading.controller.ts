import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Param,
  Get,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { XmlReadingService } from './xml-reading.service';
import { XmlData } from './interfaces/xml-data.interface';

@Controller('xml')
export class XmlReadingController {
  constructor(private readonly xmlReadingService: XmlReadingService) {}

  @Post('read')
  @UseInterceptors(FileInterceptor('file'))
  async readXml(@UploadedFile() file: Express.Multer.File): Promise<XmlData> {
    return this.xmlReadingService.parseXmlFile(file.path);
  }

  @Get('comprobacion/:comprobacionId')
  async getXmlByComprobacion(
    @Param('comprobacionId') comprobacionId: string,
  ): Promise<XmlData> {
    return this.xmlReadingService.getXmlDataByComprobacionOnly(
      Number(comprobacionId),
    );
  }
}
