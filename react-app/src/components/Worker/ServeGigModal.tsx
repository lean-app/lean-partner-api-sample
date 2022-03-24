import { setEntities, updateEntities } from '@ngneat/elf-entities';
import { useState } from 'react';

import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import { toast } from 'react-toastify';

import Lean, { CREATE_GIG, } from '../../services/lean.service';

const submit = (gig: any) => Lean.perform({
  type: CREATE_GIG,
  params: gig
}).then((result) => {
  if (result.status !== 201) {
    throw new Error(result.data.message);
  }
 
  // Update GigStore
  
  toast('Gig created!');
}).catch((error) => {
  console.error(error)
  toast(error.message);
});

export const ServeGigModal = ({ worker, closeModal }: { worker: any, closeModal: () => void }) => {
  const [amount, setAmount] = useState(1.14);
  const [tip, setTip] = useState(1);
  const [expenses, setExpenses] = useState(1);
  const [type, setType] = useState('Space Rideshare Gig');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState(worker?.city ?? '');
  const [state, setState] = useState(worker?.state ?? '');
  const [postalCode, setPostalCode] = useState(worker?.postalCode ?? '');
  const [phoneNumber, setPhoneNumber] = useState(worker?.phoneNumber ?? '');
  const [birthday, setBirthday] = useState(worker?.birthday ?? '');

  return (
    <Form onSubmit={(e) => [e.preventDefault(), submit({
      totalAmount: amount + tip + expenses,

      partnerUserId: worker.id
    }).then(closeModal)]}>
      <Card>
        <Card.Header>
          <Card.Title>Serve Gig</Card.Title>
        </Card.Header>
        <Card.Body>
          <Form.Group>
            <Form.Label>Ammount</Form.Label>
            <Form.Control type="text" placeholder="$1.14" defaultValue={amount} onChange={(e) => setAmount(Number(e.target.value))}></Form.Control>

            <Form.Label>Tip</Form.Label>
            <Form.Control type="text" placeholder="$1.00" defaultValue={tip} onChange={(e) => setTip(Number(e.target.value))}></Form.Control>

            <Form.Label>Expenses</Form.Label>
            <Form.Control type="text" placeholder="$1.00" defaultValue={expenses} onChange={(e) => setExpenses(Number(e.target.value))}></Form.Control>

            <Form.Label>Type</Form.Label>
            <Form.Control type="text" placeholder="Space Rideshare Gig" defaultValue={type} onChange={(e) => setType(e.target.value)}></Form.Control>

            <Form.Label>Description</Form.Label>
            <Form.Control as="textarea" placeholder="Description" defaultValue={description} onChange={(e) => setDescription(e.target.value)}></Form.Control>
          </Form.Group>
        </Card.Body>
        <Card.Footer>
          <Button type="submit">Submit</Button>
        </Card.Footer>
      </Card>
    </Form>
  );
}