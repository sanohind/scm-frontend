# Driver Info Feature - Implementation Summary

## Overview
Fitur ini menambahkan inputan **driver name** dan **plat number** pada halaman delivery note detail untuk role **Supplier Warehouse (role 7)**.

## Changes Made

### 1. Database Migration
**File:** `database/migrations/2025_10_06_100300_add_driver_info_to_dn_header_table.php`

Menambahkan 2 kolom baru pada tabel `dn_header`:
- `driver_name` (VARCHAR 255, nullable)
- `plat_number` (VARCHAR 50, nullable)

**Cara menjalankan migration:**
```bash
php artisan migrate
```

### 2. Model Update
**File:** `app/Models/DeliveryNote/DnHeader.php`

Menambahkan field `driver_name` dan `plat_number` ke dalam array `$fillable` agar dapat di-mass assign.

### 3. Controller Update
**File:** `app/Http/Controllers/Api/V1/DeliveryNote/DnHeaderController.php`

Menambahkan method baru:
- `updateDriverInfo(UpdateDriverInfoRequest $request)` - Method untuk update driver name dan plat number

### 4. Request Validation
**File:** `app/Http/Requests/DeliveryNote/UpdateDriverInfoRequest.php` (NEW)

Request validation untuk update driver info dengan rules:
- `no_dn`: required, string, must exist in dn_header table
- `driver_name`: nullable, string, max 255 characters
- `plat_number`: nullable, string, max 50 characters

**Authorization:** Hanya role 7 (Supplier Warehouse) dan role 9 (Super User) yang dapat mengakses.

### 5. Resource Update
**File:** `app/Http/Resources/DeliveryNote/DnDetailListResource.php`

Menambahkan field `driver_name` dan `plat_number` pada response API saat get detail delivery note.

### 6. Routes Update
**File:** `routes/api.php`

Menambahkan route baru untuk supplier warehouse:
```php
Route::put('dn/update-driver-info', [DnHeaderController::class, 'updateDriverInfo']);
```

**Full endpoint:** `PUT /api/supplier-warehouse/dn/update-driver-info`

### 7. Test Cases
**File:** `test_api_cases.md`

Menambahkan 5 test cases baru:
- Test Case 11: Get Delivery Note Detail with Driver Info
- Test Case 12: Update Driver Info (Success)
- Test Case 13: Update Driver Info - Validation Error
- Test Case 14: Update Driver Info - DN Not Found
- Test Case 15: Update Driver Info - Unauthorized Role

## API Endpoints

### 1. Get Delivery Note Detail (Updated)
**Endpoint:** `GET /api/supplier-warehouse/dn/detail/{no_dn}`

**Response includes:**
```json
{
    "status": true,
    "message": "Display List DN Detail Successfully",
    "data": {
        "no_dn": "DN-2024-001",
        "po_no": "PO-2024-001",
        "plan_delivery_date": "2024-01-15 10:00",
        "driver_name": "John Doe",
        "plat_number": "B 1234 XYZ",
        "confirm_update_at": "2024-01-15T10:30:00Z",
        "confirm_at": {...},
        "detail": [...]
    }
}
```

### 2. Update Driver Info (NEW)
**Endpoint:** `PUT /api/supplier-warehouse/dn/update-driver-info`

**Request:**
```json
{
    "no_dn": "DN-2024-001",
    "driver_name": "John Doe",
    "plat_number": "B 1234 XYZ"
}
```

**Response:**
```json
{
    "status": true,
    "message": "Driver information updated successfully",
    "data": {
        "no_dn": "DN-2024-001",
        "driver_name": "John Doe",
        "plat_number": "B 1234 XYZ"
    }
}
```

## Testing Instructions

### 1. Run Migration
```bash
php artisan migrate
```

### 2. Test API Endpoints

#### Test Update Driver Info
```bash
curl -X PUT http://localhost:8000/api/supplier-warehouse/dn/update-driver-info \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "no_dn": "DN-2024-001",
    "driver_name": "John Doe",
    "plat_number": "B 1234 XYZ"
  }'
```

#### Test Get DN Detail
```bash
curl -X GET http://localhost:8000/api/supplier-warehouse/dn/detail/DN-2024-001 \
  -H "Authorization: Bearer {token}" \
  -H "Accept: application/json"
```

## Security & Authorization

- Hanya **Supplier Warehouse (role 7)** dan **Super User (role 9)** yang dapat mengupdate driver info
- Field `driver_name` dan `plat_number` bersifat **nullable** (opsional)
- Validasi dilakukan untuk memastikan `no_dn` ada di database

## Database Schema

### Table: dn_header
```sql
ALTER TABLE dn_header 
ADD COLUMN driver_name VARCHAR(255) NULL AFTER packing_slip,
ADD COLUMN plat_number VARCHAR(50) NULL AFTER driver_name;
```

## Notes

1. Field driver_name dan plat_number bersifat **opsional** (nullable)
2. Fitur ini **hanya untuk role Supplier Warehouse (7)**
3. Data driver dapat diupdate kapan saja sebelum delivery note di-close
4. Tidak ada validasi khusus untuk format plat number (bisa disesuaikan jika diperlukan)

## Files Modified/Created

### Created:
1. `database/migrations/2025_10_06_100300_add_driver_info_to_dn_header_table.php`
2. `app/Http/Requests/DeliveryNote/UpdateDriverInfoRequest.php`

### Modified:
1. `app/Models/DeliveryNote/DnHeader.php`
2. `app/Http/Controllers/Api/V1/DeliveryNote/DnHeaderController.php`
3. `app/Http/Resources/DeliveryNote/DnDetailListResource.php`
4. `routes/api.php`
5. `test_api_cases.md`

## Rollback Instructions

Jika perlu rollback migration:
```bash
php artisan migrate:rollback --step=1
```

---

**Created:** 2025-10-06
**Author:** Development Team
**Feature:** Driver Info for Delivery Note (Supplier Warehouse)
