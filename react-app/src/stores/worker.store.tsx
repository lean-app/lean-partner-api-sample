import { createStore } from '@ngneat/elf';
import { withActiveId, withEntities } from '@ngneat/elf-entities';

interface Worker { 
  id: string, 
  [key: string]: any
};

export default createStore(
  { name: 'workers' },
  withEntities<Worker>(),
  withActiveId()
);