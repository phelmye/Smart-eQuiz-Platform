import { SetMetadata } from '@nestjs/common';

export const ApiScopes = (...scopes: string[]) => SetMetadata('apiScopes', scopes);
