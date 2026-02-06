import { calculateAdler32 } from '@/common/utils/checkSum';
import { getFileInfo } from '@/common/utils/getFileInfo';

import { request } from '../request';
import { FeishuUploadTokenConfig, FIXED_CONFIG } from './config';

export interface UploadResult {
  code: number;
  msg: string;
  data?: {
    file_token: string;
    [key: string]: any;
  };
}

/**
 * 上传文件到飞书多维表格
 * 保持与原RN函数相同的接口
 */
export async function uploadFileToFeishuBitable(
  filePath: string, // 小程序临时文件路径
  fileName: string
): Promise<UploadResult> {
  try {
    // 1. 获取文件信息
    const fileInfo = await getFileInfo(filePath);

    // 2. 计算校验和
    console.log(fileInfo.arrayBuffer);

    const checkSum = calculateAdler32(fileInfo.arrayBuffer);

    console.log(checkSum);

    console.log('准备上传文件到飞书:', {
      fileName,
      fileSize: fileInfo.size,
      filePath,
      parentType: FIXED_CONFIG.parentType,
      parentNode: FIXED_CONFIG.parentNode,
      checkSum,
    });

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

    // 4. 检查响应
    if (res.code !== 0) {
      throw new Error(res.msg || '飞书上传失败');
    }

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
