import React, { useEffect, useState } from 'react';
import { Paper, Typography, Box, CircularProgress, Button, Stack, Alert, AlertTitle, Divider } from '@mui/material';
import { getProducts, deleteProduct } from '../api/api';
import ProductTable from '../components/ProductTable';
import { useNavigate } from 'react-router-dom';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = async () => {
    try {
      setLoading(true);
      const res = await getProducts();
      setProducts(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter(p => p._id !== id));
    } catch (err) {
      console.error(err);
      alert('Delete failed');
    }
  };

  const getStockAlerts = () => {
    const outOfStock = products.filter(p => (p.stock || 0) === 0);
    const lowStock = products.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= 5);
    const fullStock = products.filter(p => (p.stock || 0) >= (p.maxStock || 50));
    const highDemandLowStock = products.filter(p => (p.buyerCount || 0) > 5 && (p.stock || 0) < 10);
    return { outOfStock, lowStock, fullStock, highDemandLowStock };
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5">Products</Typography>
        <Button variant="contained" onClick={() => navigate('/add')}>Add Product</Button>
      </Stack>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}><CircularProgress/></Box>
      ) : products.length === 0 ? (
        <Typography>No products yet. Add one.</Typography>
      ) : (
        <>
          {(() => {
            const { outOfStock, lowStock, fullStock, highDemandLowStock } = getStockAlerts();
            return (
              <>
                {highDemandLowStock.length > 0 && (
                  <Alert severity="error" sx={{ mb: 2, backgroundColor: '#ffebee', borderLeft: '4px solid #ff6f00' }}>
                    <AlertTitle>🔥 HIGH DEMAND - LOW STOCK ALERT</AlertTitle>
                    {highDemandLowStock.map(p => (
                      <div key={p._id}>
                        <strong>{p.name}</strong> ({p.item_number}) - <strong>{p.buyerCount} buyers but only {p.stock || 0} units in stock!</strong> Shopkeeper: This is a popular product. Maintain higher stock to meet customer demand!
                      </div>
                    ))}
                  </Alert>
                )}

                {outOfStock.length > 0 && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    <AlertTitle>🚨 OUT OF STOCK ALERT</AlertTitle>
                    {outOfStock.map(p => (
                      <div key={p._id}>
                        <strong>{p.name}</strong> ({p.item_number}) - <strong>Shopkeeper: Purchase and place this product in stock immediately!</strong>
                      </div>
                    ))}
                  </Alert>
                )}
                
                {lowStock.length > 0 && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    <AlertTitle>⚠️ LOW STOCK WARNING</AlertTitle>
                    {lowStock.map(p => (
                      <div key={p._id}>
                        <strong>{p.name}</strong> ({p.item_number}) - {p.stock || 0} units remaining. Please consider restocking.
                      </div>
                    ))}
                  </Alert>
                )}

                {fullStock.length > 0 && (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    <AlertTitle>✅ FULL STOCK</AlertTitle>
                    {fullStock.map(p => (
                      <div key={p._id}>
                        <strong>{p.name}</strong> ({p.item_number}) - Adequately stocked ({p.stock || 0}/{p.maxStock || 50} units)
                      </div>
                    ))}
                  </Alert>
                )}

                {outOfStock.length === 0 && lowStock.length === 0 && fullStock.length === 0 && highDemandLowStock.length === 0 && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    All products have normal stock levels
                  </Alert>
                )}
              </>
            );
          })()}
          
          <Divider sx={{ my: 2 }} />
          <ProductTable products={products} onDelete={handleDelete} />
        </>
      )}
    </Paper>
  );
}
