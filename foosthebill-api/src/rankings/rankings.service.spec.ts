import { Test, TestingModule } from '@nestjs/testing';
import { RankingsService } from './rankings.service';
import { Ranking } from './ranking.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';

describe('RankingsService', () => {
    let service: RankingsService;
    let repository: Repository<Ranking>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RankingsService,
                {
                    provide: getRepositoryToken(Ranking),
                    useClass: Repository,
                },
            ],
        }).compile();

        service = module.get<RankingsService>(RankingsService);
        repository = module.get<Repository<Ranking>>(getRepositoryToken(Ranking));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should create a ranking', async () => {
        const ranking: Ranking = { id: 1, tournament: {} as any, team: {} as any, position: 1, points: 10 } as Ranking;
        jest.spyOn(repository, 'save').mockResolvedValue(ranking);

        const result = await service.create(ranking);
        expect(result).toEqual(ranking);
        expect(repository.save).toHaveBeenCalledWith(ranking);
    });

    it('should throw NotFoundException when ranking not found', async () => {
        jest.spyOn(repository, 'findOne').mockResolvedValue(null);

        await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException if an error occurs in update', async () => {
        jest.spyOn(repository, 'update').mockRejectedValue(new Error('Internal error'));

        await expect(service.update(1, { id: 1, tournament: {} as any, team: {} as any, position: 1, points: 10 } as Ranking))
            .rejects.toThrow(InternalServerErrorException);
    });

    it('should throw NotFoundException if ranking to delete does not exist', async () => {
        jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException('Ranking with id 1 not found'));
        await expect(service.remove(1)).rejects.toThrowError(NotFoundException);
    });
});
