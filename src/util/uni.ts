type ShowToastOptions = Omit<UniApp.ShowToastOptions, 'title'>;
type ShowModalOptions = Omit<UniApp.ShowModalOptions, 'content'>;

/**
 * 显示消息提示框
 *
 * @param title - 提示的内容
 * @param options - 提示框 {@link https://uniapp.dcloud.net.cn/api/ui/prompt.html#showtoast | 配置项}
 * @example
 * 使用示例：
 * ```
 * showToast('hello world');
 * ```
 */
export function showToast(title: string, options?: ShowToastOptions) {
  return uni.showToast({
    title,
    icon: 'none',
    ...options,
  });
}

/**
 * 显示模态弹窗
 *
 * @param content - 提示的内容
 * @param options - 弹窗 {@link https://uniapp.dcloud.net.cn/api/ui/prompt.html#showmodal | 配置项}
 * @example
 * 使用示例：
 * ```
 * showModal('hello world');
 * ```
 */
export function showModal(content: string, options?: ShowModalOptions) {
  return uni.showModal({
    content,
    title: '提示',
    ...options,
  });
}
