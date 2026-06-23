import { Upload, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';

const { Dragger } = Upload;

interface FileUploaderProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  accept?: string;
  maxSizeMB?: number;
}

export const FileUploader = ({
  onFileSelect,
  selectedFile,
  accept = '.xlsx, .xls',
  maxSizeMB = 5,
}: FileUploaderProps) => {
  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    accept,
    beforeUpload: (file) => {
      const isLtMax = file.size / 1024 / 1024 < maxSizeMB;
      if (!isLtMax) {
        message.error(`Dung lượng file tải lên phải nhỏ hơn ${maxSizeMB}MB!`);
        return Upload.LIST_IGNORE;
      }
      onFileSelect(file);
      return false; // Prevent auto upload
    },
    onRemove: () => {
      onFileSelect(null);
    },
    fileList: selectedFile
      ? [
          {
            uid: '-1',
            name: selectedFile.name,
            status: 'done',
            size: selectedFile.size,
            type: selectedFile.type,
          },
        ]
      : [],
  };

  return (
    <div className="border border-dashed border-slate-200 rounded-xl overflow-hidden bg-slate-50/50 p-2 hover:bg-slate-50 transition-colors">
      <Dragger {...uploadProps}>
        <p className="ant-upload-drag-icon text-indigo-500/80 mb-2">
          <InboxOutlined className="text-4xl" />
        </p>
        <p className="ant-upload-text text-slate-700 font-semibold text-sm">
          Kéo thả file Excel vào đây hoặc nhấp để chọn
        </p>
        <p className="ant-upload-hint text-slate-400 text-xs mt-1">
          Chấp nhận định dạng file: {accept}. Kích thước tối đa {maxSizeMB}MB.
        </p>
      </Dragger>
    </div>
  );
};

export default FileUploader;
