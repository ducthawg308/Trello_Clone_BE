export const pagingSkipValue = (page, itemsPerPage) => {
  // Luôn đảm bảo giá trị không hợp lệ thì return về 0 hết
  if (!page || !itemsPerPage) return 0
  if (page <= 0 || itemsPerPage <= 0) return 0

  return (page - 1) * itemsPerPage
}