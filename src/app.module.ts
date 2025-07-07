import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { CompaniesModule } from './companies/companies.module';
import { BranchModule } from './branch/branch.module';
import { AreaModule } from './area/area.module';
import { UsersModule } from './users/users.module';
import { ExpenseRequestsModule } from './expense-requests/expense-requests.module';
import { InspirationQuotesModule } from './inspiration_quotes/inspiration_quotes.module';
import { ComprobacionesModule } from './comprobaciones/comprobaciones.module';
import { MovementsModule } from './movements/movements.module';
import { AuthSlModule } from './auth-sl/auth-sl.module';
import { WholesaleAccountsModule } from './wholesale-accounts/wholesale-accounts.module';
import { XmlReadingModule } from './xml-reading/xml-reading.module';
import { SalesTaxcodeModule } from './sales-taxcode/sales-taxcode.module';
import { DistributionRulesModule } from './distribution-rules/distribution-rules.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { GenerateFactProvModule } from './generate_fact_prov/generate_fact_prov.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    CompaniesModule,
    BranchModule,
    AreaModule,
    UsersModule,
    ExpenseRequestsModule,
    InspirationQuotesModule,
    ComprobacionesModule,
    MovementsModule,
    AuthSlModule,
    WholesaleAccountsModule,
    XmlReadingModule,
    SalesTaxcodeModule,
    DistributionRulesModule,
    RolesModule,
    PermissionsModule,
    GenerateFactProvModule,
  ],
  providers: [],
})
export class AppModule {}
