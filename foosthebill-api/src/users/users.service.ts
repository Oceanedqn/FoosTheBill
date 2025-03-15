import { Injectable, NotFoundException, InternalServerErrorException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { UserResponseDTO } from './dto/user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    // Method to hash password
    private async hashPassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt(10);
        return await bcrypt.hash(password, salt);
    }

    // Create user
    async create(createUserDto: CreateUserDto): Promise<UserResponseDTO> {
        try {
            const existingUser = await this.userRepository.findOne({ where: { email: createUserDto.email } });
            if (existingUser) {
                throw new ConflictException('User with this email already exists');
            }

            createUserDto.password = await this.hashPassword(createUserDto.password);

            const createdUser = await this.userRepository.save(createUserDto);
            const { password, ...userWithoutPassword } = createdUser;
            return userWithoutPassword as UserResponseDTO;
        } catch (error) {
            if (error instanceof ConflictException) {
                throw error;
            }
            throw new InternalServerErrorException('Error creating user', error.message);
        }
    }

    // Find all users
    async findAll(): Promise<UserResponseDTO[]> {
        try {
            const users = await this.userRepository.find();

            return users.map(user => {
                const { password, ...userWithoutPassword } = user;
                return userWithoutPassword as UserResponseDTO;
            });
        } catch (error) {
            throw new InternalServerErrorException('Error fetching users', error.message);
        }
    }

    // Find one user
    async findOne(id: string): Promise<UserResponseDTO> {
        try {
            const user = await this.userRepository.findOne({ where: { id } });

            if (!user) {
                throw new NotFoundException(`User with id ${id} not found`);
            }

            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword as UserResponseDTO;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            } else {
                throw new InternalServerErrorException('Error fetching user', error.message);
            }
        }
    }

    // Update user without changing password or creation date
    async update(id: string, updateUserDto: UpdateUserDto): Promise<void> {
        const existingUser = await this.userRepository.findOne({ where: { id } });
        if (!existingUser) {
            throw new NotFoundException(`User with id ${id} not found`);
        }
        try {
            await this.userRepository.update(id, updateUserDto);
        } catch (error) {
            throw new InternalServerErrorException('Error updating user', error.message);
        }
    }

    // Update only password
    async updatePassword(id: string, newPassword: string): Promise<void> {
        const existingUser = await this.userRepository.findOne({ where: { id } });
        if (!existingUser) {
            throw new NotFoundException(`User with id ${id} not found`);
        }
        try {
            const hashedPassword = await this.hashPassword(newPassword);
            await this.userRepository.update(id, { password: hashedPassword });
        } catch (error) {
            throw new InternalServerErrorException('Error updating password', error.message);
        }
    }

    // Delete user
    async remove(id: string): Promise<void> {
        const existingUser = await this.findOne(id);  // Vérification via la méthode findOne
        if (!existingUser) {
            throw new NotFoundException(`User with id ${id} not found`);
        }
        try {
            await this.userRepository.delete(id);
        } catch (error) {
            throw new InternalServerErrorException('Error deleting user', error.message);
        }
    }
}