import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type SyncOperation = 
  | { type: "ADD"; data: any }
  | { type: "DELETE"; data: { id: string; version?: number } };

function logSync(action: string, details: any) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    action,
    ...details
  }));
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const operations = body.operations as SyncOperation[];

    if (!Array.isArray(operations) || operations.length === 0) {
      return NextResponse.json({ error: "No operations provided" }, { status: 400 });
    }

    const results: any[] = [];

    // Process in transaction
    await prisma.$transaction(async (tx) => {
      for (const op of operations) {
        try {
          if (op.type === "ADD") {
            const created = await tx.history.create({
              data: {
                ...op.data,
                version: 1,
              },
            });
            results.push({ id: created.id, status: "success", type: "ADD" });
            logSync("SYNC_ADD_SUCCESS", { id: created.id, data: op.data });
          } else if (op.type === "DELETE") {
            const { id, version } = op.data;
            
            // Optimistic Lock Check
            const current = await tx.history.findUnique({ where: { id } });
            
            if (!current) {
               // Already deleted, consider success or idempotent
               results.push({ id, status: "success", type: "DELETE", note: "Already deleted" });
               continue;
            }

            if (version !== undefined && current.version !== version) {
              throw new Error(`Version mismatch: client=${version}, server=${current.version}`);
            }

            await tx.history.delete({ where: { id } });
            results.push({ id, status: "success", type: "DELETE" });
            logSync("SYNC_DELETE_SUCCESS", { id, version });
          }
        } catch (error: any) {
          console.error(`Operation failed: ${op.type}`, error);
          results.push({ 
            id: op.data.id || "unknown", 
            status: "failed", 
            type: op.type, 
            error: error.message 
          });
          logSync(`SYNC_${op.type}_FAILED`, { error: error.message, data: op.data });
          // In a transaction, throwing usually rolls back everything. 
          // If we want partial success, we shouldn't use a single transaction for all, 
          // or we should catch and decide.
          // Requirement says "support batch operations and transactions". 
          // Usually batch means all-or-nothing or partial. 
          // Given "transactions" requirement, let's enforce all-or-nothing for the batch.
          throw error; 
        }
      }
    });

    return NextResponse.json({ success: true, results });

  } catch (error: any) {
    console.error("Sync Transaction Failed", error);
    return NextResponse.json({ 
      success: false, 
      error: "Batch sync failed", 
      details: error.message 
    }, { status: 500 });
  }
}
