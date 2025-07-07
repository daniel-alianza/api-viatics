import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateCardDto, UpdateCardDto } from './dto/card.dto';
import { UserWithMessage, CardWithMessage } from './dto/types.dto';

@Controller('users')
@UsePipes(new ValidationPipe({ transform: true }))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }

  @Post(':id/cards')
  assignCard(
    @Param('id', ParseIntPipe) id: number,
    @Body() createCardDto: CreateCardDto,
  ): Promise<UserWithMessage> {
    return this.usersService.assignCard(
      id,
      createCardDto.cardNumber,
      createCardDto.companyId,
    );
  }

  @Delete('cards/:cardId')
  removeCard(
    @Param('cardId', ParseIntPipe) cardId: number,
  ): Promise<CardWithMessage> {
    return this.usersService.removeCard(cardId);
  }

  @Patch('cards/:cardId')
  updateCard(
    @Param('cardId', ParseIntPipe) cardId: number,
    @Body() updateCardDto: UpdateCardDto,
  ): Promise<CardWithMessage> {
    return this.usersService.updateCard(cardId, updateCardDto);
  }
}
