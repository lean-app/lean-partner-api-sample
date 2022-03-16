import { createStore } from '@ngneat/elf';
import { withActiveId, withEntities } from '@ngneat/elf-entities';
import {
  persistState,
  localStorageStrategy,
  sessionStorageStrategy,
} from '@ngneat/elf-persist-state';
interface Worker { 
  id: string, 
  [key: string]: any
};

const workerStore = createStore(
  { name: 'workers' },
  withEntities<Worker>(),
  withActiveId()
);

const instance = persistState(workerStore, {
  key: 'todos',
  storage: localStorageStrategy,
});

export default workerStore;