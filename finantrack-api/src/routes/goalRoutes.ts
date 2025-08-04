import { Router } from 'express';
import {
  getMonthlyGoals,
  getMonthlyGoal,
  setMonthlyGoal,
  updateMonthlyGoal,
  deleteMonthlyGoal
} from '../controllers/goalController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

// Todas as rotas de meta requerem autenticação
router.use(authenticateToken);

// GET /api/goals - Listar metas mensais do usuário
router.get('/', getMonthlyGoals);

// GET /api/goals/:month/:year - Obter meta mensal específica
router.get('/:month/:year', getMonthlyGoal);

// POST /api/goals - Criar ou atualizar meta mensal
router.post('/', setMonthlyGoal);

// PUT /api/goals/:id - Atualizar meta mensal
router.put('/:id', updateMonthlyGoal);

// DELETE /api/goals/:id - Deletar meta mensal
router.delete('/:id', deleteMonthlyGoal);

export default router;
