import { Table, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { TableProps } from 'antd';

interface DataTableProps<T> extends Omit<TableProps<T>, 'dataSource' | 'columns'> {
  dataSource: T[];
  columns: any[];
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  searchValue?: string;
  pageSize?: number;
}

export function DataTable<T extends object>({
  dataSource,
  columns,
  searchPlaceholder = 'Tìm kiếm...',
  onSearch,
  searchValue,
  pageSize = 10,
  loading,
  ...rest
}: DataTableProps<T>) {
  return (
    <div className="space-y-4">
      {onSearch !== undefined && (
        <div className="max-w-sm">
          <Input
            placeholder={searchPlaceholder}
            prefix={<SearchOutlined className="text-slate-400" />}
            value={searchValue}
            onChange={(e) => onSearch(e.target.value)}
            allowClear
            className="rounded-lg py-2 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      )}
      <Table
        dataSource={dataSource}
        columns={columns}
        loading={loading}
        pagination={
          rest.pagination !== false
            ? {
                pageSize,
                showSizeChanger: true,
                className: 'pt-4',
                ...rest.pagination,
              }
            : false
        }
        scroll={{ x: 'max-content', ...rest.scroll }}
        className="border border-slate-100 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm bg-white dark:bg-zinc-900"
        rowClassName={() => 'hover:bg-slate-50/50 transition-colors'}
        {...rest}
      />
    </div>
  );
}

export default DataTable;
