import { NextRequest, NextResponse } from 'next/server';
import { Open } from 'unzipper';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import os from 'os';

export async function POST(req: NextRequest) {
  let tempFilePath: string | null = null;

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const zip = await Open.buffer(buffer);
    const entry = zip.files.find((f: { path: string }) => f.path === 'collection.anki2' || f.path === 'collection.anki21');
    if (!entry) {
      throw new Error('Anki collection file not found in the package');
    }
    const collectionBuffer = await entry.buffer();

    // Write the buffer to a temporary file
    tempFilePath = join(os.tmpdir(), `temp_collection_${Date.now()}.anki2`);
    await writeFile(tempFilePath, collectionBuffer);

    // Open SQLite database from the temporary file
    const db = await open({
      filename: tempFilePath,
      driver: sqlite3.Database
    });

    const notes = await db.all("SELECT flds FROM notes");

    const extractedCards = notes.map(note => {
      const [front, back] = note.flds.split('\x1f');
      return {
        front: cleanText(front),
        back: cleanText(back || "")
      };
    });

    await db.close();

    const result = {
      deckName: file.name.replace(/\.[^/.]+$/, ""),
      cards: extractedCards
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error processing Anki import:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    // Clean up the temporary file
    if (tempFilePath) {
      try {
        await unlink(tempFilePath);
      } catch (unlinkError) {
        console.error('Error deleting temporary file:', unlinkError);
      }
    }
  }
}

function cleanText(text: string): string {
  return text.replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
