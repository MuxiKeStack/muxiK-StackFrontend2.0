import Taro from '@tarojs/taro';

// 文件信息接口
export interface FileInfo {
  size: number;
  arrayBuffer: ArrayBuffer;
  fileName: string;
  filePath: string;
}

/**
 * 获取小程序文件信息
 */
export async function getFileInfo(filePath: string): Promise<FileInfo> {
  return new Promise((resolve, reject) => {
    Taro.getFileSystemManager().getFileInfo({
      filePath,
      success: (fileRes) => {
        Taro.getFileSystemManager().readFile({
          filePath,
          success: (readRes) => {
            resolve({
              size: fileRes.size,
              arrayBuffer: readRes.data as ArrayBuffer,
              fileName: filePath.split('/').pop() || 'file',
              filePath,
            });
          },
          fail: (readErr) => reject(new Error(`读取失败: ${readErr.errMsg}`)),
        });
      },
      fail: (fileErr) => reject(new Error(`文件不存在: ${fileErr.errMsg}`)),
    });
  });
}
