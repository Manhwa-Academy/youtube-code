export const STATUS_MAP = {
  ready: "Sẵn sàng",
  preparing: "Đang chuẩn bị",
  processing: "Đang xử lý",
  errored: "Lỗi",
} as const;

export const VISIBILITY_MAP = {
  public: "Công khai",
  private: "Riêng tư",
} as const;

export const TRACK_STATUS_MAP = {
  ready: "Sẵn sàng",
  preparing: "Đang chuẩn bị",
  processing: "Đang xử lý",
  errored: "Lỗi",
  no_subtitles: "Không có phụ đề",
} as const;
