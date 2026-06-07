import { calculateAdler32, getFileInfo } from '@/common/utils';

import { request } from '../..';
import { FeishuUploadTokenConfig, FIXED_CONFIG } from './config';

export interface UploadResult {
  code: number;
  msg: string;
  data?: {
    file_token: string;
    [key: string]: any;
  };
}

export async function uploadFileToFeishuBitable(
  filePath: string,
  fileName: string
): Promise<UploadResult> {
  try {
    const fileInfo = await getFileInfo(filePath);

    const checkSum = calculateAdler32(fileInfo.arrayBuffer);

    const res = (await request.post(
      'https://open.feishu.cn/open-apis/drive/v1/medias/upload_all',
      {
        file_name: fileName,
        parent_type: FIXED_CONFIG.parentType,
        parent_node: FIXED_CONFIG.parentNode,
        size: fileInfo.size.toString(),
        checksum: checkSum,
      },
      {
        upload: {
          filePath,
          fileFieldName: 'file',
        },
        tokenConfig: FeishuUploadTokenConfig,
      }
    )) as UploadResult;

    return res;
  } catch (error: any) {
    console.error('飞书上传失败:', {
      message: error.message,
      fileName,
      error,
    });

    throw error;
  }
}
