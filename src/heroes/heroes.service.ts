import { Injectable, NotFoundException, HttpStatus, HttpException } from '@nestjs/common';

import { HEROES, NOT_FOUND as noDataFound } from './heroes.data';

import { Hero } from './interfaces/hero.interface';

@Injectable()
export class HeroesService {

  heroes = HEROES;

  add(hero: Hero): Promise<any> {
    return new Promise(resolve => {
      this.heroes.push(hero);
      resolve(hero);
    });
  }

  delete(value: string): Promise<any> {
    const id = Number(value);
    return new Promise(resolve => {
      const index = this.heroes.findIndex(hero => hero.value === id);

      if (index === -1) {
        throw new NotFoundException('Hero does not exist!');
      }

      this.heroes.splice(index, 1);
      resolve({message: 'Hero removido com sucesso'});
    });
  }

  get(filter?: string): Promise<any> {
    const heroes = filter ? this.filterByProperty(filter, this.heroes, 'nickname') : this.heroes;

    return Promise.resolve({ items: heroes });
  }

  getByFilter(filter?: string, page?: number, pageSize?: number, order?: string): Promise<any> {
    const { heroes, hasNext } = this.filter(filter, page, pageSize, order);

    if (filter && heroes.length === 0) {
      throw new HttpException(noDataFound, HttpStatus.NOT_FOUND);
    }

    return Promise.resolve({ items: heroes, hasNext });
  }

  getByLabel(name: string): Promise<Hero> {
    const result = this.heroes.find(hero => hero.label.toLocaleLowerCase() === name);

    return Promise.resolve(result);
  }

  getByNickname(nickname: string): Promise<Hero> {
    const result = this.heroes.find(hero => hero.nickname.toLocaleLowerCase() === nickname);

    return Promise.resolve(result);
  }

  getFilterByNickname(nickname: string): Promise<any> {
    const result = this.filterByProperty(nickname, this.heroes, 'nickname');

    return Promise.resolve({ items: result });
  }

  private hasNext(items = [], pageSize = 0, page = 0) {
    return items.length > (pageSize * page);
  }

  private filter(filter: string, page?: number, pageSize?: number, order?: string) {
    let heroes = this.filterByProperty(filter, this.heroes, 'label');
    const hasNext = this.hasNext(heroes, pageSize, page);

    if (order) {
      heroes = this.sort(heroes, order);
    }

    if (pageSize || page) {
      heroes = this.paginate(heroes, page, pageSize);
    }

    return { heroes, hasNext };
  }

  private filterByProperty(filter: string, heroes: Array<Hero>, property: string): Array<Hero> {
    filter = (filter || '').toLocaleLowerCase();
    const result = [];

    heroes.forEach(hero => {
      if (hero[property].toLocaleLowerCase().includes(filter)) {
        result.push(hero);
      }
    });
    return result;
  }

  private sort(heroes: Array<Hero>, order: string): Array<Hero> {
    return heroes.sort((value, previousValue) =>
      (value[order] > previousValue[order]) ? 1 : ((previousValue[order] > value[order]) ? -1 : 0));
  }

  private paginate(heroes: Array<Hero>, page: number = 1, pageSize: number): Array<Hero> {
    return heroes.slice((page - 1) * pageSize, page * pageSize);
  }

}
