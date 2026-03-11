import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Container } from '@mui/material';
import NavBar from './components/NavBar';
import ProductList from './pages/ProductList';
import ProductForm from './pages/ProductForm';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <>
      <NavBar />
      <Container sx={{ mt: 4 }}>
        <Routes>
          <Route path="/" element={<ProductList />} />
          <Route path="/add" element={<ProductForm />} />
          <Route path="/edit/:id" element={<ProductForm />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Container>
    </>
  );
}
