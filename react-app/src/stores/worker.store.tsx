import { createStore, withProps } from '@ngneat/elf';
import { withEntities } from '@ngneat/elf-entities';

interface Worker { 
  id: string, 
  [key: string]: any
};

export default createStore(
  { name: 'workers' },
  withEntities<Worker>()
);