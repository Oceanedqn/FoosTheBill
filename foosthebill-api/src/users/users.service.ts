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
     * This method generates a hashed password using bcrypt, salts it with 10 rounds, and then hashes it.
     * @param password - The plain text password to hash.
     * @returns Promise<string> - The hashed password as a string.
     */
    private async hashPassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt(10);  // Generate salt
        return await bcrypt.hash(password, salt);  // Hash the password with the salt
    }

    /**
     * Creates a new user.
     * Checks if the email already exists, sets the default role to 'PARTICIPANT', hashes the password, and stores the user.
     * @param createUserDto - Contains the user details (email, name, password).
     * @returns Promise<IUser> - The created user data without the password.
     * @throws ConflictException - If the email already exists.
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
     * Fetches all users from the database, excluding the password and creation date.
     * @returns Promise<IUser[]> - An array of users without their password or creation date.
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
     * Finds a user by their ID. If no user is found, a NotFoundException is thrown.
     * @param id - The ID of the user.
     * @returns Promise<IUser> - The user data without the password and creation date.
     * @throws NotFoundException - If the user with the given ID is not found.
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
     * Finds a user by their email address. If no user is found, a NotFoundException is thrown.
     * @param email - The email of the user.
     * @returns Promise<User> - The user entity.
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
     * Allows users to update details like name, email, and role.
     * @param id - The ID of the user.
     * @param updateUserDto - Contains the user information to update.
     * @returns Promise<void> - Nothing is returned upon successful update.
     * @throws NotFoundException - If the user with the provided ID is not found.
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
     * Hashes the new password before saving it to the database.
     * @param id - The ID of the user.
     * @param newPassword - The new password to set for the user.
     * @returns Promise<void> - Nothing is returned upon successful password update.
     * @throws NotFoundException - If the user with the provided ID is not found.
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
     * Deletes the user from the database. If no user is found, a NotFoundException is thrown.
     * @param id - The ID of the user.
     * @returns Promise<void> - Nothing is returned upon successful deletion.
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
