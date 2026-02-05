import GeneratorApp from "@/components/feature/GeneratorApp";
import { prisma } from "@/lib/prisma";

export default async function GeneratePage({ searchParams }: { searchParams?: { edit?: string; text?: string; auto?: string } }) {
  const editId = searchParams?.edit;
  const initialText = searchParams?.text;
  const autoGenerate = searchParams?.auto === "true";
  
  const initialHistory = editId
    ? await prisma.history
        .findUnique({ where: { id: editId } })
        .then((item: any) =>
          item
            ? {
                id: item.id,
                originalText: item.originalText,
                generatedPrompt: item.generatedPrompt,
                xhsTitle: item.xhsTitle,
                xhsContent: item.xhsContent,
                imageUrl: item.imageUrl,
                style: item.style,
                createdAt: item.createdAt.toISOString(),
              }
            : null
        )
    : null;

  return (
    <div className="min-h-full">
      <GeneratorApp 
        editId={editId} 
        initialHistory={initialHistory} 
        initialText={initialText}
        autoGenerate={autoGenerate}
      />
    </div>
  );
}
