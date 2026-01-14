import {
  Controller,
  Get,
  Header,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { version } from '../../../package.json';
import { PrismaService } from 'src/services/prisma/prisma.service';
import {
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';

const response_schema = {
  type: 'object',
  properties: {
    status: {
      type: 'object',
      properties: {
        database: {
          type: 'boolean',
        },
      },
    },
    version: {
      type: 'string',
    },
  },
  required: ['status', 'version'],
};

@Controller('health')
export class HealthCheckController {
  constructor(@Inject() private readonly prisma: PrismaService) {}

  private async checkCoreServices() {
    return {
      database: await this.prisma.testConnection(),
    };
  }

  @Get()
  @Header('Content-Type', 'application/json')
  @ApiTags('HealthCheck')
  @ApiOkResponse({
    description: 'All services are ok',
    schema: response_schema,
    example: {
      status: {
        database: true,
      },
      version: '0.0.1',
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Some services are not ok',
    schema: response_schema,
    example: {
      status: {
        database: false,
      },
      version: '0.0.1',
    },
  })
  async get() {
    const core = await this.checkCoreServices();
    const response = {
      status: {
        ...core,
      },
      version,
    };

    // all core services are ok
    const allOk = Object.values(core).every((e) => typeof e === 'boolean' && e);

    if (allOk) {
      return response;
    }

    // some services are not ok
    throw new HttpException(
      JSON.stringify(response),
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
