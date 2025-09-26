import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { DbService } from './db.service';

@Injectable({ providedIn: 'root' })
export class DbInitResolver implements Resolve<boolean> {
  constructor(private db: DbService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    return this.db.init();
  }
}
