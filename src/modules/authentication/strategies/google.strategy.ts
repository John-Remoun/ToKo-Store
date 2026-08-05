import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';

export interface GoogleProfile {
  email: string;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  picture?: string;
}

/**
 * Verifies Google ID tokens sent up by the frontend (Google Identity
 * Services / "Sign in with Google" button). This is NOT a Passport
 * strategy in the redirect-flow sense — the API only ever receives an
 * already-issued ID token and verifies it server-side, which is the
 * correct pattern for a JSON API consumed by SPA/mobile clients.
 *
 * Requires GOOGLE_CLIENT_ID (and optionally GOOGLE_CLIENT_SECRET, unused
 * for token verification but kept for future authorization-code flows).
 */
@Injectable()
export class GoogleAuthStrategy {
  private readonly client: OAuth2Client;
  private readonly clientId?: string;

  constructor(private readonly configService: ConfigService) {
    this.clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    this.client = new OAuth2Client(this.clientId);
  }

  isConfigured(): boolean {
    return Boolean(this.clientId);
  }

  async verify(idToken: string): Promise<GoogleProfile> {
    if (!this.isConfigured()) {
      throw new UnauthorizedException(
        'Google authentication is not configured on this server (missing GOOGLE_CLIENT_ID)',
      );
    }

    let ticket;
    try {
      ticket = await this.client.verifyIdToken({
        idToken,
        audience: this.clientId,
      });
    } catch {
      throw new UnauthorizedException('Invalid Google token');
    }

    const payload = ticket.getPayload();
    if (!payload?.email) {
      throw new UnauthorizedException('Google token did not contain an email');
    }

    return {
      email: payload.email,
      firstName: payload.given_name ?? payload.name ?? 'Google',
      lastName: payload.family_name ?? 'User',
      emailVerified: Boolean(payload.email_verified),
      picture: payload.picture,
    };
  }
}
