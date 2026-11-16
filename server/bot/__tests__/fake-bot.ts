import assert from "node:assert/strict";

export type Sent = { chatId: number; text: string; options?: unknown };

export class FakeBot {
  handlers = new Map<string, (value: never) => Promise<unknown>>();
  sent: Sent[] = [];
  edited: Array<{ text: string; options: unknown }> = [];
  answers: string[] = [];
  failText?: string;
  profileName = "Дмитрий";

  on(event: string, handler: (value: never) => Promise<unknown>): this {
    this.handlers.set(event, handler);
    return this;
  }

  async sendMessage(chatId: number, text: string, options?: unknown): Promise<object> {
    if (this.failText && text.includes(this.failText)) throw new Error("Telegram unavailable");
    this.sent.push({ chatId, text, options });
    return {};
  }

  async answerCallbackQuery(id: string, options?: { text?: string }): Promise<boolean> {
    this.answers.push(options?.text ?? id);
    return true;
  }

  async editMessageText(text: string, options: unknown): Promise<object> {
    this.edited.push({ text, options });
    return {};
  }

  async getChat(): Promise<{ first_name: string }> {
    return { first_name: this.profileName };
  }

  async message(text: string, chatId = 1, firstName?: string): Promise<void> {
    const handler = this.handlers.get("message");
    assert.ok(handler);
    await handler({ text, chat: { id: chatId, type: "private" }, from: firstName ? { first_name: firstName } : undefined } as never);
  }

  async callback(data: string, chatId = 1): Promise<void> {
    const handler = this.handlers.get("callback_query");
    assert.ok(handler);
    await handler({ id: "callback-id", data, message: { chat: { id: chatId, type: "private" }, message_id: 7 } } as never);
  }
}
