import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsOptional } from 'class-validator';

export class InventoryViewFilterDto {
    @IsDate()
    @Type(() => Date)
    @IsNotEmpty()
    fechaInicio: string;

    @IsDate()
    @Type(() => Date)
    @IsNotEmpty()
    fechaFinal: string;

    @IsOptional()
    marca: string;

    @IsOptional()
    categoria: string
}
