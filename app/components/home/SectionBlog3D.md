# SectionBlog3D 設計文件

對應檔案：`app/components/home/SectionBlog3D.vue`  
原始參考：`pure-css-3d-animated-carousel`（純 CSS 3D 輪播）

---

## 1. 幾何原理

### translateZ 公式推導（apothem）

N 張卡片均勻排在正 N 邊形各邊上，每張卡片就是多邊形的「一條邊」。圓心到邊中點的垂直距離稱為 **apothem（邊心距）**，即 translateZ 推的距離：

```
R = (w/2 + gap) / tan(π/N)
  = (0.5*w + 0.5em) / tan(0.5 * arc/gn)
```

每張卡擺位：先繞 Y 軸旋轉到角度位置，再沿 local Z 推出 R：

```css
transform: rotatey(offset + i * ba) translatez(-R); /* 負值 = 凸面 */
```

### 凸面 vs 凹面（translateZ 正負）

|              | 凸面 `translateZ(-R)`（目前） | 凹面 `translateZ(+R)`  |
| ------------ | ----------------------------- | ---------------------- |
| 卡片正面朝向 | 朝外，面向觀眾                | 朝內，背對觀眾         |
| 觀眾視角     | 旋轉木馬（看圓柱外壁）        | 站在圓柱內往外看       |
| 前方卡片     | 在 180° 位置、最近、最大      | 在 0° 位置、最近、最大 |
| 裁切風險     | 無                            | 近裁切面容易裁掉卡片   |

**為何凹面容易裁切**：`+R` 時前方卡片 z = +R ≈ 31.7em，而 `perspective: 22em`，卡片衝過透視焦點，scale 爆大（≈3×），超出 scene 高度被裁掉。凹面需要 `perspective >> R`（至少 3 倍以上）。

### 目前的視覺體驗描述

> 「人正在圓心，從內到外看到多邊形的邊長在轉動。」

這個感受的成因：`perspective: 22em` 的焦距比圓柱半徑（≈31.7em）還短，觀眾的虛擬相機已深入圓柱內部，雖然程式碼是凸面（`translateZ(-R)`），視覺上已接近站在圓柱裡往外看的感覺。

---

## 2. 原始 source 參數對照表

| 項目            | 原始參考值      | 目前元件值                          | 對應 prop / CSS      |
| --------------- | --------------- | ----------------------------------- | -------------------- |
| 卡片數 N        | `12`            | `displayCount=6`（首頁）            | `displayCount`       |
| 卡片寬 `--w`    | `17.5em`        | `16em` 動態（clamp 14–22em）        | `cardWidth` computed |
| 旋轉週期        | `32s`           | `40s`                               | `spinDuration`       |
| 長寬比          | `7 / 10`        | `7 / 10`（未改）                    | `.card aspect-ratio` |
| translateZ 方向 | 凸面（負值）    | 凸面（負值，未改）                  | `translatez(-R)`     |
| perspective     | 無明確值        | `22em`                              | `.scene perspective` |
| 可見扇角        | 360°（全圓）    | `arc=360`                           | `arc` prop           |
| 幾何卡片數      | = N（無此概念） | `geometryCount=null`（首頁用 `12`） | `geometryCount`      |
| 側邊淡出遮罩    | `18%–82%`       | `18%–82%`（未改）                   | `.scene mask`        |

---

## 3. 設計決策 Reasoning Chain

**`displayCount 6` + `geometryCount 12`（首頁）**  
只渲染 6 張精選文章，但圓柱半徑維持 12 張的大圓柱手感。原理：`--n`（角度間距）用實際卡片數填滿 360°；`--gn`（幾何基準）固定用 12 計算 apothem，讓圓柱半徑不隨卡片數縮水。

**`perspective: 22em`（從無明確值調整）**  
設為接近圓柱半徑量級，讓近大遠小的差距更戲劇化。前方卡片明顯比側面大。

**`cardWidth` 動態化（16em 起）**  
當實際抓到的文章數 `n < displayCount` 時自動加寬，防止圓柱出現空缺。  
公式：`w = clamp(14em, 16 + (displayCount - n) * 1.2, 22em)`

**`geometryCount` 解耦**  
把「渲染密度」與「幾何尺度」分開。`--ba = arc/n`（卡片均分整圈）；`--geo-ba = arc/gn`（半徑基準用 gn）。

---

## 4. 如何重置回原始效果

### Props 層

```vue
<HomeSectionBlog3D
  :display-count="12"
  :spin-duration="32"
  :radius="null"
  :arc="360"
  :geometry-count="null"
/>
```

### CSS 層（需手動改 SectionBlog3D.vue）

```css
/* 卡片寬：原始 17.5em，目前動態算出 16em */
.a3d {
  --w: 17.5em;
}

/* 透視：原始無強透視，調大以還原平緩感 */
.scene {
  perspective: 80em;
}
```

---

## 5. 參數速查

| Prop            | 預設                    | 效果         | 調整方向             |
| --------------- | ----------------------- | ------------ | -------------------- |
| `displayCount`  | `8`                     | 渲染卡片數   | 越少 → 每張越大      |
| `geometryCount` | `null`（=displayCount） | 圓柱幾何基準 | 設 12 保留大圓柱手感 |
| `spinDuration`  | `40`                    | 旋轉一圈秒數 | 越大越慢             |
| `radius`        | `null`（自動）          | 圓柱半徑 em  | 越小越彎、越大越平   |
| `arc`           | `360`                   | 可見扇角 deg | 180 = 只鋪前半弧     |
| `titleFontSize` | `"2rem"`                | 卡片標題字級 | —                    |

**perspective 與 radius 的關係**：`perspective / radius` 越小，透視越誇張（正面卡越大）。目前 `perspective≈22em`、`radius≈31.7em`，比值約 0.7，透視感偏強。調大 perspective → 卡片大小趨向一致；調小 → 更戲劇化。
