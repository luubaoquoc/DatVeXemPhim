// src/components/ScrollToTop.jsx
import { useEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

export default function ScrollToTop() {
  const { pathname, hash } = useLocation()
  const navigationType = useNavigationType() // 'POP', 'PUSH', 'REPLACE'

  useEffect(() => {
    // Nếu có hash (#id), React sẽ render xong mới cuộn đúng vị trí,
    // nên ta chờ một chút rồi ép về top để ghi đè hành vi đó.
    const timer = setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'instant', // hoặc 'smooth' nếu bạn muốn
      })

      // Xoá hash khỏi URL để khi quay lại trang không bị giữ vị trí cũ
      if (hash) {
        window.history.replaceState(null, '', pathname)
      }
    }, 100) // chờ 100ms cho render xong DOM

    return () => clearTimeout(timer)
  }, [pathname, navigationType, hash])

  return null
}
