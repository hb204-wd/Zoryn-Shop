import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

const CATEGORIES = [
  { name: "Processeurs", slug: "processeurs" },
  { name: "Cartes Mères", slug: "cartes-meres" },
  { name: "Cartes Graphiques", slug: "cartes-graphiques" },
  { name: "RAM", slug: "ram" },
  { name: "Stockage", slug: "stockage" },
  { name: "Écrans", slug: "ecrans" },
  { name: "Périphériques", slug: "peripheriques" },
  { name: "Accessoires", slug: "accessoires" },
];

const PRODUCTS: {
  name: string;
  slug: string;
  description: string;
  brand: string;
  categorySlug: string;
  price: number;
  stock: number;
  rating: number;
  images: string[];
}[] = [
  // Processeurs
  {
    name: "Intel Core i9-14900K",
    slug: "intel-core-i9-14900k",
    description:
      "Le processeur Intel Core i9-14900K offre des performances exceptionnelles avec 24 cœurs et 32 threads. Idéal pour le gaming haut de gamme et le montage vidéo professionnel. Fréquence boost jusqu'à 6,0 GHz.",
    brand: "Intel",
    categorySlug: "processeurs",
    price: 549.99,
    stock: 25,
    rating: 4.8,
    images: ["/images/products/intel-i9-14900k.jpg"],
  },
  {
    name: "Intel Core i7-14700K",
    slug: "intel-core-i7-14700k",
    description:
      "Processeur Intel Core i7-14700K avec 20 cœurs et 28 threads. Excellent rapport performance/prix pour le gaming et la productivité. Fréquence boost jusqu'à 5,6 GHz.",
    brand: "Intel",
    categorySlug: "processeurs",
    price: 399.99,
    stock: 40,
    rating: 4.7,
    images: ["/images/products/intel-i7-14700k.jpg"],
  },
  {
    name: "Intel Core i5-14600K",
    slug: "intel-core-i5-14600k",
    description:
      "Le Core i5-14600K est le choix parfait pour les gamers. 14 cœurs, 20 threads et une fréquence boost de 5,3 GHz pour des performances gaming fluides.",
    brand: "Intel",
    categorySlug: "processeurs",
    price: 299.99,
    stock: 55,
    rating: 4.6,
    images: ["/images/products/intel-i5-14600k.jpg"],
  },
  {
    name: "AMD Ryzen 9 7950X",
    slug: "amd-ryzen-9-7950x",
    description:
      "Le AMD Ryzen 9 7950X est un processeur 16 cœurs / 32 threads sur l'architecture Zen 4. Performances multi-cœurs imbattables pour le streaming, le rendu 3D et la création de contenu.",
    brand: "AMD",
    categorySlug: "processeurs",
    price: 579.99,
    stock: 20,
    rating: 4.9,
    images: ["/images/products/amd-ryzen-9-7950x.jpg"],
  },
  {
    name: "AMD Ryzen 7 7800X3D",
    slug: "amd-ryzen-7-7800x3d",
    description:
      "Le Ryzen 7 7800X3D avec sa technologie 3D V-Cache est le roi du gaming. 8 cœurs, 16 threads et un cache L3 de 104 Mo pour des performances gaming sans précédent.",
    brand: "AMD",
    categorySlug: "processeurs",
    price: 449.99,
    stock: 30,
    rating: 4.9,
    images: ["/images/products/amd-ryzen-7-7800x3d.jpg"],
  },
  {
    name: "AMD Ryzen 5 7600X",
    slug: "amd-ryzen-5-7600x",
    description:
      "Le Ryzen 5 7600X offre d'excellentes performances gaming à prix abordable. 6 cœurs, 12 threads et une fréquence boost de 5,3 GHz.",
    brand: "AMD",
    categorySlug: "processeurs",
    price: 229.99,
    stock: 65,
    rating: 4.5,
    images: ["/images/products/amd-ryzen-5-7600x.jpg"],
  },
  {
    name: "Intel Core i3-14100F",
    slug: "intel-core-i3-14100f",
    description:
      "Processeur d'entrée de gamme Intel Core i3-14100F. 4 cœurs, 8 threads, parfait pour une config gaming économique. Fréquence boost jusqu'à 4,7 GHz.",
    brand: "Intel",
    categorySlug: "processeurs",
    price: 109.99,
    stock: 80,
    rating: 4.3,
    images: ["/images/products/intel-i3-14100f.jpg"],
  },
  {
    name: "AMD Ryzen 9 9950X",
    slug: "amd-ryzen-9-9950x",
    description:
      "Le tout nouveau Ryzen 9 9950X sur architecture Zen 5. 16 cœurs, 32 threads, performances monstrueuses pour les professionnels et créateurs de contenu.",
    brand: "AMD",
    categorySlug: "processeurs",
    price: 649.99,
    stock: 15,
    rating: 4.8,
    images: ["/images/products/amd-ryzen-9-9950x.jpg"],
  },
  // Cartes Mères
  {
    name: "ASUS ROG Strix Z790-E Gaming WiFi",
    slug: "asus-rog-strix-z790-e-gaming-wifi",
    description:
      "Carte mère haut de gamme ASUS ROG Strix Z790-E Gaming WiFi. Support Intel 14e gen, DDR5, PCIe 5.0, WiFi 6E, multiple slots M.2 avec dissipateurs thermiques.",
    brand: "ASUS",
    categorySlug: "cartes-meres",
    price: 399.99,
    stock: 18,
    rating: 4.7,
    images: ["/images/products/asus-rog-strix-z790e.jpg"],
  },
  {
    name: "MSI MAG B650 TOMAHAWK WiFi",
    slug: "msi-mag-b650-tomahawk-wifi",
    description:
      "Carte mère MSI MAG B650 TOMAHAWK WiFi pour AMD AM5. Design robuste avec VRM 14+2 phases, DDR5, WiFi 6E, multiple connecteurs M.2.",
    brand: "MSI",
    categorySlug: "cartes-meres",
    price: 229.99,
    stock: 35,
    rating: 4.6,
    images: ["/images/products/msi-mag-b650-tomahawk.jpg"],
  },
  {
    name: "Gigabyte X670 AORUS Elite AX",
    slug: "gigabyte-x670-aorus-elite-ax",
    description:
      "Carte mère Gigabyte X670 AORUS Elite AX. Chipset AMD X670, support DDR5, PCIe 5.0, WiFi 6E, design thermique optimisé pour les processeurs AMD Ryzen.",
    brand: "Gigabyte",
    categorySlug: "cartes-meres",
    price: 269.99,
    stock: 22,
    rating: 4.5,
    images: ["/images/products/gigabyte-x670-aorus-elite.jpg"],
  },
  {
    name: "ASRock B760M Pro RS",
    slug: "asrock-b760m-pro-rs",
    description:
      "Carte mère micro-ATX ASRock B760M Pro RS. Entrée de gamme avec support Intel 13e/14e gen, DDR4/DDR5, design compact pour build budget.",
    brand: "ASRock",
    categorySlug: "cartes-meres",
    price: 109.99,
    stock: 50,
    rating: 4.3,
    images: ["/images/products/asrock-b760m-pro-rs.jpg"],
  },
  {
    name: "ASUS TUF Gaming B650-PLUS WiFi",
    slug: "asus-tuf-gaming-b650-plus-wifi",
    description:
      "Carte mère ASUS TUF Gaming B650-PLUS WiFi. Construite pour durer, VRM 12+2 phases, DDR5, WiFi 6E, connectique complète pour gaming et productivité.",
    brand: "ASUS",
    categorySlug: "cartes-meres",
    price: 199.99,
    stock: 30,
    rating: 4.6,
    images: ["/images/products/asus-tuf-b650-plus.jpg"],
  },
  // Cartes Graphiques
  {
    name: "NVIDIA GeForce RTX 4090 Founders Edition",
    slug: "nvidia-rtx-4090-founders-edition",
    description:
      "La GeForce RTX 4090 est la carte graphique la plus puissante au monde. 16384 cœurs CUDA, 24 Go GDDR6X, DLSS 3, ray tracing de nouvelle génération. Performance gaming 4K ultime.",
    brand: "NVIDIA",
    categorySlug: "cartes-graphiques",
    price: 1799.99,
    stock: 10,
    rating: 4.9,
    images: ["/images/products/nvidia-rtx-4090.jpg"],
  },
  {
    name: "ASUS ROG Strix RTX 4080 Super OC",
    slug: "asus-rog-strix-rtx-4080-super-oc",
    description:
      "Carte graphique ASUS ROG Strix GeForce RTX 4080 Super Overclocked. 10240 cœurs CUDA, 16 Go GDDR6X, refroidissement triple ventilateur, boost à 2655 MHz.",
    brand: "ASUS",
    categorySlug: "cartes-graphiques",
    price: 1199.99,
    stock: 15,
    rating: 4.8,
    images: ["/images/products/asus-rog-rtx-4080-super.jpg"],
  },
  {
    name: "MSI GeForce RTX 4070 Ti SUPER Ventus 3X",
    slug: "msi-rtx-4070-ti-super-ventus-3x",
    description:
      "Carte graphique MSI RTX 4070 Ti SUPER Ventus 3X. 8448 cœurs CUDA, 16 Go GDDR6X, excellent rapport performance/prix pour le gaming 1440p et 4K.",
    brand: "MSI",
    categorySlug: "cartes-graphiques",
    price: 799.99,
    stock: 25,
    rating: 4.7,
    images: ["/images/products/msi-rtx-4070-ti-super.jpg"],
  },
  {
    name: "AMD Radeon RX 7900 XTX",
    slug: "amd-radeon-rx-7900-xtx",
    description:
      "La AMD Radeon RX 7900 XTX offre des performances gaming 4K exceptionnelles. 6144 cœurs de stream, 24 Go GDDR6, RDNA 3 architecture. Alternative puissante aux cartes NVIDIA.",
    brand: "AMD",
    categorySlug: "cartes-graphiques",
    price: 949.99,
    stock: 18,
    rating: 4.6,
    images: ["/images/products/amd-rx-7900-xtx.jpg"],
  },
  {
    name: "Gigabyte GeForce RTX 4070 Windforce OC",
    slug: "gigabyte-rtx-4070-windforce-oc",
    description:
      "Carte graphique Gigabyte RTX 4070 Windforce OC. 5888 cœurs CUDA, 12 Go GDDR6X, refroidissement Windforce efficace, parfait pour le gaming 1440p.",
    brand: "Gigabyte",
    categorySlug: "cartes-graphiques",
    price: 599.99,
    stock: 35,
    rating: 4.5,
    images: ["/images/products/gigabyte-rtx-4070-windforce.jpg"],
  },
  {
    name: "Sapphire AMD Radeon RX 7800 XT Nitro+",
    slug: "sapphire-rx-7800-xt-nitro-plus",
    description:
      "Carte graphique Sapphire Nitro+ AMD Radeon RX 7800 XT. 3840 cœurs de stream, 16 Go GDDR6, excellent refroidissement, performante en 1440p.",
    brand: "Sapphire",
    categorySlug: "cartes-graphiques",
    price: 549.99,
    stock: 28,
    rating: 4.6,
    images: ["/images/products/sapphire-rx-7800-xt-nitro.jpg"],
  },
  {
    name: "NVIDIA GeForce RTX 4060 Ti Founders Edition",
    slug: "nvidia-rtx-4060-ti-founders-edition",
    description:
      "La RTX 4060 Ti Founders Edition offre d'excellentes performances gaming 1080p et 1440p. 4352 cœurs CUDA, 8 Go GDDR6, DLSS 3 et ray tracing.",
    brand: "NVIDIA",
    categorySlug: "cartes-graphiques",
    price: 399.99,
    stock: 45,
    rating: 4.4,
    images: ["/images/products/nvidia-rtx-4060-ti.jpg"],
  },
  {
    name: "ASRock AMD Radeon RX 7600 Phantom Gaming",
    slug: "asrock-rx-7600-phantom-gaming",
    description:
      "Carte graphique d'entrée de gamme ASRock RX 7600 Phantom Gaming. 2048 cœurs de stream, 8 Go GDDR6, parfaite pour le gaming 1080p à prix abordable.",
    brand: "ASRock",
    categorySlug: "cartes-graphiques",
    price: 269.99,
    stock: 55,
    rating: 4.3,
    images: ["/images/products/asrock-rx-7600-phantom.jpg"],
  },
  // RAM
  {
    name: "Corsair Vengeance DDR5 6000 MHz 32 Go (2x16 Go)",
    slug: "corsair-vengeance-ddr5-6000-32go",
    description:
      "Kit mémoire Corsair Vengeance DDR5 6000 MHz CL30. 32 Go en configuration double canal (2x16 Go). Performances élevées pour gaming et productivité, compatibilité Intel XMP 3.0.",
    brand: "Corsair",
    categorySlug: "ram",
    price: 119.99,
    stock: 60,
    rating: 4.7,
    images: ["/images/products/corsair-vengeance-ddr5-6000.jpg"],
  },
  {
    name: "G.Skill Trident Z5 RGB DDR5 6400 MHz 32 Go",
    slug: "gskill-trident-z5-ddr5-6400-32go",
    description:
      "Kit mémoire G.Skill Trident Z5 RGB DDR5 6400 MHz CL32. Design élégant avec éclairage RGB, performances exceptionnelles, idéal pour les configurations haut de gamme.",
    brand: "G.Skill",
    categorySlug: "ram",
    price: 149.99,
    stock: 40,
    rating: 4.8,
    images: ["/images/products/gskill-trident-z5-ddr5.jpg"],
  },
  {
    name: "Kingston FURY Beast DDR5 5600 MHz 64 Go (2x32 Go)",
    slug: "kingston-fury-beast-ddr5-5600-64go",
    description:
      "Kit mémoire Kingston FURY Beast DDR5 5600 MHz. 64 Go en double canal pour les stations de travail et créateurs de contenu. Stabilité et performance.",
    brand: "Kingston",
    categorySlug: "ram",
    price: 199.99,
    stock: 30,
    rating: 4.5,
    images: ["/images/products/kingston-fury-beast-ddr5.jpg"],
  },
  {
    name: "Corsair Dominator Platinum DDR5 6600 MHz 16 Go",
    slug: "corsair-dominator-platinum-ddr5-6600-16go",
    description:
      "Kit mémoire premium Corsair Dominator Platinum RGB DDR5 6600 MHz. 16 Go, design premium avec éclairage CAPELLIX RGB, dissipation thermique optimisée.",
    brand: "Corsair",
    categorySlug: "ram",
    price: 189.99,
    stock: 25,
    rating: 4.8,
    images: ["/images/products/corsair-dominator-platinum.jpg"],
  },
  {
    name: "G.Skill Ripjaws S5 DDR5 5200 MHz 32 Go (2x16 Go)",
    slug: "gskill-ripjaws-s5-ddr5-5200-32go",
    description:
      "Kit mémoire G.Skill Ripjaws S5 DDR5 5200 MHz CL28. 32 Go, excellent rapport performance/prix, compatible XMP 3.0 pour un overclocking facile.",
    brand: "G.Skill",
    categorySlug: "ram",
    price: 89.99,
    stock: 50,
    rating: 4.5,
    images: ["/images/products/gskill-ripjaws-s5-ddr5.jpg"],
  },
  {
    name: "Corsair Vengeance LPX DDR4 3200 MHz 32 Go",
    slug: "corsair-vengeance-lpx-ddr4-3200-32go",
    description:
      "Kit mémoire Corsair Vengeance LPX DDR4 3200 MHz CL16. 32 Go, compatible avec les plateformes DDR4 existantes, excellent pour les mises à jour.",
    brand: "Corsair",
    categorySlug: "ram",
    price: 69.99,
    stock: 70,
    rating: 4.4,
    images: ["/images/products/corsair-vengeance-lpx-ddr4.jpg"],
  },
  {
    name: "TeamGroup T-Force Delta RGB DDR5 6000 MHz 32 Go",
    slug: "teamgroup-tforce-delta-ddr5-6000-32go",
    description:
      "Kit mémoire TeamGroup T-Force Delta RGB DDR5 6000 MHz. 32 Go avec éclairage RGB dynamique, châssis en aluminium pour dissipation thermique.",
    brand: "TeamGroup",
    categorySlug: "ram",
    price: 109.99,
    stock: 35,
    rating: 4.4,
    images: ["/images/products/teamgroup-tforce-delta-ddr5.jpg"],
  },
  {
    name: "Kingston FURY Renegade DDR5 7200 MHz 32 Go",
    slug: "kingston-fury-renegade-ddr5-7200-32go",
    description:
      "Kit mémoire haut de gamme Kingston FURY Renegade DDR5 7200 MHz. 32 Go, performances extrêmes pour les passionnés d'overclocking, RGB intégré.",
    brand: "Kingston",
    categorySlug: "ram",
    price: 219.99,
    stock: 20,
    rating: 4.7,
    images: ["/images/products/kingston-fury-renegade-ddr5.jpg"],
  },
  // Stockage
  {
    name: "Samsung 990 Pro NVMe 2 To",
    slug: "samsung-990-pro-nvme-2to",
    description:
      "SSD Samsung 990 Pro NVMe M.2 2 To. Vitesse de lecture jusqu'à 7450 Mo/s, écriture jusqu'à 6900 Mo/s. NAND V-NAND 3ème gen, idéal pour gaming et création de contenu.",
    brand: "Samsung",
    categorySlug: "stockage",
    price: 179.99,
    stock: 45,
    rating: 4.9,
    images: ["/images/products/samsung-990-pro-2to.jpg"],
  },
  {
    name: "WD Black SN850X NVMe 1 To",
    slug: "wd-black-sn850x-nvme-1to",
    description:
      "SSD Western Digital Black SN850X NVMe M.2 1 To. Vitesse de lecture 7300 Mo/s, écriture 6300 Mo/s. Parfait pour le gaming et les chargements rapides.",
    brand: "Western Digital",
    categorySlug: "stockage",
    price: 99.99,
    stock: 55,
    rating: 4.8,
    images: ["/images/products/wd-black-sn850x-1to.jpg"],
  },
  {
    name: "Samsung 870 EVO SATA 1 To",
    slug: "samsung-870-evo-sata-1to",
    description:
      "SSD Samsung 870 EVO SATA 2.5\" 1 To. Solution de stockage fiable et rapide pour les ordinateurs portables et de bureau. Vitesse de lecture 560 Mo/s.",
    brand: "Samsung",
    categorySlug: "stockage",
    price: 79.99,
    stock: 60,
    rating: 4.6,
    images: ["/images/products/samsung-870-evo-1to.jpg"],
  },
  {
    name: "WD Black SN770 NVMe 2 To",
    slug: "wd-black-sn770-nvme-2to",
    description:
      "SSD WD Black SN770 NVMe M.2 2 To. Excellent rapport capacité/prix, vitesse de lecture 5150 Mo/s, interface PCIe Gen4. Parfait pour étendre votre stockage.",
    brand: "Western Digital",
    categorySlug: "stockage",
    price: 119.99,
    stock: 40,
    rating: 4.7,
    images: ["/images/products/wd-black-sn770-2to.jpg"],
  },
  {
    name: "Crucial P3 Plus NVMe 4 To",
    slug: "crucial-p3-plus-nvme-4to",
    description:
      "SSD Crucial P3 Plus NVMe M.2 4 To. Grande capacité pour les bibliothèques de jeux, vitesse de lecture 5000 Mo/s, interface PCIe Gen4 abordable.",
    brand: "Crucial",
    categorySlug: "stockage",
    price: 229.99,
    stock: 25,
    rating: 4.5,
    images: ["/images/products/crucial-p3-plus-4to.jpg"],
  },
  {
    name: "Seagate Barracuda HDD 4 To",
    slug: "seagate-barracuda-hdd-4to",
    description:
      "Disque dur Seagate Barracuda 4 To 3.5\". Solution de stockage massif pour sauvegardes et fichiers volumineux. 7200 tr/min, cache 256 Mo.",
    brand: "Seagate",
    categorySlug: "stockage",
    price: 89.99,
    stock: 50,
    rating: 4.3,
    images: ["/images/products/seagate-barracuda-4to.jpg"],
  },
  {
    name: "Samsung 990 Pro NVMe 4 To",
    slug: "samsung-990-pro-nvme-4to",
    description:
      "SSD Samsung 990 Pro NVMe M.2 4 To. Le stockage ultime pour les créateurs et gamers exigeants. 7450 Mo/s en lecture, 6900 Mo/s en écriture.",
    brand: "Samsung",
    categorySlug: "stockage",
    price: 349.99,
    stock: 15,
    rating: 4.9,
    images: ["/images/products/samsung-990-pro-4to.jpg"],
  },
  {
    name: "Kingston NV2 NVMe 1 To",
    slug: "kingston-nv2-nvme-1to",
    description:
      "SSD Kingston NV2 NVMe M.2 1 To. Solution d'entrée de gamme abordable avec des performances correctes. Vitesse de lecture 3500 Mo/s, PCIe Gen4.",
    brand: "Kingston",
    categorySlug: "stockage",
    price: 59.99,
    stock: 75,
    rating: 4.2,
    images: ["/images/products/kingston-nv2-1to.jpg"],
  },
  // Écrans
  {
    name: "LG UltraGear 27GP850-B 27\" QHD IPS 165Hz",
    slug: "lg-ultragear-27gp850b",
    description:
      "Écran gaming LG UltraGear 27\" QHD (2560x1440) Nano IPS 165Hz. Temps de réponse 1ms, G-Sync/FreeSync compatible, HDR 400, excellent pour le gaming compétitif.",
    brand: "LG",
    categorySlug: "ecrans",
    price: 449.99,
    stock: 20,
    rating: 4.8,
    images: ["/images/products/lg-ultragear-27gp850b.jpg"],
  },
  {
    name: "ASUS ROG Swift PG279QM 27\" QHD 240Hz",
    slug: "asus-rog-swift-pg279qm",
    description:
      "Écran gaming ASUS ROG Swift 27\" QHD 240Hz. Panel IPS, G-Sync avec module, HDR 600, design premium pour les joueurs professionnels.",
    brand: "ASUS",
    categorySlug: "ecrans",
    price: 649.99,
    stock: 12,
    rating: 4.9,
    images: ["/images/products/asus-rog-swift-pg279qm.jpg"],
  },
  {
    name: "Dell UltraSharp U2723QE 27\" 4K USB-C",
    slug: "dell-ultrasharp-u2723qe",
    description:
      "Moniteur professionnel Dell UltraSharp 27\" 4K IPS Black. Connectivité USB-C avec charge 90W, caliber色 de couleur factory, idéal pour la créativité et le bureau.",
    brand: "Dell",
    categorySlug: "ecrans",
    price: 549.99,
    stock: 18,
    rating: 4.7,
    images: ["/images/products/dell-ultrasharp-u2723qe.jpg"],
  },
  {
    name: "Samsung Odyssey G7 32\" QHD 240Hz VA",
    slug: "samsung-odyssey-g7-32",
    description:
      "Écran gaming Samsung Odyssey G7 32\" QHD 240Hz. Panel VA avec contraste 2500:1, 1ms de temps de réponse, courbure 1000R, HDR 600.",
    brand: "Samsung",
    categorySlug: "ecrans",
    price: 499.99,
    stock: 15,
    rating: 4.6,
    images: ["/images/products/samsung-odyssey-g7-32.jpg"],
  },
  {
    name: "LG 27UK850-W 27\" 4K HDR IPS",
    slug: "lg-27uk850w",
    description:
      "Moniteur LG 27\" 4K UHD HDR10 IPS. USB-C avec charge, HDR 10, 99% sRGB, excellente qualité d'image pour le travail créatif et le divertissement.",
    brand: "LG",
    categorySlug: "ecrans",
    price: 399.99,
    stock: 25,
    rating: 4.5,
    images: ["/images/products/lg-27uk850w.jpg"],
  },
  {
    name: "ASUS ProArt PA278QV 27\" QHD",
    slug: "asus-proart-pa278qv",
    description:
      "Moniteur professionnel ASUS ProArt 27\" QHD IPS. Calibration Delta E < 2, 100% sRGB, intuitif pour les designers et photographes.",
    brand: "ASUS",
    categorySlug: "ecrans",
    price: 329.99,
    stock: 22,
    rating: 4.6,
    images: ["/images/products/asus-proart-pa278qv.jpg"],
  },
  {
    name: "Dell S2722QC 27\" 4K USB-C",
    slug: "dell-s2722qc",
    description:
      "Moniteur Dell 27\" 4K UHD avec USB-C. Design élégant, résolution 3840x2160, HDR 400, idéal pour le télétravail et le divertissement.",
    brand: "Dell",
    categorySlug: "ecrans",
    price: 349.99,
    stock: 30,
    rating: 4.4,
    images: ["/images/products/dell-s2722qc.jpg"],
  },
  {
    name: "MSI Optix MAG274QRF-QD 27\" QHD 165Hz",
    slug: "msi-optix-mag274qrf-qd",
    description:
      "Écran gaming MSI Optix MAG274QRF-QD 27\" QHD 165Hz. Quantum Dot IPS, 1ms, G-Sync compatible, couleurs éclatantes pour une immersion totale.",
    brand: "MSI",
    categorySlug: "ecrans",
    price: 399.99,
    stock: 18,
    rating: 4.7,
    images: ["/images/products/msi-optix-mag274qrf.jpg"],
  },
  // Périphériques
  {
    name: "Logitech G Pro X Superlight 2",
    slug: "logitech-g-pro-x-superlight-2",
    description:
      "Souris gaming sans fil Logitech G Pro X Superlight 2. Ultra-légère 60g, capteur HERO 2, autonomie 95h, connectivité LIGHTSPEED. Préférée des pros.",
    brand: "Logitech",
    categorySlug: "peripheriques",
    price: 149.99,
    stock: 40,
    rating: 4.9,
    images: ["/images/products/logitech-g-pro-x-superlight2.jpg"],
  },
  {
    name: "Razer DeathAdder V3 Pro",
    slug: "razer-deathadder-v3-pro",
    description:
      "Souris gaming Razer DeathAdder V3 Pro sans fil. Capteur Focus Pro 30K, switches optiques, autonomie 90h, design ergonomique iconique.",
    brand: "Razer",
    categorySlug: "peripheriques",
    price: 139.99,
    stock: 35,
    rating: 4.8,
    images: ["/images/products/razer-deathadder-v3-pro.jpg"],
  },
  {
    name: "Corsair K100 RGB Cherry MX Speed",
    slug: "corsair-k100-rgb-cherry-mx-speed",
    description:
      "Clavier mécanique gaming Corsair K100 RGB. Switches Cherry MX Speed, touches macro iCUE, rétroéclairage RGB, roulette multifonction.",
    brand: "Corsair",
    categorySlug: "peripheriques",
    price: 229.99,
    stock: 20,
    rating: 4.7,
    images: ["/images/products/corsair-k100-rgb.jpg"],
  },
  {
    name: "Razer BlackWidow V4 Pro",
    slug: "razer-blackwidow-v4-pro",
    description:
      "Clavier gaming Razer BlackWidow V4 Pro. Switches mécaniques Razer Green, touches macro dédiées, roulette magnétique, rétroéclairage RGB Chroma.",
    brand: "Razer",
    categorySlug: "peripheriques",
    price: 199.99,
    stock: 25,
    rating: 4.6,
    images: ["/images/products/razer-blackwidow-v4-pro.jpg"],
  },
  {
    name: "Logitech MX Master 3S",
    slug: "logitech-mx-master-3s",
    description:
      "Souris sans fil Logitech MX Master 3S. Ergonomie premium, wheel电磁 scroll, capteur 8000 DPI, compatible multi-appareils, silencieuse.",
    brand: "Logitech",
    categorySlug: "peripheriques",
    price: 99.99,
    stock: 45,
    rating: 4.8,
    images: ["/images/products/logitech-mx-master-3s.jpg"],
  },
  {
    name: "SteelSeries Arctis Nova Pro Wireless",
    slug: "steelseries-arctis-nova-pro-wireless",
    description:
      "Casque gaming sans fil SteelSeries Arctis Nova Pro. Audio Hi-Fi, ANC active, microphone retractable, autonomie 44h avec base station.",
    brand: "SteelSeries",
    categorySlug: "peripheriques",
    price: 349.99,
    stock: 15,
    rating: 4.8,
    images: ["/images/products/steelseries-arctis-nova-pro.jpg"],
  },
  {
    name: "Logitech G915 TKL Lightspeed",
    slug: "logitech-g915-tkl-lightspeed",
    description:
      "Clavier sans fil Logitech G915 TKL. Format tenkeyless, switches GL mécaniques, rétroéclairage LIGHTSYNC RGB, châssis en aluminium.",
    brand: "Logitech",
    categorySlug: "peripheriques",
    price: 229.99,
    stock: 22,
    rating: 4.7,
    images: ["/images/products/logitech-g915-tkl.jpg"],
  },
  {
    name: "HyperX Cloud III Wireless",
    slug: "hyperx-cloud-3-wireless",
    description:
      "Casque gaming sans fil HyperX Cloud III. Confort exceptionnel, son immersif, microphone amovible, autonomie 120h, compatible multi-plateformes.",
    brand: "HyperX",
    categorySlug: "peripheriques",
    price: 169.99,
    stock: 30,
    rating: 4.6,
    images: ["/images/products/hyperx-cloud-3-wireless.jpg"],
  },
  // Accessoires
  {
    name: "Corsair RM850x 80+ Gold Modular",
    slug: "corsair-rm850x-80-plus-gold",
    description:
      "Alimentation Corsair RM850x 850W 80+ Gold. Entièrement modulaire, ventilateur 135mm silencieux, conforme ATX 3.0, câbles premodontables.",
    brand: "Corsair",
    categorySlug: "accessoires",
    price: 149.99,
    stock: 35,
    rating: 4.8,
    images: ["/images/products/corsair-rm850x.jpg"],
  },
  {
    name: "NZXT H7 Flow RGB",
    slug: "nzxt-h7-flow-rgb",
    description:
      "Boîtier PC NZXT H7 Flow RGB. Tour ATX mid-tower avec panneau en verre trempé, flux d'air optimisé, 3 ventilateurs RGB inclus, design épuré.",
    brand: "NZXT",
    categorySlug: "accessoires",
    price: 129.99,
    stock: 25,
    rating: 4.7,
    images: ["/images/products/nzxt-h7-flow-rgb.jpg"],
  },
  {
    name: "be quiet! Dark Rock Pro 5",
    slug: "be-quiet-dark-rock-pro-5",
    description:
      "Dissipateur thermique be quiet! Dark Rock Pro 5. Refroidissement passif haute performance, deux ventilateurs Silent Wings, TDP jusqu'à 270W.",
    brand: "be quiet!",
    categorySlug: "accessoires",
    price: 89.99,
    stock: 30,
    rating: 4.9,
    images: ["/images/products/be-quiet-dark-rock-pro5.jpg"],
  },
  {
    name: "Corsair iCUE H150i Elite Capellix 360mm",
    slug: "corsair-icue-h150i-elite-capellix",
    description:
      "Kit watercooling Corsair iCUE H150i Elite Capellix. Radiateur 360mm, pompe RGB, ventilateurs ML RGB, contrôle logiciel iCUE.",
    brand: "Corsair",
    categorySlug: "accessoires",
    price: 189.99,
    stock: 20,
    rating: 4.7,
    images: ["/images/products/corsair-h150i-elite.jpg"],
  },
  {
    name: "Fractal Design Pop Air RGB",
    slug: "fractal-design-pop-air-rgb",
    description:
      "Boîtier PC Fractal Design Pop Air RGB. Tour mid-tower avec mesh front, excellent flux d'air, 3 ventilateurs RGB 120mm inclus, compartiment HDD.",
    brand: "Fractal Design",
    categorySlug: "accessoires",
    price: 99.99,
    stock: 28,
    rating: 4.6,
    images: ["/images/products/fractal-pop-air-rgb.jpg"],
  },
  {
    name: "Seasonic Focus GX-1000 80+ Gold",
    slug: "seasonic-focus-gx-1000",
    description:
      "Alimentation Seasonic Focus GX-1000 1000W 80+ Gold. Entièrement modulaire, câbles targetables,ventilateur FDB, garantie 10 ans.",
    brand: "Seasonic",
    categorySlug: "accessoires",
    price: 179.99,
    stock: 22,
    rating: 4.8,
    images: ["/images/products/seasonic-focus-gx-1000.jpg"],
  },
  {
    name: "Cooler Master MasterBox TD500 Mesh",
    slug: "cooler-master-masterbox-td500-mesh",
    description:
      "Boîtier PC Cooler Master MasterBox TD500 Mesh. Panneau mesh front, panneau en verre trempé, 3 ventilateurs ARGB inclus, design élégant.",
    brand: "Cooler Master",
    categorySlug: "accessoires",
    price: 89.99,
    stock: 30,
    rating: 4.5,
    images: ["/images/products/cooler-master-td500-mesh.jpg"],
  },
  {
    name: "Noctua NH-D15 chromax.black",
    slug: "noctua-nh-d15-chromax-black",
    description:
      "Dissipateur thermique Noctua NH-D15 chromax.black. Le roi du refroidissement par air, deux ventilateurs NF-A15, compatible avec la plupart des sockets.",
    brand: "Noctua",
    categorySlug: "accessoires",
    price: 109.99,
    stock: 25,
    rating: 4.9,
    images: ["/images/products/noctua-nh-d15-chromax.jpg"],
  },
];

const FRENCH_FIRST_NAMES = [
  "Antoine", "Marie", "Jean", "Sophie", "Pierre", "Julie", "Michel", "Claire",
  "Philippe", "Isabelle", "Nicolas", "Catherine", "François", "Nathalie", "Laurent",
  "Valérie", "Patrick", "Sylvie", "Daniel", "Christine", "Thierry", "Véronique",
  "Alain", "Monique", "Stéphane", "Cécile", "Olivier", "Sandrine", "Frédéric",
  "Dominique", "Pascal", "Bénédicte", "Yves", "Anne", "André", "Martine",
  "Gérard", "Françoise", "Marc", "Hélène", "Didier", "Catherine", "Eric",
  "Brigitte", "Christian", "Nathalie", "Bernard", "Maryse", "Pascal", "Murielle",
  "Renaud", "Caroline", "Manuel", "Nadège", "Laurent", "Véronique", "Sébastien",
  "Stéphanie", "Christophe", "Sandrine",
];

const FRENCH_LAST_NAMES = [
  "Dupont", "Martin", "Bernard", "Dubois", "Thomas", "Robert", "Richard",
  "Petit", "Durand", "Leroy", "Moreau", "Simon", "Laurent", "Lefebvre",
  "Michel", "Garcia", "David", "Bertrand", "Roux", "Vincent", "Fournier",
  "Morel", "Girard", "André", "Lefèvre", "Mercier", "Dupuy", "Lambert",
  "Bonnet", "François", "Martinez", "Legrand", "Garnier", "Faure", "Rousseau",
  "Blanc", "Guérin", "Boyer", "Garnier", "Chevalier", "François", "Legrand",
  "Gauthier", "Perrin", "Robin", "Clément", "Morin", "Nicolas", "Henry",
  "Rousseau", "Mathieu", "Gautier", "Masson", "Hubert", "Marchand", "Duval",
  "Denis", "Aubert", "Lefèvre", "Pelletier", "Lucas", "Coste", "Guillaume",
];

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function generateReviewTitle(rating: number): string {
  const titles: Record<number, string[]> = {
    5: [
      "Excellent produit !",
      "Le meilleur que j'ai eu",
      "Je recommande vivement",
      "Parfait sans compromis",
      "Une pépite !",
    ],
    4: [
      "Très bon produit",
      "Rapport qualité/prix intéressant",
      "Quasiment parfait",
      "Bon choix",
      "Satisfait de mon achat",
    ],
    3: [
      "Correct, sans plus",
      "Moyen mais fonctionnel",
      "Ça fait le job",
      "Attendais mieux",
      "Passable",
    ],
    2: [
      "Déçu par la qualité",
      "Ne vaut pas le prix",
      "Problèmes récurrents",
      "Mauvais achat",
      "À éviter",
    ],
    1: [
      "Terrible, ne fonctionne pas",
      "Arnaque totale",
      "Ne recommande pas du tout",
      "Retourné immédiatement",
      "Catastrophique",
    ],
  };
  return randomPick(titles[rating] ?? titles[3]);
}

function generateReviewContent(rating: number): string {
  const contents: Record<number, string[]> = {
    5: [
      "Produit au top, rien à dire. Les performances sont au rendez-vous et la livraison était rapide.",
      "Je suis pleinement satisfait de cet achat. La qualité est exceptionnelle.",
      "Rapport qualité/prix imbattable. Je recommande les yeux fermés.",
      "Le meilleur produit dans sa catégorie. Vraiment impressionnant.",
      "Livraison rapide, produit conforme à la description. Parfait !",
    ],
    4: [
      "Bon produit dans l'ensemble. Quelques petits défauts mineurs mais rien de bloquant.",
      "Très satisfait malgré quelques réserves. Le rapport qualité/prix est bon.",
      "Un bon produit qui remplit bien sa fonction. Je recommande.",
      "Qualité au rendez-vous, dommage pour le petit détail qui manque.",
      "Bonne affaire, produit solide et fiable.",
    ],
    3: [
      "Produit moyen, correspond à la description mais sans plus. Le prix est justifié.",
      "Ça fonctionne mais j'attendais un peu mieux pour ce tarif.",
      "Pas de gros problème mais rien d'exceptionnel non plus.",
      "Correct pour un usage basique, mais ne pas s'attendre à des miracles.",
      "Le produit fait ce qu'on lui demande, c'est tout.",
    ],
    2: [
      "Déçu, la qualité n'est pas au rendez-vous. Je m'attendais à mieux.",
      "Pour le prix, j'espérais mieux. Les matériaux semblent fragiles.",
      "Problèmes rencontrés dès la première utilisation. Pas terrible.",
      "Ne correspond pas vraiment à mes attentes. Mauvaise expérience.",
      "Le produit est en dessous de la moyenne, dommage.",
    ],
    1: [
      "Produit défectueux, ne fonctionne pas du tout. Service client inexistant.",
      "Arnaque totale, ne gaspillez pas votre argent.",
      "Retourné immédiatement, rien ne fonctionne.",
      "La pire expérience d'achat. À fuir.",
      "Ne respecte absolument pas les caractéristiques annoncées.",
    ],
  };
  return randomPick(contents[rating] ?? contents[3]);
}

async function main() {
  console.log("🚀 Début du seeding de la base de données Zoryn Project...\n");

  console.log("🗑️  Nettoyage des tables existantes...");
  await prisma.experimentAssignment.deleteMany();
  await prisma.experiment.deleteMany();
  await prisma.analyticsEvent.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.review.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  console.log("✅ Tables nettoyées.\n");

  // --- Categories ---
  console.log("📁 Création des catégories...");
  const categoryMap = new Map<string, string>();
  for (const cat of CATEGORIES) {
    const created = await prisma.category.create({
      data: { name: cat.name, slug: cat.slug },
    });
    categoryMap.set(cat.slug, created.id);
    console.log(`   ✓ ${cat.name}`);
  }
  console.log("✅ Catégories créées.\n");

  // --- Products ---
  console.log("📦 Création des produits...");
  const productIds: string[] = [];
  for (const prod of PRODUCTS) {
    const categoryId = categoryMap.get(prod.categorySlug)!;
    const created = await prisma.product.create({
      data: {
        sku: `ZRN-${prod.slug.slice(0, 10).toUpperCase()}-${randomInt(1000, 9999)}`,
        name: prod.name,
        slug: prod.slug,
        description: prod.description,
        brand: prod.brand,
        categoryId,
        price: prod.price,
        stockQuantity: prod.stock,
        rating: prod.rating,
        isActive: true,
        images: {
          create: prod.images.map((url, idx) => ({
            url,
            altText: `${prod.name} - image ${idx + 1}`,
            position: idx,
          })),
        },
      },
    });
    productIds.push(created.id);
    console.log(`   ✓ ${prod.name} (${prod.brand}) - ${prod.price}€`);
  }
  console.log(`✅ ${PRODUCTS.length} produits créés.\n`);

  // --- Users ---
  console.log("👥 Création des utilisateurs demo...");
  const hashedPassword = await bcrypt.hash("Demo2024!", 12);
  const userIds: string[] = [];

  // Admin user
  const adminUser = await prisma.user.create({
    data: {
      name: "Admin Zoryn",
      email: "admin@zoryn.fr",
      password: hashedPassword,
      role: "ADMIN",
    },
  });
  userIds.push(adminUser.id);
  console.log("   ✓ Admin Zoryn (admin@zoryn.fr) - ADMIN");

  // Demo users
  for (let i = 0; i < 50; i++) {
    const firstName = randomPick(FRENCH_FIRST_NAMES);
    const lastName = randomPick(FRENCH_LAST_NAMES);
    const user = await prisma.user.create({
      data: {
        name: `${firstName} ${lastName}`,
        email: `${slugify(firstName)}.${slugify(lastName)}${i}@example.fr`,
        password: hashedPassword,
        role: "USER",
      },
    });
    userIds.push(user.id);
  }
  console.log(`   ✓ 50 utilisateurs demo créés`);
  console.log(`✅ ${userIds.length} utilisateurs créés au total.\n`);

  // --- Reviews ---
  console.log("⭐ Création des avis...");
  let reviewCount = 0;
  const usedCombos = new Set<string>();

  for (let i = 0; i < 120; i++) {
    const productId = randomPick(productIds);
    const userId = randomPick(userIds.slice(1)); // Skip admin
    const comboKey = `${productId}-${userId}`;

    if (usedCombos.has(comboKey)) continue;
    usedCombos.add(comboKey);

    const rating = randomPick([3, 3, 4, 4, 4, 5, 5, 5, 5, 2]);

    await prisma.review.create({
      data: {
        productId,
        userId,
        rating,
        title: generateReviewTitle(rating),
        content: generateReviewContent(rating),
      },
    });
    reviewCount++;
  }
  console.log(`✅ ${reviewCount} avis créés.\n`);

  // --- Carts ---
  console.log("🛒 Création des paniers...");
  let cartCount = 0;
  for (let i = 0; i < 30; i++) {
    const userId = randomPick(userIds);
    const cart = await prisma.cart.create({
      data: {
        userId,
        sessionId: uuidv4(),
        status: "ACTIVE",
      },
    });

    const itemCount = randomInt(1, 5);
    const usedProducts = new Set<string>();

    for (let j = 0; j < itemCount; j++) {
      let productId: string;
      do {
        productId = randomPick(productIds);
      } while (usedProducts.has(productId));
      usedProducts.add(productId);

      const product = await prisma.product.findUnique({ where: { id: productId } });
      const quantity = randomInt(1, 3);

      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
          unitPrice: product!.price,
        },
      });
    }
    cartCount++;
  }
  console.log(`✅ ${cartCount} paniers créés.\n`);

  // --- Orders ---
  console.log("📋 Création des commandes...");
  let orderCount = 0;

  for (let i = 0; i < 110; i++) {
    const userId = randomPick(userIds);
    const numItems = randomInt(1, 6);
    const orderItems: { productId: string; quantity: number; unitPrice: number }[] = [];
    const usedProducts = new Set<string>();
    let totalAmount = 0;

    for (let j = 0; j < numItems; j++) {
      let productId: string;
      do {
        productId = randomPick(productIds);
      } while (usedProducts.has(productId));
      usedProducts.add(productId);

      const product = await prisma.product.findUnique({ where: { id: productId } });
      const quantity = randomInt(1, 2);
      const unitPrice = product!.price;

      orderItems.push({ productId, quantity, unitPrice });
      totalAmount += unitPrice * quantity;
    }

    const daysAgo = randomInt(0, 180);
    const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

    const statuses: Array<"PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "DEMO_CONFIRMED"> = [
      "PENDING", "PAID", "SHIPPED", "DELIVERED", "DELIVERED", "DELIVERED",
    ];

    const cities = [
      "Paris", "Lyon", "Marseille", "Toulouse", "Nice", "Nantes", "Strasbourg",
      "Montpellier", "Bordeaux", "Lille", "Rennes", "Reims", "Le Havre",
      "Saint-Étienne", "Toulon", "Grenoble", "Dijon", "Angers", "Nîmes", "Clermont-Ferrand",
    ];

    const shippingMethods: Array<"standard" | "express" | "pickup"> = [
      "standard", "standard", "standard", "express", "pickup",
    ];

    await prisma.order.create({
      data: {
        userId,
        totalAmount: Math.round(totalAmount * 100) / 100,
        status: randomPick(statuses),
        shippingMethod: randomPick(shippingMethods),
        shippingName: `${randomPick(FRENCH_FIRST_NAMES)} ${randomPick(FRENCH_LAST_NAMES)}`,
        shippingAddress: `${randomInt(1, 200)} ${randomPick(["rue", "avenue", "boulevard", "impasse", "place"])}`,
        shippingCity: randomPick(cities),
        shippingZip: `${randomInt(10000, 99999)}`,
        shippingCountry: "FR",
        createdAt,
        items: {
          create: orderItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
      },
    });
    orderCount++;
  }
  console.log(`✅ ${orderCount} commandes créées.\n`);

  // --- Analytics Events ---
  console.log("📊 Création des événements analytics...");
  const eventTypes = [
    "product_viewed",
    "product_added_to_cart",
    "checkout_started",
    "purchase_completed",
    "search_performed",
    "category_viewed",
    "wishlist_add",
    "product_shared",
    "newsletter_signup",
    "page_view",
  ];

  let eventCount = 0;
  for (let i = 0; i < 550; i++) {
    const eventName = randomPick(eventTypes);
    const userId = Math.random() > 0.3 ? randomPick(userIds) : null;
    const anonymousId = userId ? null : `anon-${uuidv4().slice(0, 8)}`;
    const sessionId = `session-${uuidv4().slice(0, 8)}`;

    const daysAgo = randomInt(0, 90);
    const occurredAt = new Date(
      Date.now() - daysAgo * 24 * 60 * 60 * 1000 - randomInt(0, 86400) * 1000
    );

    let properties: Record<string, unknown> = {};

    if (eventName === "product_viewed" || eventName === "product_added_to_cart") {
      properties = {
        productId: randomPick(productIds),
        productName: randomPick(PRODUCTS).name,
        price: randomPick(PRODUCTS).price,
      };
    } else if (eventName === "search_performed") {
      properties = {
        query: randomPick([
          "carte graphique", "processeur gaming", "RAM DDR5",
          "écran 4K", "SSD NVMe", "clavier mécanique",
          "souris sans fil", "casque gaming", "boîtier PC",
        ]),
        resultsCount: randomInt(0, 50),
      };
    } else if (eventName === "category_viewed") {
      properties = {
        categoryId: randomPick([...categoryMap.values()]),
        categoryName: randomPick(CATEGORIES).name,
      };
    } else if (eventName === "purchase_completed") {
      properties = {
        orderId: uuidv4(),
        amount: randomInt(50, 3000),
        itemCount: randomInt(1, 8),
      };
    } else if (eventName === "page_view") {
      properties = {
        path: randomPick(["/", "/produits", "/panier", "/compte", "/a-propos"]),
        referrer: randomPick(["google.com", "direct", "facebook.com", "twitter.com", null]),
      };
    }

    await prisma.analyticsEvent.create({
      data: {
        eventName,
        userId,
        anonymousId,
        sessionId,
        propertiesJson: Object.keys(properties).length > 0 ? JSON.stringify(properties) : null,
        occurredAt,
      },
    });
    eventCount++;
  }
  console.log(`✅ ${eventCount} événements analytics créés.\n`);

  // --- Experiments ---
  console.log("🧪 Création des expériences...");

  const exp1 = await prisma.experiment.create({
    data: {
      key: "add_to_cart_cta_v1",
      name: "Test CTA Ajouter au Panier",
      description:
        "Test A/B du bouton Ajouter au Panier : variante verte vs bleue avec texte différents",
      status: "ACTIVE",
    },
  });

  const exp2 = await prisma.experiment.create({
    data: {
      key: "checkout_layout_v1",
      name: "Test Mise en Page Paiement",
      description:
        "Test A/B de la page de paiement : page unique vs étapes multiples",
      status: "ACTIVE",
    },
  });

  // Assign users to experiments
  let assignmentCount = 0;
  for (const userId of userIds) {
    // Experiment 1
    await prisma.experimentAssignment.create({
      data: {
        experimentId: exp1.id,
        userId,
        variant: Math.random() > 0.5 ? "control" : "variant_a",
      },
    });

    // Experiment 2
    await prisma.experimentAssignment.create({
      data: {
        experimentId: exp2.id,
        userId,
        variant: Math.random() > 0.5 ? "single_page" : "multi_step",
      },
    });
    assignmentCount += 2;
  }
  console.log(`   ✓ ${exp1.name} (${exp1.key})`);
  console.log(`   ✓ ${exp2.name} (${exp2.key})`);
  console.log(`   ✓ ${assignmentCount} assignations d'expériences`);
  console.log("✅ Expériences créées.\n");

  console.log("============================================");
  console.log("🎉 Seed terminé avec succès !");
  console.log("============================================");
  console.log(`   📁 ${CATEGORIES.length} catégories`);
  console.log(`   📦 ${PRODUCTS.length} produits`);
  console.log(`   👥 ${userIds.length} utilisateurs (1 admin + 50 demo)`);
  console.log(`   ⭐ ${reviewCount} avis`);
  console.log(`   🛒 ${cartCount} paniers`);
  console.log(`   📋 ${orderCount} commandes`);
  console.log(`   📊 ${eventCount} événements analytics`);
  console.log(`   🧪 2 expériences (${assignmentCount} assignations)`);
  console.log("============================================\n");

  await prisma.$disconnect();
}

main()
  .catch((e) => {
    console.error("❌ Erreur lors du seeding:", e);
    process.exit(1);
  });
