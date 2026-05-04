const jsonServer = require('json-server');
const bodyParser = require('body-parser');

const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults({ noCors: false });

server.use(middlewares);
server.use(bodyParser.json());

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function ok(data, message = 'Success') {
  return { data, message };
}

function err(message, status = 400) {
  return { status, body: { data: null, message } };
}

function paginate(array, pageNumber = 1, pageSize = 10) {
  pageNumber = parseInt(pageNumber) || 1;
  pageSize = parseInt(pageSize) || 10;
  const total = array.length;
  const totalPages = Math.ceil(total / pageSize) || 1;
  const start = (pageNumber - 1) * pageSize;
  const items = array.slice(start, start + pageSize);
  return { items, totalCount: total, pageNumber, pageSize, totalPages, hasPreviousPage: pageNumber > 1, hasNextPage: pageNumber < totalPages };
}

function getDb() {
  return router.db.getState();
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────

server.post('/api/auth/sign-in', (req, res) => {
  const { email, password } = req.body;
  const user = getDb().users.find(u => u.email === email);
  if (!user) return res.status(401).json({ data: null, message: 'Email ou mot de passe incorrect' });

  const wishlistItems = getDb().wishlists.filter(w => w.userId === user.id);
  const shoppingCart = wishlistItems.map(w => {
    const product = getDb().products.find(p => p.id === w.productId);
    return product ? { product, quantity: 1 } : null;
  }).filter(Boolean);

  res.json(ok({ accessToken: `fake-jwt-${user.id}-${Date.now()}`, user, shoppingCart: [] }));
});

server.post('/api/auth/sign-up', (req, res) => {
  const db = getDb();
  if (db.users.find(u => u.email === req.body.email)) {
    return res.status(400).json({ data: null, message: 'Cet email est déjà utilisé' });
  }
  const newUser = {
    id: Date.now(),
    email: req.body.email,
    password: req.body.password,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    phone: '',
    role: 'Cliente',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    shippingAddress: null,
    billingAddress: null,
  };
  router.db.get('users').push(newUser).write();
  res.json(ok('Compte créé avec succès'));
});

server.post('/api/auth/sign-out', (req, res) => {
  res.json(ok('Déconnexion réussie'));
});

server.post('/api/auth/refresh-token', (req, res) => {
  const user = getDb().users[0];
  res.json(ok({ accessToken: `fake-jwt-refreshed-${Date.now()}`, user, shoppingCart: [] }));
});

server.post('/api/auth/forgot-password', (req, res) => {
  res.json(ok('Un email de réinitialisation a été envoyé'));
});

server.post('/api/auth/reset-password', (req, res) => {
  res.json(ok('Mot de passe réinitialisé avec succès'));
});

// ─── PRODUCTS ─────────────────────────────────────────────────────────────────

server.get('/api/products', (req, res) => {
  let products = [...getDb().products];
  const { SearchTerm, CategoryId, Featured, PriceMin, PriceMax, PageNumber, PageSize } = req.query;

  if (SearchTerm) products = products.filter(p => p.name.toLowerCase().includes(SearchTerm.toLowerCase()) || p.description.toLowerCase().includes(SearchTerm.toLowerCase()));
  if (CategoryId) products = products.filter(p => p.categoryId === parseInt(CategoryId));
  if (Featured !== undefined) products = products.filter(p => p.featured === (Featured === 'true'));
  if (PriceMin) products = products.filter(p => p.price >= parseFloat(PriceMin));
  if (PriceMax) products = products.filter(p => p.price <= parseFloat(PriceMax));

  // Enrichir avec la catégorie
  const categories = getDb().categories;
  products = products.map(p => ({ ...p, category: categories.find(c => c.id === p.categoryId) || null }));

  res.json(ok(paginate(products, PageNumber, PageSize)));
});

server.get('/api/products/:id', (req, res) => {
  const product = getDb().products.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ data: null, message: 'Produit introuvable' });
  const category = getDb().categories.find(c => c.id === product.categoryId);
  res.json(ok({ ...product, category }));
});

server.post('/api/products', (req, res) => {
  const newProduct = {
    id: Date.now(),
    ...req.body,
    images: req.body.images || [],
    featured: req.body.featured || false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  router.db.get('products').push(newProduct).write();
  res.json(ok('Produit créé avec succès'));
});

server.put('/api/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const product = getDb().products.find(p => p.id === id);
  if (!product) return res.status(404).json({ data: null, message: 'Produit introuvable' });
  router.db.get('products').find({ id }).assign({ ...req.body, updatedAt: new Date().toISOString() }).write();
  res.json(ok('Produit mis à jour'));
});

server.delete('/api/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  router.db.get('products').remove({ id }).write();
  res.json(ok('Produit supprimé'));
});

// Upload image produit
server.post('/api/products/:id/images', (req, res) => {
  const productId = parseInt(req.params.id);
  const newImage = { id: Date.now(), path: `https://picsum.photos/seed/${Date.now()}/400/400`, productId };
  router.db.get('products').find({ id: productId }).get('images').push(newImage).write();
  res.json(ok({ imageId: String(newImage.id), url: newImage.path }));
});

server.delete('/api/products/:productId/images/:imageId', (req, res) => {
  const productId = parseInt(req.params.productId);
  const imageId = parseInt(req.params.imageId);
  const product = router.db.get('products').find({ id: productId });
  product.get('images').remove({ id: imageId }).write();
  res.json(ok('Image supprimée'));
});

// ─── CATEGORIES ───────────────────────────────────────────────────────────────

server.get('/api/categories', (req, res) => {
  let categories = [...getDb().categories];
  const { SearchTerm, PageNumber, PageSize } = req.query;

  if (SearchTerm) categories = categories.filter(c => c.name.toLowerCase().includes(SearchTerm.toLowerCase()));

  res.json(ok(paginate(categories, PageNumber, PageSize)));
});

server.get('/api/categories/:id', (req, res) => {
  const category = getDb().categories.find(c => c.id === parseInt(req.params.id));
  if (!category) return res.status(404).json({ data: null, message: 'Catégorie introuvable' });
  res.json(ok(category));
});

server.post('/api/categories', (req, res) => {
  const newCat = { id: Date.now(), ...req.body, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  router.db.get('categories').push(newCat).write();
  res.json(ok('Catégorie créée'));
});

server.put('/api/categories/:id', (req, res) => {
  const id = parseInt(req.params.id);
  router.db.get('categories').find({ id }).assign({ ...req.body, updatedAt: new Date().toISOString() }).write();
  res.json(ok('Catégorie mise à jour'));
});

server.delete('/api/categories/:id', (req, res) => {
  const id = parseInt(req.params.id);
  router.db.get('categories').remove({ id }).write();
  res.json(ok('Catégorie supprimée'));
});

// ─── ORDERS ───────────────────────────────────────────────────────────────────

server.get('/api/orders', (req, res) => {
  let orders = [...getDb().orders];
  const { UserId, SearchTerm, PageNumber, PageSize } = req.query;

  if (UserId) orders = orders.filter(o => o.userId === parseInt(UserId));
  if (SearchTerm) orders = orders.filter(o => o.orderNumber.toLowerCase().includes(SearchTerm.toLowerCase()));

  // Tri par date décroissante
  orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json(ok(paginate(orders, PageNumber, PageSize)));
});

server.get('/api/orders/:id', (req, res) => {
  const order = getDb().orders.find(o => o.id === parseInt(req.params.id));
  if (!order) return res.status(404).json({ data: null, message: 'Commande introuvable' });
  res.json(ok(order));
});

server.post('/api/orders', (req, res) => {
  const db = getDb();
  const orderCount = db.orders.length + 1;
  const newOrder = {
    id: Date.now(),
    orderNumber: `ORD-${new Date().getFullYear()}-${String(orderCount).padStart(3, '0')}`,
    status: 'Pending',
    subtotal: req.body.items?.reduce((sum, i) => sum + i.price * i.quantity, 0) || 0,
    tax: 0,
    shippingCost: 0,
    total: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...req.body,
  };
  newOrder.tax = parseFloat((newOrder.subtotal * 0.13).toFixed(2));
  newOrder.shippingCost = newOrder.subtotal >= 100 ? 0 : 5.99;
  newOrder.total = parseFloat((newOrder.subtotal + newOrder.tax + newOrder.shippingCost).toFixed(2));

  router.db.get('orders').push(newOrder).write();
  res.json(ok('Commande créée avec succès'));
});

server.put('/api/orders/:id', (req, res) => {
  const id = parseInt(req.params.id);
  router.db.get('orders').find({ id }).assign({ ...req.body, updatedAt: new Date().toISOString() }).write();
  res.json(ok('Commande mise à jour'));
});

server.delete('/api/orders/:id', (req, res) => {
  const id = parseInt(req.params.id);
  router.db.get('orders').find({ id }).assign({ status: 'Cancelled', updatedAt: new Date().toISOString() }).write();
  res.json(ok('Commande annulée'));
});

// ─── USERS ────────────────────────────────────────────────────────────────────

server.get('/api/users', (req, res) => {
  let users = [...getDb().users].map(({ password, ...u }) => u);
  const { SearchTerm, PageNumber, PageSize } = req.query;

  if (SearchTerm) {
    const term = SearchTerm.toLowerCase();
    users = users.filter(u => u.email.toLowerCase().includes(term) || u.firstName.toLowerCase().includes(term) || u.lastName.toLowerCase().includes(term));
  }

  res.json(ok(paginate(users, PageNumber, PageSize)));
});

server.get('/api/users/:id', (req, res) => {
  const user = getDb().users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ data: null, message: 'Utilisateur introuvable' });
  const { password, ...safeUser } = user;
  res.json(ok(safeUser));
});

server.put('/api/users/profile/:id', (req, res) => {
  const id = parseInt(req.params.id);
  router.db.get('users').find({ id }).assign({ ...req.body, updatedAt: new Date().toISOString() }).write();
  res.json(ok('Profil mis à jour'));
});

server.put('/api/users/address/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { shippingAddress, billingAddress } = req.body;
  router.db.get('users').find({ id }).assign({ shippingAddress, billingAddress, updatedAt: new Date().toISOString() }).write();
  res.json(ok('Adresse mise à jour'));
});

server.put('/api/users/role/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const user = getDb().users.find(u => u.id === id);
  if (!user) return res.status(404).json({ data: null, message: 'Utilisateur introuvable' });
  const newRole = user.role === 'Administrador' ? 'Cliente' : 'Administrador';
  router.db.get('users').find({ id }).assign({ role: newRole, updatedAt: new Date().toISOString() }).write();
  res.json(ok(`Rôle changé en ${newRole}`));
});

server.delete('/api/users/:id', (req, res) => {
  const id = parseInt(req.params.id);
  router.db.get('users').remove({ id }).write();
  res.json(ok('Utilisateur supprimé'));
});

// ─── WISHLIST ─────────────────────────────────────────────────────────────────

server.get('/api/users/wishlist/:userId', (req, res) => {
  const userId = parseInt(req.params.userId);
  const wishlists = getDb().wishlists.filter(w => w.userId === userId);

  const products = wishlists.map(w => {
    const product = getDb().products.find(p => p.id === w.productId);
    return product ? { ...product } : null;
  }).filter(Boolean);

  res.json(ok(products));
});

server.post('/api/users/wishlist/:userId', (req, res) => {
  const userId = parseInt(req.params.userId);
  const { productId } = req.body;

  const existing = getDb().wishlists.find(
    w => w.userId === userId && w.productId === productId
  );

  if (existing) {
    // Si déjà présent → on retire (toggle)
    router.db.get('wishlists').remove({ userId, productId }).write();
    return res.json(ok('Retiré des favoris'));
  }

  // Sinon → on ajoute
  const newItem = { id: Date.now(), userId, productId };
  router.db.get('wishlists').push(newItem).write();
  res.json(ok('Ajouté aux favoris'));
});

// ─── DASHBOARD (Admin) ────────────────────────────────────────────────────────

server.get('/api/dashboard', (req, res) => {
  const db = getDb();
  const orders = db.orders;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);

  res.json(ok({
    totalProducts: db.products.length,
    totalCategories: db.categories.length,
    totalUsers: db.users.length,
    totalOrders: orders.length,
    totalRevenue: parseFloat(totalRevenue.toFixed(2)),
    pendingOrders: orders.filter(o => o.status === 'Pending').length,
    processingOrders: orders.filter(o => o.status === 'Processing').length,
    shippedOrders: orders.filter(o => o.status === 'Shipped').length,
    deliveredOrders: orders.filter(o => o.status === 'Delivered').length,
    cancelledOrders: orders.filter(o => o.status === 'Cancelled').length,
    recentOrders: [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5),
  }));
});

// ─── SHOPPING CART ────────────────────────────────────────────────────────────

server.post('/api/orders/shopping-cart', (req, res) => {
  res.json(ok('Panier synchronisé'));
});
// ─── START ────────────────────────────────────────────────────────────────────

server.listen(5180, () => {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║   ✅  Serveur E-Shop démarré            ║');
  console.log('║   🌐  http://localhost:5180             ║');
  console.log('╠════════════════════════════════════════╣');
  console.log('║  📦  /api/products                     ║');
  console.log('║  📂  /api/categories                   ║');
  console.log('║  👤  /api/users                        ║');
  console.log('║  📋  /api/orders                       ║');
  console.log('║  ❤️   /api/wishlist                     ║');
  console.log('║  📊  /api/dashboard                    ║');
  console.log('║  🔐  /api/auth/sign-in                 ║');
  console.log('╠════════════════════════════════════════╣');
  console.log('║  👤  admin@eshop.com  (Administrateur) ║');
  console.log('║  👤  client@eshop.com (Client)         ║');
  console.log('╚════════════════════════════════════════╝\n');
});