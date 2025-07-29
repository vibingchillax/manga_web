// Ideally we'd use $fetch but there's no parsing of qs
import axios, { type AxiosRequestConfig } from 'axios'

const axiosInstance = axios.create({
  baseURL: 'https://api.mangadex.org',
})

axiosInstance.interceptors.response.use(
  response => response.data,
  error => Promise.reject(error)
)

export function axiosFetch<T>(config: AxiosRequestConfig): Promise<T> {
  return axiosInstance(config)
}