import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import * as nodemailer from 'nodemailer';

// Mock nodemailer
jest.mock('nodemailer');

describe('EmailService', () => {
  let service: EmailService;
  let transporterMock;

  beforeEach(async () => {
    // Mock implementation of createTransport
    transporterMock = {
      sendMail: jest.fn().mockResolvedValue(true),
    };
    (nodemailer.createTransport as jest.Mock).mockReturnValue(transporterMock);

    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailService],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendCompanyApprovedEmail', () => {
    it('should send an approval email', async () => {
      const email = 'test@example.com';
      const name = 'Test Company';
      await service.sendCompanyApprovedEmail(email, name);

      expect(transporterMock.sendMail).toHaveBeenCalledWith({
        from: '"UfroJobs" <ufro.jobs@gmail.com>',
        to: email,
        subject: '¡Tu empresa ha sido aprobada!',
        text: `Hola ${name},\n\nTu empresa ha sido aprobada en UfroJobs.`,
        html: `<p>Hola ${name},</p><p>Tu empresa ha sido aprobada en UfroJobs.</p>`,
      });
    });
  });

  describe('sendCompanyRejectedEmail', () => {
    it('should send a rejection email', async () => {
      const email = 'test@example.com';
      const name = 'Test Company';
      await service.sendCompanyRejectedEmail(email, name);

      expect(transporterMock.sendMail).toHaveBeenCalledWith({
        from: '"UfroJobs" <ufro.jobs@gmail.com>',
        to: email,
        subject: 'Tu empresa ha sido rechazada',
        text: `Hola ${name},\n\nLamentamos informarte que tu empresa ha sido rechazada.`,
        html: `<p>Hola ${name},</p><p>Lamentamos informarte que tu empresa ha sido rechazada.</p>`,
      });
    });
  });

  describe('isValidEmail', () => {
    it('should return true for a valid email', () => {
      expect(service.isValidEmail('test@example.com')).toBe(true);
    });

    it('should return false for an invalid email', () => {
      expect(service.isValidEmail('invalid-email')).toBe(false);
    });
  });
});