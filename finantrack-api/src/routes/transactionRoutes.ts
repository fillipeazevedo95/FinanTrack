import { Router } from 'express';
import {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction
} from '../controllers/transactionController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

// Todas as rotas de transação requerem autenticação
router.use(authenticateToken);

// GET /api/transactions - Listar transações do usuário
router.get('/', getTransactions);

// GET /api/transactions/:id - Obter transação por ID
router.get('/:id', getTransactionById);

// POST /api/transactions - Criar nova transação
router.post('/', createTransaction);

// PUT /api/transactions/:id - Atualizar transação
router.put('/:id', updateTransaction);

// DELETE /api/transactions/:id - Deletar transação
router.delete('/:id', deleteTransaction);

export default router;
