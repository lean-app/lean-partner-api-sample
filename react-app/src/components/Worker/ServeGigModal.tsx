import { Temporal } from '@js-temporal/polyfill';
import { setEntities, updateEntities } from '@ngneat/elf-entities';
import { useState } from 'react';

import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
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
  const [tips, setTips] = useState(1);
  const [expenses, setExpenses] = useState(1);
  const [type, setType] = useState('Space Rideshare Gig');
  const [description, setDescription] = useState('');

  const [startDate, setStartDate] = useState(Temporal.Now.plainDateISO().toString());
  const [startTime, setStartTime] = useState(Temporal.Now.plainTimeISO().toString({
    smallestUnit: 'minutes'
  }));

  const [endDate, setEndDate] = useState(Temporal.Now.plainDateISO().toString());
  const [endTime, setEndTime] = useState(Temporal.Now.plainTimeISO().add({ hours: 1 }).toString({
    smallestUnit: 'minutes'
  }));

console.log(startTime)
  return (
    <Form onSubmit={(e) => [e.preventDefault(), submit({
      partnerUserId: worker.id,

      type,
      description,
      startDate,
      startTime,
      endDate,
      endTime,

      totalAmount: amount + tips + expenses,
      tips,
      expenses,
    }).then(closeModal)]}>
      <Card>
        <Card.Header>
          <Card.Title>Serve Gig</Card.Title>
        </Card.Header>
        <Card.Body>
          <Form.Group>

            <Form.Label >Amount</Form.Label>
            <InputGroup>
              <InputGroup.Text>$</InputGroup.Text>
              <Form.Control type="number" 
              placeholder="$1.14" 
              defaultValue={amount} 
              step="0.01" 
              onChange={(e) => setAmount(Number(e.target.value))} />
            </InputGroup>

            <Form.Label>Tip</Form.Label>
            <InputGroup>
              <InputGroup.Text>$</InputGroup.Text>
              <Form.Control type="number" 
              placeholder="1.00" 
              defaultValue={tips} 
              step="0.01" 
              onChange={(e) => setTips(Number(e.target.value))} />
            </InputGroup>

            <Form.Label>Expenses</Form.Label>
            <InputGroup>
              <InputGroup.Text>$</InputGroup.Text>
              <Form.Control type="number" 
              placeholder="1.00" 
              defaultValue={expenses} 
              step="0.01" 
              onChange={(e) => setExpenses(Number(e.target.value))} />
            </InputGroup>

            <Form.Label>Type</Form.Label>
            <InputGroup>
              <Form.Control as="select" 
              defaultValue={type}
              onChange={(e) => setType(e.target.value)}>
                <option>Space Rideshare Gig</option>
              </Form.Control>
            </InputGroup>

            <Form.Label>Description</Form.Label>
            <InputGroup>
              <Form.Control as="textarea" 
              placeholder="Description" 
              defaultValue={description} 
              onChange={(e) => setDescription(e.target.value)} /> 
            </InputGroup>
           
            <Form.Label>Start Time</Form.Label>
            <InputGroup>
              <Form.Control type="date" placeholder="Start Time" defaultValue={startDate} onChange={(e) => setStartDate(e.target.value)}></Form.Control>
              <Form.Control type="time" placeholder="Start Time" defaultValue={startTime} onChange={(e) => setStartTime(e.target.value)}></Form.Control>
            </InputGroup>

            <Form.Label>End Time</Form.Label>
            <InputGroup>
              <Form.Control type="date" placeholder="Start Time" defaultValue={endDate} onChange={(e) => setEndDate(e.target.value)}></Form.Control>
              <Form.Control type="time" placeholder="Start Time" defaultValue={endTime} onChange={(e) => setEndTime(e.target.value)}></Form.Control>
            </InputGroup>
            
          </Form.Group>
        </Card.Body>
        <Card.Footer>
          <Button type="submit">Submit</Button>
        </Card.Footer>
      </Card>
    </Form>
  );
}