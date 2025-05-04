import React, { useState, useEffect } from 'react';
import { Form, Button, Spinner, Modal, Badge } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';


function Wallet() {
  const { modalShow, setModalShow, authToken, walletBalance, setWalletBalance } = useAuth();
  //const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
    const fetchWalletBalance = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/payment/user/wallet-balance`, {
          headers: {
            Authorization: authToken,
          },
        });
        
        setWalletBalance(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching wallet balance:', error);
      }
    };

    fetchWalletBalance();
  }, [authToken]);

  const refreshWalletBalance = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/payment/user/wallet-balance`, {
        headers: {
          Authorization: authToken,
        },
      });
      
      setWalletBalance(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
    }
  };

  return (
    <Modal
      show={modalShow}
      onHide={() => setModalShow(false)}
      size="md"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Your Wallet
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Modal.Title id="contained-modal-title-vcenter">
          Balance: {/* {loading && <Spinner animation="border" /> : `₹${walletBalance}`} */}
          {loading ? (
            <Spinner animation="border" />
          ) : (
            <Badge bg="success">₹{walletBalance}</Badge>
          )}
        </Modal.Title>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={refreshWalletBalance} variant='warning'>Refresh</Button>
        <Button onClick={() => setModalShow(false)} variant='danger'>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default Wallet;

