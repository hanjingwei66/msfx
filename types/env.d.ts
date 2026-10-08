interface ImportMetaEnv extends Readonly<Record<string, string>> {
  /** APP 标题 */
  readonly VITE_APP_TITLE: string;
  /** 服务端口 */
  readonly VITE_PORT: string;
  /** 日志等级 */
  readonly VITE_LOG_LEVEL: string;
  /** 配置文件路径 */
  readonly VITE_PUBLIC_PATH: string;
  /** 处方拆零服务地址 */
  readonly VITE_PRES_URL: string;
  /** 收费拆零服务地址 */
  readonly VITE_CHARGE_URL: string;
  /** 全局请求头 apiKey */
  readonly VITE_API_KEY: string;
  /** 全局请求头 operator */
  readonly VITE_OPERATOR: string;
  /** 全局请求头 deptCode */
  readonly VITE_DEPT_CODE: string;
  /** 全局请求头 langType */
  readonly VITE_LANG_TYPE: string;
  /** 全局请求头 orgCode */
  readonly VITE_ORG_CODE: string;
  /** 全局请求头 districtCode */
  readonly VITE_DISTRICT_CODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
