"use client";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-dvh w-full bg-background text-foreground">
      <div className="flex h-full">
        <div className="flex min-w-0 flex-1 flex-col">
          <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </div>
  );
}
