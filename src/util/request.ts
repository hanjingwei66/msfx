import { createGlobalHeaders } from '@/config/headers';
import {
  getService,
  getServiceBaseURL,
  serviceDefinitions,
  type ServiceKey,
} from '@/config/services';

export interface RequestOptions {
  data?: UniNamespace.RequestOptions['data'];
  header?: Record<string, string>;
  timeout?: number;
  /** 为 true 时失败不弹提示 */
  silent?: boolean;
}

export class HttpError extends Error {
  code?: number | string;
  statusCode?: number;

  constructor(message: string, extra?: { code?: number | string; statusCode?: number }) {
    super(message);
    this.name = 'HttpError';
    this.code = extra?.code;
    this.statusCode = extra?.statusCode;
  }
}

export interface ServiceClient {
  get<T>(url: string, options?: RequestOptions): Promise<T>;
  post<T>(url: string, options?: RequestOptions): Promise<T>;
  put<T>(url: string, options?: RequestOptions): Promise<T>;
  delete<T>(url: string, options?: RequestOptions): Promise<T>;
}

/**
 * 业务成功码。智业一类院内接口常见 0 / 200 / 00000，不一致时只改这里。
 */
const SUCCESS_CODES = new Set(['0', '200', '00000']);

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

function isSuccessCode(code: unknown): boolean {
  return SUCCESS_CODES.has(String(code));
}

function toast(message: string) {
  uni.showToast({
    title: message.slice(0, 40) || '请求失败',
    icon: 'none',
  });
}

function resolveErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  if (typeof error === 'object' && error && 'errMsg' in error) {
    const errMsg = String((error as { errMsg: string }).errMsg);
    if (errMsg.includes('timeout')) {
      return '请求超时';
    }
    return '网络异常';
  }
  return '网络异常';
}

function joinURL(base: string, url: string): string {
  if (/^https?:\/\//.test(url)) {
    return url;
  }
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${base}${path}`;
}

function unwrap<T>(body: unknown, statusCode: number): T {
  const prefix = Math.floor(statusCode / 100);
  if (body == null || typeof body !== 'object') {
    if (prefix === 2) {
      return body as T;
    }
    throw new HttpError(`请求失败（${statusCode}）`, { statusCode });
  }

  const record = body as Record<string, unknown>;
  const code = record.code;
  const message = String(record.message || record.msg || `请求失败（${statusCode}）`);

  if (prefix !== 2) {
    throw new HttpError(message, {
      statusCode,
      code: typeof code === 'number' || typeof code === 'string' ? code : undefined,
    });
  }

  if (code === undefined) {
    return body as T;
  }

  if (!isSuccessCode(code)) {
    throw new HttpError(message, {
      code: code as number | string,
      statusCode,
    });
  }

  if ('data' in record) {
    return record.data as T;
  }
  return body as T;
}

async function request<T>(
  service: ServiceKey,
  method: HttpMethod,
  url: string,
  options: RequestOptions = {},
): Promise<T> {
  const baseURL = getServiceBaseURL(service);
  if (!baseURL) {
    const message = `未配置 ${getService(service).envKey}`;
    if (!options.silent) {
      toast(message);
    }
    throw new HttpError(message);
  }

  const header: Record<string, string> = {
    ...createGlobalHeaders(),
    ...options.header,
  };

  try {
    const response = await uni.request({
      method,
      url: joinURL(baseURL, url),
      data: options.data,
      header,
      timeout: options.timeout ?? 30000,
    });
    return unwrap<T>(response.data, response.statusCode);
  } catch (error) {
    const httpError = error instanceof HttpError ? error : new HttpError(resolveErrorMessage(error));
    if (!options.silent && httpError.message) {
      toast(httpError.message);
    }
    throw httpError;
  }
}

export function createServiceClient(service: ServiceKey): ServiceClient {
  return {
    get: <T>(url: string, options?: RequestOptions) => request<T>(service, 'GET', url, options),
    post: <T>(url: string, options?: RequestOptions) => request<T>(service, 'POST', url, options),
    put: <T>(url: string, options?: RequestOptions) => request<T>(service, 'PUT', url, options),
    delete: <T>(url: string, options?: RequestOptions) => request<T>(service, 'DELETE', url, options),
  };
}

/** 按服务名取客户端。新增服务并登记后，这里会自动带上。 */
export const http = Object.fromEntries(
  serviceDefinitions.map(item => [item.key, createServiceClient(item.key)]),
) as { [K in ServiceKey]: ServiceClient };
