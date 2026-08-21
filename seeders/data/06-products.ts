export interface ProductSeed {
  name: string;
  sku: string;
  description: string;
  warrantyDays: number;
  categoryName: string;
  stocks: {
    serialNumber?: string;
    batchNumber?: string;
    quantity: number;
    costPrice: number;
    sellingPrice: number;
    withVat: boolean;
  }[];
}

export const productsData: ProductSeed[] = [
  // 1. Laptops (Serialized items, quantity = 1 per SN)
  {
    name: "Dell XPS 15 (i7-13700H, 16GB, 512GB SSD, RTX 4050)",
    sku: "LAP-DELL-XPS15",
    description: "15.6 inch OLED Display, 13th Gen Intel Core i7.",
    warrantyDays: 365,
    categoryName: "Laptops & Computers",
    stocks: [
      {
        serialNumber: "SN-DELL-9834201",
        quantity: 1,
        costPrice: 1650.0,
        sellingPrice: 1999.0,
        withVat: true,
      },
      {
        serialNumber: "SN-DELL-9834202",
        quantity: 1,
        costPrice: 1650.0,
        sellingPrice: 1999.0,
        withVat: true,
      },
      {
        serialNumber: "SN-DELL-9834203",
        quantity: 1,
        costPrice: 1650.0,
        sellingPrice: 1999.0,
        withVat: true,
      },
    ],
  },
  {
    name: "Apple MacBook Pro 14 (M3 Pro 18GB, 512GB Space Black)",
    sku: "LAP-APL-MBP14-M3",
    description: "Apple M3 Pro chip with 11-core CPU and 14-core GPU.",
    warrantyDays: 365,
    categoryName: "Laptops & Computers",
    stocks: [
      {
        serialNumber: "SN-APL-M3P-4401",
        quantity: 1,
        costPrice: 1750.0,
        sellingPrice: 2099.0,
        withVat: true,
      },
      {
        serialNumber: "SN-APL-M3P-4402",
        quantity: 1,
        costPrice: 1750.0,
        sellingPrice: 2099.0,
        withVat: true,
      },
    ],
  },

  // 2. Storage & RAM (Batch items)
  {
    name: "Samsung 990 PRO 2TB PCIe 4.0 NVMe SSD",
    sku: "SSD-SAM-990P-2TB",
    description: "Read speeds up to 7,450 MB/s, V-NAND TLC.",
    warrantyDays: 1825, // 5 years
    categoryName: "Storage & RAM",
    stocks: [
      {
        batchNumber: "BATCH-SAM-2026Q1",
        quantity: 25,
        costPrice: 130.0,
        sellingPrice: 179.99,
        withVat: true,
      },
    ],
  },
  {
    name: "Kingston Fury Beast 16GB DDR5 5600MHz RAM",
    sku: "RAM-KNG-16GD5-56",
    description: "Desktop gaming memory module with heatsink.",
    warrantyDays: 1095, // 3 years
    categoryName: "Storage & RAM",
    stocks: [
      {
        batchNumber: "BATCH-KNG-2026A",
        quantity: 40,
        costPrice: 42.0,
        sellingPrice: 65.0,
        withVat: false,
      },
    ],
  },

  // 3. Security & Network Cameras
  {
    name: "Hikvision 4K AcuSense Outdoor Dome IP Camera",
    sku: "CAM-HIK-4K-DOME",
    description: "8 MP motorized varifocal dome network camera with ColorVu.",
    warrantyDays: 730, // 2 years
    categoryName: "Network & Security Cameras",
    stocks: [
      {
        serialNumber: "SN-HIK-8891001",
        quantity: 1,
        costPrice: 180.0,
        sellingPrice: 249.0,
        withVat: true,
      },
      {
        serialNumber: "SN-HIK-8891002",
        quantity: 1,
        costPrice: 180.0,
        sellingPrice: 249.0,
        withVat: true,
      },
      {
        batchNumber: "BATCH-HIK-2026",
        quantity: 10,
        costPrice: 180.0,
        sellingPrice: 249.0,
        withVat: true,
      },
    ],
  },

  // 4. Accessories
  {
    name: "Logitech MX Master 3S Wireless Mouse",
    sku: "ACC-LOGI-MX3S",
    description:
      "Quiet clicks, 8K DPI any-surface sensor, MagSpeed scroll wheel.",
    warrantyDays: 365,
    categoryName: "Computer Accessories",
    stocks: [
      {
        batchNumber: "BATCH-LOGI-MX3S",
        quantity: 30,
        costPrice: 68.0,
        sellingPrice: 99.99,
        withVat: true,
      },
    ],
  },

  // 5. Toners
  {
    name: "HP 85A Black Original LaserJet Toner (CE285A)",
    sku: "TON-HP-85A-BLK",
    description: "Standard yield ~1,600 pages for LaserJet P1102 / M1212nf.",
    warrantyDays: 90,
    categoryName: "Printers & Toners",
    stocks: [
      {
        batchNumber: "BATCH-HP-85A-FEB",
        quantity: 50,
        costPrice: 35.0,
        sellingPrice: 55.0,
        withVat: true,
      },
    ],
  },
];
