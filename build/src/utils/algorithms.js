const pagingSkipValue = (page, itemsPerPage) => {
  // Luôn đảm bảo nếu giá trị không hợp lệ thì return về 0
  if (!page || !itemsPerPage) return 0;
  if (page <= 0 || itemsPerPage <= 0) return 0;

  /**
   * Giải thích công thức skip đơn giản:
   * Giả sử mỗi page hiển thị 12 sản phẩm (itemsPerPage = 12)
   *
   * Trường hợp 1: page = 1
   * -> (1 - 1) * 12 = 0 → skip 0 bản ghi
   *
   * Trường hợp 2: page = 2
   * -> (2 - 1) * 12 = 12 → skip 12 bản ghi (tức là bỏ qua 12 bản ghi đầu tiên)
   *
   * Trường hợp 3: page = 5
   * -> (5 - 1) * 12 = 48 → skip 48 bản ghi (bỏ qua 48 bản ghi đầu tiên)
   *
   * Tương tự với các page khác...
   */

  return (page - 1) * itemsPerPage;
};
module.exports = {
  pagingSkipValue
};