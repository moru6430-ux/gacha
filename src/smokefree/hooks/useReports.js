import { useCallback, useEffect, useState } from 'react'

const KEY = 'smokefree.reports.v1'

function read() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function useReports() {
  const [reports, setReports] = useState(read)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(reports))
    } catch {
      // 存储配额不足或无痕模式：允许失败，页面仍可用
    }
  }, [reports])

  const submit = useCallback((r) => {
    setReports((prev) => [
      { ...r, id: crypto.randomUUID?.() || String(Date.now()), at: Date.now() },
      ...prev,
    ])
  }, [])

  return { reports, submit }
}
