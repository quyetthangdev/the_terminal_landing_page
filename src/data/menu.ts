export interface MenuItem {
  id: string
  name: string
  description: string
  price: string
  image: string
  category: 'drinks' | 'breakfast' | 'mains' | 'desserts'
}

export const categories = [
  { id: 'drinks', label: 'THỨC UỐNG' },
  { id: 'breakfast', label: 'ĂN SÁNG' },
  { id: 'mains', label: 'MÓN CHÍNH' },
  { id: 'desserts', label: 'TRÁNG MIỆNG' },
] as const

export type CategoryId = (typeof categories)[number]['id']

export const menuItems: MenuItem[] = [
  // Drinks
  { id: 'd1', category: 'drinks', name: 'Terminal Espresso', description: 'Espresso đặc biệt, crema vàng kim', price: '45.000đ', image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&auto=format&fit=crop' },
  { id: 'd2', category: 'drinks', name: 'Signature Latte', description: 'Sữa tươi nguyên kem, vanilla, caramel nhẹ', price: '65.000đ', image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=400&auto=format&fit=crop' },
  { id: 'd3', category: 'drinks', name: 'Cold Brew Tonic', description: 'Cold brew ngâm 24h, tonic, nước hoa hồng', price: '70.000đ', image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&auto=format&fit=crop' },
  { id: 'd4', category: 'drinks', name: 'Matcha Zen', description: 'Matcha Nhật Bản, oat milk, foam latte', price: '75.000đ', image: 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=400&auto=format&fit=crop' },
  { id: 'd5', category: 'drinks', name: 'Terminal Black', description: 'Cà phê phin truyền thống, đá viên', price: '35.000đ', image: 'https://images.unsplash.com/photo-1497935586047-9395ee065e52?w=400&auto=format&fit=crop' },
  { id: 'd6', category: 'drinks', name: 'Cacao Belge', description: 'Cacao Bỉ nguyên chất, sữa tươi nóng', price: '65.000đ', image: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=400&auto=format&fit=crop' },
  // Breakfast
  { id: 'b1', category: 'breakfast', name: 'Eggs Benedict', description: 'Trứng chần, bacon, hollandaise sauce, bánh mì Anh', price: '95.000đ', image: 'https://images.unsplash.com/photo-1608039755401-742074f0548d?w=400&auto=format&fit=crop' },
  { id: 'b2', category: 'breakfast', name: 'Croque Monsieur', description: 'Bánh mì nướng, jambon, phô mai Gruyère', price: '85.000đ', image: 'https://images.unsplash.com/photo-1528736235302-52922df5c122?w=400&auto=format&fit=crop' },
  { id: 'b3', category: 'breakfast', name: 'Avocado Toast', description: 'Bánh mì sourdough, bơ nghiền, trứng luộc, hạt', price: '75.000đ', image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&auto=format&fit=crop' },
  { id: 'b4', category: 'breakfast', name: 'French Toast', description: 'Bánh brioche ngâm trứng, maple syrup, berries', price: '80.000đ', image: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400&auto=format&fit=crop' },
  // Mains
  { id: 'm1', category: 'mains', name: 'Pasta Carbonara', description: 'Pasta tươi, guanciale, pecorino, lòng đỏ trứng', price: '145.000đ', image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400&auto=format&fit=crop' },
  { id: 'm2', category: 'mains', name: 'Beef Bourguignon', description: 'Thịt bò hầm rượu vang đỏ, khoai tây, cà rốt', price: '185.000đ', image: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=400&auto=format&fit=crop' },
  { id: 'm3', category: 'mains', name: 'Salmon à la Plancha', description: 'Cá hồi áp chảo, risotto nấm, sốt chanh bơ', price: '195.000đ', image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&auto=format&fit=crop' },
  { id: 'm4', category: 'mains', name: 'Croque Madame', description: 'Bánh mì nướng, jambon, trứng ốp la, bechamel', price: '95.000đ', image: 'https://images.unsplash.com/photo-1528736235302-52922df5c122?w=400&auto=format&fit=crop' },
  // Desserts
  { id: 'de1', category: 'desserts', name: 'Crème Brûlée', description: 'Kem trứng vanilla, lớp caramel giòn', price: '65.000đ', image: 'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=400&auto=format&fit=crop' },
  { id: 'de2', category: 'desserts', name: 'Tiramisu', description: 'Mascarpone, espresso, lady fingers', price: '75.000đ', image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&auto=format&fit=crop' },
  { id: 'de3', category: 'desserts', name: 'Tarte Tatin', description: 'Bánh táo lật ngược, kem tươi', price: '70.000đ', image: 'https://images.unsplash.com/photo-1464305795204-6f5bbfc7fb81?w=400&auto=format&fit=crop' },
  { id: 'de4', category: 'desserts', name: 'Profiteroles', description: 'Bánh su kem, sốt socola đen', price: '60.000đ', image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&auto=format&fit=crop' },
]
