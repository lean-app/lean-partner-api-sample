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

const initialState = {
  type: 'Space Rideshare Gig',
  description: 'From A to Apoapsis',
  startDate: Temporal.Now
    .plainDateISO()
    .toString(),
  startTime: Temporal.Now
    .plainTimeISO()
    .round('hour')
    .toString({ smallestUnit: 'minutes' }),
  endDate: Temporal.Now
    .plainDateTimeISO()
    .add({ hours: 1 })
    .toPlainDate()
    .toString(),
  endTime: Temporal.Now
  .plainTimeISO()
  .round('hour')
  .add({ hours: 1 })
  .toString({ smallestUnit: 'minutes' })
};

export const ServeGigModal = ({ worker, closeModal }: { worker: any, closeModal: () => void }) => {
  const [amount, setAmount] = useState(1.14);
  const [tips, setTips] = useState(1);
  const [expenses, setExpenses] = useState(1);
  const [type, setType] = useState(initialState.type);
  const [description, setDescription] = useState(initialState.description);

  const [startDate, setStartDate] = useState(initialState.startDate);
  const [startTime, setStartTime] = useState(initialState.startTime);
  const [endDate, setEndDate] = useState(initialState.endDate);
  const [endTime, setEndTime] = useState(initialState.endTime);

  return (
    <Form onSubmit={(e) => [e.preventDefault(), submit({
      partnerUserId: worker.id,

      type,
      description,
      startTime: `${startDate}T${startTime}:00.000`,
      endTime: `${endDate}T${endTime}:00.000`,

      totalAmount: (amount + tips + expenses).toFixed(2),
      tips: tips.toFixed(2),
      expenses: expenses.toFixed(2),
    }).then(closeModal)]}>
      <Card>
        <Card.Header>
          <Card.Title>Serve Gig</Card.Title>
        </Card.Header>
        <Card.Body>
          <Form.Group>

            <Form.Label>Amount</Form.Label>
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
              <Form.Control type="date" 
              defaultValue={startDate} 
              onChange={(e) => setStartDate(e.target.value)} />
              <Form.Control type="time" 
              defaultValue={startTime} 
              onChange={(e) => setStartTime(e.target.value)} />
            </InputGroup>

            <Form.Label>End Time</Form.Label>
            <InputGroup>
              <Form.Control type="date" 
              defaultValue={endDate} 
              onChange={(e) => setEndDate(e.target.value)} />
              <Form.Control type="time" 
              defaultValue={endTime} 
              onChange={(e) => setEndTime(e.target.value)} />
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