import { useState } from 'react';
import { Plus, Trash2, Bell, BellOff, ShieldAlert, Shield, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useGlobalAnnouncements } from '@/hooks/useGlobalAnnouncements';
import { Badge } from '@/components/ui/badge';

export function AdminAnnouncements() {
  const { announcements, loading, createAnnouncement, toggleActive, toggleBlockSite, deleteAnnouncement } = useGlobalAnnouncements();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [blockSite, setBlockSite] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!title.trim() || !content.trim()) return;
    setCreating(true);
    const ok = await createAnnouncement(title, content, blockSite);
    if (ok) {
      setTitle('');
      setContent('');
      setBlockSite(false);
    }
    setCreating(false);
  };

  return (
    <div className="space-y-6">
      {/* Create new */}
      <div className="p-6 rounded-xl border border-border bg-card space-y-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Plus className="w-5 h-5 text-primary" /> Tạo thông báo mới
        </h3>
        <div className="space-y-2">
          <Label>Tiêu đề</Label>
          <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Tiêu đề thông báo..." />
        </div>
        <div className="space-y-2">
          <Label>Nội dung</Label>
          <Textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Nội dung thông báo..." rows={4} />
        </div>
        <div className="flex items-center gap-3">
          <Switch checked={blockSite} onCheckedChange={setBlockSite} />
          <Label className="flex items-center gap-2 cursor-pointer">
            <ShieldAlert className="w-4 h-4 text-destructive" />
            Chặn trang web (người dùng không thể đóng hoặc truy cập bất kỳ trang nào)
          </Label>
        </div>
        <Button onClick={handleCreate} disabled={creating || !title.trim() || !content.trim()} className="gap-2">
          <Plus className="w-4 h-4" /> {creating ? 'Đang tạo...' : 'Tạo thông báo'}
        </Button>
      </div>

      {/* List */}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg">Danh sách thông báo</h3>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Đang tải...</div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">Chưa có thông báo nào</div>
        ) : (
          announcements.map(a => (
            <div key={a.id} className="p-4 rounded-xl border border-border bg-card/80 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-medium">{a.title}</h4>
                    {a.is_active ? (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 gap-1">
                        <Bell className="w-3 h-3" /> Đang bật
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1">
                        <BellOff className="w-3 h-3" /> Đã tắt
                      </Badge>
                    )}
                    {a.block_site && (
                      <Badge className="bg-destructive/20 text-destructive border-destructive/30 gap-1">
                        <ShieldAlert className="w-3 h-3" /> Chặn web
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{a.content}</p>
                  <p className="text-xs text-muted-foreground/60 mt-2">
                    {new Date(a.created_at).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant={a.is_active ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleActive(a.id, !a.is_active)}
                  className="gap-1.5"
                >
                  {a.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                  {a.is_active ? 'Tắt thông báo' : 'Bật thông báo'}
                </Button>
                <Button
                  variant={a.block_site ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => toggleBlockSite(a.id, !a.block_site)}
                  className="gap-1.5"
                >
                  {a.block_site ? <Shield className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                  {a.block_site ? 'Bỏ chặn web' : 'Chặn web'}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => deleteAnnouncement(a.id)} className="text-destructive gap-1.5">
                  <Trash2 className="w-4 h-4" /> Xóa
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
