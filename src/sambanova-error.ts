import { z } from 'zod';
import {
  createJsonErrorResponseHandler,
  ResponseHandler,
} from '@ai-sdk/provider-utils';
import { APICallError } from '@ai-sdk/provider';

export const sambanovaErrorDataSchema = z.object({
  error: z.object({
    message: z.string(),
    type: z.string(),
  }),
});

export type SambaNovaErrorData = z.infer<typeof sambanovaErrorDataSchema>;

export const sambanovaFailedResponseHandler: ResponseHandler<APICallError> =
  createJsonErrorResponseHandler({
    errorSchema: sambanovaErrorDataSchema,
    errorToMessage: (data) => data.error.message,
  });
