import { useState } from 'react';
import Form from 'react-bootstrap/Form';

export const InviteWorkerModal = ({ worker }: { worker: any}) => {
  const [workerFirstName, workerMiddleOrLastName, workerLastName] = worker.name.split(' ');
  const [firstName, setFirstName] = useState(workerFirstName);
  const [middleName, setMiddleName] = useState(workerMiddleOrLastName && workerLastName ? workerMiddleOrLastName : '');
  const [lastName, setLastName] = useState(workerLastName ?? workerMiddleOrLastName);
  const [street, setStreet] = useState(worker.street);
  const [city, setCity] = useState(worker.city);
  const [state, setState] = useState(worker.state);
  const [country, setCountry] = useState(worker.country);
  const [zipcode, setZipcode] = useState(worker.zipcode);


  return <Form>
    <h1>Invite Worker</h1>
    <Form.Group>
      <Form.Label>First Name</Form.Label>
      <Form.Control type="text" placeholder="First Name" defaultValue={firstName}></Form.Control>

      <Form.Label>Middle Name</Form.Label>
      <Form.Control type="text" placeholder="Middle Name" defaultValue={middleName}></Form.Control>

      <Form.Label>Last Name</Form.Label>
      <Form.Control type="text" placeholder="Last Name" defaultValue={lastName}></Form.Control>

      <Form.Label>Street</Form.Label>
      <Form.Control type="text" placeholder="Street" defaultValue={street}></Form.Control>

      <Form.Label>City</Form.Label>
      <Form.Control type="text" placeholder="City" defaultValue={city}></Form.Control>

      <Form.Label>State</Form.Label>
      <Form.Control type="text" placeholder="State" defaultValue={state}></Form.Control>

      <Form.Label>Country</Form.Label>
      <Form.Control type="text" placeholder="Country" defaultValue={country}></Form.Control>

      <Form.Label>ZIP Code</Form.Label>
      <Form.Control type="text" placeholder="ZIP Code" defaultValue={zipcode}></Form.Control>
    </Form.Group>
  </Form>
}