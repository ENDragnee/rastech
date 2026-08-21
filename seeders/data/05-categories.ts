export interface CategorySeed {
  name: string;
  description: string;
}

export const categoriesData: CategorySeed[] = [
  {
    name: "Laptops & Computers",
    description:
      "Business and gaming laptops, desktop towers, and all-in-one PCs.",
  },
  {
    name: "Computer Accessories",
    description:
      "Keyboards, mice, docks, USB adapters, and external peripherals.",
  },
  {
    name: "Network & Security Cameras",
    description: "IP cameras, NVRs, PoE switches, and surveillance gear.",
  },
  {
    name: "Storage & RAM",
    description:
      "NVMe SSDs, external hard drives, DDR4/DDR5 desktop and SODIMM RAM.",
  },
  {
    name: "Printers & Toners",
    description:
      "Laser printers, barcode scanners, and replacement toner cartridges.",
  },
];
