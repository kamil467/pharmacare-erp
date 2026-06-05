import { NextResponse } from 'next/server';
import { db } from "@/db";
import { products, batches, sales } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (!type) {
      return NextResponse.json({ error: 'Missing type parameter' }, { status: 400 });
    }

    let data: any[] = [];
    let filename = '';

    if (type === 'products') {
      data = await db.select().from(products);
      filename = `products_export_${new Date().toISOString().split('T')[0]}.csv`;
    } else if (type === 'batches') {
      data = await db.select().from(batches);
      filename = `inventory_batches_export_${new Date().toISOString().split('T')[0]}.csv`;
    } else if (type === 'sales') {
      data = await db.select().from(sales);
      filename = `sales_export_${new Date().toISOString().split('T')[0]}.csv`;
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    if (data.length === 0) {
      return new NextResponse("No data available to export.", { status: 200 });
    }

    // Convert JSON to CSV
    const headers = Object.keys(data[0]);
    const csvRows = [];
    csvRows.push(headers.join(','));

    for (const row of data) {
      const values = headers.map(header => {
        const val = row[header];
        if (val === null || val === undefined) return '';
        // Escape quotes and commas
        let str = String(val);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          str = `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      });
      csvRows.push(values.join(','));
    }

    const csvString = csvRows.join('\n');

    return new NextResponse(csvString, {
      headers: {
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Type': 'text/csv',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to create backup' }, { status: 500 });
  }
}
