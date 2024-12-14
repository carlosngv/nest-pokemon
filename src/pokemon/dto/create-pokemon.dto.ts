import { Transform } from "class-transformer";
import { IsNumber, IsPositive, IsString, Min, MinLength } from "class-validator";

export class CreatePokemonDto {

    @IsString()
    @MinLength( 1 )
    @Transform( ( { value } ) => value.toLowerCase() )
    name: string;

    @IsNumber()
    @IsPositive()
    @Min( 1 )
    no: number;



}
