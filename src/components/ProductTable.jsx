import React from 'react';
import { Table, TableHead, TableRow, TableCell, TableBody, IconButton, Chip, colors } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { Link as RouterLink } from 'react-router-dom';

const getStockStatus = (stock, maxStock) => {
  if (stock === 0) {
    return {
      label: 'OUT OF STOCK',
      color: 'error',
      icon: <ErrorIcon sx={{ fontSize: 18 }} />,
      message: '🚨 CRITICAL: Product out of stock! Shopkeeper: Buy and restock immediately!'
    };
  } else if (stock <= 5) {
    return {
      label: 'LOW STOCK',
      color: 'warning',
      icon: <WarningIcon sx={{ fontSize: 18 }} />,
      message: `⚠️ WARNING: Low stock (${stock} units). Please consider restocking soon.`
    };
  } else if (stock >= (maxStock || 50)) {
    return {
      label: 'FULL STOCK',
      color: 'success',
      icon: <CheckCircleIcon sx={{ fontSize: 18 }} />,
      message: `✅ FULL: Stock is adequate (${stock}/${maxStock || 50} units)`
    };
  } else {
    return {
      label: 'NORMAL',
      color: 'default',
      icon: <CheckCircleIcon sx={{ fontSize: 18 }} />,
      message: `✓ Normal stock level (${stock}/${maxStock || 50} units)`
    };
  }
};

const isHighDemandLowStock = (buyerCount, stock) => {
  return buyerCount > 5 && stock < 10;
};

export default function ProductTable({ products, onDelete }) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell>Item Number</TableCell>
          <TableCell>Price ($)</TableCell>
          <TableCell>Quantity</TableCell>
          <TableCell>Stock</TableCell>
          <TableCell align="center">Buyers</TableCell>
          <TableCell>Status</TableCell>
          <TableCell>Total Value ($)</TableCell>
          <TableCell align="right">Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {products.map((p) => {
          const status = getStockStatus(p.stock || 0, p.maxStock || 50);
          const isHighDemand = isHighDemandLowStock(p.buyerCount || 0, p.stock || 0);
          return (
          <TableRow 
            key={p._id}
            sx={isHighDemand ? { 
              backgroundColor: '#fff3cd',
              borderLeft: '4px solid #ff9800',
              fontWeight: 'bold'
            } : {}}
          >
            <TableCell>{p.name}</TableCell>
            <TableCell>{p.item_number}</TableCell>
            <TableCell>{typeof p.price === 'number' ? p.price.toFixed(2) : p.price}</TableCell>
            <TableCell>{p.quantity}</TableCell>
            <TableCell>{p.stock || 0}</TableCell>
            <TableCell align="center" sx={{ fontWeight: 'bold', color: p.buyerCount > 0 ? 'success.main' : 'inherit' }}>
              {p.buyerCount || 0}
            </TableCell>
            <TableCell>
              <Chip 
                icon={status.icon}
                label={status.label} 
                color={status.color} 
                variant="outlined"
                size="small"
                title={status.message}
              />
            </TableCell>
            <TableCell>
              {typeof p.price === 'number' && typeof p.quantity === 'number' 
                ? (p.price * p.quantity).toFixed(2) 
                : 'N/A'}
            </TableCell>
            <TableCell align="right">
              <IconButton component={RouterLink} to={`/edit/${p._id}`} size="small">
                <EditIcon />
              </IconButton>
              <IconButton onClick={() => onDelete(p._id)} size="small">
                <DeleteIcon />
              </IconButton>
            </TableCell>
          </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
