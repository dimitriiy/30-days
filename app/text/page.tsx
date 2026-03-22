"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { MarkdownViewer } from "./components/MarkdownViewer";
import { MarkdownEditor } from "./components/MarkdownEditor";
import { EditToggle } from "./components/EditToggle";
import { fetchPages, createPage, deletePage, type Page } from "./api";
import './styles.css';

export default function TextPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [activePageId, setActivePageId] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchPages().then((data) => {
      setPages(data);
      if (data.length > 0) setActivePageId(String(data[0].id));
    });
  }, []);

  const handleContentChange = useCallback(
    (content: string) => {
      setPages((prev) =>
        prev.map((p) =>
          String(p.id) === activePageId ? { ...p, content } : p,
        ),
      );
    },
    [activePageId],
  );

  const handleCreatePage = async () => {
    const newPage = await createPage();
    setPages((prev) => [...prev, newPage]);
    setActivePageId(String(newPage.id));
  };

  const handleDeletePage = async () => {
    const id = Number(activePageId);
    await deletePage(id);
    setPages((prev) => {
      const next = prev.filter((p) => p.id !== id);
      if (next.length > 0) setActivePageId(String(next[0].id));
      return next;
    });
  };

  const activePage = pages.find((p) => String(p.id) === activePageId);

  if (pages.length === 0) {
    return (
      <main className="dark flex min-h-screen items-center justify-center bg-background text-foreground">
        <p className="text-muted-foreground">Загрузка...</p>
      </main>
    );
  }

  return (
    <main className="dark min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <Tabs value={activePageId} onValueChange={setActivePageId}>
          <div className="flex items-center gap-2">
            <TabsList className="max-w-md-[300px] overflow-x-auto overflow-y-hidden">
              {pages.map((page) => (
                <TabsTrigger key={page.id} value={String(page.id)}>
                  Страница {page.id}
                </TabsTrigger>
              ))}
            </TabsList>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleCreatePage}
              className="size-8 rounded-full text-muted-foreground transition-colors hover:bg-emerald-500/15 hover:text-emerald-400"
              aria-label="Создать страницу"
            >
              <Plus className="size-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleDeletePage}
              disabled={pages.length <= 1}
              className="size-8 rounded-full text-muted-foreground transition-colors hover:bg-red-500/15 hover:text-red-400 disabled:opacity-30"
              aria-label="Удалить страницу"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>

          {pages.map((page) => (
            <TabsContent key={page.id} value={String(page.id)}>
              {isEditing ? (
                <MarkdownEditor
                  content={page.content}
                  onChange={handleContentChange}
                />
              ) : (
                <MarkdownViewer content={page.content} />
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <EditToggle
        isEditing={isEditing}
        onToggle={() => setIsEditing((prev) => !prev)}
      />
    </main>
  );
}
