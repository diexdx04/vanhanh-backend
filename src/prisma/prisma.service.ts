import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect(); // Kết nối đến cơ sở dữ liệu khi module khởi tạo
  }

  async onModuleDestroy() {
    await this.$disconnect(); // Ngắt kết nối khi module bị hủy
  }
}
