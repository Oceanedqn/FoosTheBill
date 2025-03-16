import { Controller, Get, Post, Param, Body, Put, Delete, HttpStatus, NotFoundException, ConflictException, UseFilters, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AllExceptionsFilter } from 'src/common/filters/all-exceptions.filter';
import { AuthGuard } from 'src/auth/guards/auth.guard';

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

    @UseGuards(AuthGuard)
    @Get()
    async findAll() {
        const users = await this.usersService.findAll();
        return {
            statusCode: HttpStatus.OK,
            message: 'Users retrieved successfully',
            data: users,
        };
    }

    @UseGuards(AuthGuard)
    @Get(':id')
    async findOne(@Param('id') id: string) {
        const user = await this.usersService.findOne(id);
        if (!user) {
            throw new NotFoundException("Erreur lors de la récupération de l'utilisateur");
        }
        return {
            statusCode: HttpStatus.OK,
            message: 'User retrieved successfully',
            data: user,
        };
    }

    @UseGuards(AuthGuard)
    @Put(':id')
    async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        const user = await this.usersService.findOne(id);
        if (!user) {
            throw new NotFoundException("Erreur lors de la mise à jour de l'utilisateur");
        }
        await this.usersService.update(id, updateUserDto);
        return {
            statusCode: HttpStatus.OK,
            message: 'User updated successfully',
        };
    }

    @UseGuards(AuthGuard)
    @Put(':id/password')
    async updatePassword(@Param('id') id: string, @Body('password') newPassword: string) {
        const user = await this.usersService.findOne(id);
        if (!user) {
            throw new NotFoundException("Erreur lors de la mise à jour du mot de passe");
        }
        await this.usersService.updatePassword(id, newPassword);
        return {
            statusCode: HttpStatus.OK,
            message: 'Password updated successfully',
        };
    }

    @UseGuards(AuthGuard)
    @Delete(':id')
    async remove(@Param('id') id: string) {
        try {
            await this.usersService.remove(id);
            return {
                statusCode: HttpStatus.OK,
                message: 'User deleted successfully',
            };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw new NotFoundException("Erreur lors de la suppression de l'utilisateur");
            }
            throw error;
        }
    }
}
