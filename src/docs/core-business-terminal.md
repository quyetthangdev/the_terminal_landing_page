# Tài liệu Nghiệp vụ — Hệ thống Order theo Bàn (Table-first)

> Dành cho quản lý và product owner. Cập nhật: 2026-05-27.

---

## 1. Hệ thống là gì?

Đây là nền tảng **quản lý đặt hàng theo bàn** cho mô hình F&B phục vụ tại chỗ. Khác với mô hình thanh toán trước, hệ thống này cho phép khách **gọi món trước, bếp chế biến ngay, thanh toán sau khi dùng xong**. Toàn bộ hoá đơn được quản lý theo bàn — mọi người ngồi cùng bàn đều có thể tự gọi món và gộp chung một bill.

**Điểm khác biệt cốt lõi so với mô hình thông thường:**

|              | Mô hình thông thường       | Mô hình này                     |
| ------------ | -------------------------- | ------------------------------- |
| Thứ tự       | Đặt → Thanh toán → Bếp làm | Đặt → Bếp làm → Thanh toán      |
| Quản lý bill | Theo đơn hàng              | Theo bàn (table session)        |
| QR bàn       | Tĩnh                       | Động — đổi sau mỗi lượt phục vụ |
| Ai gọi món   | 1 người tạo đơn            | Mọi người cùng bàn đều gọi được | //Tương lai sẽ làm, hiện tại nhân viên sẽ ra bàn order dùm

---

## 2. Khái niệm nền tảng

### 2.1 Phiên bàn (Table Session) //tương lai làm

Mỗi khi một nhóm khách mới ngồi vào bàn, hệ thống mở một **phiên bàn** mới. Phiên bàn:

- Tập hợp toàn bộ món đã gọi của tất cả người ngồi cùng bàn
- Tích luỹ bill theo thời gian thực khi có thêm món mới
- Kết thúc khi bàn đó hoàn tất thanh toán
- Sau khi thanh toán xong, phiên mới bắt đầu và QR bàn được làm mới

### 2.2 QR động của bàn //tương lai làm

Mỗi bàn có một mã QR. Mã này **thay đổi sau mỗi lần thanh toán hoàn tất**, đảm bảo:

- Khách của lượt trước không thể vô tình gọi thêm món vào bill lượt sau
- Chỉ khách đang ngồi tại bàn (quét QR hiện tại) mới gọi được vào phiên đang mở
- Nhân viên không cần can thiệp thủ công để reset bàn

---

## 3. Các luồng nghiệp vụ chính

### 3.1 Luồng khách đến và gọi món // tương lai làm 

```
Khách ngồi vào bàn
    │
    ▼
Khách quét QR trên bàn bằng điện thoại
    │  → QR dẫn đến thực đơn của chi nhánh hôm nay
    │  → Phiên bàn mở sẵn (do nhân viên kích hoạt hoặc tự động)
    ▼
Khách chọn món và đặt
    │  → Hệ thống kiểm tra tồn kho
    │  → Áp dụng khuyến mãi tự động (nếu có)
    │  → Món được ghi vào bill của bàn
    ▼
Phiếu bếp được tạo ngay lập tức
    │  → Bếp nhận và bắt đầu chế biến
    │  → Không cần chờ thanh toán
    ▼
Khách khác cùng bàn có thể tiếp tục quét QR và gọi thêm
    │  → Mọi món gọi thêm đều cộng dồn vào bill bàn
```

---

### 3.2 Quản lý bill theo bàn

```
Bill bàn = Tổng hợp tất cả món đã gọi trong phiên hiện tại
    │
    ├─ Hiển thị: danh sách món, số lượng, giá từng món
    ├─ Cập nhật thời gian thực khi có món mới được thêm
    └─ Cho phép áp dụng voucher 
```

**Ai gọi thêm được?**

- Bất kỳ người nào quét đúng QR bàn đang hoạt động
- Mỗi người gọi theo tài khoản cá nhân → hệ thống biết người nào đã order gì //hỏi lại
- Bill cuối vẫn là 1 hoá đơn chung cho bàn

---

### 3.3 Thanh toán cuối bàn / voucher và điểm tích lũy tương lai sẽ làm 

```
Khách / nhân viên yêu cầu thanh toán
    │
    ▼
Hệ thống tổng hợp bill:
    │  → Tổng tiền gốc tất cả món
    │  − Giảm giá khuyến mãi (nếu có)
    │  − Giảm giá voucher (nếu khách nhập mã)
    │  − Dùng điểm tích luỹ (nếu chọn)
    │  = Số tiền cần trả
    ▼
Chọn phương thức thanh toán
    │  (tiền mặt / chuyển khoản / thẻ / điểm / QR)  // hiện tại chỉ áp dụng 2 pttt: tiền mặt và chuyển khoản 
    ▼
Thanh toán thành công
    │  → Hoá đơn chính thức được tạo và in
    │  → Điểm tích luỹ được cộng cho khách (nếu có tài khoản)
    │  → Phiên bàn kết thúc
    │  → QR bàn được làm mới (đổi sang mã mới)
    ▼
Bàn sẵn sàng cho nhóm khách tiếp theo
```

---

### 3.4 Luồng bếp (Kitchen)

```
Khách đặt món → Phiếu bếp được tạo ngay
    │
    ▼
Bếp nhận phiếu theo khu vực (bếp nóng / bếp lạnh / bar…)
    │
    ▼
Đầu bếp bắt đầu: Đang chuẩn bị
    │
    ▼
Món xong: Đánh dấu Hoàn thành
    │
    ▼
Phục vụ mang món ra bàn
```

> Khác với mô hình thanh toán trước: bếp nhận phiếu **ngay khi khách gọi**, không chờ thanh toán. Điều này giúp phục vụ nhanh hơn trong môi trường dine-in.

---

## 4. QR Động — Cơ chế hoạt động

```
[Phiên bàn mới bắt đầu]
    │
    ▼
Hệ thống sinh QR mới cho bàn
    │  → QR chứa mã phiên bàn hiện tại (có thời hạn)
    │  → Hiển thị trên màn hình bàn hoặc in sẵn
    ▼
Khách quét → vào thực đơn và gọi món
    │
    ▼
[Thanh toán hoàn tất]
    │
    ▼
Hệ thống vô hiệu hoá QR cũ
    │
    ▼
Sinh QR mới cho phiên tiếp theo
```

**Tại sao QR phải thay đổi?**

- Ngăn khách lượt trước gọi thêm vào bill lượt sau
- Ngăn người ngoài bàn quét QR cũ để gọi ké
- Mỗi QR chỉ hợp lệ trong 1 phiên bàn duy nhất

---

## 5. Quản lý thực đơn

Tương tự mô hình thông thường:

- Mỗi chi nhánh có thực đơn riêng, cập nhật theo ngày
- Từng món có thể giới hạn số lượng bán trong ngày
- Khi hết tồn kho, món tự động khoá
- Quản lý sao chép thực đơn từ ngày trước

**Phân loại sản phẩm:**
| Loại | Ý nghĩa |
|---|---|
| Thường | Sản phẩm bình thường |
| Combo | Gói nhiều món với giá ưu đãi |
| Giới hạn | Số lượng có giới hạn mỗi ngày |
| Quà tặng | Không tính tiền, dùng cho tặng kèm |
| Top sell | Hiển thị nổi bật trên thực đơn |
| Mới | Gắn nhãn mới ra mắt |

---

## 6. Thanh toán

### 6.1 Các phương thức thanh toán

| Phương thức      | Cách xác nhận                  |
| ---------------- | ------------------------------ |
| Tiền mặt         | Nhân viên xác nhận trực tiếp   |
| Chuyển khoản ACB | Quét QR → ACB xác nhận tự động |
| Thẻ tín dụng     | Xử lý qua cổng thanh toán      | // tương lai khi làm tài khoản cho khách
| Điểm tích luỹ    | Trừ điểm từ tài khoản khách    | // tương lai 
| Tài khoản nội bộ | Trừ số dư nội bộ               | // tương lai 
| QR thanh toán    | Mã QR có thời hạn              | // tương lai 

### 6.2 Tính toán bill bàn 

```
Tổng tiền gốc (cộng tất cả món đã gọi trong phiên) 
    − Giảm giá khuyến mãi                            // tương lai khi làm tài khoản cho khách     
    − Giảm giá voucher (nhập lúc thanh toán)         // tương lai 
    − Điểm tích luỹ (nếu dùng)                       // tương lai 
    = Số tiền bàn cần trả
```

## 7. Voucher & Khuyến mãi //tương lai làm sau

### 7.1 Khuyến mãi (Promotion)

- Áp dụng tự động lên từng món khi khách gọi
- Giá món trên thực đơn đã phản ánh giá sau KM

### 7.2 Voucher (Mã giảm giá)

Áp dụng lúc **thanh toán** (không phải lúc gọi món). Hệ thống kiểm tra:

```
1. Mã còn hạn sử dụng?
2. Còn lượt dùng (tổng và theo từng khách)?
3. Bill bàn đủ giá trị tối thiểu?
4. Sản phẩm trong bill có đủ điều kiện?
    → "Ít nhất 1 món hợp lệ" hoặc "Toàn bộ món hợp lệ"
5. Tính giảm giá:
    → Theo %: Tổng bill × tỷ lệ %
    → Cố định: Trừ thẳng số tiền
```

## 8. Chương trình khách hàng thân thiết // tương lai khi làm tài khoản cho khách   

### 8.1 Tích điểm

- Điểm được cộng sau khi bill bàn thanh toán thành công
- Tích theo giá trị thực tế đã thanh toán (sau giảm giá)

### 8.2 Dùng điểm

- Áp dụng lúc thanh toán — trừ vào tổng bill bàn
- Nếu huỷ bill (Hủy thanh toán) → điểm được hoàn

### 8.3 Thẻ thành viên & Thẻ quà tặng

- Tương tự mô hình thông thường
- Số dư thẻ dùng để thanh toán bill bàn

---

## 9. Quản lý chi nhánh

Mỗi chi nhánh hoạt động độc lập:

| Cấu hình  | Ý nghĩa                          |
| --------- | -------------------------------- |
| Thực đơn  | Menu riêng, theo ngày            |
| Bàn       | Sơ đồ bàn, mỗi bàn có QR động    |
| Khu bếp   | Phân luồng món theo khu chế biến |
| Máy in    | In phiếu bếp và hoá đơn          |
| Nhân viên | Mỗi nhân viên thuộc chi nhánh    |
| Doanh thu | Theo dõi riêng từng chi nhánh    |

---

## 10. Vòng đời phiên bàn

```
[Nhóm khách mới — Nhân viên/hệ thống mở phiên bàn]
    │
    ▼
ĐANG PHỤC VỤ
    │  → Khách quét QR, gọi món bất kỳ lúc nào // hiện tại là nhân viên order dùm 
    │  → Bếp nhận và làm ngay khi có món mới
    │  → Bill bàn cộng dồn theo thời gian thực
    │
    ▼ (khi khách yêu cầu thanh toán)
CHỜ THANH TOÁN
    │  → Tổng kết bill, áp dụng voucher/điểm
    │
    ▼ (thanh toán thành công)
ĐÃ HOÀN TẤT
    │  → Hoá đơn được in
    │  → QR bàn làm mới
    │
    ▼
[Bàn sẵn sàng — Phiên mới có thể bắt đầu]
```

---

## 11. Vòng đời trạng thái từng món (trong phiên bàn)

```
Khách gọi món
    │
    ▼
CHỜ BẾP NHẬN
    │
    ▼
ĐANG CHẾ BIẾN
    │
    ▼
ĐÃ HOÀN THÀNH  ←── Phục vụ mang ra bàn
```

Khách có thể gọi thêm bất kỳ lúc nào trong suốt phiên — mỗi lần gọi tạo ra một loạt món mới đi qua vòng đời này.

---

## 12. Hoá đơn & In ấn

- Hoá đơn được tạo **sau khi thanh toán thành công**
- Nội dung: toàn bộ món trong phiên, ai gọi món nào, giá, giảm giá, tổng tiền
- Có thể in qua máy in nhiệt hoặc xuất PDF
- Phiếu bếp in riêng theo khu — mỗi khu chỉ thấy phần việc của mình

---

## 13. Thông báo

| Sự kiện               | Thông báo đến                          |
| --------------------- | -------------------------------------- |
| Khách gọi món mới     | Bếp (in phiếu / hiển thị màn hình bếp) |
| Món chế biến xong     | Phục vụ (để mang ra bàn)               |
| Thanh toán thành công | Khách (xác nhận), quản lý              |
| Bill bàn cập nhật     | Khách (xem bill realtime)              |

**Kênh gửi:** Push notification, màn hình bếp

---

## 14. Báo cáo & Phân tích

| Báo cáo                      | Nội dung                               |
| ---------------------------- | -------------------------------------- |
| Doanh thu theo ngày          | Tổng bill các bàn trong ngày           |
| Doanh thu theo chi nhánh     | So sánh từng chi nhánh                 | // tương lai 
| Phân tích sản phẩm           | Món gọi nhiều nhất, doanh thu theo món |
| Lịch sử điểm / voucher       | Theo từng khách hàng                   |

---

## 15. Phân quyền hệ thống

| Vai trò             | Quyền                                             |
| ------------------- | ------------------------------------------------- |
| **Admin**           | Toàn quyền                                        |
| **Manager**         | Quản lý chi nhánh: menu, bàn, phiên, doanh thu    |
| **Staff / Cashier** | Mở phiên bàn, xem bill, xử lý thanh toán, huỷ món |
| **Chef**            | Xem và cập nhật trạng thái phiếu bếp              |
| **Customer**        | Quét QR, gọi món, xem bill bàn, thanh toán        |

---

## 16. Tích hợp bên ngoài

| Dịch vụ           | Mục đích kinh doanh                                    |
| ----------------- | ------------------------------------------------------ |
| **Ngân hàng ACB** | Thanh toán chuyển khoản tự động khi khách trả bill bàn |
| **Google Maps**   | Hỗ trợ giao hàng nếu chi nhánh có dịch vụ này          | // có thể trong tương lai
| **Firebase**      | Thông báo đẩy đến bếp, phục vụ, khách                  |
| **Zalo OA**       | Gửi xác nhận bill, chăm sóc sau bữa ăn                 |
| **Email**         | Gửi hoá đơn điện tử                                    |
| **Máy in nhiệt**  | In phiếu bếp và hoá đơn bàn                            |

---

## 17. Tính năng nổi bật

### QR động — Bảo mật phiên bàn

Mỗi phiên bàn có mã QR riêng, hết hiệu lực ngay sau khi thanh toán xong. Đảm bảo chỉ khách đang ngồi đúng bàn, đúng thời điểm mới gọi được.

### Gọi món đồng thời nhiều người

Nhiều khách cùng bàn gọi song song trên điện thoại riêng — bill tự động gộp, không cần truyền tay thực đơn hay chờ nhân viên.

### Bill realtime

Khách theo dõi tổng bill bàn ngay trên điện thoại, thấy từng món được thêm vào và cập nhật giá tức thì.

### Không mất dữ liệu

Mọi thao tác xoá đều là xoá mềm — lịch sử phiên bàn, món gọi, thanh toán được lưu đầy đủ để kiểm toán.

### Bật/tắt tính năng không cần cập nhật hệ thống

Quản trị viên kiểm soát tính năng theo thời gian thực thông qua Feature Flag.
