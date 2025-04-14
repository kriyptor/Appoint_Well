import React, { useState, useEffect } from 'react';
import { Form, Button, ListGroup } from 'react-bootstrap';
import mockApi from '../../mockData';

const Wallet = () => {
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState('');
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchWallet = async () => {
      const res = await mockApi.getWallet();
      setBalance(res.balance);
      setTransactionalData(res.transactions);
    };
    fetchWallet();
  }, []);

  const handleAddMoney = async () => {
    await mockApi.addMoney({ amount: parseFloat(amount) });
    const res = await mockApi.getWallet();
    setBalance(res.balance);
    setTransactions(res.transactions);
    setAmount('');
  };

  return (
    <div>
      <h2>Wallet</h2>
      <p>Balance: ${balance}</p>
      <Form>
        <Form.Group>
          <Form.Label>Add Money</Form.Label>
          <Form.Control
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </Form.Group>
        <Button className="mt-2" onClick={handleAddMoney}>
          Add
        </Button>
      </Form>
      <h3>Transaction History</h3>
      <ListGroup>
        {transactions.map((t, i) => (
          <ListGroup.Item key={i}>
            ${t.amount} on {new Date(t.date).toLocaleString()}
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
};

export default Wallet;