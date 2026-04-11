'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  Package, HandHelping, Search, AlertTriangle, CheckCircle, Clock,
  Plus, Filter, ArrowUpDown, Printer, MapPin, Phone, User, Info,
  TrendingUp, TrendingDown, Minus
} from 'lucide-react';

type PostType = 'have' | 'need' | 'help' | 'info';
type Urgency = 'low' | 'medium' | 'high' | 'critical';
type PostStatus = 'active' | 'fulfilled' | 'expired';
type SortBy = 'newest' | 'urgent' | 'nearest';
type ResourceType = 'water' | 'food' | 'generator' | 'tools' | 'shelter' | 'medication' | 'fuel' | 'medical' | 'translation' | 'cooking' | 'childcare' | 'repair' | 'other';

interface CommunityPost {
  id: string;
  type: PostType;
  authorName: string;
  contact: string;
  resourceType: ResourceType;
  quantity: string;
  location: string;
  description: string;
  timestamp: number;
  urgency: Urgency;
  status: PostStatus;
  expiresAt: number;
}

const RESOURCE_TYPES: { value: ResourceType; label: string; icon: React.ReactNode }[] = [
  { value: 'water', label: 'Su / Water', icon: <TrendingUp className="h-4 w-4 text-blue-400" /> },
  { value: 'food', label: 'Yiyecek / Food', icon: <Package className="h-4 w-4 text-green-400" /> },
  { value: 'generator', label: 'Jenerator / Generator', icon: <TrendingUp className="h-4 w-4 text-yellow-400" /> },
  { value: 'tools', label: 'Araclar / Tools', icon: <Package className="h-4 w-4 text-gray-400" /> },
  { value: 'shelter', label: 'Barinak / Shelter', icon: <Package className="h-4 w-4 text-cyan-400" /> },
  { value: 'medication', label: 'Ilac / Medication', icon: <Package className="h-4 w-4 text-red-400" /> },
  { value: 'fuel', label: 'Yakit / Fuel', icon: <TrendingUp className="h-4 w-4 text-orange-400" /> },
  { value: 'medical', label: 'Tibbi Beceri / Medical Skills', icon: <HandHelping className="h-4 w-4 text-pink-400" /> },
  { value: 'translation', label: 'Ceviri / Translation', icon: <HandHelping className="h-4 w-4 text-purple-400" /> },
  { value: 'cooking', label: 'Yemek / Cooking', icon: <HandHelping className="h-4 w-4 text-amber-400" /> },
  { value: 'childcare', label: 'Cocuk Bakimi / Childcare', icon: <HandHelping className="h-4 w-4 text-teal-400" /> },
  { value: 'repair', label: 'Tamir / Repair', icon: <HandHelping className="h-4 w-4 text-indigo-400" /> },
  { value: 'other', label: 'Diger / Other', icon: <Package className="h-4 w-4 text-nomad-slate" /> },
];

const POST_TYPE_CONFIG: Record<PostType, { label: string; color: string; bgColor: string }> = {
  have: { label: 'Elimde Var / Have', color: 'text-green-300', bgColor: 'bg-green-900/30' },
  need: { label: 'Ihtiyacim Var / Need', color: 'text-red-300', bgColor: 'bg-red-900/30' },
  help: { label: 'Yardim Edebilirim / Can Help', color: 'text-blue-300', bgColor: 'bg-blue-900/30' },
  info: { label: 'Bilgi / Information', color: 'text-amber-300', bgColor: 'bg-amber-900/30' },
};

const URGENCY_CONFIG: Record<Urgency, { label: string; color: string; icon: React.ReactNode }> = {
  low: { label: 'Dusuk / Low', color: 'text-green-400', icon: <TrendingDown className="h-3 w-3" /> },
  medium: { label: 'Orta / Medium', color: 'text-amber-400', icon: <Minus className="h-3 w-3" /> },
  high: { label: 'Yuksek / High', color: 'text-orange-400', icon: <TrendingUp className="h-3 w-3" /> },
  critical: { label: 'Kritik / Critical', color: 'text-red-400', icon: <AlertTriangle className="h-3 w-3" /> },
};

const STORAGE_KEY = 'prepturk:communityResources';
const EXPIRY_HOURS = 24;

function loadPosts(): CommunityPost[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const posts: CommunityPost[] = JSON.parse(raw);
    const now = Date.now();
    return posts.map((p) => ({
      ...p,
      status: p.expiresAt < now ? 'expired' : p.status,
    })).filter((p) => p.status !== 'expired' || (now - p.expiresAt) < 86400000 * 2);
  } catch { return []; }
}

function savePosts(posts: CommunityPost[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'Az once';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} dakika once`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} saat once`;
  const days = Math.floor(hours / 24);
  return `${days} gun once`;
}

function timeRemaining(expiresAt: number): string {
  const remaining = expiresAt - Date.now();
  if (remaining <= 0) return 'Suresi dolmus';
  const hours = Math.floor(remaining / 3600000);
  if (hours < 1) return '1 saatten az';
  return `${hours} saat kaldi`;
}

export default function ToplulukKaynakPage() {
  const [posts, setPosts] = useState<CommunityPost[]>(loadPosts);
  const [showForm, setShowForm] = useState(false);
  const [filterType, setFilterType] = useState<PostType | 'all'>('all');
  const [filterUrgency, setFilterUrgency] = useState<Urgency | 'all'>('all');
  const [filterResource, setFilterResource] = useState<ResourceType | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortBy>('newest');

  // Form state
  const [postType, setPostType] = useState<PostType>('have');
  const [authorName, setAuthorName] = useState('');
  const [contact, setContact] = useState('');
  const [resourceType, setResourceType] = useState<ResourceType>('water');
  const [quantity, setQuantity] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<Urgency>('medium');

  useEffect(() => {
    const loaded = loadPosts();
    setPosts(loaded);
  }, []);

  // Auto-expire old posts
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setPosts((prev) => prev.filter((p) => p.expiresAt > now || p.status === 'fulfilled'));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = () => {
    if (!authorName.trim() || !contact.trim()) return;

    const post: CommunityPost = {
      id: Date.now().toString(),
      type: postType,
      authorName: authorName.trim(),
      contact: contact.trim(),
      resourceType,
      quantity: quantity.trim(),
      location: location.trim(),
      description: description.trim(),
      timestamp: Date.now(),
      urgency,
      status: 'active',
      expiresAt: Date.now() + EXPIRY_HOURS * 3600000,
    };

    const updated = [post, ...posts];
    setPosts(updated);
    savePosts(updated);

    // Reset form
    setAuthorName('');
    setContact('');
    setQuantity('');
    setLocation('');
    setDescription('');
    setUrgency('medium');
    setShowForm(false);
  };

  const updateStatus = (id: string, status: PostStatus) => {
    const updated = posts.map((p) => p.id === id ? { ...p, status } : p);
    setPosts(updated);
    savePosts(updated);
  };

  const deletePost = (id: string) => {
    const updated = posts.filter((p) => p.id !== id);
    setPosts(updated);
    savePosts(updated);
  };

  // Filter and sort
  const filteredPosts = posts
    .filter((p) => {
      if (filterType !== 'all' && p.type !== filterType) return false;
      if (filterUrgency !== 'all' && p.urgency !== filterUrgency) return false;
      if (filterResource !== 'all' && p.resourceType !== filterResource) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return b.timestamp - a.timestamp;
      if (sortBy === 'urgent') {
        const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
      }
      return a.location.localeCompare(b.location);
    });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Package className="h-7 w-7 text-nomad-green" />
            Topluluk Kaynak Paylasim
          </h1>
          <p className="text-nomad-slate text-sm">Community Resource Sharing Board</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-1" />
            Yazdir
          </Button>
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Ilan Ver
          </Button>
        </div>
      </div>

      {/* New Post Form */}
      {showForm && (
        <Card className="border-nomad-green/50 bg-nomad-green/5">
          <CardHeader>
            <CardTitle>Yeni Ilan / New Post</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Post Type */}
            <div>
              <label className="text-sm font-medium mb-2 block">Ilan Tipi / Post Type</label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.entries(POST_TYPE_CONFIG) as [PostType, typeof POST_TYPE_CONFIG[PostType]][]).map(([type, config]) => (
                  <button
                    key={type}
                    onClick={() => setPostType(type)}
                    className={`p-3 rounded-lg border text-center transition-colors ${
                      postType === type
                        ? 'border-nomad-green bg-nomad-green/20'
                        : 'border-nomad-border bg-nomad-bg hover:border-nomad-green/30'
                    }`}
                  >
                    <p className={`text-sm font-medium ${config.color}`}>{config.label}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block flex items-center gap-1">
                  <User className="h-3 w-3" /> Ad / Name
                </label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full h-10 rounded-md border border-nomad-border bg-nomad-surface px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-nomad-green"
                  placeholder="Adiniz"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block flex items-center gap-1">
                  <Phone className="h-3 w-3" /> Iletisim / Contact
                </label>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full h-10 rounded-md border border-nomad-border bg-nomad-surface px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-nomad-green"
                  placeholder="Telefon veya baska iletisim"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Kaynak Tipi / Resource Type</label>
                <select
                  value={resourceType}
                  onChange={(e) => setResourceType(e.target.value as ResourceType)}
                  className="w-full h-10 rounded-md border border-nomad-border bg-nomad-surface px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-nomad-green"
                >
                  {RESOURCE_TYPES.map((rt) => (
                    <option key={rt.value} value={rt.value}>{rt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Miktar / Quantity</label>
                <input
                  type="text"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full h-10 rounded-md border border-nomad-border bg-nomad-surface px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-nomad-green"
                  placeholder="Orn: 5 litre, 10 ekmek"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> Konum / Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full h-10 rounded-md border border-nomad-border bg-nomad-surface px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-nomad-green"
                  placeholder="Mahalle, sokak, bina"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Aciliyet / Urgency</label>
                <div className="flex gap-2">
                  {(Object.entries(URGENCY_CONFIG) as [Urgency, typeof URGENCY_CONFIG[Urgency]][]).map(([urg, config]) => (
                    <button
                      key={urg}
                      onClick={() => setUrgency(urg)}
                      className={`flex-1 p-2 rounded-lg border text-center transition-colors ${
                        urgency === urg
                          ? 'border-nomad-green bg-nomad-green/20'
                          : 'border-nomad-border bg-nomad-bg'
                      }`}
                    >
                      <div className={`flex items-center justify-center gap-1 ${config.color}`}>
                        {config.icon}
                        <span className="text-xs">{config.label.split('/')[0].trim()}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Aciklama / Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-nomad-border bg-nomad-surface px-3 py-2 text-sm text-foreground placeholder:text-nomad-slate focus:outline-none focus:ring-2 focus:ring-nomad-green resize-none"
                placeholder="Ek bilgiler..."
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">Iptal</Button>
              <Button onClick={handleSubmit} className="flex-1">
                <Plus className="h-4 w-4 mr-1" />
                Yayinla
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card className="border-nomad-border no-print">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="h-4 w-4 text-nomad-green" />
            <span className="text-sm font-medium">Filtreler / Filters</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as PostType | 'all')}
              className="h-8 rounded-md border border-nomad-border bg-nomad-surface px-2 text-xs text-foreground"
            >
              <option value="all">Tum Tipler</option>
              {Object.entries(POST_TYPE_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>

            <select
              value={filterUrgency}
              onChange={(e) => setFilterUrgency(e.target.value as Urgency | 'all')}
              className="h-8 rounded-md border border-nomad-border bg-nomad-surface px-2 text-xs text-foreground"
            >
              <option value="all">Tum Aciliyetler</option>
              {Object.entries(URGENCY_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>

            <select
              value={filterResource}
              onChange={(e) => setFilterResource(e.target.value as ResourceType | 'all')}
              className="h-8 rounded-md border border-nomad-border bg-nomad-surface px-2 text-xs text-foreground"
            >
              <option value="all">Tum Kaynaklar</option>
              {RESOURCE_TYPES.map((rt) => (
                <option key={rt.value} value={rt.value}>{rt.label}</option>
              ))}
            </select>

            <div className="flex items-center gap-1 ml-auto">
              <ArrowUpDown className="h-3 w-3 text-nomad-slate" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="h-8 rounded-md border border-nomad-border bg-nomad-surface px-2 text-xs text-foreground"
              >
                <option value="newest">En Yeni</option>
                <option value="urgent">En Acil</option>
                <option value="nearest">En Yakin</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-nomad-slate">
          {filteredPosts.length} ilan gosteriliyor / {posts.length} toplam
        </p>
      </div>

      {/* Posts List */}
      <div className="space-y-3">
        {filteredPosts.length === 0 ? (
          <Card className="border-nomad-border">
            <CardContent className="p-8 text-center">
              <Search className="h-12 w-12 text-nomad-slate mx-auto mb-3" />
              <p className="text-nomad-slate">Henuk ilan yok. "Ilan Ver" butonuna tiklayarak ilk ilani olusturun.</p>
              <p className="text-xs text-nomad-slate mt-1">(No posts yet. Click "Ilan Ver" to create the first post.)</p>
            </CardContent>
          </Card>
        ) : (
          filteredPosts.map((post) => {
            const typeConfig = POST_TYPE_CONFIG[post.type];
            const urgencyConfig = URGENCY_CONFIG[post.urgency];
            const resourceConfig = RESOURCE_TYPES.find((r) => r.value === post.resourceType);

            return (
              <Card
                key={post.id}
                className={`border-nomad-border ${
                  post.status === 'fulfilled' ? 'opacity-60' : ''
                } ${post.urgency === 'critical' ? 'border-red-800' : ''}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge className={`${typeConfig.bgColor} ${typeConfig.color} border-0`}>
                          {typeConfig.label.split('/')[0].trim()}
                        </Badge>
                        <Badge className={`${urgencyConfig.color} border-0 text-xs`}>
                          {urgencyConfig.icon}
                          {urgencyConfig.label.split('/')[0].trim()}
                        </Badge>
                        {post.status === 'fulfilled' && (
                          <Badge className="bg-green-900/30 text-green-300 border-0 text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Tamamlandi
                          </Badge>
                        )}
                        {post.status === 'expired' && (
                          <Badge className="bg-gray-800/30 text-gray-400 border-0 text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            Suresi dolmus
                          </Badge>
                        )}
                        {resourceConfig && (
                          <span className="text-xs text-nomad-slate flex items-center gap-1">
                            {resourceConfig.icon}
                            {resourceConfig.label.split('/')[0].trim()}
                          </span>
                        )}
                      </div>

                      <p className="text-sm mb-2">{post.description}</p>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-nomad-slate">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" /> {post.authorName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {post.contact}
                        </span>
                        {post.quantity && (
                          <span>Miktar: {post.quantity}</span>
                        )}
                        {post.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {post.location}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 mt-2 text-xs text-nomad-slate">
                        <span>{timeAgo(post.timestamp)}</span>
                        <span>{timeRemaining(post.expiresAt)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    {post.status === 'active' && (
                      <div className="flex flex-col gap-1 no-print">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateStatus(post.id, 'fulfilled')}
                          className="h-7 text-xs"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Tamamlandi
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deletePost(post.id)}
                          className="h-7 text-xs text-red-400"
                        >
                          Sil
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Info */}
      <Card className="border-nomad-border bg-nomad-bg">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-nomad-green" />
            <h4 className="text-sm font-medium">Nasil Calisir / How It Works</h4>
          </div>
          <p className="text-sm text-nomad-slate">
            Topluluk kaynak paylasim panosu, mahallenizdeki kaynaklari koordine etmenize yardimci olur.
            "Elimde Var" ilanlari fazla kaynaklarinizi listeler. "Ihtiyacim Var" ilanlari ihtiyac duyulan kaynaklari gosterir.
            "Yardim Edebilirim" ilanlari sunabildiginiz becerileri listeler. "Bilgi" ilanlari bolge durumunu paylasir.
          </p>
          <p className="text-xs text-nomad-slate">
            Ilanlar 24 saat sonra otomatik olarak sona erer. "Durum Guncelle" ile ilanlari tamamlandi olarak isaretleyebilirsiniz.
            Tum veriler yerel olarak saklanir (localStorage).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
