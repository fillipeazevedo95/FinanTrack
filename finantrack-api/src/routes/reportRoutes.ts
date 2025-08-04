import { Router } from 'express';
import {
  getFinancialSummary,
  getMonthlyReport,
  getCustomPeriodReport,
  getNotifications
} from '../controllers/reportController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

// Todas as rotas de relatório requerem autenticação
router.use(authenticateToken);

// GET /api/reports/summary - Obter resumo financeiro
router.get('/summary', getFinancialSummary);

// GET /api/reports/monthly - Obter relatório mensal
router.get('/monthly', getMonthlyReport);

// GET /api/reports/custom - Obter relatório por período personalizado
router.get('/custom', getCustomPeriodReport);

// GET /api/reports/notifications - Obter notificações e alertas
router.get('/notifications', getNotifications);

export default router;
