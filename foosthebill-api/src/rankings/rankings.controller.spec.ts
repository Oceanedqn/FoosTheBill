import { Test, TestingModule } from '@nestjs/testing';
import { RankingsController } from './rankings.controller';
import { RankingsService } from './rankings.service';
import { Ranking } from './ranking.entity';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';

describe('RankingsController', () => {
    let controller: RankingsController;
    let service: RankingsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [RankingsController],
            providers: [
                {
                    provide: RankingsService,
                    useValue: {
                        create: jest.fn(),
                        findAll: jest.fn(),
                        findOne: jest.fn(),
                        update: jest.fn(),
                        remove: jest.fn(),
                    },
                },
            ],
        }).compile();

        controller = module.get<RankingsController>(RankingsController);
        service = module.get<RankingsService>(RankingsService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should create a ranking', async () => {
        const ranking: Ranking = { id: 1, tournament: {} as any, team: {} as any, position: 1, points: 10 } as Ranking;
        jest.spyOn(service, 'create').mockResolvedValue(ranking);

        const result = await controller.create(ranking);
        expect(result).toEqual({ code: 201, message: 'Ranking created successfully', data: ranking });
    });

    it('should throw NotFoundException when ranking not found', async () => {
        jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException('Ranking not found'));

        await expect(controller.findOne(1)).rejects.toThrowError(NotFoundException);
    });

    it('should throw InternalServerErrorException when update fails', async () => {
        jest.spyOn(service, 'update').mockRejectedValue(new InternalServerErrorException('Error updating ranking'));

        await expect(controller.update(1, { id: 1, tournament: {} as any, team: {} as any, position: 1, points: 10 } as Ranking))
            .rejects.toThrowError(InternalServerErrorException);
    });

    it('should delete a ranking', async () => {
        jest.spyOn(service, 'remove').mockResolvedValue(undefined);

        const result = await controller.remove(1);
        expect(result).toEqual({ code: 200, message: 'Ranking deleted successfully' });
    });

    it('should throw InternalServerErrorException when delete fails', async () => {
        jest.spyOn(service, 'remove').mockRejectedValue(new InternalServerErrorException('Error deleting ranking'));

        await expect(controller.remove(1)).rejects.toThrowError(InternalServerErrorException);
    });
});
