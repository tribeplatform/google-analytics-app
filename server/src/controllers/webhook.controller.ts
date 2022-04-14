import { NextFunction, Request, Response } from 'express';

import { Types } from '@tribeplatform/gql-client';
import { logger } from '@/utils/logger';

const DEFAULT_SETTINGS = {}
// Measurement IDs can either be in the form of (Y = number, X = alphanumeric)
// UA-YYYYY-YYYY or G-XXXXXX for arbitrary amounts of X and Y
const MEASUREMENT_ID_REGEX = /^(UA-\d+-\d+|G-[A-Z0-9]+)$/

class WebhookController {
  public index = async (req: Request, res: Response, next: NextFunction) => {
    const input = req.body;
    try {
      if (input.data?.challenge) {
        return res.json({
          type: 'TEST',
          status: 'SUCCEEDED',
          data: {
            challenge: req.body?.data?.challenge,
          },
        });
      }
      let result: any = {
        type: input.type,
        status: 'SUCCEEDED',
        data: {},
      };

      switch (input.type) {
        case 'GET_SETTINGS':
          result = await this.getSettings(input);
          break;
        case 'UPDATE_SETTINGS':
          result = await this.updateSettings(input);
          break;
        case 'SUBSCRIPTION':
          result = await this.handleSubscription(input);
          break;
      }
      res.status(200).json(result);
    } catch (error) {
      logger.error(error);
      return {
        type: input.type,
        status: 'FAILED',
        data: {},
      };
    }
  };

  /**
   *
   * @param input
   * @returns { type: input.type, status: 'SUCCEEDED', data: {} }
   * TODO: Elaborate on this function
   */
  private async getSettings(input) {
    const currentSettings = input.currentSettings[0]?.settings || {};
    let defaultSettings;
    switch (input.context) {
      case Types.PermissionContext.NETWORK:
        defaultSettings = DEFAULT_SETTINGS;
        break;
      default:
        defaultSettings = {};
    }
    const settings = {
      ...defaultSettings,
      ...currentSettings,
    };
    return {
      type: input.type,
      status: 'SUCCEEDED',
      data: settings,
    };
  }

  /**
   *
   * @param input
   * @returns { type: input.type, status: 'SUCCEEDED', data: {} }
   * TODO: Elaborate on this function
   */
  private async updateSettings(input) {
    if (!input.data.settings?.measurementId) {
      return {
        type: input.type,
        status: 'FAILED',
        errorCode: 'MISSING_PARAMETER',
        errorMessage: `Missing required parameter measurementId.`,
      }
    } else if (!MEASUREMENT_ID_REGEX.test(input.data.settings?.measurementId)) {
      return {
        type: input.type,
        status: 'FAILED',
        errorCode: 'INVALID_PARAMETER',
        errorMessage: `Measurement ID is in an invalid format.`,
      }
    }
    return {
      type: input.type,
      status: 'SUCCEEDED',
      data: { toStore: input.data.settings },
    };
  }

  /**
   *
   * @param input
   * @returns { type: input.type, status: 'SUCCEEDED', data: {} }
   * TODO: Elaborate on this function
   */
  private async handleSubscription(input) {
    return {
      type: input.type,
      status: 'SUCCEEDED',
      data: {},
    };
  }
}

export default WebhookController;
