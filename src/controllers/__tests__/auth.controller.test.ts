import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { login } from '../auth.controller';
import { getDB } from '../../config/database';

jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../../config/database', () => ({
  getDB: jest.fn()
}));

describe('AuthController', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockStatus: jest.Mock;
  let mockJson: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    
    mockReq = {
      body: {}
    };
    
    mockRes = {
      status: mockStatus
    };
    
    jest.clearAllMocks();
  });

  it('should return 401 if user does not exist or wrong password', () => {
    mockReq.body = { username: 'testuser', password: 'wrongpassword' };
    
    const mockDb = {
      prepare: jest.fn().mockReturnValue({
        get: jest.fn().mockReturnValue(undefined) // Usuario no encontrado
      })
    };
    (getDB as jest.Mock).mockReturnValue(mockDb);

    login(mockReq as Request, mockRes as Response);

    expect(mockStatus).toHaveBeenCalledWith(401);
    expect(mockJson).toHaveBeenCalledWith({ error: { message: 'Credenciales inválidas' } });
  });

  it('should return 200 and a token on successful login', () => {
    mockReq.body = { username: 'admin', password: 'admin123' };
    
    const mockUser = { id: 1, username: 'admin', password: 'hashedpassword', role: 'ADMIN' };
    const mockDb = {
      prepare: jest.fn().mockReturnValue({
        get: jest.fn().mockReturnValue(mockUser)
      })
    };
    
    (getDB as jest.Mock).mockReturnValue(mockDb);
    (bcrypt.compareSync as jest.Mock).mockReturnValue(true);
    (jwt.sign as jest.Mock).mockReturnValue('fake-jwt-token');

    login(mockReq as Request, mockRes as Response);

    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith({
      message: 'Login exitoso',
      token: 'fake-jwt-token',
      user: {
        id: 1,
        username: 'admin',
        role: 'ADMIN'
      }
    });
  });
});
