import { Injectable, NotFoundException, InternalServerErrorException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role, User } from './user.entity';
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

            createUserDto.role = Role.PARTICIPANT;
            createUserDto.creation_date = new Date();
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
        const user = await this.userRepository.findOne({ where: { id } });

        if (!user) {
            throw new NotFoundException(`L'utilisateur n'a pas été trouvé`);
        }

        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword as UserResponseDTO;
    }

    // TODO : Add a method to find a user by email
    async findUserByEmail(email: string): Promise<User> {
        try {
            const user = await this.userRepository.findOne({ where: { email } });

            if (!user) {
                throw new NotFoundException(`User with email ${email} not found`);
            }

            return user;
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
            throw new NotFoundException(`L'utilisateur n'a pas été trouvé`);
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
            throw new NotFoundException(`L'utilisateur n'a pas été trouvé`);
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
        const user = await this.findOne(id);  // Vérifie si l'utilisateur existe
        if (!user) {
            throw new NotFoundException(`L'utilisateur n'a pas été trouvé`);
        }
        await this.userRepository.delete(id);  // Supprime l'utilisateur si trouvé
    }
}