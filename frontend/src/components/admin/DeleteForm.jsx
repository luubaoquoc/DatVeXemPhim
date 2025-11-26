import React from "react"
import { Trash2Icon } from "lucide-react"
import { useState } from "react"

const DeleteForm = ({ title = "item", itemName = "item", onDelete }) => {
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    try {
      setLoading(true)
      await onDelete()  // gọi hàm delete từ component cha
      setShow(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Nút Delete */}
      <button
        onClick={() => setShow(true)}
        className="p-2 text-red-400 hover:bg-red-500/10 rounded cursor-pointer"
      >
        <Trash2Icon size={18} />
      </button>

      {/* Modal confirm */}
      {show && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-black/90 border border-primary p-6 rounded-lg w-[350px] shadow-lg">
            <h2 className="text-lg font-semibold mb-3">
              Xác nhận xoá <span className="text-lg text-primary ">{title} {itemName}</span>
            </h2>

            <p className="text-gray-300 mb-5">
              Bạn có chắc chắn muốn xoá <span className="text-primary">{title} {itemName}</span> này không?
            </p>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShow(false)}
                className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500 cursor-pointer"
                disabled={loading}
              >
                Hủy
              </button>

              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-500 cursor-pointer"
                disabled={loading}
              >
                {loading ? "Đang xoá..." : "Xoá"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default DeleteForm
