import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

export type MetaPixelEventName =
  | 'PageView'
  | 'ViewContent'
  | 'AddToCart'
  | 'InitiateCheckout'
  | 'Purchase';

export interface MetaPixelUserData {
  email?: string;
  phone?: string;
  /** End-user IP, forward from the request when available for match quality. */
  clientIpAddress?: string;
  clientUserAgent?: string;
  /** Browser-set _fbp/_fbc cookies, if the frontend can pass them through. */
  fbp?: string;
  fbc?: string;
}

export interface MetaPixelCustomData {
  currency?: string;
  value?: number;
  contentIds?: string[];
  contentType?: string;
  [key: string]: unknown;
}

/**
 * Server-side Meta Conversions API client. This complements (does not
 * replace) the browser-side Pixel snippet — sending the same event from
 * both sides with the same event_id lets Meta deduplicate them, and the
 * server-side copy survives ad blockers / iOS ATT restrictions.
 *
 * Nothing is hard-coded: reads META_PIXEL_ID and
 * META_CONVERSIONS_API_ACCESS_TOKEN from the environment. If either is
 * missing, calls are logged and skipped rather than throwing, so checkout
 * and order flows never fail because analytics isn't configured.
 */
@Injectable()
export class MetaPixelService {
  private readonly logger = new Logger(MetaPixelService.name);
  private readonly pixelId?: string;
  private readonly accessToken?: string;
  private readonly apiVersion: string;
  private readonly testEventCode?: string;

  constructor(private readonly configService: ConfigService) {
    this.pixelId = this.configService.get<string>('META_PIXEL_ID');
    this.accessToken = this.configService.get<string>(
      'META_CONVERSIONS_API_ACCESS_TOKEN',
    );
    this.apiVersion = this.configService.get<string>(
      'META_GRAPH_API_VERSION',
      'v21.0',
    );
    // Set while validating events in Meta Events Manager's "Test Events" tab.
    this.testEventCode = this.configService.get<string>(
      'META_TEST_EVENT_CODE',
    );
  }

  isConfigured(): boolean {
    return Boolean(this.pixelId && this.accessToken);
  }

  /** Get the public pixel ID for the frontend bootstrap snippet. Never expose the access token. */
  getPixelId(): string | undefined {
    return this.pixelId;
  }

  private hash(value?: string): string | undefined {
    if (!value) return undefined;
    return crypto
      .createHash('sha256')
      .update(value.trim().toLowerCase())
      .digest('hex');
  }

  /**
   * Sends one event to the Conversions API. Pass the same `eventId` you use
   * for the client-side fbq('track', ...) call for deduplication.
   */
  async sendEvent(params: {
    eventName: MetaPixelEventName;
    eventId?: string;
    eventSourceUrl?: string;
    userData?: MetaPixelUserData;
    customData?: MetaPixelCustomData;
  }): Promise<void> {
    if (!this.isConfigured()) {
      this.logger.debug(
        `Meta Pixel not configured — skipping ${params.eventName} event`,
      );
      return;
    }

    const body = {
      data: [
        {
          event_name: params.eventName,
          event_time: Math.floor(Date.now() / 1000),
          event_id: params.eventId,
          event_source_url: params.eventSourceUrl,
          action_source: 'website',
          user_data: {
            em: this.hash(params.userData?.email),
            ph: this.hash(params.userData?.phone),
            client_ip_address: params.userData?.clientIpAddress,
            client_user_agent: params.userData?.clientUserAgent,
            fbp: params.userData?.fbp,
            fbc: params.userData?.fbc,
          },
          custom_data: params.customData,
        },
      ],
      ...(this.testEventCode ? { test_event_code: this.testEventCode } : {}),
    };

    try {
      const response = await fetch(
        `https://graph.facebook.com/${this.apiVersion}/${this.pixelId}/events?access_token=${this.accessToken}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        },
      );

      if (!response.ok) {
        const text = await response.text();
        this.logger.warn(
          `Meta Conversions API request failed (${response.status}): ${text}`,
        );
      }
    } catch (error) {
      // Analytics must never break the request that triggered it.
      this.logger.warn(`Meta Conversions API request errored: ${error}`);
    }
  }
}
