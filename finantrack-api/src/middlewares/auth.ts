import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { AuthenticatedRequest, JWTPayload } from '../types';

// Middleware para verificar se o usuário está autenticado
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Token de acesso requerido'
      });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET não configurado');
      res.status(500).json({
        success: false,
        error: 'Erro de configuração do servidor'
      });
      return;
    }

    // Verificar e decodificar o token
    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;

    // Buscar o usuário no banco de dados
    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Usuário não encontrado ou inativo'
      });
      return;
    }

    // Adicionar o usuário ao request
    req.user = user as any; // Type assertion para resolver incompatibilidade
    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        error: 'Token inválido'
      });
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        error: 'Token expirado'
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// Middleware para verificar se o usuário é administrador
export const requireAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Usuário não autenticado'
    });
    return;
  }

  if (req.user.role !== 'ADMIN') {
    res.status(403).json({
      success: false,
      error: 'Acesso negado. Privilégios de administrador requeridos.'
    });
    return;
  }

  next();
};

// Middleware para verificar se o usuário pode acessar o recurso
export const requireOwnership = (userIdField: string = 'userId') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      });
    }

    // Administradores podem acessar qualquer recurso
    if (req.user.role === 'ADMIN') {
      return next();
    }

    // Verificar se o usuário é o dono do recurso
    const resourceUserId = req.params[userIdField] || req.body[userIdField];
    
    if (resourceUserId && resourceUserId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado. Você só pode acessar seus próprios recursos.'
      });
    }

    next();
  };
};

// Função utilitária para gerar tokens JWT
export const generateToken = (payload: JWTPayload): string => {
  const jwtSecret = process.env.JWT_SECRET;
  const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';

  if (!jwtSecret) {
    throw new Error('JWT_SECRET não configurado');
  }

  return jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn } as jwt.SignOptions);
};

// Função utilitária para verificar tokens
export const verifyToken = (token: string): JWTPayload => {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error('JWT_SECRET não configurado');
  }

  return jwt.verify(token, jwtSecret) as JWTPayload;
};
