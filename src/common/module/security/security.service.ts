import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { compare, hash } from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class SecurityService {
  constructor(private readonly configService: ConfigService) {}

  private getRequiredConfigValue(key: string): string {
    const value = this.configService.get<string>(key);

    if (!value) {
      throw new BadRequestException(`${key} is not configured`);
    }

    return value;
  }

  private base64UrlEncode(value: string): string {
    return Buffer.from(value)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '');
  }

  createToken({
    subject,
    secretKeyName,
    expiresIn,
    tokenType,
  }: {
    subject: string;
    secretKeyName: string;
    expiresIn: number;
    tokenType: 'access' | 'refresh';
  }): string {
    const secretKey = this.getRequiredConfigValue(secretKeyName);
    const nowInSeconds = Math.floor(Date.now() / 1000);
    const payload = {
      sub: subject,
      type: tokenType,
      iat: nowInSeconds,
      exp: nowInSeconds + expiresIn,
    };

    const header = {
      alg: 'HS256',
      typ: 'JWT',
    };

    const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = this.base64UrlEncode(JSON.stringify(payload));
    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '');

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  generateHash = async ({
    plaintext,
    salt = Number(this.configService.get<string>('SALT_ROUND') ?? 10),
  }: {
    plaintext: string;
    salt?: number;
  }): Promise<string> => {
    return await hash(plaintext, salt);
  };

  compareHash = async ({
    plaintext,
    cipherText,
  }: {
    plaintext: string;
    cipherText: string;
  }): Promise<boolean> => {
    return await compare(plaintext, cipherText);
  };

  private getEncryptionKeyBuffer(): Buffer {
    const encKey =
      this.configService.get<string>('ENC_KEY') ||
      this.configService.get<string>('ENC_BYTE') ||
      'dev_default_secure_encryption_key_32_bytes_long_secret!!';

    if (/^[0-9a-fA-F]{64}$/.test(encKey)) {
      return Buffer.from(encKey, 'hex');
    }

    if (Buffer.from(encKey, 'utf8').length === 32) {
      return Buffer.from(encKey, 'utf8');
    }

    // Fallback: derive exact 32-byte key via SHA-256
    return crypto.createHash('sha256').update(encKey).digest();
  }

  generateEncryption = (plaintext: string): string => {
    if (!plaintext) {
      throw new BadRequestException('No plaintext provided');
    }

    const ivLength = Number(
      this.configService.get<string>('ENC_IV_LENGTH') ?? 16,
    );

    const iv = crypto.randomBytes(ivLength);
    const keyBuffer = this.getEncryptionKeyBuffer();

    const cipher = crypto.createCipheriv('aes-256-cbc', keyBuffer, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return `${iv.toString('hex')}:${encrypted}`;
  };

  generateDecryption = (cipherText: string): string => {
    if (!cipherText) {
      throw new BadRequestException('No cipher text provided');
    }

    const parts = cipherText.split(':');
    if (parts.length !== 2) {
      throw new BadRequestException('Invalid encryption format');
    }

    const [ivHex, encrypted] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const keyBuffer = this.getEncryptionKeyBuffer();

    const decipher = crypto.createDecipheriv('aes-256-cbc', keyBuffer, iv);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  };
}
