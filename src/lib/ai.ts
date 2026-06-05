"use client";

import { readsApi } from "@/lib/api";
import type {
  ConversationTurn,
  FollowUpAnalysis,
  GeneratedMessage,
  MessageStyle,
  MessageTone,
  ProfileAnalysis,
} from "@/types";

/* ─────────────────────────────────────────────
   Real AI calls — everything goes through the backend (Gemini). These are the
   only profile-analysis / opener / reply / tweak entry points the app uses.
   ───────────────────────────────────────────── */

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/** Convert up to 6 uploaded files to base64 data-URLs (for display + upload). */
export async function filesToDataUrls(files: File[]): Promise<string[]> {
  return Promise.all(files.slice(0, 6).map(fileToDataUrl));
}

export async function analyzeProfile(
  files: File[],
  context?: string,
): Promise<ProfileAnalysis> {
  const images = await filesToDataUrls(files);
  return readsApi.analyze(images, context ?? null);
}

export async function generateMessages(
  analysis: ProfileAnalysis,
  style: MessageStyle,
  tone: MessageTone,
): Promise<GeneratedMessage[]> {
  return readsApi.messages(analysis, style, tone);
}

export async function analyzeReply(
  conversation: ConversationTurn[],
  analysis: ProfileAnalysis,
): Promise<FollowUpAnalysis> {
  const turns = conversation.map((t) => ({ role: t.role, text: t.text }));
  return readsApi.reply(turns, analysis);
}

export async function regenerateMessage(
  message: GeneratedMessage,
  instruction: string,
): Promise<GeneratedMessage> {
  return readsApi.tweak(message.text, instruction, message.tone);
}

/** Exchange a saved match's gs:// screenshot URIs for short-lived view URLs. */
export async function signImageUrls(uris: string[]): Promise<string[]> {
  return readsApi.signImages(uris);
}
