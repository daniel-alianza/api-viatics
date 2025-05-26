import { User, Card } from '@prisma/client';

export interface UserWithMessage extends User {
  message?: string;
}

export interface CardWithMessage extends Card {
  message?: string;
}
