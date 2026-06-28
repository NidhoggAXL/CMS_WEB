import xlRequest from "../.."

export function getCategoryListData() {
  return xlRequest.get({
    url: "/categories/list"
  })
}

export function createCategoryData(data: { name: string; parent_id: number; sort: number }) {
  return xlRequest.post({
    url: "/categories",
    data
  })
}

export function updateCategoryData(id: number, data: { name: string; parent_id: number; sort: number }) {
  return xlRequest.patch({
    url: `/categories/${id}`,
    data
  })
}

export function deleteCategoryData(id: number) {
  return xlRequest.delete({
    url: `/categories/${id}`
  })
}
