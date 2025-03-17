import { Controller, Get, Post, Param, Body, Put, Delete, HttpStatus, NotFoundException, ConflictException, UseFilters, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AllExceptionsFilter } from 'src/common/filters/all-exceptions.filter';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Controller('users')
@UseFilters(new AllExceptionsFilter())  // Applies global exception handling for all routes in this controller.
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    /**
     * Creates a new user.
     * 
     * This route allows for the creation of a new user. It takes in user data, calls the service
     * to create the user, and returns the created user data in the response.
     * 
     * @param createUserDto - Data transfer object containing user details (email, name, password, etc.).
     * 
     * @returns { statusCode: HttpStatus.CREATED, message: string, data: UserResponseDTO }
     * 
     * @throws ConflictException - If a user with the same email already exists.
     */
    @Post()
    async create(@Body() createUserDto: CreateUserDto) {
        const user = await this.usersService.create(createUserDto);
        return {
            statusCode: HttpStatus.CREATED,
            message: 'User created successfully',
            data: user,
        };
    }

    /**
     * Retrieves all users.
     * 
     * This route fetches all users from the database and returns them as a response.
     * 
     * @returns { statusCode: HttpStatus.OK, message: string, data: UserResponseDTO[] }
     */
    @UseGuards(AuthGuard)  // Ensures only authenticated users can access this route
    @Get()
    async findAll() {
        const users = await this.usersService.findAll();
        return {
            statusCode: HttpStatus.OK,
            message: 'Users retrieved successfully',
            data: users,
        };
    }

    /**
     * Retrieves a specific user by ID.
     * 
     * This route fetches a single user by their ID. If no user is found, it throws a NotFoundException.
     * 
     * @param id - The ID of the user to retrieve.
     * 
     * @returns { statusCode: HttpStatus.OK, message: string, data: UserResponseDTO }
     * 
     * @throws NotFoundException - If the user with the provided ID does not exist.
     */
    @UseGuards(AuthGuard)  // Ensures only authenticated users can access this route
    @Get(':id')
    async findOne(@Param('id') id: string) {
        const user = await this.usersService.findOne(id);
        if (!user) {
            throw new NotFoundException("Error retrieving user");
        }
        return {
            statusCode: HttpStatus.OK,
            message: 'User retrieved successfully',
            data: user,
        };
    }

    /**
     * Updates user information.
     * 
     * This route allows the update of a user's information (excluding password). If no user is found, 
     * it throws a NotFoundException. Upon success, it returns a success message.
     * 
     * @param id - The ID of the user to update.
     * @param updateUserDto - Data transfer object containing the fields to update (name, email, etc.).
     * 
     * @returns { statusCode: HttpStatus.OK, message: string }
     * 
     * @throws NotFoundException - If the user with the provided ID does not exist.
     */
    @UseGuards(AuthGuard)  // Ensures only authenticated users can access this route
    @Put(':id')
    async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        const user = await this.usersService.findOne(id);
        if (!user) {
            throw new NotFoundException("Error updating user");
        }
        await this.usersService.update(id, updateUserDto);
        return {
            statusCode: HttpStatus.OK,
            message: 'User updated successfully',
        };
    }

    /**
     * Updates a user's password.
     * 
     * This route allows the update of a user's password. If no user is found, it throws a NotFoundException.
     * After updating the password, it returns a success message.
     * 
     * @param id - The ID of the user whose password is to be updated.
     * @param newPassword - The new password to set for the user.
     * 
     * @returns { statusCode: HttpStatus.OK, message: string }
     * 
     * @throws NotFoundException - If the user with the provided ID does not exist.
     */
    @UseGuards(AuthGuard)  // Ensures only authenticated users can access this route
    @Put(':id/password')
    async updatePassword(@Param('id') id: string, @Body('password') newPassword: string) {
        const user = await this.usersService.findOne(id);
        if (!user) {
            throw new NotFoundException("Error updating password");
        }
        await this.usersService.updatePassword(id, newPassword);
        return {
            statusCode: HttpStatus.OK,
            message: 'Password updated successfully',
        };
    }

    /**
     * Deletes a user by ID.
     * 
     * This route deletes a user from the database by their ID. If the user is not found, 
     * it throws a NotFoundException. Upon success, it returns a success message.
     * 
     * @param id - The ID of the user to delete.
     * 
     * @returns { statusCode: HttpStatus.OK, message: string }
     * 
     * @throws NotFoundException - If the user with the provided ID does not exist.
     */
    @UseGuards(AuthGuard)  // Ensures only authenticated users can access this route
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
                throw new NotFoundException("Error deleting user");
            }
            throw error;  // Re-throw any other unexpected errors
        }
    }
}
