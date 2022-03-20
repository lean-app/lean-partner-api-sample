import { createStore } from '@ngneat/elf';
import { withActiveId, withEntities, withUIEntities } from '@ngneat/elf-entities';
import {
  persistState,
  localStorageStrategy
} from '@ngneat/elf-persist-state';
import { Worker, WorkerUI } from '../types/Worker';

const workerStore = createStore(
  { name: 'workers' },
  withEntities<Worker>(),
  withUIEntities<WorkerUI>(),
  withActiveId()
);

const instance = persistState(workerStore, {
  key: 'workers',
  storage: localStorageStrategy,
});

export default workerStore;