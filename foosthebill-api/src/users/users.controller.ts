import { Controller, Get, Post, Param, Body, Put, Delete, HttpStatus, NotFoundException, ConflictException, UseFilters } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AllExceptionsFilter } from 'src/common/filters/http-exceptions.filter';

@Controller('users')
@UseFilters(new AllExceptionsFilter())
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    async create(@Body() createUserDto: CreateUserDto) {
        const user = await this.usersService.create(createUserDto);
        return {
            statusCode: HttpStatus.CREATED,
            message: 'Utilisateur créé avec succès',
            data: user,
        };
    }

    @Get()
    async findAll() {
        const users = await this.usersService.findAll();
        return {
            statusCode: HttpStatus.OK,
            message: 'Users retrieved successfully',
            data: users,
        };
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const user = await this.usersService.findOne(id);
        if (!user) {
            throw new NotFoundException(`User with id ${id} not found`);
        }
        return {
            statusCode: HttpStatus.OK,
            message: 'User retrieved successfully',
            data: user,
        };
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        const user = await this.usersService.findOne(id);
        if (!user) {
            throw new NotFoundException(`User with id ${id} not found`);
        }
        await this.usersService.update(id, updateUserDto);
        return {
            statusCode: HttpStatus.OK,
            message: 'User updated successfully',
        };
    }

    @Put(':id/password')
    async updatePassword(@Param('id') id: string, @Body('password') newPassword: string) {
        const user = await this.usersService.findOne(id);
        if (!user) {
            throw new NotFoundException(`User with id ${id} not found`);
        }
        await this.usersService.updatePassword(id, newPassword);
        return {
            statusCode: HttpStatus.OK,
            message: 'Password updated successfully',
        };
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        const user = await this.usersService.findOne(id);
        if (!user) {
            throw new NotFoundException(`User with id ${id} not found`);
        }
        await this.usersService.remove(id);
        return {
            statusCode: HttpStatus.OK,
            message: 'User deleted successfully',
        };
    }
}
