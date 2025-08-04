import { Router } from 'express';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

// Todas as rotas de categoria requerem autenticação
router.use(authenticateToken);

// GET /api/categories - Listar categorias do usuário
router.get('/', getCategories);

// GET /api/categories/:id - Obter categoria por ID
router.get('/:id', getCategoryById);

// POST /api/categories - Criar nova categoria
router.post('/', createCategory);

// PUT /api/categories/:id - Atualizar categoria
router.put('/:id', updateCategory);

// DELETE /api/categories/:id - Deletar categoria
router.delete('/:id', deleteCategory);

export default router;
