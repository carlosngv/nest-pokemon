import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import mongoose, { isValidObjectId, Model } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PokemonService {

  constructor(
    @InjectModel( Pokemon.name ) private readonly pokemonModel: Model<Pokemon>
  ) {
    
  }

  private handleExceptions( error: any, errorMessage: string ) {
    if( error.code && error.code === 11000 ) throw new BadRequestException( errorMessage );
    console.log({ error })
    throw new InternalServerErrorException();
  }

  async create(createPokemonDto: CreatePokemonDto) {

    try {
      const createdPokemon = await this.pokemonModel.create( createPokemonDto );
      await createdPokemon.save();
      return createdPokemon;
    } catch (error) {
      this.handleExceptions( error, `Pokemon exists in db ${ JSON.stringify( error.keyValue )}` );
      if( error.code === 11000 ) {
        throw new BadRequestException();
      }

      console.log( error );
      throw new InternalServerErrorException(`Can't create pokemon - Check server logs`);

    }

  }

  findAll() {
    
    return  this.pokemonModel.find();
  }

  async findOne(term: string) {

    let pokemon: Pokemon;

    if( !isNaN( +term ) ) {
      pokemon = await this.pokemonModel.findOne({ no: term });
    }
    
    if( !pokemon && isValidObjectId( term ) ) {
      pokemon = await this.pokemonModel.findById( term );
    }

    if( !pokemon ) {
      pokemon = await this.pokemonModel.findOne({ name: term.trim() });
    }

    if( !pokemon ) throw new NotFoundException(`Pokemon with id, name or no ${ term } not found.`);

    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    const dbPokemon = await this.findOne( term );

    try {
      if( updatePokemonDto.name ) updatePokemonDto.name = updatePokemonDto.name.toLowerCase();
  
      await dbPokemon.updateOne( updatePokemonDto, { new: true } )
  
      return { ...dbPokemon.toJSON(), ...updatePokemonDto }
      
    } catch (error) {
      this.handleExceptions( error, `Name/number ${ term } is already in use` );
    }


  }

  async remove(id: string) {
    const { deletedCount } = await this.pokemonModel.deleteOne({ _id: id });

    if( deletedCount === 0 ) throw new BadRequestException(`Pokemon with id ${ id } not found.`);

    return;
    
  }
}
