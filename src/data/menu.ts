export interface MenuItem {
  id: string
  name: string
  description: string
  price: string
  image: string
  category: string
}

export interface Category {
  id: string
  label: string
}

export type CategoryId = string

export const categories: Category[] = [
  { id: 'appetizers', label: 'Khai Vị' },
  { id: 'soups', label: 'Súp' },
  { id: 'salads', label: 'Salad' },
  { id: 'seafood', label: 'Hải Sản' },
  { id: 'steaks', label: 'Thịt & Steak' },
  { id: 'pasta', label: 'Pasta' },
  { id: 'breakfast', label: 'Ăn Sáng' },
  { id: 'desserts', label: 'Tráng Miệng' },
  { id: 'coffee', label: 'Cà Phê' },
  { id: 'cocktails', label: 'Cocktail' },
]

export const menuItems: MenuItem[] = [
  // Khai vị
  { id: 'ap1', category: 'appetizers', name: 'Foie Gras Terrine', description: 'Gan ngỗng ép, mứt sung, bánh brioche nướng', price: '245.000đ', image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=200&auto=format&fit=crop' },
  { id: 'ap2', category: 'appetizers', name: 'Burrata & Tomato', description: 'Phô mai burrata, cà chua heirloom, húng quế, dầu olive extra virgin', price: '185.000đ', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&auto=format&fit=crop' },
  { id: 'ap3', category: 'appetizers', name: 'Tuna Tartare', description: 'Cá ngừ tươi thái hạt lựu, avocado, xốt ponzu, sesame', price: '215.000đ', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&auto=format&fit=crop' },
  { id: 'ap4', category: 'appetizers', name: 'Scallop Crudo', description: 'Sò điệp tươi, dầu chanh yuzu, hoa ăn được', price: '225.000đ', image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=200&auto=format&fit=crop' },

  // Súp
  { id: 'so1', category: 'soups', name: 'French Onion Soup', description: 'Súp hành tây hầm, crouton, phô mai Gruyère nướng vàng', price: '125.000đ', image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=200&auto=format&fit=crop' },
  { id: 'so2', category: 'soups', name: 'Lobster Bisque', description: 'Súp tôm hùm kem, cognac, chive oil', price: '195.000đ', image: 'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=200&auto=format&fit=crop' },
  { id: 'so3', category: 'soups', name: 'Velouté de Champignon', description: 'Kem nấm rừng, truffle oil, hành phi giòn', price: '115.000đ', image: 'https://images.unsplash.com/photo-1600783245777-080fd7ff9253?w=200&auto=format&fit=crop' },

  // Salad
  { id: 'sa1', category: 'salads', name: 'Caesar Classique', description: 'Romaine, parmesan, crouton tự làm, xốt caesar truyền thống', price: '135.000đ', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&auto=format&fit=crop' },
  { id: 'sa2', category: 'salads', name: 'Niçoise Royale', description: 'Cá ngừ seared, trứng luộc lòng đào, olives Niçoise, đậu French', price: '175.000đ', image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=200&auto=format&fit=crop' },
  { id: 'sa3', category: 'salads', name: 'Burrata Garden', description: 'Rau mầm, hoa ăn được, vinaigrette chanh mật ong', price: '145.000đ', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&auto=format&fit=crop' },

  // Hải sản
  { id: 'sf1', category: 'seafood', name: 'Salmon à la Plancha', description: 'Cá hồi áp chảo, risotto nấm, sốt chanh bơ', price: '295.000đ', image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=200&auto=format&fit=crop' },
  { id: 'sf2', category: 'seafood', name: 'Grilled Lobster', description: 'Tôm hùm nướng, bơ tỏi herbs, khoai tây nghiền', price: '695.000đ', image: 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=200&auto=format&fit=crop' },
  { id: 'sf3', category: 'seafood', name: 'Sea Bass en Papillote', description: 'Cá vược hấp giấy bạc, rau thơm Địa Trung Hải, chanh Meyer', price: '325.000đ', image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=200&auto=format&fit=crop' },
  { id: 'sf4', category: 'seafood', name: 'Gambas al Ajillo', description: 'Tôm to xào tỏi, ớt, dầu olive, bánh mì nướng', price: '265.000đ', image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=200&auto=format&fit=crop' },

  // Thịt & Steak
  { id: 'st1', category: 'steaks', name: 'Wagyu Ribeye 300g', description: 'Bò Wagyu A4, áp chảo bơ herbs, muối Himalaya', price: '895.000đ', image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=200&auto=format&fit=crop' },
  { id: 'st2', category: 'steaks', name: 'Beef Bourguignon', description: 'Thịt bò hầm rượu vang đỏ Burgundy, khoai tây, cà rốt heirloom', price: '285.000đ', image: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=200&auto=format&fit=crop' },
  { id: 'st3', category: 'steaks', name: 'Duck Confit', description: 'Vịt confit, đậu lăng Puy, xốt cherry đỏ', price: '345.000đ', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=200&auto=format&fit=crop' },
  { id: 'st4', category: 'steaks', name: 'Rack of Lamb', description: 'Sườn cừu nướng herbs, purée đậu Hà Lan, jus rosemary', price: '465.000đ', image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=200&auto=format&fit=crop' },

  // Pasta
  { id: 'pa1', category: 'pasta', name: 'Pasta Carbonara', description: 'Pasta tươi, guanciale, pecorino romano, lòng đỏ trứng', price: '185.000đ', image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=200&auto=format&fit=crop' },
  { id: 'pa2', category: 'pasta', name: 'Tagliatelle Bolognese', description: 'Sốt thịt bò hầm 6 tiếng, tagliatelle tươi, parmesan', price: '195.000đ', image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=200&auto=format&fit=crop' },
  { id: 'pa3', category: 'pasta', name: 'Truffle Risotto', description: 'Risotto Arborio, truffle đen, parmesan, bơ lạnh', price: '245.000đ', image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=200&auto=format&fit=crop' },
  { id: 'pa4', category: 'pasta', name: 'Lobster Linguine', description: 'Linguine, tôm hùm Maine, sốt bisque nhẹ, chive', price: '385.000đ', image: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=200&auto=format&fit=crop' },

  // Ăn sáng
  { id: 'br1', category: 'breakfast', name: 'Eggs Benedict', description: 'Trứng chần, bacon Iberico, hollandaise sauce, bánh Anh', price: '145.000đ', image: 'https://images.unsplash.com/photo-1608039755401-742074f0548d?w=200&auto=format&fit=crop' },
  { id: 'br2', category: 'breakfast', name: 'French Toast Royale', description: 'Bánh brioche, crème brûlée custard, berries tươi, maple syrup', price: '125.000đ', image: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=200&auto=format&fit=crop' },
  { id: 'br3', category: 'breakfast', name: 'Avocado Toast', description: 'Sourdough nướng, bơ nghiền, trứng luộc, hạt bí, microgreens', price: '115.000đ', image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=200&auto=format&fit=crop' },
  { id: 'br4', category: 'breakfast', name: 'Croque Monsieur', description: 'Bánh mì nướng, jambon Bayonne, phô mai Gruyère', price: '105.000đ', image: 'https://images.unsplash.com/photo-1528736235302-52922df5c122?w=200&auto=format&fit=crop' },

  // Tráng miệng
  { id: 'de1', category: 'desserts', name: 'Crème Brûlée', description: 'Kem trứng vanilla Madagascar, lớp caramel giòn', price: '85.000đ', image: 'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=200&auto=format&fit=crop' },
  { id: 'de2', category: 'desserts', name: 'Chocolate Soufflé', description: 'Bánh socola nóng lòng, kem vanilla, bạc hà', price: '95.000đ', image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=200&auto=format&fit=crop' },
  { id: 'de3', category: 'desserts', name: 'Tiramisu Classico', description: 'Mascarpone, espresso, lady fingers, cacao Valrhona', price: '85.000đ', image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=200&auto=format&fit=crop' },
  { id: 'de4', category: 'desserts', name: 'Tarte Tatin', description: 'Bánh táo lật ngược caramel, kem fraîche', price: '80.000đ', image: 'https://images.unsplash.com/photo-1464305795204-6f5bbfc7fb81?w=200&auto=format&fit=crop' },

  // Cà phê
  { id: 'cf1', category: 'coffee', name: 'Terminal Espresso', description: 'Single origin Ethiopia, crema vàng kim', price: '55.000đ', image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200&auto=format&fit=crop' },
  { id: 'cf2', category: 'coffee', name: 'Signature Latte', description: 'Sữa tươi Anchor, vanilla bean, latte art', price: '75.000đ', image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=200&auto=format&fit=crop' },
  { id: 'cf3', category: 'coffee', name: 'Cold Brew Tonic', description: 'Cold brew ngâm 24h, tonic Fever-Tree, nước hoa hồng', price: '85.000đ', image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=200&auto=format&fit=crop' },
  { id: 'cf4', category: 'coffee', name: 'Matcha Zen', description: 'Matcha Uji Nhật Bản, oat milk, foam latte', price: '85.000đ', image: 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=200&auto=format&fit=crop' },
  { id: 'cf5', category: 'coffee', name: 'Cacao Belge', description: 'Cacao Bỉ Callebaut nguyên chất, sữa tươi nóng', price: '75.000đ', image: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=200&auto=format&fit=crop' },

  // Cocktail
  { id: 'co1', category: 'cocktails', name: 'Terminal Old Fashioned', description: 'Bourbon Woodford, bitters Angostura, cam tươi, đường nâu', price: '145.000đ', image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=200&auto=format&fit=crop' },
  { id: 'co2', category: 'cocktails', name: 'Negroni Sbagliato', description: 'Campari, Martini Rosso, Prosecco, vỏ cam', price: '135.000đ', image: 'https://images.unsplash.com/photo-1541004995046-4f1b574bfd1f?w=200&auto=format&fit=crop' },
  { id: 'co3', category: 'cocktails', name: 'Aperol Spritz', description: 'Aperol, Prosecco DOC, soda, cam Sicilian', price: '125.000đ', image: 'https://images.unsplash.com/photo-1560512823-829485b8bf24?w=200&auto=format&fit=crop' },
  { id: 'co4', category: 'cocktails', name: 'Espresso Martini', description: 'Vodka Grey Goose, Kahlúa, espresso double, foam', price: '155.000đ', image: 'https://images.unsplash.com/photo-1575023782549-62ca0d244b39?w=200&auto=format&fit=crop' },
]
