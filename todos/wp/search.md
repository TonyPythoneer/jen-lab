這份 API 規格文件是基於 WordPress REST API v2 標準所撰寫，方便你作為 Backend 使用。
https://www.google.com/search?q=Jenliu.com.au 文章搜尋 API 規格書
1. 基礎資訊
• Base URL: https://jenliu.com.au/wp-json/wp/v2
• Endpoint: /posts
• Method: GET
• Content-Type: application/json
2. 查詢參數 (Query Parameters)
搜尋與分頁 (Search & Pagination)
參數名稱	類型	預設值	說明
search	string	-	關鍵字搜尋。比對文章標題、內容與摘要。
page	integer	1	指定請求的頁碼。
per_page	integer	10	每頁回傳筆數，上限為 100。
offset	integer	-	跳過前 N 筆結果。使用此參數會忽略 page。
排序 (Ordering)
參數名稱	類型	預設值	說明
orderby	string	date	排序基準。可選：date, relevance (搜尋時建議), id, include, title, slug, modified。
order	string	desc	排序方向。asc (升冪)、desc (降冪)。
篩選 (Filtering)
參數名稱	類型	說明
categories	array	包含特定分類 ID 的文章（多筆以逗號分隔）。
categories_exclude	array	排除特定分類 ID。
tags	array	包含特定標籤 ID 的文章。
tags_exclude	array	排除特定標籤 ID。
author	array	篩選特定作者 ID。
slug	string	根據 URL 代稱搜尋精確的文章。
after	string	限制日期之後的文章 (ISO8601, e.g., 2024-01-01T00:00:00)。
before	string	限制日期之前的文章。
sticky	boolean	是否只顯示置頂文章。
效能與格式 (Optimization)
參數名稱	類型	說明
_fields	array	欄位過濾。僅回傳指定欄位以節省頻寬。例如：_fields=id,title,link。
_embed	boolean	嵌入關聯資料。會額外包含作者資訊、分類標籤、精選圖片網址等。
3. 請求範例
場景 A：基礎關鍵字搜尋（包含圖片與分類）
GET /posts?search=旅拍&_embed

場景 B：高性能清單模式（僅取 ID、標題、連結）
GET /posts?search=美食&_fields=id,title,link&per_page=5

場景 C：進階複合查詢
GET /posts?search=教學&categories=12&orderby=relevance&per_page=20

4. 回傳 Header (重要資訊)
當你發送請求後，Response Header 會包含分頁資訊，這對於前端實作分頁按鈕很有用：
• X-WP-Total: 匹配搜尋條件的文章總數。
• X-WP-TotalPages: 總頁數。
5. 常用欄位對照 (Response Body)
若使用 _embed 參數，常用資訊路徑如下：
• 文章標題: title.rendered
• 文章內容: content.rendered
• 精選圖片網址: _embedded['wp:featuredmedia'][0].source_url
• 分類名稱: _embedded['wp:term'][0] (陣列)
