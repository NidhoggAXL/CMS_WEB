import xlRequest from "../.."

export interface GoodsQuery {
  offset?: number
  size?: number
  name?: string
  category_id?: number | string
  minPrice?: number | string
  maxPrice?: number | string
}

export function getGoodsListData(query: GoodsQuery = {}) {
  return xlRequest.get({
    url: "/goods/list",
    params: query
  })
}

export function getAllGoodsData() {
  return xlRequest.get({
    url: "/goods/all"
  })
}

export function createGoodsData(data: {
  name: string
  category_id: number
  price: number
  stock: number
  description: string
  image: string
}) {
  return xlRequest.post({
    url: "/goods",
    data
  })
}

export function updateGoodsData(
  id: number,
  data: {
    name: string
    category_id: number
    price: number
    stock: number
    description: string
    image: string
  }
) {
  return xlRequest.patch({
    url: `/goods/${id}`,
    data
  })
}

export function deleteGoodsData(id: number) {
  return xlRequest.delete({
    url: `/goods/${id}`
  })
}
