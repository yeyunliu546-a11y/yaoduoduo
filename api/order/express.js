import request from '@/utils/request/request.js'

const api = {
  listTrack: '/api/Order/ListTrack',
  latestTrack: '/api/Order/GetLasetTrack'
}

export function ListTrack(params = {}, header = {}) {
  return request.get(api.listTrack, params, header)
}

export function GetLasetTrack(params = {}, header = {}) {
  return request.get(api.latestTrack, params, header)
}

export const listTrack = ListTrack
export const getLatestTrack = GetLasetTrack
