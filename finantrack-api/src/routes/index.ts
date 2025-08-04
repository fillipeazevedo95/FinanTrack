import { Router } from 'express';
import authRoutes from './authRoutes';
import categoryRoutes from './categoryRoutes';
import transactionRoutes from './transactionRoutes';
import reportRoutes from './reportRoutes';
import goalRoutes from './goalRoutes';

const router = Router();

// Rotas de autenticação
router.use('/auth', authRoutes);

// Rotas de categorias
router.use('/categories', categoryRoutes);

// Rotas de transações
router.use('/transactions', transactionRoutes);

// Rotas de relatórios
router.use('/reports', reportRoutes);

// Rotas de metas mensais
router.use('/goals', goalRoutes);

// Rota de teste
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'API FinanTrack funcionando!',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      categories: '/api/categories',
      transactions: '/api/transactions',
      reports: '/api/reports',
      goals: '/api/goals'
    }
  });
});

export default router;
