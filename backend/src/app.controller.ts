import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { UserRole } from '@starpointapp/shared';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return `${this.appService.getHello()} UserRoles: ${Object.values(UserRole).join(', ')}`;
  }
}
