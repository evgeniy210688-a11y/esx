import { cache } from 'react';
import { snapshotService } from './service-snapshot';

export const getServiceProfile = cache(async (id: string) => snapshotService(id));
