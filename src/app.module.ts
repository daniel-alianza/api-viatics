import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { CompaniesModule } from './companies/companies.module';
import { BranchModule } from './branch/branch.module';
import { AreaModule } from './area/area.module';
import { UsersModule } from './users/users.module';
import { ExpenseRequestsModule } from './expense-requests/expense-requests.module';
import { InspirationQuotesModule } from './inspiration_quotes/inspiration_quotes.module';

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
  ],
  providers: [],
})
export class AppModule {}
