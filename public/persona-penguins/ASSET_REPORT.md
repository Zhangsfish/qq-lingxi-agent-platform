# QQ 灵犀 16 型企鹅人格素材资产报告

## 1. 输入源图 / 源素材

- 用户确认源图：`C:\Users\Zhang S\Desktop\15517e82-c243-41bc-be31-db42e734ad34.png`
- 项目内保留源图：`assets/mbti_penguin_grid.png`
- 源图尺寸：`1055 x 1491 px`
- 固定裁切参数：四列边界为 `15-280`、`258-523`、`500-765`、`765-1030`，每列宽度均为 `265 px`；行参数为 `top=220`、`cellHeight=310`、`gapY=-5`。
- 头像去标签处理：统一从固定格底部裁去 `65 px` 后生成 `512 x 512 px` 头像。

## 2. 输出目录

- `public/persona-penguins/avatar/`
- `public/persona-penguins/with-label/`
- `public/persona-penguins/result-hero/`
- `public/persona-penguins/preview/`
- `public/persona-penguins/persona_penguin_manifest.json`

## 3. Avatar 头像版

- 数量：`16` 张
- 尺寸：全部为 `512 x 512 px`
- 背景：统一白底
- 标签：已移除底部 MBTI 标签

## 4. With-Label 标签版

- 数量：`16` 张
- 尺寸：全部为 `512 x 580 px`
- 标签：保留源图 MBTI 标签

## 5. Result-Hero 结果页主视觉版

- 数量：`16` 张
- 尺寸：全部为 `1200 x 640 px`
- 布局：左侧角色白色面板，右侧浅色留白及轻装饰，不包含长文案或中文标题。

## 6. Manifest

- 文件：`persona_penguin_manifest.json`
- 条目数：`16`
- 字段：类型、显示名、企鹅名、短标题、一句话文案、三类图片路径及强调色。

## 7. Contact Sheets

- `preview/avatar_contact_sheet.png`
- `preview/with_label_contact_sheet.png`
- `preview/result_hero_contact_sheet.png`
- 附加审查过程图：`preview/crop_grid_preview.png`

## 8. 裁切检查

- 未发现企鹅主体或原始标签被明显截断的问题。
- 为同时保留 `ENTP` 的伸手动作与 `ESTJ` 的扩音器，采用了用户确认的等宽重叠边界；个别相邻图边缘可能包含极少量邻格蓝色装饰/配件边缘，这是当前固定等宽裁切的已知取舍。

## 9. 未使用文件

- 无未使用的正式素材文件。
- `crop_grid_preview.png` 为人工确认和裁切追溯用审查文件，不供最终页面展示使用。
