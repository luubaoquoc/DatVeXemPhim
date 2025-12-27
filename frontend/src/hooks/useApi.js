import { useSelector } from "react-redux";
import axios from "axios";
import { useMemo } from "react";
import store from "../redux/store"; // import store trực tiếp
import { refreshAuth } from "../redux/features/authSlice";

const useApi = (isProtected = false) => {

  // const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const BACKEND_URL = "http://localhost:5000";

  const accessToken = useSelector((state) => state.auth.accessToken)

  // console.log(accessToken);


  const axiosInstance = useMemo(() => {
    const inst = axios.create({
      baseURL: `${BACKEND_URL}/api`,
      withCredentials: true,
    });

    if (isProtected) {
      // attach token
      inst.interceptors.request.use((config) => {
        if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
        return config
      });

      // xử lý 401 và retry sau khi refresh token
      inst.interceptors.response.use(
        (response) => response,
        async (error) => {
          const originalRequest = error.config
          if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true
            try {
              await store.dispatch(refreshAuth()).unwrap()
              const newToken = store.getState().auth.accessToken
              if (newToken) originalRequest.headers.Authorization = `Bearer ${newToken}`
              return inst(originalRequest)
            } catch (err) {
              return Promise.reject(err)
            }
          }
          return Promise.reject(error)
        }
      )
    }

    return inst
  }, [accessToken, isProtected])

  return axiosInstance
}

export default useApi
