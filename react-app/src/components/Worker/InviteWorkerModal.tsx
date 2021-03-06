import { setEntities, updateEntities } from '@ngneat/elf-entities';
import { useState } from 'react';

import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import { toast } from 'react-toastify';

import Lean, { INVITE_CUSTOMER } from '../../services/lean.service';
import WorkerStore from '../../stores/worker.store';

const submit = (worker: {
  firstName: string,
  middleName: string,
  lastName: string,
  email: string,
  street: string,
  city: string,
  state: string,
  postalCode: string,
  phoneNumber: string,
  birthday: string,
  partnerUserId: string
}) => Lean.perform({
  type: INVITE_CUSTOMER,
  params: worker
}).then((result) => {
  if (result.status !== 201) {
    throw new Error(result.data.message);
  }
  
  WorkerStore.update(updateEntities(worker.partnerUserId, {
    invited: true
  }));
  
  toast('Worker invite sent!');
}).catch((error) => {
  console.error(error)
  toast(error.message);
});

export const InviteWorkerModal = ({ worker, closeModal }: { worker: any, closeModal: () => void }) => {
  const [workerFirstName, workerMiddleOrLastName, workerLastName] = (worker?.name ?? '').split(' ');
  const [firstName, setFirstName] = useState(workerFirstName ?? '');
  const [middleName, setMiddleName] = useState(workerMiddleOrLastName && workerLastName ? workerMiddleOrLastName : '');
  const [lastName, setLastName] = useState(workerLastName ?? workerMiddleOrLastName ?? '');
  const [email, setEmail] = useState(worker?.email ?? '');
  const [street, setStreet] = useState(worker?.street ?? '');
  const [city, setCity] = useState(worker?.city ?? '');
  const [state, setState] = useState(worker?.state ?? '');
  const [postalCode, setPostalCode] = useState(worker?.postalCode ?? '');
  const [phoneNumber, setPhoneNumber] = useState(worker?.phoneNumber ?? '');
  const [birthday, setBirthday] = useState(worker?.birthday ?? '');

  return (
    <Form onSubmit={(e) => [e.preventDefault(), submit({
      firstName,
      middleName,
      lastName,
      email,
      street,
      city,
      state,
      postalCode,
      phoneNumber,
      birthday,
      partnerUserId: worker.id
    }).then(closeModal)]}>
      <Card>
        <Card.Header>
          <Card.Title>Invite Worker</Card.Title>
        </Card.Header>
        <Card.Body>
            <Form.Group>
              <Form.Label>First Name</Form.Label>
              <Form.Control type="text" placeholder="First Name" defaultValue={firstName} onChange={(e) => setFirstName(e.target.value)}></Form.Control>

              <Form.Label>Middle Name</Form.Label>
              <Form.Control type="text" placeholder="Middle Name" defaultValue={middleName} onChange={(e) => setMiddleName(e.target.value)}></Form.Control>

              <Form.Label>Last Name</Form.Label>
              <Form.Control type="text" placeholder="Last Name" defaultValue={lastName} onChange={(e) => setLastName(e.target.value)}></Form.Control>

              <Form.Label>Email</Form.Label>
              <Form.Control type="email" placeholder="Email" defaultValue={email} onChange={(e) => setEmail(e.target.value)}></Form.Control>

              <Form.Label>Street</Form.Label>
              <Form.Control type="text" placeholder="Street" defaultValue={street} onChange={(e) => setStreet(e.target.value)}></Form.Control>

              <Form.Label>City</Form.Label>
              <Form.Control type="text" placeholder="City" defaultValue={city} onChange={(e) => setCity(e.target.value)}></Form.Control>

              <Form.Label>State</Form.Label>
              <Form.Control type="text" placeholder="State" defaultValue={state} onChange={(e) => setState(e.target.value)}></Form.Control>

              <Form.Label>Postal Code</Form.Label>
              <Form.Control type="text" placeholder="00000" defaultValue={postalCode} onChange={(e) => setPostalCode(e.target.value)}></Form.Control>
            
              <Form.Label>Phone Number</Form.Label>
              <Form.Control type="phone" placeholder="555-555-5555" defaultValue={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)}></Form.Control>
            
              <Form.Label>Birthday</Form.Label>
              <Form.Control type="date" placeholder="02/02/2022" defaultValue={birthday} onChange={(e) => setBirthday(e.target.value)}></Form.Control>
            </Form.Group>
        </Card.Body>
        <Card.Footer>
          <Button type="submit">Submit</Button>
        </Card.Footer>
      </Card>
    </Form>
  );
}