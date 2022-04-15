import { addEntities, resetActiveId, selectEntitiesCountByPredicate, setActiveId, UIEntitiesRef, updateEntities } from "@ngneat/elf-entities";
import { toast } from "react-toastify";
import { ulid } from "ulid";

import WorkerStore from "../stores/worker.store";
import { Worker } from "../types/Worker";

import Lean, { CREATE_GIG, GET_CUSTOMER } from "./lean.service";

import { Temporal } from '@js-temporal/polyfill';
import { Gig } from "../types/Gig";

import { from, of } from "rxjs";
import { filter, map, switchMap, tap, take } from "rxjs/operators";
import { update } from "lodash";

const nameForWorker = (data: Worker) => ((data.firstName && data.lastName) ? `${data.firstName} ${data.middleName ? `${data.middleName} ${data.lastName}` : ` ${data.lastName}`}` : data.name);
export const createWorker = (partialWorker: Partial<Worker>) => {
  const id = ulid();
  const worker = {
    name: '',
    paymentMethod: '',
    email: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    phoneNumber: '',
    birthday: '',
    ...partialWorker,

    id,
    status: 'NEW',
    updatedAt: Temporal.Now.plainDateTimeISO().toString(),
  };

  WorkerStore.update(addEntities(worker));
  return worker;
}

export const showInviteWorkerModal = (worker: Worker) => {
  if (worker.status.toUpperCase() !== 'NEW') {
    toast('Worker already invited.');
  }

  WorkerStore.update(
    resetActiveId(),
    setActiveId(worker.id),
    updateEntities(worker.id, (entity) => ({ 
      ...entity, 
      showModal: 'invite' 
    }), { ref: UIEntitiesRef })
  );
}

export const tryCreateWorkerToInvite = () => WorkerStore.pipe(
  selectEntitiesCountByPredicate(({ invited, status }) => !invited && status === 'NEW'),
  take(1),
  filter(count => count === 0),
  map(() => createWorker({
    name: 'Gig Worker',
    paymentMethod: 'bank_account',
    street: 'residential house',
    city: 'Los Angeles',
    state: 'CA',
    postalCode: '90000',
    phoneNumber: `${`${Math.random()}`.substring(2, 5)}-${`${Math.random()}`.substring(2, 5)}-${`${Math.random()}`.substring(2, 6)}`,
    birthday: '1990-09-19',
    status: 'NEW',
    invited: false
  }))
).subscribe();

export const refresh = (worker: Worker) => of(worker).pipe(
  filter(({ invited, status }) => status !== 'NEW' || invited),
  tap((worker) => console.log(worker)),
  tap(() => WorkerStore.update(
    updateEntities(worker.id, {
      refreshing: true
    }, { ref: UIEntitiesRef })
  )),
  switchMap((worker) => from(Lean.perform({
    type: GET_CUSTOMER,
    params: worker.id
  }))),
  tap(({ status, data }) => status === 200 ? toast("Worker refreshed!") : toast(data.message)),
  tap(({ status, data }) => {
    if (status === 200) {
      WorkerStore.update(
        updateEntities(worker.id, (entity) => {
          if (data.status === 'ACTIVE' && entity.paymentMethod !== 'lean') {
            entity.paymentMethod = 'lean';
          }
  
          return { ...entity, ...data,
            name: nameForWorker({ ...entity, ...data }),
          };
        })
      )
    } 

    WorkerStore.update(
      updateEntities(worker.id, {
        refreshing: false
      }, { ref: UIEntitiesRef }),
    )
  })
).subscribe();

export const showServeGigModal = (worker: Worker) => WorkerStore.update(
  resetActiveId(),
  setActiveId(worker.id),
  updateEntities(worker.id, (entity) => ({ 
    ...entity, 
    showModal: 'gig' 
  }), { ref: UIEntitiesRef })
);

export const serveGig = async (worker: Worker, gig: Gig) => {
  if (worker.paymentMethod.toLowerCase() === 'lean') {
    const result = await Lean.perform({
      type: CREATE_GIG,
      params: {
        ...gig,

        partnerUserId: worker.id,
        gigId: ulid()
      }
    })
    
    if (result.status !== 201) {
      console.error(result.data.message);
      toast('result.data.message');
    } else {
      toast('Gig created!');
    }
  }
}