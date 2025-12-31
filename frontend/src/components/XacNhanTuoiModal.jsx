import React from 'react'

const XacNhanTuoiModal = ({ doTuoi, ageMessage, setShowAgeModal, handleConfirm }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-black/80 text-black rounded-lg p-6 w-[90%] max-w-md mx-auto border border-primary">
        <p className='text-lg font-semibold mb-3 text-center text-white'>
          <span className='border p-2 rounded bg-primary/30'>{doTuoi}</span>
        </p>
        <h3 className="text-xl font-semibold mb-3 text-white text-center">
          Xác nhận mua vé cho cho người đủ tuổi !
        </h3>

        <p className="text-sm text-gray-300 mb-5">
          {ageMessage}
        </p>

        <div className="flex justify-center gap-3">
          <button
            onClick={() => setShowAgeModal(false)}
            className="px-4 py-2 border rounded bg-gray-400 hover:bg-gray-100 cursor-pointer"
          >
            Từ chối
          </button>

          <button
            onClick={() => {
              setShowAgeModal(false)
              handleConfirm()
            }}
            className="px-4 py-2 bg-primary-dull text-white rounded hover:bg-primary cursor-pointer"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  )
}

export default XacNhanTuoiModal
