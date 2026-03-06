import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuthStore } from '@/store/auth.store';
import {
  useCreateLibraryItem,
  useDeleteLibraryItem,
  useLibraryItems,
  useUpdateLibraryItem,
} from '@/hooks/api';
import { DataState, SchoolSectionShell } from './shared/SchoolSection';

export function CatalogSection() {
  const { schoolId } = useAuthStore();
  const itemsQuery = useLibraryItems(schoolId);
  const createItem = useCreateLibraryItem(schoolId ?? '');
  const updateItem = useUpdateLibraryItem(schoolId ?? '');
  const deleteItem = useDeleteLibraryItem(schoolId ?? '');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', author: '', isbn: '', category: '', shelfLocation: '', totalCopies: '1', availableCopies: '1' });
  const [editForm, setEditForm] = useState(form);

  const items = itemsQuery.data ?? [];

  const submitCreate = async () => {
    await createItem.mutateAsync({
      title: form.title,
      author: form.author,
      isbn: form.isbn,
      category: form.category,
      shelfLocation: form.shelfLocation,
      totalCopies: Number(form.totalCopies || 1),
      availableCopies: Number(form.availableCopies || 1),
    });
    setForm({ title: '', author: '', isbn: '', category: '', shelfLocation: '', totalCopies: '1', availableCopies: '1' });
  };

  const submitUpdate = async (id: string) => {
    await updateItem.mutateAsync({
      id,
      title: editForm.title,
      author: editForm.author,
      isbn: editForm.isbn,
      category: editForm.category,
      shelfLocation: editForm.shelfLocation,
      totalCopies: Number(editForm.totalCopies || 1),
      availableCopies: Number(editForm.availableCopies || 0),
    });
    setEditingId(null);
  };

  return (
    <SchoolSectionShell
      title="Catalog"
      description="Manage library catalog records and copies."
      actions={<Button size="sm" onClick={submitCreate} disabled={!form.title || createItem.isPending}>Add Item</Button>}
    >
      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-4">
          <Input placeholder="Title" value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} />
          <Input placeholder="Author" value={form.author} onChange={(e) => setForm((prev) => ({ ...prev, author: e.target.value }))} />
          <Input placeholder="ISBN" value={form.isbn} onChange={(e) => setForm((prev) => ({ ...prev, isbn: e.target.value }))} />
          <Input placeholder="Category" value={form.category} onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))} />
          <Input placeholder="Shelf" value={form.shelfLocation} onChange={(e) => setForm((prev) => ({ ...prev, shelfLocation: e.target.value }))} />
          <Input type="number" placeholder="Total copies" value={form.totalCopies} onChange={(e) => setForm((prev) => ({ ...prev, totalCopies: e.target.value }))} />
          <Input type="number" placeholder="Available copies" value={form.availableCopies} onChange={(e) => setForm((prev) => ({ ...prev, availableCopies: e.target.value }))} />
        </CardContent>
      </Card>

      <DataState
        isLoading={itemsQuery.isLoading}
        isError={itemsQuery.isError}
        isEmpty={!items.length}
        loadingLabel="Loading catalog"
        emptyLabel="No library items"
        errorLabel="Failed to load catalog"
        onRetry={() => itemsQuery.refetch()}
      >
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Copies</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{editingId === item.id ? <Input value={editForm.title} onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))} /> : item.title}</TableCell>
                    <TableCell>{editingId === item.id ? <Input value={editForm.author} onChange={(e) => setEditForm((prev) => ({ ...prev, author: e.target.value }))} /> : item.author}</TableCell>
                    <TableCell>{editingId === item.id ? <Input value={editForm.category} onChange={(e) => setEditForm((prev) => ({ ...prev, category: e.target.value }))} /> : item.category}</TableCell>
                    <TableCell>{editingId === item.id ? <Input type="number" value={editForm.availableCopies} onChange={(e) => setEditForm((prev) => ({ ...prev, availableCopies: e.target.value }))} /> : `${item.availableCopies}/${item.totalCopies}`}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {editingId === item.id ? (
                          <>
                            <Button size="sm" onClick={() => submitUpdate(item.id)} disabled={updateItem.isPending}>Save</Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingId(item.id);
                              setEditForm({
                                title: item.title,
                                author: item.author,
                                isbn: item.isbn,
                                category: item.category,
                                shelfLocation: item.shelfLocation,
                                totalCopies: String(item.totalCopies),
                                availableCopies: String(item.availableCopies),
                              });
                            }}
                          >
                            Edit
                          </Button>
                        )}
                        <Button size="sm" variant="destructive" onClick={() => deleteItem.mutate(item.id)} disabled={deleteItem.isPending}>Delete</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </DataState>
    </SchoolSectionShell>
  );
}
