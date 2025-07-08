import { Module } from '@nestjs/common';
import { GenerateFactProvService } from './generate_fact_prov.service';
import { GenerateFactProvController } from './generate_fact_prov.controller';
import { AuthSlModule } from '../auth-sl/auth-sl.module';
import { UsersModule } from '../users/users.module';
import { WholesaleAccountsModule } from '../wholesale-accounts/wholesale-accounts.module';
import { SalesTaxcodeModule } from '../sales-taxcode/sales-taxcode.module';
import { CardMatchService } from './services/card-match.service';
import { InvoiceTransformerService } from './services/invoice-transformer.service';
import { ServiceLayerInvoiceService } from './services/service-layer-invoice.service';
import { PrismaClient } from '@prisma/client';
import { TicketContabilidadService } from './services/ticket-contabilidad.service';
import { DistributionRulesModule } from '../distribution-rules/distribution-rules.module';

@Module({
  imports: [
    AuthSlModule,
    UsersModule,
    WholesaleAccountsModule,
    SalesTaxcodeModule,
    DistributionRulesModule,
  ],
  controllers: [GenerateFactProvController],
  providers: [
    GenerateFactProvService,
    CardMatchService,
    InvoiceTransformerService,
    ServiceLayerInvoiceService,
    PrismaClient,
    TicketContabilidadService,
  ],
  exports: [TicketContabilidadService],
})
export class GenerateFactProvModule {}
