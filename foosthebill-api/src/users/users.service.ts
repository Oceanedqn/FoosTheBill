import { Injectable, NotFoundException, InternalServerErrorException, ConflictException, forwardRef, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role, User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { ICreateUser, IUpdateUser, IUser } from './dto/user.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User) private userRepository: Repository<User>,

    ) { }

    /**
     * Hashes a plain text password.
     * This private method generates a hashed password using bcrypt. The password is first salted
     * with 10 rounds and then hashed for storage in the database.
     * @param password - The plain text password to hash.
     * @returns Promise<string> - Returns the hashed password as a string.
     */
    private async hashPassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt(10);  // Generate salt
        return await bcrypt.hash(password, salt);  // Hash the password with the salt
    }

    /**
     * Creates a new user.
     * This function allows the creation of a new user. It checks if the email already exists,
     * sets the default role to 'PARTICIPANT', hashes the password, and stores the user in the database.
     * @param createUserDto - Data transfer object containing user details such as email, name, and password.
     * @returns Promise<UserResponseDto> - Returns the created user data without the password.
     * @throws ConflictException - If a user with the same email already exists.
     * @throws InternalServerErrorException - If an error occurs while creating the user.
     */
    async create(createUserDto: ICreateUser): Promise<IUser> {
        try {
            const existingUser = await this.userRepository.findOne({ where: { email: createUserDto.email } });
            if (existingUser) {
                throw new ConflictException('User with this email already exists');
            }

            createUserDto.role = Role.PARTICIPANT;  // Set default role to participant
            createUserDto.creation_date = new Date();  // Set the creation date to the current date
            createUserDto.password = await this.hashPassword(createUserDto.password);  // Hash the password

            const createdUser = await this.userRepository.save(createUserDto);
            const { password, creation_date, ...userWithoutPassword } = createdUser;  // Remove sensitive fields
            return userWithoutPassword as IUser;
        } catch (error) {
            if (error instanceof ConflictException) {
                throw error;  // If the email already exists, rethrow the ConflictException
            }
            throw new InternalServerErrorException('Error creating user', error.message);  // Handle any other errors
        }
    }

    /**
     * Retrieves all users.
     * This function fetches all users from the database, excluding their password and creation date.
     * @returns Promise<UserResponseDto[]> - Returns an array of users without their password or creation date.
     * @throws InternalServerErrorException - If an error occurs while fetching users.
     */
    async findAll(): Promise<IUser[]> {
        try {
            const users = await this.userRepository.find();
            return users.map(user => {
                const { password, creation_date, ...userWithoutPassword } = user;  // Remove sensitive fields
                return userWithoutPassword as IUser;
            });
        } catch (error) {
            throw new InternalServerErrorException('Error fetching users', error.message);  // Handle any errors
        }
    }


    /**
     * Retrieves a user by their ID.
     * This function retrieves a user from the database using their ID. If no user is found, 
     * a NotFoundException is thrown.
     * @param id - The ID of the user to retrieve.
     * @returns Promise<UserResponseDto> - Returns the user data without the password and creation date.
     * @throws NotFoundException - If the user with the given ID does not exist.
     */
    async findOne(id: string): Promise<IUser> {
        const user = await this.userRepository.findOne({ where: { id } });

        if (!user) {
            throw new NotFoundException(`User not found`);  // If no user is found with the provided ID, throw an exception
        }

        const { password, creation_date, ...userWithoutPassword } = user;  // Remove sensitive fields
        return userWithoutPassword as IUser;
    }

    /**
     * Retrieves a user by their email.
     * This function finds a user by their email address. If no user is found, 
     * a NotFoundException is thrown.
     * @param email - The email of the user to retrieve.
     * @returns Promise<User> - Returns the user entity.
     * @throws NotFoundException - If the user with the provided email does not exist.
     * @throws InternalServerErrorException - If an error occurs while fetching the user.
     */
    async findUserByEmail(email: string): Promise<User> {
        try {
            const user = await this.userRepository.findOne({ where: { email } });

            if (!user) {
                throw new NotFoundException(`User with email ${email} not found`);  // If no user is found with the provided email, throw an exception
            }

            return user;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;  // If the user is not found, rethrow the exception
            } else {
                throw new InternalServerErrorException('Error fetching user', error.message);  // Handle any other errors
            }
        }
    }

    /**
     * Updates a user's information (excluding password and creation date).
     * This function allows users to update their information such as name, email, and role,
     * excluding sensitive fields like the password and creation date.
     * @param id - The ID of the user to update.
     * @param updateUserDto - Data transfer object containing the user information to update.
     * @returns Promise<void> - Returns nothing upon successful update.
     * @throws NotFoundException - If the user with the provided ID does not exist.
     * @throws InternalServerErrorException - If an error occurs while updating the user.
     */
    async update(id: string, updateUserDto: IUpdateUser): Promise<void> {
        const existingUser = await this.userRepository.findOne({ where: { id } });
        if (!existingUser) {
            throw new NotFoundException(`User not found`);  // If the user does not exist, throw an exception
        }
        try {
            await this.userRepository.update(id, updateUserDto);  // Update the user's information in the database
        } catch (error) {
            throw new InternalServerErrorException('Error updating user', error.message);  // Handle any errors
        }
    }

    /**
     * Updates a user's password.
     * This function allows a user to update their password. The new password is hashed before being saved to the database.
     * @param id - The ID of the user to update.
     * @param newPassword - The new password to set for the user.
     * @returns Promise<void> - Returns nothing upon successful password update.
     * @throws NotFoundException - If the user with the provided ID does not exist.
     * @throws InternalServerErrorException - If an error occurs while updating the password.
     */
    async updatePassword(id: string, newPassword: string): Promise<void> {
        const existingUser = await this.userRepository.findOne({ where: { id } });
        if (!existingUser) {
            throw new NotFoundException(`User not found`);  // If the user does not exist, throw an exception
        }
        try {
            const hashedPassword = await this.hashPassword(newPassword);  // Hash the new password
            await this.userRepository.update(id, { password: hashedPassword });  // Update the user's password in the database
        } catch (error) {
            throw new InternalServerErrorException('Error updating password', error.message);  // Handle any errors
        }
    }

    /**
     * Deletes a user by their ID.
     * This function deletes a user from the database. If no user is found, a NotFoundException is thrown.
     * @param id - The ID of the user to delete.
     * @returns Promise<void> - Returns nothing upon successful deletion.
     * @throws NotFoundException - If the user with the provided ID does not exist.
     */
    async remove(id: string): Promise<void> {
        const user = await this.findOne(id);  // Check if the user exists
        if (!user) {
            throw new NotFoundException(`User not found`);  // If no user is found, throw an exception
        }
        await this.userRepository.delete(id);  // Delete the user from the database
    }
}
