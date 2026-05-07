export async function onRequestGet(context) {
  const { results } = await context.env.DB
    .prepare('SELECT id, text, name, date, created_at FROM messages ORDER BY created_at ASC')
    .all();
  return Response.json(results);
}

export async function onRequestPost(context) {
  const body = await context.request.json().catch(() => ({}));
  const { text, name, date } = body;

  if (typeof text !== 'string' || !text.trim()) {
    return Response.json({ error: 'text requerido' }, { status: 400 });
  }
  if (typeof name !== 'string' || !name.trim()) {
    return Response.json({ error: 'name requerido' }, { status: 400 });
  }
  if (typeof date !== 'string' || !date.trim()) {
    return Response.json({ error: 'date requerido' }, { status: 400 });
  }

  const cleanText = text.trim().slice(0, 500);
  const cleanName = name.trim().slice(0, 80);
  const cleanDate = date.trim().slice(0, 40);

  const row = await context.env.DB
    .prepare('INSERT INTO messages (text, name, date) VALUES (?, ?, ?) RETURNING id, text, name, date, created_at')
    .bind(cleanText, cleanName, cleanDate)
    .first();

  return Response.json(row, { status: 201 });
}
