<script setup lang="ts">
  import { onLaunch, onShow, onHide } from '@dcloudio/uni-app';
  import { logger } from '@/util/logger';

  onLaunch(() => {
    logger.info('App Launch');
  });
  onShow(() => {
    logger.info('App Show');
  });
  onHide(() => {
    logger.info('App Hide');
  });
</script>

<style lang="scss">
  page {
    background: $uni-bg-color-grey;
    color: $uni-text-color;
    font-size: 28rpx;
  }

  button::after {
    border: none;
  }
</style>
