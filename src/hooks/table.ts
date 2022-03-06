import { h, reactive, Ref, ref, shallowReactive, VNode } from 'vue'

import { DataTableColumn, NButton } from 'naive-ui'
import { TableFooterType, TableHeaderType } from '@/types/components'

export interface TableActionModel {
  label: string
  type: 'default' | 'warning' | 'primary' | 'success' | 'error' | 'info'
  disabled: boolean
  onClick: () => {}
}

interface Table {
  dataList: Array<any>
  bordered: Ref<Boolean>
  selectRows: Array<string | number>
  tableLoading: Ref<boolean>
  tableHeaderRef: Ref<TableHeaderType | null>
  tableFooterRef: Ref<TableFooterType | null>
  tableHeight: Ref<number>
  handleSuccess: (res: any) => Promise<any>
  handleSelectionChange: (tempSelectRows: Array<any>) => void
  useTableColumn: (columns: DataTableColumn[], options: DataTableColumn) => Array<any>
  selectionColumn: { type: 'selection' }
  indexColumn: {
    title: string
    key: string
    width: number
    render: (rowData: any, rowIndex: number) => VNode
  }
}

export const useTableHeight = async function (): Promise<number> {
  const clientHeight = document.querySelector('.main-section')?.clientHeight || 0
  return new Promise((resolve) => {
    setTimeout(() => {
      let tempHeight = 0
      const header = document.getElementById('tableHeaderContainer')
      if (header) {
        console.log(header.clientHeight)

        tempHeight += header.clientHeight
      }
      const footer = document.querySelector('.table-footer-container')
      if (footer) {
        console.log(footer.clientHeight)
        tempHeight += footer.clientHeight
      }
      tempHeight += 20 + 2 // 加是 table-body 上下 10px的间距 和 1px的border
      resolve(clientHeight - tempHeight)
    }, 1000)
  })
}

export const useTable = function (): Table {
  const dataList = shallowReactive([]) as Array<any>
  const selectRows = shallowReactive([]) as Array<any>
  const tableHeaderRef = ref<TableHeaderType | null>(null)
  const tableFooterRef = ref<TableFooterType | null>(null)
  const tableHeight = ref(200)
  const bordered = ref(false)
  const tableLoading = ref(true)
  const handleSuccess = ({ data = [] }): Promise<any> => {
    tableLoading.value = false
    dataList.length = 0
    dataList.push(...data)
    return Promise.resolve(data)
  }
  const handleSelectionChange = (tempSelectRows: Array<any>) => {
    selectRows.length = 0
    selectRows.push(...tempSelectRows)
  }
  return {
    dataList,
    tableHeaderRef,
    tableFooterRef,
    tableHeight,
    bordered,
    selectRows,
    tableLoading,
    handleSuccess,
    handleSelectionChange,
    useTableColumn,
    selectionColumn: {
      type: 'selection',
    },
    indexColumn: useTableIndexColumn(),
  }
}

export const useRenderAction = function (actions: TableActionModel[]) {
  const renderActions = actions.map((it) => {
    return h(
      NButton,
      {
        type: it.type || 'primary',
        size: 'tiny',
        secondary: true,
        round: true,
        disabled: it.disabled,
        onClick: it.onClick,
      },
      {
        default: () => it.label,
      }
    )
  })
  return renderActions
}

export const useRowKey = function (propName: string) {
  return function (rowData: any) {
    return rowData[propName]
  }
}

export const useTableColumn = function (columns: DataTableColumn[], options: DataTableColumn) {
  return columns.map((it) => Object.assign(it, options))
}

export const useTableIndexColumn = function () {
  return {
    title: '序号',
    key: 'index',
    width: 80,
    render: (rowData: any, rowIndex: number) => {
      return h('div', null, { default: () => rowIndex + 1 })
    },
  }
}

export const usePagination = function (callback: () => void) {
  function onChange() {
    callback()
  }
  function onPageSizeChange() {
    callback()
  }
  const paginationInfo = reactive({
    page: 1,
    pageSize: 10,
    showSizePicker: true,
    pageCount: 1,
    pageSizes: [10, 20, 30, 40],
    onChange,
    onPageSizeChange,
    setTotalSize(totalSize: number) {
      paginationInfo.pageCount = Math.ceil(totalSize / paginationInfo.pageSize)
    },
  })
  return paginationInfo
}
