import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getInfo() {
    return {
      name: 'Smart eQuiz Platform API',
      version: '1.0.0',
      status: 'running',
      endpoints: {
        auth: '/api/auth',
        users: '/api/users',
        tournaments: '/api/tournaments',
        questions: '/api/questions',
        practice: '/api/practice',
        matches: '/api/matches',
      },
      documentation: 'See API_DOCUMENTATION.md for details',
    };
  }

  @Get('health')
  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
